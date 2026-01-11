import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-slate-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-slate-200 bg-white pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4">
          Batch Bakery System&nbsp;
          <code className="font-mono font-bold">v1.0</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white lg:static lg:h-auto lg:w-auto lg:bg-none">
           <span className="text-slate-500">
             Logged in as {user?.email}
           </span>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left gap-4">
        
        {/* Card 1: Materials */}
        <Link
          href="/materials"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-slate-300 hover:bg-slate-100 border-slate-200 bg-white shadow-sm"
        >
          <h2 className={`mb-3 text-2xl font-semibold text-slate-900`}>
            Materials{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-slate-600`}>
            Manage ingredients, suppliers, and costs.
          </p>
        </Link>

        {/* Card 2: Formulas */}
        <Link
          href="/formulas"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-slate-300 hover:bg-slate-100 border-slate-200 bg-white shadow-sm"
        >
          <h2 className={`mb-3 text-2xl font-semibold text-slate-900`}>
            Formulas{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-slate-600`}>
            Create recipes and calculate yields.
          </p>
        </Link>

        {/* Card 3: Batches */}
        <Link
          href="/batches"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-slate-300 hover:bg-slate-100 border-slate-200 bg-white shadow-sm"
        >
          <h2 className={`mb-3 text-2xl font-semibold text-slate-900`}>
            Schedule{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-slate-600`}>
            Plan production runs and track status.
          </p>
        </Link>

        {/* Card 4: Shopping */}
        <Link
          href="/shopping"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-slate-300 hover:bg-slate-100 border-slate-200 bg-white shadow-sm"
        >
          <h2 className={`mb-3 text-2xl font-semibold text-slate-900`}>
            Shopping{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-slate-600`}>
            Generate procurement lists from production.
          </p>
        </Link>

        {/* Card 5: Inventory */}
        <Link
          href="/inventory"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-slate-300 hover:bg-slate-100 border-slate-200 bg-white shadow-sm"
        >
          <h2 className={`mb-3 text-2xl font-semibold text-slate-900`}>
            Inventory{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-slate-600`}>
            Track stock levels and value on hand.
          </p>
        </Link>

        {/* Card 6: Live Pricing (NEW) */}
        <Link
          href="/pricing"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-slate-300 hover:bg-slate-100 border-slate-200 bg-white shadow-sm"
        >
          <h2 className={`mb-3 text-2xl font-semibold text-slate-900`}>
            Live Pricing{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-slate-600`}>
            Check current supermarket prices.
          </p>
        </Link>

      </div>
    </main>
  )
}