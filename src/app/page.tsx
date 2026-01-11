import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tighter">
          Batch.
        </h1>
        <p className="text-slate-500">The operating system for makers.</p>
      </div>

      <div className="mt-16 grid text-center lg:max-w-5xl lg:w-full lg:grid-cols-3 lg:text-left gap-4">
        
        {/* Card 1: Materials - This is the only one that works for now */}
        <Link href="/materials" className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-slate-300 hover:bg-slate-100 border-slate-200 bg-white shadow-sm">
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

        {/* Card 2: Formulas (Active) */}
        <Link href="/formulas" className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-slate-300 hover:bg-slate-100 border-slate-200 bg-white shadow-sm">
          <h2 className={`mb-3 text-2xl font-semibold text-slate-900`}>
            Formulas{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-slate-600`}>
            Build recipes and calculate yields.
          </p>
        </Link>

        {/* Card 3: Batches (Now Active) */}
        <Link href="/batches" className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-slate-300 hover:bg-slate-100 border-slate-200 bg-white shadow-sm">
          <h2 className={`mb-3 text-2xl font-semibold text-slate-900`}>
            Batches{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-slate-600`}>
            Schedule production and track inventory usage.
          </p>
        </Link>

        {/* Card 4: Shopping List */}
        <Link href="/shopping" className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-slate-300 hover:bg-slate-100 border-slate-200 bg-white shadow-sm">
          <h2 className={`mb-3 text-2xl font-semibold text-slate-900`}>
            Shopping{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-slate-600`}>
            Generate procurement lists from your production schedule.
          </p>
        </Link>

      </div>
    </main>
  );
}