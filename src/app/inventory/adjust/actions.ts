'use server'

import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export async function adjustStock(formData: FormData) {
  
  const itemId = formData.get('itemId') as string
  const quantity = parseFloat(formData.get('quantity') as string)
  const reason = formData.get('reason') as string
  const type = formData.get('type') as string // 'add' or 'remove'

  if (!itemId || isNaN(quantity)) {
    throw new Error('Invalid input')
  }

  // If removing stock, make the number negative
  const finalQty = type === 'remove' ? -Math.abs(quantity) : Math.abs(quantity)

  const supabase = await createClient()
  const { error } = await supabase.from('inventory_transactions').insert({
    supplier_item_id: itemId,
    quantity_change: finalQty,
    reason: reason || 'manual_adjustment'
  })

  if (error) {
    throw new Error('Failed to adjust stock: ' + error.message)
  }

  redirect('/inventory')
}