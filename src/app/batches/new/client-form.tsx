'use client'

import { useState } from 'react'
import { createBatch } from './actions'

export default function BatchForm({ formulas }: { formulas: any[] }) {
  const [selectedFormulaId, setSelectedFormulaId] = useState('')
  
  // Find the selected formula object so we can show its unit (e.g. "cookies")
  const selectedFormula = formulas.find(f => f.id === selectedFormulaId)
  const unitLabel = selectedFormula ? selectedFormula.batch_yield_unit : 'units'

  return (
    <form action={createBatch} className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 space-y-6">
      
      {/* 1. Date Picker */}
      <div>
        <label className="block text-sm font-bold text-slate-900 mb-1">Scheduled Date</label>
        <input 
          name="date" 
          type="date" 
          required 
          defaultValue={new Date().toISOString().split('T')[0]} // Defaults to Today
          className="w-full rounded-md border-slate-300 border p-2 text-slate-900" 
        />
      </div>

      {/* 2. Formula Select */}
      <div>
        <label className="block text-sm font-bold text-slate-900 mb-1">Recipe to Produce</label>
        <select 
          name="formulaId" 
          required 
          className="w-full rounded-md border-slate-300 border p-2 text-slate-900 bg-white"
          onChange={(e) => setSelectedFormulaId(e.target.value)}
        >
          <option value="">Select a recipe...</option>
          {formulas.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} (Default Batch: {f.batch_yield_quantity} {f.batch_yield_unit})
            </option>
          ))}
        </select>
      </div>

      {/* 3. Target Yield */}
      <div>
        <label className="block text-sm font-bold text-slate-900 mb-1">Target Quantity</label>
        <div className="flex gap-2 items-center">
            <input 
            name="targetYield" 
            type="number" 
            step="any" 
            required 
            placeholder="e.g. 24" 
            className="w-full rounded-md border-slate-300 border p-2 text-slate-900" 
            />
            <span className="text-slate-500 font-medium w-24">
                {unitLabel}
            </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
            How many do you plan to make? We will calculate ingredients based on this.
        </p>
      </div>

      <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-md font-bold hover:bg-slate-800 transition-all shadow-lg mt-4">
        Schedule Production
      </button>

    </form>
  )
}