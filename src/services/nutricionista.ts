import { neon } from '@/lib/neon';

export interface NutricionistaProfile {
  id: string;
  nome: string;
  email: string;
  created_at?: string;
}

/**
 * Fetches the nutritionist profile for the authenticated user from `public.nutricionistas`.
 */
export async function getNutricionistaById(
  userId: string
): Promise<NutricionistaProfile | null> {
  const { data, error } = await neon
    .from('nutricionistas')
    .select('id, nome, email, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as NutricionistaProfile | null;
}

/**
 * Saves or ensures a nutritionist record exists in `public.nutricionistas`
 * with `id` matching the Neon Auth user ID (required by RLS `id = auth.uid()`).
 */
export async function saveNutricionistaProfile(profile: {
  id: string;
  nome: string;
  email: string;
}): Promise<NutricionistaProfile> {
  const existing = await getNutricionistaById(profile.id);
  if (existing) {
    return existing;
  }

  const { data, error } = await neon
    .from('nutricionistas')
    .insert({
      id: profile.id,
      nome: profile.nome.trim(),
      email: profile.email.trim().toLowerCase(),
    })
    .select('id, nome, email, created_at')
    .single();

  if (error) {
    throw error;
  }

  return data as NutricionistaProfile;
}

