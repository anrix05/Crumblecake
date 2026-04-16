import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
      if (error) console.error("Error fetching orders:", error);
      else setOrders(data || []);
      setLoading(false);
    };
    loadOrders();
  }, []);

  const addOrder = async (order) => {
    const newOrder = { 
      ...order, 
      id: `ORD-${Date.now().toString().slice(-6)}`, 
      date: new Date().toISOString(),
      status: 'Processing'
    };

    const { data, error } = await supabase.from('orders').insert([newOrder]).select();
    
    if (error) {
      console.error("Error adding order:", error);
    } else if (data && data.length > 0) {
      setOrders(prev => [data[0], ...prev]);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
      console.error("Error updating order:", error);
    } else {
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    }
  };

  const deleteOrder = async (orderId) => {
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) {
      console.error("Error deleting order:", error);
    } else {
      setOrders(prev => prev.filter(order => order.id !== orderId));
    }
  };

  const rateOrderItem = async (orderId, itemIndex, rating) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedItems = [...order.items];
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], user_rating: rating };

    const { error } = await supabase.from('orders').update({ items: updatedItems }).eq('id', orderId);
    
    if (error) {
      console.error("Error saving rating:", error);
    } else {
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, items: updatedItems } : o
      ));
    }
  };

  const updateOrderPrice = async (orderId, newPrice) => {
    const { error } = await supabase.from('orders').update({ total: newPrice }).eq('id', orderId);
    if (error) {
      console.error("Error updating order price:", error);
    } else {
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, total: newPrice } : o
      ));
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, deleteOrder, rateOrderItem, updateOrderPrice, loading }}>

      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);
