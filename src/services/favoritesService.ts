/**
 * Favorites Service - Connected to SmartRent API
 */
import { apiGet, apiPost } from "@/lib/api";

export interface FavoriteApartment {
  id: number;
  title: string;
  wilaya: string;
  price: string;
  images: string[];
}

export const getUserFavorites = async (_userId?: string): Promise<FavoriteApartment[]> => {
  try {
    const res = await apiGet<{ status: string; data: FavoriteApartment[] }>('/favorites');
    return res.data || [];
  } catch {
    return [];
  }
};

export const toggleFavorite = async (apartmentId: string): Promise<{ message: string }> => {
  const res = await apiPost<{ status: string; message: string }>(
    `/favorites/${apartmentId}`,
    {}
  );
  return { message: res.message };
};

export const isApartmentFavorited = async (_userId: string, apartmentId: string): Promise<boolean> => {
  try {
    const favorites = await getUserFavorites();
    return favorites.some(f => String(f.id) === String(apartmentId));
  } catch {
    return false;
  }
};
