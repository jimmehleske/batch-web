import { createClient } from '@/lib/supabase' // Change Importimport Link from 'next/link';
import Link from 'next/link'
import BatchForm from './client-form'

export default async function NewBatchPage() {
  
  // Fetch formulas so we can list them in the dropdown
  const supabase = await createClient() // Create client inside the function
  const { data: formulas } = await supabase
    .from('formulas')
    .select('id, name, batch_yield_quantity, batch_yield_unit')
    .order('name')

  return (
    <main className="min-h-screen p-24 bg-slate-50">
      <div className="max-w-md mx-auto">
        <Link href="/batches" className="text-slate-500 hover:text-slate-800 hover:underline mb-6 block">
          ← Back to Schedule
        </Link>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Plan New Batch</h1>
        
        <BatchForm formulas={formulas || []} />
        
      </div>
    </main>
  )
}