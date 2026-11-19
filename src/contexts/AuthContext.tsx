import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { neon } from '@/lib/neon';
import { getFriendlyAuthErrorMessage } from '@/lib/auth-errors';
import {
  getNutricionistaById,
  saveNutricionistaProfile,
  type NutricionistaProfile,
} from '@/services/nutricionista';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  nutricionista: NutricionistaProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (params: { email: string; password: string }) => Promise<void>;
  signUp: (params: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: sessionData, isPending, refetch } = neon.auth.useSession();
  const [nutricionista, setNutricionista] =
    useState<NutricionistaProfile | null>(null);
  const [isSyncingProfile, setIsSyncingProfile] = useState(false);

  const user = (sessionData?.user as AuthUser | undefined) ?? null;
  const session = sessionData?.session ?? null;
  const isAuthenticated = Boolean(user && session);

  useEffect(() => {
    let cancelled = false;

    if (!user?.id) {
      setNutricionista(null);
      setIsSyncingProfile(false);
      return;
    }

    setIsSyncingProfile(true);
    getNutricionistaById(user.id)
      .then(async (existing) => {
        if (cancelled) return;
        if (existing) {
          setNutricionista(existing);
          return;
        }
        const created = await saveNutricionistaProfile({
          id: user.id,
          nome: user.name || user.email.split('@')[0],
          email: user.email,
        });
        if (!cancelled) {
          setNutricionista(created);
        }
      })
      .catch((err) => {
        console.error('Erro ao sincronizar perfil do nutricionista:', err);
      })
      .finally(() => {
        if (!cancelled) {
          setIsSyncingProfile(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.name, user?.email]);

  const signIn = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const normalizedEmail = email.trim().toLowerCase();

      let result: Awaited<ReturnType<typeof neon.auth.signIn.email>>;
      try {
        result = await neon.auth.signIn.email({
          email: normalizedEmail,
          password,
          rememberMe: true,
        });
      } catch (err) {
        throw new Error(getFriendlyAuthErrorMessage(err, 'login'));
      }

      if (result.error) {
        throw new Error(getFriendlyAuthErrorMessage(result.error, 'login'));
      }

      const freshSession = await neon.auth.getSession();
      const signedInUser = freshSession.data?.user as AuthUser | undefined;

      if (signedInUser?.id) {
        try {
          const profile = await saveNutricionistaProfile({
            id: signedInUser.id,
            nome: signedInUser.name || normalizedEmail.split('@')[0],
            email: signedInUser.email || normalizedEmail,
          });
          setNutricionista(profile);
        } catch (profileErr) {
          console.error('Erro ao garantir registro do nutricionista:', profileErr);
        }
      }

      await refetch();
    },
    [refetch]
  );

  const signUp = useCallback(
    async ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => {
      const trimmedName = name.trim();
      const normalizedEmail = email.trim().toLowerCase();

      let result: Awaited<ReturnType<typeof neon.auth.signUp.email>>;
      try {
        result = await neon.auth.signUp.email({
          name: trimmedName,
          email: normalizedEmail,
          password,
        });
      } catch (err) {
        throw new Error(getFriendlyAuthErrorMessage(err, 'signup'));
      }

      if (result.error) {
        throw new Error(getFriendlyAuthErrorMessage(result.error, 'signup'));
      }

      const freshSession = await neon.auth.getSession();
      const createdUser =
        (freshSession.data?.user as AuthUser | undefined) ??
        (result.data?.user as AuthUser | undefined);

      if (!createdUser?.id) {
        throw new Error(
          'Conta criada, mas não foi possível iniciar a sessão. Tente fazer login.'
        );
      }

      try {
        const profile = await saveNutricionistaProfile({
          id: createdUser.id,
          nome: trimmedName,
          email: normalizedEmail,
        });
        setNutricionista(profile);
      } catch (profileErr) {
        console.error(
          'Erro ao salvar nutricionista na tabela nutricionistas:',
          profileErr
        );
        throw new Error(
          'Sua conta foi criada, mas houve um erro ao salvar seu perfil profissional. Tente fazer login novamente.'
        );
      }

      await refetch();
    },
    [refetch]
  );

  const signOut = useCallback(async () => {
    try {
      await neon.auth.signOut();
    } finally {
      setNutricionista(null);
      await refetch();
    }
  }, [refetch]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      nutricionista,
      isAuthenticated,
      isLoading: isPending || (isAuthenticated && isSyncingProfile && !nutricionista),
      signIn,
      signUp,
      signOut,
    }),
    [
      user,
      nutricionista,
      isAuthenticated,
      isPending,
      isSyncingProfile,
      signIn,
      signUp,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.');
  }
  return ctx;
}

