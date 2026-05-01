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
    try {
      const { data, error } = await supabase.from('products').insert([product]).select();
      if (error) throw error;
      if (data && data.length > 0) {
        setProducts(prev => [data[0], ...prev]);
        return { success: true, data: data[0] };
      }
      return { success: false, error: { message: 'No data returned' } };
    } catch (error) {
      console.error("Error adding product:", error);
      return { success: false, error };
    }
  };

  const updateProduct = async (updatedProduct) => {
    try {
      const { error } = await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id);
      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      return { success: true };
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false, error };
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

  const fetchReviews = async (productId) => {
    try {
      const { data, error } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Error fetching reviews:", e);
      return [];
    }
  };

  const addReview = async (review) => {
    try {
      const { data, error } = await supabase.from('reviews').insert([review]).select();
      if (error) throw error;
      return data?.[0] || null;
    } catch (e) {
      console.error("Error adding review:", e);
      return null;
    }
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, fetchReviews, addReview, loading }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
