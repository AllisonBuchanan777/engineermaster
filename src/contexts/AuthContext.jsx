import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // ✅ REQUIRED: Separate async operations object
  const profileOperations = {
    async load(userId) {
      if (!userId) return;
      setProfileLoading(true);
      try {
        const { data, error } = await supabase
          ?.from('user_profiles')
          ?.select('*')
          ?.eq('id', userId)
          ?.single();
        
        if (!error && data) {
          setUserProfile(data);
        } else if (error) {
          console.error('Profile load error:', error);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Profile operation error:', error);
        setUserProfile(null);
      } finally {
        setProfileLoading(false);
      }
    },
    
    clear() {
      setUserProfile(null);
      setProfileLoading(false);
    }
  };

  // ✅ REQUIRED: Protected auth handlers
  const authStateHandlers = {
    // CRITICAL: This MUST remain synchronous
    onChange: (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        profileOperations?.load(session?.user?.id); // Fire-and-forget
      } else {
        profileOperations?.clear();
      }
    }
  };

  // Auth methods
  const signUp = async ({ email, password, fullName, username, role = 'student', specialization }) => {
    try {
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
            role: role,
            specialization: specialization
          }
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase?.auth?.signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setUserProfile(null);
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase?.auth?.resetPasswordForEmail(email, {
        redirectTo: `${window.location?.origin}/reset-password`
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { data: null, error };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user?.id) throw new Error('No authenticated user');

      const { data, error } = await supabase?.from('user_profiles')?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.eq('id', user?.id)?.select()?.single();

      if (error) throw error;
      
      setUserProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { data: null, error };
    }
  };

  useEffect(() => {
    // Get initial session
    supabase?.auth?.getSession()?.then(({ data: { session } }) => {
      authStateHandlers?.onChange(null, session);
    });

    // PROTECTED: Never modify this callback signature
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      authStateHandlers?.onChange
    );

    return () => subscription?.unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    profileLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
