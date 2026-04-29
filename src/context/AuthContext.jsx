import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [savedName, setSavedName] = useState('');
  const [savedPhone, setSavedPhone] = useState('');
  const [savedAddress, setSavedAddress] = useState('');

  useEffect(() => {
    // Get initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        // Sync saved address, name, phone from metadata if it exists
        setSavedAddress(session.user.user_metadata?.address || '');
        setSavedName(session.user.user_metadata?.full_name || '');
        setSavedPhone(session.user.user_metadata?.phone || '');
      }
      setLoading(false);
    };

    checkSession();

    // Listen to auth changes (Sign in / Sign out, etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setSavedAddress(session.user.user_metadata?.address || '');
          setSavedName(session.user.user_metadata?.full_name || '');
          setSavedPhone(session.user.user_metadata?.phone || '');
        } else {
          setSavedAddress('');
          setSavedName('');
          setSavedPhone('');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };
  
  const signUp = async (email, password) => {
    return await supabase.auth.signUp({ email, password });
  };

  const resetPassword = async (email) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
  };

  const updateProfile = async (updates) => {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });
    if (!error) {
      setSavedAddress(data.user.user_metadata?.address || '');
      setSavedName(data.user.user_metadata?.full_name || '');
      setSavedPhone(data.user.user_metadata?.phone || '');
    }
    return { data, error };
  };

  const isAdmin = user?.email === 'chef@crumblecakes.in';

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      signIn, 
      signUp, 
      signOut, 
      updateProfile,
      resetPassword,
      savedName,
      savedPhone,
      savedAddress,
      loading, 
      isAuthModalOpen, 
      setIsAuthModalOpen 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
