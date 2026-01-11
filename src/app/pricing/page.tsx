'use client'

import { useState } from 'react'

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

    try {
      // We use a public CORS proxy to bypass browser restrictions
      // Note: This is for development/personal use. Production apps usually need a paid proxy.
      const PROXY_URL = 'https://corsproxy.io/?'
      const WOOLIES_API = 'https://www.woolworths.com.au/apis/ui/Search/products'
      
      const payload = {
        SearchTerm: term,
        PageSize: 10,
        PageNumber: 1,
        SortType: "Relevance",
        Location: "/shop/search/products",
        IsSpecial: false,
        Filters: [],
        LocationId: 0
      };

      const response = await fetch(PROXY_URL + encodeURIComponent(WOOLIES_API), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Woolies checks these to ensure it looks like a real request
          'Origin': 'https://www.woolworths.com.au',
          'Referer': 'https://www.woolworths.com.au',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Blocked by supermarket (${response.status})`)
      }

      const data = await response.json();

      const products = data.Products
        ?.filter((p: any) => p.Products && p.Products[0])
        .map((p: any) => {
          const item = p.Products[0];
          return {
            Stockcode: item.Stockcode,
            Name: item.DisplayName || item.Name,
            Price: item.Price,
            IsAvailable: item.IsAvailable,
            PackageSize: item.PackageSize
          };
        }) || [];

      setResults(products);

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to fetch prices')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-4 md:p-24 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Live Price Checker</h1>
        
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
            {loading ? '...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {results.map((item) => (
            <div key={item.Stockcode} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">{item.Name}</h3>
                <p className="text-sm text-slate-500">{item.PackageSize} • Stockcode: {item.Stockcode}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-700">${item.Price?.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}