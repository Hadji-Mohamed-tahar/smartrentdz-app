/**
 * Apartment Service - Connected to SmartRent API
 */
import { apiGet, apiPost, apiPostForm, apiDelete } from "@/lib/api";

export interface Apartment {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  price_unit: 'day' | 'week' | 'month';
  wilaya: string;
  wilaya_id: number;
  municipality: string;
  rooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];
  is_featured: boolean;
  is_active: boolean;
  views: number;
  phone_clicks: number;
  created_at: string;
  landlord_id: string;
  landlord_phone: string;
  landlord_name: string;
  status: 'approved' | 'pending' | 'rejected';
  updated_at?: string;
  admin_notes?: string;
  latitude?: number | null;
  longitude?: number | null;
}

/** Map raw API apartment to our Apartment interface */
function mapApartment(raw: any): Apartment {
  return {
    id: String(raw.id),
    title: raw.title || '',
    description: raw.description || '',
    images: raw.images || [],
    price: parseFloat(raw.price) || 0,
    price_unit: raw.price_unit || 'day',
    wilaya: raw.wilaya || '',
    wilaya_id: raw.wilaya_id || 0,
    municipality: raw.municipality || '',
    rooms: raw.rooms || 0,
    bathrooms: raw.bathrooms || 0,
    area: parseFloat(raw.area) || 0,
    amenities: raw.amenities || [],
    is_featured: raw.is_featured || false,
    is_active: raw.is_active ?? true,
    views: raw.views_count ?? raw.views ?? 0,
    phone_clicks: raw.phone_clicks || 0,
    created_at: raw.created_at || '',
    landlord_id: String(raw.landlord_id || ''),
    landlord_phone: raw.landlord_phone || raw.landlord?.phone || '',
    landlord_name: raw.landlord_name || raw.landlord?.name || '',
    status: raw.status || 'pending',
    updated_at: raw.updated_at,
    admin_notes: raw.admin_notes,
    latitude: raw.latitude != null && raw.latitude !== '' ? parseFloat(raw.latitude) : null,
    longitude: raw.longitude != null && raw.longitude !== '' ? parseFloat(raw.longitude) : null,
  };
}

export const createApartment = async (data: any): Promise<string> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('wilaya', data.wilaya);
  formData.append('municipality', data.municipality);
  formData.append('price', String(data.price));
  formData.append('price_unit', data.price_unit);
  formData.append('rooms', String(data.rooms));
  formData.append('bathrooms', String(data.bathrooms));
  formData.append('area', String(data.area));

  if (typeof data.latitude === 'number' && Number.isFinite(data.latitude)) {
    formData.append('latitude', String(data.latitude));
  }
  if (typeof data.longitude === 'number' && Number.isFinite(data.longitude)) {
    formData.append('longitude', String(data.longitude));
  }

  if (data.amenities?.length) {
    data.amenities.forEach((a: string, i: number) => {
      formData.append(`amenities[${i}]`, a);
    });
  }

  if (data.images?.length) {
    data.images.forEach((file: File) => {
      formData.append('images[]', file);
    });
  }

  const res = await apiPostForm<{ status: string; message: string; data: any }>('/apartments', formData);
  return String(res.data?.id || '');
};

export const updateApartment = async (id: string, data: any): Promise<void> => {
  const formData = new FormData();

  if (data.title) formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.wilaya) formData.append('wilaya', data.wilaya);
  if (data.municipality) formData.append('municipality', data.municipality);
  if (data.price != null) formData.append('price', String(data.price));
  if (data.price_unit) formData.append('price_unit', data.price_unit);
  if (data.rooms != null) formData.append('rooms', String(data.rooms));
  if (data.bathrooms != null) formData.append('bathrooms', String(data.bathrooms));
  if (data.area != null) formData.append('area', String(data.area));

  if (typeof data.latitude === 'number' && Number.isFinite(data.latitude)) {
    formData.append('latitude', String(data.latitude));
  }
  if (typeof data.longitude === 'number' && Number.isFinite(data.longitude)) {
    formData.append('longitude', String(data.longitude));
  }

  if (data.amenities?.length) {
    data.amenities.forEach((a: string, i: number) => {
      formData.append(`amenities[${i}]`, a);
    });
  }

  if (data.images?.length) {
    data.images.forEach((file: File) => {
      formData.append('images[]', file);
    });
  }

  if (data.existing_images?.length) {
    data.existing_images.forEach((url: string, i: number) => {
      formData.append(`existing_images[${i}]`, url);
    });
  }

  await apiPostForm(`/apartments/${id}`, formData);
};

