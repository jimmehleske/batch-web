'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// --- HELPER: Unit Conversion Logic ---
function getBaseFactor(unit: string) {
  // We normalize everything to 'g' or 'ml'
  switch (unit) {
    case 'kg': return 1000;
    case 'L':  return 1000;
    case 'g':  return 1;
    case 'ml': return 1;
    case 'units': return 1;
    case 'unit': return 1;
    default: return 1;
  }
}

export async function updateBatchStatus(batchId: string, newStatus: 'planned' | 'in_progress' | 'completed') {
  
  const supabase = await createClient()

  // 1. Update the status
  const { error } = await supabase
    .from('batches')
    .update({ status: newStatus })
    .eq('id', batchId)

  if (error) throw new Error('Failed to update status')

  // 2. If completing, deduct from inventory
  if (newStatus === 'completed') {
    await deductInventoryForBatch(batchId)
  }

  revalidatePath(`/batches/${batchId}`)
}

async function deductInventoryForBatch(batchId: string) {
  const supabase = await createClient()

  // A. Fetch Batch + Formula Items + Supplier Details
  const { data: batchData } = await supabase
    .from('batches')
    .select(`
      target_yield,
      formulas (
        batch_yield_quantity,
        formula_items (
          quantity_required,
          unit_used,
          master_ingredients (
            supplier_items ( id, is_primary, purchase_unit, purchase_quantity )
          )
        )
      )
    `)
    .eq('id', batchId)
    .single()

  if (!batchData) return

  // --- THE FIX IS HERE ---
  // Cast to 'any' to stop TypeScript from complaining about arrays vs objects
  const batch: any = batchData;

  // robust check: If formulas is an array, take the first one. If object, use it.
  const formula = Array.isArray(batch.formulas) ? batch.formulas[0] : batch.formulas;

  if (!formula) return; // Safety check

  const scaleFactor = batch.target_yield / (formula.batch_yield_quantity || 1)
  const transactions: any[] = []

  // B. Loop through ingredients using the extracted 'formula' object
  for (const item of formula.formula_items) {
    // 1. Find Supplier
    const supplierItem = item.master_ingredients.supplier_items?.find((i: any) => i.is_primary) 
                      || item.master_ingredients.supplier_items?.[0]

    if (!supplierItem) continue

    // 2. Normalize Recipe Usage
    const recipeBaseFactor = getBaseFactor(item.unit_used)
    const totalRecipeQtyBase = (item.quantity_required * scaleFactor) * recipeBaseFactor

    // 3. Normalize Supplier Unit
    const supplierBaseFactor = getBaseFactor(supplierItem.purchase_unit)

    // 4. Calculate Final Deduction
    const deductionQty = totalRecipeQtyBase / supplierBaseFactor

    transactions.push({
      supplier_item_id: supplierItem.id,
      batch_id: batchId,
      quantity_change: -deductionQty, // Negative because we used it
      reason: 'production'
    })
  }

  // C. Save to Ledger
  if (transactions.length > 0) {
    await supabase.from('inventory_transactions').insert(transactions)
  }
}