
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: AuthError | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<{
    error: AuthError | null;
    data: Session | null;
  }>;
  signOut: () => Promise<void>;
  googleSignIn: () => Promise<{
    error: AuthError | null;
    data: {
      provider: string;
      url: string | null;
    } | null;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Notify user about auth events if needed
        if (event === 'SIGNED_IN') {
          toast({
            title: 'Signed in successfully',
            description: `Welcome ${session?.user?.email}!`,
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: 'Signed out successfully',
            description: 'You have been signed out.',
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    const response = await supabase.auth.signInWithPassword({ email, password });
    return {
      error: response.error,
      data: response.data?.session
    };
  };

  const signUp = async (email: string, password: string, metadata?: { full_name?: string }) => {
    const response = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: metadata
      }
    });
    return {
      error: response.error,
      data: response.data?.session
    };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const googleSignIn = async () => {
    try {
      const response = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile`
        }
      });
      
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Google Sign-in failed",
          description: response.error.message === "Unsupported provider: provider is not enabled" 
            ? "Google login is not enabled in Supabase. Please enable it in the Supabase dashboard."
            : response.error.message,
        });
      }
      
      return response;
    } catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Google Sign-in failed",
        description: errorMessage,
      });
      
      return {
        error: new AuthError("Google sign-in failed", 400),
        data: null
      };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    googleSignIn
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
