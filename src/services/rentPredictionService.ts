const PREDICTION_API_URL = "https://smartrent-pricing-ia.onrender.com/predict";

export type RentType = "monthly" | "daily";
export type PropertyType = "Apartment" | "Villa" | "Studio";
export type BinaryChoice = 0 | 1;

export const SUPPORTED_WILAYAS = ["Algiers", "Oran", "Setif", "M'Sila", "Constantine"] as const;

export const MUNICIPALITIES_BY_WILAYA: Record<(typeof SUPPORTED_WILAYAS)[number], string[]> = {
  Algiers: ["Sidi M'Hamed", "Hydra", "Zeralda", "Bab Ezzouar", "El Biar"],
  Oran: ["Akid Lotfi", "Bir El Djir", "Es Senia", "Oran City"],
  Setif: ["Setif City", "El Eulma", "Ain Arnat"],
  "M'Sila": ["M'Sila City", "Boussaada", "Magra"],
  Constantine: ["Constantine City", "Ali Mendjeli", "El Khroub"],
};

export const PROPERTY_TYPES: PropertyType[] = ["Apartment", "Villa", "Studio"];
export const RENT_TYPES: RentType[] = ["monthly", "daily"];
export const AMENITIES = [
  "Wifi",
  "Air Conditioning",
  "Elevator",
  "Parking",
  "Heating",
  "Security 24/7",
  "Pool",
  "Garden",
] as const;

export interface ApartmentFeatures {
  area: number;
  rooms: number;
  bathrooms: number;
  wilaya: string;
  municipality: string;
  property_type: PropertyType;
  floor?: number;
  is_furnished: BinaryChoice;
  has_elevator?: BinaryChoice;
  rent_type: RentType;
  amenities?: string[];
}

export interface PredictResponse {
  predicted_price: number;
  rent_type: RentType;
  currency: string;
  unit: "per month" | "per night";
  confidence_range?: {
    low: number;
    high: number;
  };
}

interface ValidationErrorResponse {
  detail?: Array<{ loc?: string[]; msg?: string; type?: string }>;
}

interface PredictErrorResponse {
  detail?: string;
}

const parsePredictionError = async (response: Response): Promise<string> => {
  try {
    const data = (await response.json()) as ValidationErrorResponse | PredictErrorResponse;
    if (Array.isArray((data as ValidationErrorResponse).detail)) {
      return (data as ValidationErrorResponse).detail?.map((item) => item.msg).filter(Boolean).join("، ") || "خطأ في بيانات الإدخال";
    }
    if (typeof (data as PredictErrorResponse).detail === "string") {
      return (data as PredictErrorResponse).detail || "فشل الاتصال بخدمة التنبؤ";
    }
  } catch {
    return response.status === 422 ? "خطأ في بيانات الإدخال" : "فشل الاتصال بخدمة التنبؤ";
  }
  return response.status === 422 ? "خطأ في بيانات الإدخال" : "فشل الاتصال بخدمة التنبؤ";
};

export const predictRentPrice = async (features: ApartmentFeatures): Promise<PredictResponse> => {
  const response = await fetch(PREDICTION_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(features),
  });

  if (!response.ok) {
    throw new Error(await parsePredictionError(response));
  }

  return response.json();
};