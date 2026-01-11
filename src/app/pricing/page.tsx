'use client'

import { useState } from 'react'
import { searchWoolies } from '@/app/actions/pricing'

export default function PricingPage() {
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    // Call our server action
    const { products, error } = await searchWoolies(term)
    
    if (products) setResults(products)
    if (error) alert(error)
    
    setLoading(false)
  }

  return (
    <main className="p-24 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Live Price Checker</h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input 
            type="text" 
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g. Baker's Flour"
            className="flex-1 p-3 border border-slate-300 rounded-lg text-slate-900"
          />
          <button 
            disabled={loading}
            className="bg-green-600 text-white px-6 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Results List */}
        <div className="space-y-4">
          {results.map((item) => (
            <div key={item.Stockcode} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">{item.Name}</h3>
                <p className="text-sm text-slate-500">{item.PackageSize} • Stockcode: {item.Stockcode}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-700">${item.Price?.toFixed(2)}</div>
                <button 
                  onClick={() => alert(`Ideally, this would save '${item.Name}' to your database!`)}
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  + Add to Inventory
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}