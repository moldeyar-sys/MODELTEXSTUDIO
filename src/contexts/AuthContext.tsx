import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../lib/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  /** true una vez que el perfil terminó de intentar cargarse (haya o no encontrado uno). */
  profileLoaded: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** hasSession=false cuando Supabase pide confirmar el email antes de dar sesión (hoy no pasa: autoconfirm está activo). */
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null; hasSession: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  /** Para la pantalla de /restablecer-contrasena (link del mail de recuperación). */
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // Separado de `profile`: sin esto, "no encontré perfil" (null) y "todavía no
  // terminó de buscarlo" (también null hasta que resuelva) son indistinguibles,
  // y AdminRoute quedaba esperando para siempre si la fila de perfil no existía
  // o la consulta fallaba.
  const [profileLoaded, setProfileLoaded] = useState(false);
  // Guarda el id del usuario cuyo perfil ya está cargado/cargándose. Antes,
  // CUALQUIER evento de onAuthStateChange con sesión (incluidos
  // TOKEN_REFRESHED cada ~30 min y el SIGNED_IN que auth-js dispara solo al
  // volver a poner el foco en la pestaña) volvía a poner profileLoaded en
  // false y relanzaba fetchProfile — eso desmontaba AdminRoute (spinner de
  // pantalla completa) y perdía cualquier formulario a medio completar, aun
  // sin que el usuario hubiera cambiado. Ahora solo se refetchea cuando el
  // id de usuario realmente cambia.
  const lastFetchedUserId = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    lastFetchedUserId.current = userId;
    setProfileLoaded(false);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) console.error('fetchProfile error', error);
      setProfile(data as Profile | null);
    } finally {
      setProfileLoaded(true);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfileLoaded(true);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        if (session.user.id !== lastFetchedUserId.current) {
          fetchProfile(session.user.id);
        }
      } else {
        lastFetchedUserId.current = null;
        setProfile(null);
        setProfileLoaded(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        // Adonde manda Supabase el link de confirmación SI se activa
        // "Confirm email" en el panel (hoy mailer_autoconfirm=true, así que
        // no aplica, pero sin esto el link caería en la Site URL genérica).
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    // Sin "Confirm email" (autoconfirm), signUp devuelve session de una. Si
    // algún día se activa la confirmación, data.session viene null y el
    // caller (RegisterPage) tiene que avisarle al usuario que revise su mail
    // en vez de asumir que ya puede entrar a /mi-cuenta.
    return { error: error?.message ?? null, hasSession: !!data.session };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Antes no se pasaba redirectTo: el link del mail caía en la Site URL
      // configurada en Supabase (a secas), y no existía ninguna página que
      // escuchara el evento de recuperación para pedir la contraseña nueva
      // — el link nunca terminaba de servir para nada.
      redirectTo: `${window.location.origin}/restablecer-contrasena`,
    });
    return { error: error?.message ?? null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No autenticado' };
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    }
    return { error: error?.message ?? null };
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileLoaded, signIn, signUp, signOut, resetPassword, updatePassword, updateProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
