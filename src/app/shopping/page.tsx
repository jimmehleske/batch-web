import { createClient } from '@/lib/supabase' // Change Importimport Link from 'next/link';
import Link from 'next/link';

// --- HELPER: Unit Normalization ---
function getBaseFactor(unit: string) {
  switch (unit) {
    case 'kg': return 1000;
    case 'L':  return 1000;
    case 'g':  return 1;
    case 'ml': return 1;
    default: return 1; 
  }
}

export default async function ShoppingListPage() {
  
  const supabase = await createClient() // Create client inside the function
  const { data: batches } = await supabase
    .from('batches')
    .select(`
      target_yield,
      formulas (
        batch_yield_quantity,
        formula_items (
          quantity_required,
          unit_used,
          master_ingredients (
            name,
            default_unit,
            supplier_items (
              supplier,
              purchase_quantity,
              purchase_unit,
              cost,
              is_primary
            )
          )
        )
      )
    `)
    .eq('status', 'planned');

  const shoppingList = new Map();

  batches?.forEach((batch: any) => {
    // 1. How much bigger/smaller is this batch?
    const scaleFactor = batch.target_yield / (batch.formulas.batch_yield_quantity || 1);

    batch.formulas.formula_items.forEach((item: any) => {
      const masterName = item.master_ingredients.name;
      
      // 2. Normalize Recipe Usage (e.g. 500g -> 500)
      const recipeBaseFactor = getBaseFactor(item.unit_used);
      const requiredQtyBase = (item.quantity_required * scaleFactor) * recipeBaseFactor;

      const supplierItem = item.master_ingredients.supplier_items?.find((i: any) => i.is_primary) 
                        || item.master_ingredients.supplier_items?.[0];

      const supplierName = supplierItem ? supplierItem.supplier : 'Generic / Unknown';
      const key = `${supplierName}-${masterName}`;

      if (!shoppingList.has(key)) {
        shoppingList.set(key, {
          supplier: supplierName,
          ingredient: masterName,
          totalQtyBase: 0, // We accumulate in grams/ml
          displayUnit: item.unit_used, 
          estCost: 0
        });
      }

      const entry = shoppingList.get(key);
      entry.totalQtyBase += requiredQtyBase;

      // 3. Calculate Cost Correctly
      if (supplierItem) {
        // Normalize Supplier (e.g. 1kg -> 1000)
        const supplierBaseFactor = getBaseFactor(supplierItem.purchase_unit);
        const supplierQtyBase = supplierItem.purchase_quantity * supplierBaseFactor;
        
        // Cost per Base Unit (e.g. Cost per gram)
        const costPerBase = supplierItem.cost / supplierQtyBase;
        
        // Add to total cost
        entry.estCost += (costPerBase * requiredQtyBase);
      }
    });
  });

  // Group by Supplier
  const bySupplier: Record<string, any[]> = {};
  
  Array.from(shoppingList.values()).forEach(item => {
    if (!bySupplier[item.supplier]) {
      bySupplier[item.supplier] = [];
    }
    bySupplier[item.supplier].push(item);
  });

  return (
    <main className="min-h-screen p-24 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-slate-500 hover:underline mb-2 block">← Back to Dashboard</Link>
            <h1 className="text-3xl font-bold text-slate-900">Shopping List</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Based on {batches?.length} planned batches</p>
          </div>
        </div>

        {Object.keys(bySupplier).length === 0 ? (
           <div className="bg-white p-12 text-center rounded-lg border border-slate-200 text-slate-500">
             Your schedule is clear! Plan some batches to generate a shopping list.
           </div>
        ) : (
          <div className="grid gap-8">
            {Object.entries(bySupplier).map(([supplier, items]) => (
              <div key={supplier} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex justify-between">
                  <h3 className="font-bold text-slate-800 text-lg">{supplier}</h3>
                  <span className="text-sm font-mono text-slate-600 bg-slate-200 px-2 py-1 rounded">
                    {items.length} items
                  </span>
                </div>
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => {
                      // Convert back to display unit for the UI (Optional, keeping it simple for now)
                      // If it's heavy (>1000g), we could show kg, but let's stick to the input unit's base
                      let displayQty = item.totalQtyBase;
                      let displayUnit = 'g / ml'; // Simplified base unit label
                      
                      // Smart Labeling: If the input was kg, show kg
                      if (['kg', 'L'].includes(item.displayUnit)) {
                          displayQty = item.totalQtyBase / 1000;
                          displayUnit = item.displayUnit;
                      }

                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {item.ingredient}
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-blue-600">
                            {displayQty.toFixed(2)} {displayUnit}
                          </td>
                          <td className="px-6 py-4 text-right text-slate-400 text-xs">
                            Est. ${item.estCost.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 w-12 text-center">
                            <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}