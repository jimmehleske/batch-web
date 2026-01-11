'use client'

import { useState } from 'react'
// We import the Server Action we just created
import { createFormula } from './actions'

// Type definition for the data passing in
type MasterIngredient = {
  id: string
  name: string
  default_unit: string
}

export default function FormulaForm({ ingredients }: { ingredients: MasterIngredient[] }) {
  // We need at least one row to start
  const [rows, setRows] = useState([1])

  function addRow() {
    setRows([...rows, rows.length + 1])
  }

  function removeRow(index: number) {
    if (rows.length === 1) return // Don't delete the last row
    const newRows = [...rows]
    newRows.splice(index, 1)
    setRows(newRows)
  }

  return (
    <form action={createFormula} className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 space-y-8">
      
      {/* --- HEADER SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-900 mb-1">Formula Name</label>
          <input name="name" type="text" required placeholder="e.g. Vanilla Cupcakes (Batch of 12)" className="w-full rounded-md border-slate-300 border p-2 text-slate-900" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Batch Yield (Qty)</label>
          <input name="yieldQty" type="number" defaultValue="1" required className="w-full rounded-md border-slate-300 border p-2 text-slate-900" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Yield Unit</label>
          <input name="yieldUnit" type="text" defaultValue="units" placeholder="e.g. cupcakes / kg / trays" className="w-full rounded-md border-slate-300 border p-2 text-slate-900" />
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* --- INGREDIENTS SECTION --- */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Ingredients</h3>
        
        <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
                <div className="col-span-6">Ingredient</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-3">Unit</div>
                <div className="col-span-1"></div>
            </div>

            {rows.map((row, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-start">
                {/* Ingredient Select */}
                <div className="col-span-6">
                    <select name="ingredientId" required className="w-full rounded-md border-slate-300 border p-2 text-slate-900 bg-white">
                        <option value="">Select...</option>
                        {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                                {ing.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Quantity */}
                <div className="col-span-2">
                    <input name="qty" type="number" step="any" required placeholder="0" className="w-full rounded-md border-slate-300 border p-2 text-slate-900" />
                </div>

                {/* Unit */}
                <div className="col-span-3">
                    <select name="unit" className="w-full rounded-md border-slate-300 border p-2 text-slate-900 bg-white">
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="L">L</option>
                        <option value="cups">cups</option>
                        <option value="tsp">tsp</option>
                        <option value="tbsp">tbsp</option>
                        <option value="unit">unit</option>
                    </select>
                </div>

                {/* Remove Button */}
                <div className="col-span-1 flex justify-center pt-2">
                    <button type="button" onClick={() => removeRow(index)} className="text-slate-400 hover:text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
                    </button>
                </div>
            </div>
            ))}
        </div>

        <button type="button" onClick={addRow} className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
            + Add another ingredient
        </button>
      </div>

      <div className="pt-4">
        <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-md font-bold hover:bg-slate-800 transition-all shadow-lg">
            Save Formula
        </button>
      </div>

    </form>
  )
}