'use server'

import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export async function createFormula(formData: FormData) {
  const supabase = await createClient()

  // 1. THE FIX: Explicitly get the logged-in user so we can stamp the database rows
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be logged in to create a formula.')

  // Extract the main formula details
  const name = formData.get('name') as string
  const yieldQty = parseFloat(formData.get('yieldQty') as string)
  const yieldUnit = formData.get('yieldUnit') as string

  // Extract the arrays of ingredients (since there are multiple rows)
  const ingredientIds = formData.getAll('ingredientId')
  const quantities = formData.getAll('qty')
  const units = formData.getAll('unit')

  // 2. Insert the main Formula WITH THE USER ID STAMP
  const { data: formula, error: formulaError } = await supabase
    .from('formulas')
    .insert({
      name,
      batch_yield_quantity: yieldQty,
      batch_yield_unit: yieldUnit,
      user_id: user.id // <--- The Multi-Tenant Fix
    })
    .select()
    .single()

  if (formulaError) {
    console.error("Formula Insert Error:", formulaError)
    throw new Error(`Database Error: ${formulaError.message}`)
  }

  // 3. Build the list of ingredient rows to save
  const formulaItems = ingredientIds.map((id, index) => ({
    formula_id: formula.id,
    master_ingredient_id: id,
    quantity_required: parseFloat(quantities[index] as string),
    unit_used: units[index],
    user_id: user.id // <--- The Multi-Tenant Fix for the items too!
  }))

  // 4. Insert all the ingredients at once
  const { error: itemsError } = await supabase
    .from('formula_items')
    .insert(formulaItems)

  if (itemsError) {
    console.error("Formula Items Insert Error:", itemsError)
    throw new Error(`Database Error: ${itemsError.message}`)
  }

  // 5. Success! Go back to the formulas list
  redirect('/formulas')
}