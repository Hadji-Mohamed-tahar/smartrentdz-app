import { apiPost } from "@/lib/api";

export interface SuggestApartmentContentInput {
  province: string;
  city: string;
  rooms: number;
  price: number;
}

export interface SuggestApartmentContentData {
  title: string;
  description: string;
}

interface SuggestApartmentContentResponse {
  success: boolean;
  data: SuggestApartmentContentData;
}

export class AIBusyError extends Error {
  constructor() {
    super("الذكاء الاصطناعي مشغول حالياً، حاول بعد لحظات");
    this.name = "AIBusyError";
  }
}

/**
 * Request AI-generated title and description for an apartment listing.
 * Throws AIBusyError on 503, generic Error on other failures.
 */
export async function suggestApartmentContent(
  input: SuggestApartmentContentInput
): Promise<SuggestApartmentContentData> {
  try {
    const response = await apiPost<SuggestApartmentContentResponse>(
      "/ai/suggest-apartment-content",
      input
    );
    return response.data;
  } catch (error: any) {
    const msg = error?.message || "";
    if (msg.includes("503")) {
      throw new AIBusyError();
    }
    throw new Error("حدث خطأ أثناء توليد المحتوى");
  }
}
