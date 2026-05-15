import { createClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// 1. The Server Action
async function createMaterial(formData: FormData) {
  'use server';

  const supabase = await createClient();
  
  // THE FIX: Explicitly get the logged-in user so we can stamp the database rows
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to add materials.');

  const rawName = formData.get('name') as string;
  const supplier = formData.get('supplier') as string;
  const brand = formData.get('brand') as string;
  const cost = parseFloat(formData.get('cost') as string);
  const quantity = parseFloat(formData.get('quantity') as string);
  const unit = formData.get('unit') as string;

  const masterName = rawName.trim();

  let masterId: string;
  
  // A. Check if the ingredient already exists
  const { data: existingMaster } = await supabase
    .from('master_ingredients')
    .select('id')
    .ilike('name', masterName)
    .single();

  if (existingMaster) {
    masterId = existingMaster.id;
  } else {
    // B. Create new ingredient WITH THE USER ID STAMP
    const { data: newMaster, error: masterError } = await supabase
      .from('master_ingredients')
      .insert({ 
        name: masterName, 
        default_unit: 'g',
        user_id: user.id // <--- The Multi-Tenant Fix
      })
      .select()
      .single();

    if (masterError) {
      console.error("Master Insert Error:", masterError);
      throw new Error(`Database Error: ${masterError.message}`);
    }
    masterId = newMaster.id;
  }

  // C. Create the supplier details WITH THE USER ID STAMP
  const { error: supplierError } = await supabase.from('supplier_items').insert({
    master_ingredient_id: masterId,
    supplier,
    brand,
    cost,
    purchase_quantity: quantity,
    purchase_unit: unit,
    is_primary: true,
    user_id: user.id // <--- The Multi-Tenant Fix
  });

  if (supplierError) {
    console.error("Supplier Insert Error:", supplierError);
    throw new Error(`Database Error: ${supplierError.message}`);
  }

  // D. Success! Go back to the materials list.
  redirect('/materials');
}


// 2. The Page Component
export default async function NewMaterialPage() {
  
  const supabase = await createClient(); 
  const { data: existingMasters } = await supabase
    .from('master_ingredients')
    .select('name')
    .order('name');

  return (
    <main className="min-h-screen p-24 bg-slate-50">
      <div className="max-w-md mx-auto">
        <Link href="/materials" className="text-slate-500 hover:text-slate-800 hover:underline mb-6 block">
          ← Back to Materials
        </Link>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Add New Material</h1>

        <form action={createMaterial} className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 space-y-6">
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
             <label className="block text-sm font-bold text-blue-900 mb-1">
                Master Ingredient Name
             </label>
             <p className="text-xs text-blue-600 mb-2">
                Start typing to select an existing ingredient, or create a new one.
             </p>
             
             <input 
               name="name" 
               type="text" 
               required 
               list="master-options" 
               placeholder="e.g. Plain Flour"
               autoComplete="off"
               className="w-full rounded-md border-slate-300 shadow-sm p-2 border text-slate-900 font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
             />

             <datalist id="master-options">
               {existingMasters?.map((m) => (
                 <option key={m.name} value={m.name} />
               ))}
             </datalist>
          </div>

          <hr className="border-slate-100" />

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Supplier Details</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                    <input name="supplier" type="text" placeholder="e.g. Coles" className="w-full rounded-md border-slate-300 shadow-sm p-2 border text-slate-900" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                    <input name="brand" type="text" placeholder="e.g. Essentials" className="w-full rounded-md border-slate-300 shadow-sm p-2 border text-slate-900" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cost ($)</label>
                <input name="cost" type="number" step="0.01" required placeholder="0.00" className="w-full rounded-md border-slate-300 shadow-sm p-2 border text-slate-900" />
                </div>
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Qty</label>
                <div className="flex gap-2">
                    <input name="quantity" type="number" step="0.01" required placeholder="1" className="w-full rounded-md border-slate-300 shadow-sm p-2 border text-slate-900" />
                    <select name="unit" className="rounded-md border-slate-300 shadow-sm p-2 border bg-white text-slate-900">
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="ml">ml</option>
                    <option value="unit">unit</option>
                    </select>
                </div>
                </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-md font-semibold hover:bg-slate-700 transition-colors shadow-lg">
            Save Inventory Item
          </button>

        </form>
      </div>
    </main>
  );
}