import { supabase } from './supabase';
import type { HeroImage } from './types';

/** Imágenes activas del hero (carrusel público). Resiliente. */
export async function fetchActiveHeroImages(): Promise<HeroImage[]> {
  try {
    const { data, error } = await supabase
      .from('hero_images')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) return [];
    return (data as HeroImage[]) || [];
  } catch {
    return [];
  }
}

/** Todas las imágenes del hero (para el panel admin). Resiliente. */
export async function fetchAllHeroImages(): Promise<HeroImage[]> {
  try {
    const { data, error } = await supabase
      .from('hero_images')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) return [];
    return (data as HeroImage[]) || [];
  } catch {
    return [];
  }
}
