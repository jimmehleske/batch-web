'use client'

import { useState } from 'react'
import { adjustStock } from './actions'

export default function AdjustStockForm({ items }: { items: any[] }) {
  const [selectedItemId, setSelectedItemId] = useState('')
  
  // Find the details of the item the user just picked
  const selectedItem = items.find(i => i.id === selectedItemId)

  // Calculate the helpful text
  // e.g. "Buying Unit: 12.5 kg"
  const unitLabel = selectedItem 
    ? `${selectedItem.purchase_quantity} ${selectedItem.purchase_unit}`
    : 'Supplier Unit'

  return (
    <form action={adjustStock} className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 space-y-6">
      
      {/* 1. Item Selection */}
      <div>
        <label className="block text-sm font-bold text-slate-900 mb-1">Item to Adjust</label>
        <select 
          name="itemId" 
          required 
          className="w-full rounded-md border-slate-300 border p-2 text-slate-900 bg-white"
          onChange={(e) => setSelectedItemId(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Select item...</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.master_ingredients.name} — {item.brand} ({item.supplier})
            </option>
          ))}
        </select>
      </div>

      {/* 2. Action Type */}
      <div className="grid grid-cols-2 gap-6">
         <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Action</label>
            <select name="type" className="w-full rounded-md border-slate-300 border p-2 text-slate-900 bg-white">
                <option value="add">Receive Stock (+)</option>
                <option value="remove">Write-off / Waste (-)</option>
            </select>
         </div>
         
         {/* 3. Quantity with Dynamic Label */}
         <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
            <div className="relative">
                <input 
                  name="quantity" 
                  type="number" 
                  step="any" 
                  required 
                  placeholder="0"
                  className="w-full rounded-md border-slate-300 border p-2 text-slate-900 pr-24" 
                />
                {/* The Magic Label showing the unit */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-slate-400 text-sm font-medium">
                        x {unitLabel}
                    </span>
                </div>
            </div>
         </div>
      </div>
      
      {/* Helper Text */}
      {selectedItem && (
        <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded border border-blue-100">
            <strong>Tip:</strong> You are adjusting by the <em>pack</em>. 
            <br/>
            Entering <strong>1</strong> adds <strong>{selectedItem.purchase_quantity}{selectedItem.purchase_unit}</strong> to your stock.
        </div>
      )}

      {/* 4. Reason */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Reason / Reference</label>
        <input 
          name="reason" 
          type="text" 
          required
          placeholder="e.g. Invoice #1234 or 'Spilled bag'"
          className="w-full rounded-md border-slate-300 border p-2 text-slate-900" 
        />
      </div>

      <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-md font-bold hover:bg-slate-800 transition-all shadow-lg">
        Save Adjustment
      </button>

    </form>
  )
}