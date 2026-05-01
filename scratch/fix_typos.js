import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTypos() {
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  for (const product of products) {
    let newName = product.name;
    let newDesc = product.description;
    let newCat = product.category;

    // Fix "Choclate" -> "Chocolate"
    if (newName.includes('Choclate')) newName = newName.replace(/Choclate/g, 'Chocolate');
    if (newDesc && newDesc.includes('Choclate')) newDesc = newDesc.replace(/Choclate/g, 'Chocolate');
    if (newCat && newCat.includes('Choclate')) newCat = newCat.replace(/Choclate/g, 'Chocolate');

    // Fix "Vanila" -> "Vanilla"
    if (newName.includes('Vanila')) newName = newName.replace(/Vanila/g, 'Vanilla');
    if (newDesc && newDesc.includes('Vanila')) newDesc = newDesc.replace(/Vanila/g, 'Vanilla');
    if (newCat && newCat.includes('Vanila')) newCat = newCat.replace(/Vanila/g, 'Vanilla');

    if (newName !== product.name || newDesc !== product.description || newCat !== product.category) {
      console.log(`Updating ${product.name} to ${newName}...`);
      const { error: updateError } = await supabase.from('products').update({
        name: newName,
        description: newDesc,
        category: newCat
      }).eq('id', product.id);
      
      if (updateError) console.error(`Error updating ${product.id}:`, updateError);
    }
  }
}

fixTypos();
