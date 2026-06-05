import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;
const isLiveAuth = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

if (isLiveAuth) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export interface UserSession {
  email: string | null;
  isAdmin: boolean;
}

export const authService = {
  isLive: () => {
    return isLiveAuth;
  },

  signIn: async (emailOrUsername: string, password: string): Promise<UserSession> => {
    if (isLiveAuth && supabase) {
      // Live Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@vna.com.vn`, // Auto fallback if username
        password: password,
      });

      if (error) throw new Error(error.message);
      return {
        email: data.user?.email || null,
        isAdmin: true,
      };
    } else {
      // Demo Mode Auth
      if (emailOrUsername === 'admin' && password === 'admin123') {
        const session = { email: 'admin@vna-pickleball.com', isAdmin: true };
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('vna_demo_session', JSON.stringify(session));
        }
        return session;
      } else {
        throw new Error('Invalid username or password. (Demo: admin / admin123)');
      }
    }
  },

  signOut: async (): Promise<void> => {
    if (isLiveAuth && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
    } else {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('vna_demo_session');
      }
    }
  },

  getCurrentUser: async (): Promise<UserSession | null> => {
    if (isLiveAuth && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      return {
        email: user.email || null,
        isAdmin: true,
      };
    } else {
      if (typeof window !== 'undefined') {
        const session = sessionStorage.getItem('vna_demo_session');
        return session ? JSON.parse(session) : null;
      }
      return null;
    }
  },

  subscribeToAuthChanges: (callback: (session: UserSession | null) => void) => {
    if (isLiveAuth && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session && session.user) {
          callback({
            email: session.user.email || null,
            isAdmin: true,
          });
        } else {
          callback(null);
        }
      });
      return () => subscription.unsubscribe();
    } else {
      // Poll session storage for changes in Demo Mode
      const checkSession = () => {
        const sessionStr = sessionStorage.getItem('vna_demo_session');
        const session = sessionStr ? JSON.parse(sessionStr) : null;
        callback(session);
      };
      
      checkSession();
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', checkSession);
        return () => window.removeEventListener('storage', checkSession);
      }
      return () => {};
    }
  }
};
