import { createClient } from '@/lib/supabase' // Change Importimport Link from 'next/link';
import Link from 'next/link'
import { notFound } from 'next/navigation'
import StatusButtons from './status-buttons'

export default async function BatchDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params
  
  // 1. Fetch Batch + Formula + Items + Master Ingredients
  const supabase = await createClient() // Create client inside the function
  const { data: batch } = await supabase
    .from('batches')
    .select(`
      *,
      formulas (
        name,
        batch_yield_quantity,
        batch_yield_unit,
        formula_items (
            quantity_required,
            unit_used,
            master_ingredients ( name )
        )
      )
    `)
    .eq('id', id)
    .single()

  if (!batch) return notFound()

  // 2. The Magic Math: Calculate Scaling Factor
  // Avoid division by zero if yield is missing
  const defaultYield = batch.formulas.batch_yield_quantity || 1
  const targetYield = batch.target_yield
  
  const scaleFactor = targetYield / defaultYield

  return (
    <main className="min-h-screen p-6 md:p-24 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/batches" className="text-slate-500 hover:text-slate-800 hover:underline mb-6 block">
          ← Back to Schedule
        </Link>

        {/* Header Card */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="text-sm text-slate-500 font-mono mb-1">BATCH ID: {batch.id.slice(0,8)}</div>
                    <h1 className="text-3xl font-bold text-slate-900">{batch.formulas.name}</h1>
                </div>
                
                {/* The Status Buttons Component */}
                <StatusButtons batchId={batch.id} status={batch.status} />
            </div>

            <hr className="my-6 border-slate-100"/>

            {/* Scaling Info Box */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                    <div className="text-xs text-slate-500 uppercase font-bold">Planned Date</div>
                    <div className="text-slate-900 font-semibold">
                        {new Date(batch.scheduled_for).toLocaleDateString()}
                    </div>
                </div>
                <div className="p-3 bg-blue-50 rounded border border-blue-100">
                    <div className="text-xs text-blue-600 uppercase font-bold">Target Yield</div>
                    <div className="text-blue-900 font-bold text-lg">
                        {batch.target_yield} {batch.formulas.batch_yield_unit}
                    </div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                    <div className="text-xs text-slate-500 uppercase font-bold">Standard Yield</div>
                    <div className="text-slate-900 font-semibold">
                        {batch.formulas.batch_yield_quantity} {batch.formulas.batch_yield_unit}
                    </div>
                </div>
                <div className="p-3 bg-slate-900 rounded border border-slate-800 text-white">
                    <div className="text-xs text-slate-400 uppercase font-bold">Scale Factor</div>
                    <div className="text-white font-mono font-bold text-xl">
                        {scaleFactor.toFixed(2)}x
                    </div>
                </div>
            </div>
        </div>

        {/* The Scaled Recipe Table */}
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800">Production Requirements</h3>
            <p className="text-xs text-slate-500">Ingredients scaled automatically for this batch size.</p>
          </div>
          
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-3 font-medium">Ingredient</th>
                <th className="px-6 py-3 font-medium">Standard Qty</th>
                <th className="px-6 py-3 font-medium text-blue-700 bg-blue-50">Required Qty</th>
                <th className="px-6 py-3 font-medium">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {batch.formulas.formula_items.map((item: any, index: number) => {
                // CALCULATE SCALED QUANTITY
                const scaledQty = item.quantity_required * scaleFactor;

                return (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {item.master_ingredients.name}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {item.quantity_required}
                    </td>
                    {/* The Highlighted Scaled Column */}
                    <td className="px-6 py-4 font-mono font-bold text-blue-700 bg-blue-50/50 text-lg">
                      {Number(scaledQty.toFixed(3))} 
                      {/* Note: .toFixed(3) handles small quantities like 0.005 kg nicely */}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {item.unit_used}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  )
}