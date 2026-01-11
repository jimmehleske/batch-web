// 1. New Imports
import { createClient } from '@/lib/supabase'; // New Auth-ready client
import Link from 'next/link'; // <--- This was missing!

export default async function MaterialsPage() {
  
  // 2. Create the client (Required for Auth)
  const supabase = await createClient(); 

  // 3. Fetch Data (Same logic, but using the new 'supabase' variable)
  const { data: ingredients, error } = await supabase
    .from('master_ingredients')
    .select(`
      *,
      supplier_items (
        id,
        supplier,
        brand,
        cost,
        purchase_quantity,
        purchase_unit
      )
    `)
    .order('name', { ascending: true });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <main className="min-h-screen p-24 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-slate-500 hover:underline mb-2 block">← Back to Dashboard</Link>
            <h1 className="text-3xl font-bold text-slate-900">Materials Inventory</h1>
          </div>
          <Link href="/materials/new">
            <button className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-700 shadow-sm transition-all">
              + Add Material
            </button>
          </Link>
        </div>

        <div className="space-y-6">
          {ingredients?.map((master: any) => (
            <div key={master.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-lg">{master.name}</h3>
                <span className="text-xs font-mono text-slate-500 bg-slate-200 px-2 py-1 rounded">
                  Default Unit: {master.default_unit || 'g'}
                </span>
              </div>

              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 border-b border-slate-100">
                    <th className="px-6 py-2 font-medium">Supplier</th>
                    <th className="px-6 py-2 font-medium">Brand</th>
                    <th className="px-6 py-2 font-medium">Qty</th>
                    <th className="px-6 py-2 font-medium text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {master.supplier_items?.length > 0 ? (
                    master.supplier_items.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 font-medium text-slate-900">{item.supplier}</td>
                        <td className="px-6 py-3 text-slate-600">{item.brand || '-'}</td>
                        <td className="px-6 py-3 text-slate-600">
                          {item.purchase_quantity} {item.purchase_unit}
                        </td>
                        <td className="px-6 py-3 text-right font-mono text-slate-900">
                          ${Number(item.cost).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-slate-400 italic">
                        No suppliers linked yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}

          {ingredients?.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No materials found. Click "Add Material" to get started.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}