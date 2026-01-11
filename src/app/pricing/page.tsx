'use client'

import { useState } from 'react'
import { searchWoolies } from '@/app/actions/pricing'

export default function PricingPage() {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResults([])
    
    // Call the server action (which now uses ZenRows)
    const { products, error: apiError } = await searchWoolies(term)
    
    if (apiError) setError(apiError)
    if (products) {
        if (products.length === 0) setError("No products found. Try a different search term.")
        setResults(products)
    }
    
    setLoading(false)
  }

  return (
    <main className="p-4 md:p-24 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Live Price Checker</h1>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded border border-green-200">
                POWERED BY ZENROWS
            </span>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input 
            type="text" 
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g. Flour, Sugar, Butter"
            className="flex-1 p-3 border border-slate-300 rounded-lg text-slate-900 shadow-sm"
          />
          <button 
            disabled={loading}
            className="bg-slate-900 text-white px-6 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-70 transition-all flex items-center gap-2"
          >
            {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {loading ? 'Scanning...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {results.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center transition-all hover:border-blue-300">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{item.Name}</h3>
                {item.PackageSize && (
                    <p className="text-sm text-slate-500">{item.PackageSize}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">${item.Price?.toFixed(2)}</div>
                <button 
                  className="text-xs text-blue-600 font-medium hover:underline mt-1"
                  onClick={() => alert('Feature coming soon: This will save the price to your database!')}
                >
                  + Update Cost
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}