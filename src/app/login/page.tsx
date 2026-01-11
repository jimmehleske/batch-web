'use client'

import { useState } from 'react'
import { login } from './actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-md border border-slate-200 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">Batch Bakery Login</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input name="email" type="email" required className="w-full border p-2 rounded mt-1 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input name="password" type="password" required className="w-full border p-2 rounded mt-1 text-slate-900" />
          </div>
          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  )
}