export const getApartmentById = async (id: string): Promise<Apartment | null> => {
  try {
    const res = await apiGet<{ status: string; data: any }>(`/apartments/${id}`);
    return mapApartment(res.data);
  } catch {
    return null;
  }
};

export const getAllApartments = async (filters?: {
  wilaya?: string;
  municipality?: string;
  price_unit?: string;
  rooms?: number;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
}): Promise<Apartment[]> => {
  try {
    let query = '';
    if (filters) {
      const params = new URLSearchParams();
      if (filters.wilaya) params.set('wilaya', filters.wilaya);
      if (filters.municipality) params.set('municipality', filters.municipality);
      if (filters.price_unit) params.set('price_unit', filters.price_unit);
      if (filters.rooms) params.set('rooms', String(filters.rooms));
      if (filters.min_price) params.set('min_price', String(filters.min_price));
      if (filters.max_price) params.set('max_price', String(filters.max_price));
      if (filters.sort_by) params.set('sort_by', filters.sort_by);
      const qs = params.toString();
      if (qs) query = `?${qs}`;
    }
    const res = await apiGet<{ status: string; data: any[] }>(`/apartments${query}`);
    const list = res.data || [];
    // List endpoint returns minimal fields. Fetch full details in parallel.
    const detailed = await Promise.all(
      list.map(async (item) => {
        try {
          const d = await apiGet<{ status: string; data: any }>(`/apartments/${item.id}`);
          return mapApartment({ ...item, ...d.data });
        } catch {
          return mapApartment(item);
        }
      })
    );
    return detailed;
  } catch {
    return [];
  }
};

export const getFeaturedApartments = async (): Promise<Apartment[]> => {
  const all = await getAllApartments();
  return all.filter(a => a.is_featured);
};

export const getApartmentsByLandlord = async (): Promise<Apartment[]> => {
  try {
    const res = await apiGet<{ status: string; data: any[] }>('/landlord/apartments');
    return (res.data || []).map(mapApartment);
  } catch {
    return [];
  }
};

export const getLandlordStats = async (): Promise<{
  total_views: number;
  phone_clicks: number;
  monthly_views: number;
  published_apartments: number;
  pending_apartments: number;
}> => {
  try {
    const res = await apiGet<{ status: string; data: any }>('/landlord/stats');
    const d = res.data;
    return {
      total_views: d.total_views || 0,
      phone_clicks: d.phone_clicks || 0,
      monthly_views: d.monthly_views || 0,
      published_apartments: d.published_apartments || 0,
      pending_apartments: d.pending_apartments || 0,
    };
  } catch {
    return {
      total_views: 0, phone_clicks: 0, monthly_views: 0,
      published_apartments: 0, pending_apartments: 0,
    };
  }
};

export const incrementPhoneClicks = async (id: string): Promise<void> => {
  try {
    await apiPost(`/apartments/${id}/phone-click`, {});
  } catch {
    // silently fail
  }
};

export const incrementViews = async (_id: string): Promise<void> => {
  // Views are auto-tracked by the API on GET /apartments/{id}
};

export const toggleApartmentStatus = async (_id: string, _isActive: boolean): Promise<void> => {
  throw new Error('هذه الميزة غير متوفرة حالياً');
};

export const deleteApartment = async (id: string): Promise<void> => {
  await apiDelete(`/apartments/${id}`);
};

export const searchApartments = async (filters: any): Promise<Apartment[]> => {
  return getAllApartments(filters);
};
