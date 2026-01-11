import { createClient } from '@/lib/supabase' // Change Importimport Link from 'next/link';
import { notFound } from 'next/navigation';

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

function calculateRowCost(item: any) {
  const master = item.master_ingredients;
  const supplierItem = master.supplier_items?.find((i: any) => i.is_primary) 
                    || master.supplier_items?.[0];

  if (!supplierItem) return 0;

  // 1. Normalize Supplier (1kg -> 1000)
  const supplierBaseQty = Number(supplierItem.purchase_quantity) * getBaseFactor(supplierItem.purchase_unit);
  
  // 2. Normalize Recipe (500g -> 500)
  const recipeBaseQty = Number(item.quantity_required) * getBaseFactor(item.unit_used);

  // 3. Calculate True Cost
  const costPerBaseUnit = supplierItem.cost / supplierBaseQty;
  return costPerBaseUnit * recipeBaseQty;
}

export default async function FormulaDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const supabase = await createClient() // Create client inside the function
  const { data: formula } = await supabase
    .from('formulas')
    .select(`
      *,
      formula_items (
        id,
        quantity_required,
        unit_used,
        master_ingredients (
          id,
          name,
          supplier_items (cost, purchase_quantity, purchase_unit, is_primary)
        )
      )
    `)
    .eq('id', id)
    .single();

  if (!formula) return notFound();

  const rows = formula.formula_items.map((item: any) => {
    const cost = calculateRowCost(item);
    return { ...item, cost };
  });

  const totalCost = rows.reduce((sum: number, item: any) => sum + item.cost, 0);
  const costPerUnit = totalCost / (formula.batch_yield_quantity || 1);

  return (
    <main className="min-h-screen p-24 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/formulas" className="text-slate-500 hover:text-slate-800 hover:underline mb-6 block">
          ← Back to Formulas
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{formula.name}</h1>
            <p className="text-slate-500 mt-2">
              Batch Yield: <span className="font-semibold text-slate-700">{formula.batch_yield_quantity} {formula.batch_yield_unit}</span>
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-right min-w-[200px]">
            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Cost Per Unit</div>
            <div className="text-3xl font-mono font-bold text-green-600">${costPerUnit.toFixed(2)}</div>
            <div className="text-xs text-slate-400 mt-1 pt-1 border-t border-slate-100">
              Batch Total: ${totalCost.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Ingredient Breakdown</h3>
          </div>
          
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-3 font-medium">Ingredient</th>
                <th className="px-6 py-3 font-medium">Quantity</th>
                <th className="px-6 py-3 font-medium">Cost Share</th>
                <th className="px-6 py-3 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((row: any) => {
                const percentage = totalCost > 0 ? (row.cost / totalCost) * 100 : 0;
                
                return (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {row.master_ingredients.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {row.quantity_required} {row.unit_used}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                         <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                         </div>
                         <span className="text-xs text-slate-400 font-mono">{percentage.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-900 font-bold">
                      ${row.cost.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                    <td colSpan={3} className="px-6 py-3 text-right font-bold text-slate-700">Total Material Cost</td>
                    <td className="px-6 py-3 text-right font-mono font-bold text-slate-900">${totalCost.toFixed(2)}</td>
                </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </main>
  );
}