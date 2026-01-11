import { createClient } from '@/lib/supabase' // Change Importimport Link from 'next/link';
import Link from 'next/link'
import AdjustStockForm from './client-form'

export default async function AdjustStockPage() {
  
  const supabase = await createClient() // Create client inside the function
  const { data: items } = await supabase
    .from('supplier_items')
    .select(`
      id,
      supplier,
      brand,
      purchase_unit,
      purchase_quantity,
      master_ingredients ( name )
    `)
    .order('supplier')

  return (
    <main className="min-h-screen p-24 bg-slate-50">
      <div className="max-w-md mx-auto">
        <Link href="/inventory" className="text-slate-500 hover:text-slate-800 hover:underline mb-6 block">
          ← Back to Inventory
        </Link>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Receive / Adjust Stock</h1>
        
        {/* Pass the data to the client component */}
        <AdjustStockForm items={items || []} />
        
      </div>
    </main>
  )
}