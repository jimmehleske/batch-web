import { createClient } from '@/lib/supabase' // Change Importimport Link from 'next/link';
import Link from 'next/link'
import FormulaForm from './client-form'

export default async function NewFormulaPage() {
  
  // Fetch ingredients for the dropdown
  const supabase = await createClient() // Create client inside the function
  const { data: ingredients } = await supabase
    .from('master_ingredients')
    .select('id, name, default_unit')
    .order('name')

  return (
    <main className="min-h-screen p-24 bg-slate-50">
      <div className="max-w-2xl mx-auto">
        <Link href="/formulas" className="text-slate-500 hover:text-slate-800 hover:underline mb-6 block">
          ← Back to Formulas
        </Link>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-8">New Formula</h1>
        
        {/* We pass the server data to the client component here */}
        <FormulaForm ingredients={ingredients || []} />
        
      </div>
    </main>
  )
}