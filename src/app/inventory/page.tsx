import { createClient } from '@/lib/supabase' // Change Importimport Link from 'next/link';
import Link from 'next/link';

export default async function InventoryPage() {
  
  // 1. Fetch Items and their Transaction History
  const supabase = await createClient() // Create client inside the function
  const { data: items } = await supabase
    .from('supplier_items')
    .select(`
      id,
      supplier,
      brand,
      purchase_unit,
      cost,
      master_ingredients ( name ),
      inventory_transactions ( quantity_change )
    `)
    .order('supplier');

  return (
    <main className="min-h-screen p-24 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-slate-500 hover:underline mb-2 block">← Back to Dashboard</Link>
            <h1 className="text-3xl font-bold text-slate-900">Current Stock</h1>
          </div>
            <Link href="/inventory/adjust">
                <button className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-md hover:bg-slate-50 shadow-sm transition-all">
                    Adjust Stock / Receive Goods
                </button>
            </Link>
        </div>

        {/* Stock Table */}
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-900 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Item</th>
                <th className="px-6 py-3">Supplier</th>
                <th className="px-6 py-3 text-right">Stock on Hand</th>
                <th className="px-6 py-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items?.map((item: any) => {
                // SUM up the transactions to get current stock
                const currentStock = item.inventory_transactions.reduce(
                  (sum: number, t: any) => sum + t.quantity_change, 
                  0
                );
                
                // Calculate Value (Stock * Cost Per Unit)
                // Note: We need cost per buying unit. This is a rough estimate.
                const value = (currentStock / item.purchase_quantity) * item.cost;

                // Visual styling for low stock
                const isLow = currentStock < 0; // Negative stock means data error or forgot to record purchase

                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {item.master_ingredients?.name}
                      {isLow && <span className="ml-2 text-xs text-red-600 bg-red-100 px-1 rounded">NEGATIVE</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.brand} ({item.supplier})
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-bold ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
                      {currentStock.toFixed(2)} {item.purchase_unit}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">
                      ${value > 0 ? value.toFixed(2) : '0.00'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}