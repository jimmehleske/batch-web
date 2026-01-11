import { createClient } from '@/lib/supabase' // Change Importimport Link from 'next/link';
import Link from 'next/link';

export default async function BatchesPage() {
  
  const supabase = await createClient() // Create client inside the function
  const { data: batches } = await supabase
    .from('batches')
    .select(`
      *,
      formulas ( name, batch_yield_unit )
    `)
    .order('scheduled_for', { ascending: false });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <main className="min-h-screen p-24 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER SECTION START */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-slate-500 hover:underline mb-2 block">← Back to Dashboard</Link>
            <h1 className="text-3xl font-bold text-slate-900">Production Schedule</h1>
          </div>
          <Link href="/batches/new">
            <button className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-700 shadow-sm transition-all">
              + New Batch
            </button>
          </Link>
        </div>
        {/* HEADER SECTION END */}

        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-100 text-slate-900 uppercase font-semibold">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Formula</th>
                <th className="px-6 py-3">Target</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {batches?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No batches scheduled. Start a production run!
                  </td>
                </tr>
              ) : (
                batches?.map((batch: any) => (
                  <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono">
                      {new Date(batch.scheduled_for).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {batch.formulas?.name}
                    </td>
                    <td className="px-6 py-4">
                      {batch.target_yield} {batch.formulas?.batch_yield_unit}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(batch.status)} uppercase tracking-wide`}>
                        {batch.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Link href={`/batches/${batch.id}`} className="text-blue-600 hover:underline font-medium">
                         View
                       </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}