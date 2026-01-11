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

function calculateCost(formulaItems: any[]) {
  let totalCost = 0;

  for (const item of formulaItems) {
    const master = item.master_ingredients;
    const supplierItem = master.supplier_items?.find((i: any) => i.is_primary) 
                      || master.supplier_items?.[0];

    if (!supplierItem) continue;

    // 1. Normalize Supplier (e.g. 1kg @ $2.50 -> 1000g @ $2.50)
    const supplierBaseQty = Number(supplierItem.purchase_quantity) * getBaseFactor(supplierItem.purchase_unit);
    
    // 2. Normalize Recipe (e.g. 500g -> 500)
    const recipeBaseQty = Number(item.quantity_required) * getBaseFactor(item.unit_used);

    // 3. Calculate: (Price / BaseQty) * UsageBaseQty
    // Example: ($2.50 / 1000g) * 500g = $1.25
    const costPerBaseUnit = supplierItem.cost / supplierBaseQty;
    const itemCost = costPerBaseUnit * recipeBaseQty;

    totalCost += itemCost;
  }
  return totalCost;
}

export default async function FormulasPage() {
  const supabase = await createClient() // Create client inside the function
  const { data: formulas } = await supabase
    .from('formulas')
    .select(`
      *,
      formula_items (
        quantity_required,
        unit_used,
        master_ingredients (
          id,
          name,
          supplier_items (cost, purchase_quantity, purchase_unit, is_primary)
        )
      )
    `)
    .order('name', { ascending: true });

  return (
    <main className="min-h-screen p-24 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-slate-500 hover:underline mb-2 block">← Back to Dashboard</Link>
            <h1 className="text-3xl font-bold text-slate-900">Formulas</h1>
          </div>
          <Link href="/formulas/new">
            <button className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-700 shadow-sm transition-all">
              + New Formula
            </button>
          </Link>
        </div>

        <div className="grid gap-4">
          {formulas?.length === 0 ? (
             <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200">
               No formulas yet. Time to bake!
             </div>
          ) : (
            formulas?.map((formula) => {
              const totalBatchCost = calculateCost(formula.formula_items);
              const costPerUnit = totalBatchCost / (formula.batch_yield_quantity || 1);

              return (
                <Link key={formula.id} href={`/formulas/${formula.id}`}>
                  <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {formula.name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Yields: {formula.batch_yield_quantity} {formula.batch_yield_unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-2xl font-mono font-bold text-slate-900">
                            ${totalBatchCost.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                            Total Batch
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded inline-block">
                          ${costPerUnit.toFixed(2)} / {formula.batch_yield_unit.replace(/s$/, '')}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}