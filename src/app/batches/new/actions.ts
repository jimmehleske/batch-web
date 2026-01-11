'use server'

import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export async function createBatch(formData: FormData) {
  
  const formulaId = formData.get('formulaId') as string
  const date = formData.get('date') as string
  const targetYield = parseFloat(formData.get('targetYield') as string)

  if (!formulaId || !targetYield) {
    throw new Error('Please select a formula and quantity.')
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('batches')
    .insert({
      formula_id: formulaId,
      scheduled_for: date, // e.g. '2023-10-25'
      target_yield: targetYield,
      status: 'planned'
    })

  if (error) {
    throw new Error('Failed to schedule batch: ' + error.message)
  }

  redirect('/batches')
}