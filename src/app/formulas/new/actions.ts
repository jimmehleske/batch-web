'use server'

import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

// CHANGE: We removed 'prevState: any' from the arguments. 
// Now it just accepts 'formData' directly.
export async function createFormula(formData: FormData) {
  
  // 1. Extract Header Data
  const name = formData.get('name') as string
  const yieldQty = parseFloat(formData.get('yieldQty') as string)
  const yieldUnit = formData.get('yieldUnit') as string
  
  // 2. Extract Ingredient Rows
  const ingredientIds = formData.getAll('ingredientId') as string[]
  const quantities = formData.getAll('qty') as string[]
  const units = formData.getAll('unit') as string[]

  // 3. Validation
  if (!name || ingredientIds.length === 0) {
    // Since we aren't using useFormState, we can't easily return errors to the UI yet.
    // For now, we will just throw an error (which creates a red screen) if data is missing.
    throw new Error('Please provide a name and at least one ingredient.')
  }

  // 4. Insert Header (The Formula)
  const supabase = await createClient()
  const { data: formula, error: formulaError } = await supabase
    .from('formulas')
    .insert({
      name,
      batch_yield_quantity: yieldQty,
      batch_yield_unit: yieldUnit
    })
    .select()
    .single()

  if (formulaError) {
    throw new Error('Error creating formula: ' + formulaError.message)
  }

  // 5. Prepare Rows for Bulk Insert
  const formulaItems = ingredientIds.map((id, index) => ({
    formula_id: formula.id,
    master_ingredient_id: id,
    quantity_required: parseFloat(quantities[index]),
    unit_used: units[index]
  }))

  // 6. Insert Rows
  const { error: itemsError } = await supabase
    .from('formula_items')
    .insert(formulaItems)

  if (itemsError) {
    throw new Error('Error adding ingredients: ' + itemsError.message)
  }

  // 7. Success! Go back to list
  redirect('/formulas')
}