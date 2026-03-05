import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../api/client';
import { UserSummary } from '@shared/types/domain.js';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  user: UserSummary | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: UserSummary, remember?: boolean) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'studyflow_token';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async (sessionToken: string | null) => {
      if (!sessionToken) {
        if (mounted) {
          setUser(null);
          setToken(null);
          localStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem(TOKEN_KEY);
        }
        return;
      }
      
      try {
        localStorage.setItem(TOKEN_KEY, sessionToken); // mantem retrocompatibilidade com interceptor do axios
        const response = await api.get('/auth/me');
        if (mounted) {
          setUser(response.data.user);
          setToken(sessionToken);
        }
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        if (mounted) {
          setUser(null);
          setToken(null);
        }
      }
    };

    // Se supabase não está configurado, encerrar loading e não tentar auth
    if (!supabase) {
      console.warn('Supabase não configurado. Autenticação desabilitada.');
      setLoading(false);
      return () => { mounted = false; };
    }

    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (mounted) {
        fetchUser(session?.access_token || null).finally(() => setLoading(false));
      }
    });

    // Escutar mudanças
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      await fetchUser(session?.access_token || null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = (newToken: string, newUser: UserSummary, remember?: boolean) => {
    // Agora SignIn será lidado pelos componentes usando supabase.auth.signInWithPassword
    // Este método é mantido para transições secundárias ou compatibilidade
    const primaryStorage = remember !== false ? localStorage : sessionStorage;
    primaryStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const refresh = async () => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
      setToken(session.access_token);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
