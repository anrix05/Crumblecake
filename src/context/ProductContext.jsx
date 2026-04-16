import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch from Supabase on mount
  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) console.error("Error fetching products:", error);
      else setProducts(data || []);
      setLoading(false);
    };
    loadProducts();
  }, []);

  const addProduct = async (product) => {
    // Generate an ID if needed, or let Supabase default to uuid
    const newProduct = { ...product };
    // Wait for insertion
    const { data, error } = await supabase.from('products').insert([newProduct]).select();
    if (error) {
      console.error("Error adding product:", error);
    } else if (data && data.length > 0) {
      setProducts(prev => [data[0], ...prev]);
    }
  };

  const updateProduct = async (updatedProduct) => {
    const { error } = await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id);
    if (error) {
      console.error("Error updating product:", error);
    } else {
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    }
  };

  const deleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error("Error deleting product:", error);
    } else {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, loading }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
