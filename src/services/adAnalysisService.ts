import { apiPost } from "@/lib/api";

export interface AdAnalysisReport {
  score: number | null;
  feedback: string | null;
  listing_type?: string | null;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  optimized_content: {
    title: string | null;
    description: string | null;
  };
}

export interface AdAnalysisResponse {
  success: boolean;
  model?: string;
  report: AdAnalysisReport;
}

export class AdAnalysisError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "AdAnalysisError";
  }
}

function statusToMessage(status: number): string {
  if (status === 401) return "يجب تسجيل الدخول";
  if (status === 403) return "ليس لديك صلاحية تحليل هذا الإعلان";
  if (status === 404) return "الشقة غير موجودة";
  if (status === 500 || status === 503) return "حدث خطأ، حاول لاحقاً";
  return "حدث خطأ، حاول لاحقاً";
}

export async function analyzeAd(apartmentId: string | number): Promise<AdAnalysisReport> {
  try {
    const res = await apiPost<AdAnalysisResponse>("/ai/analyze-ad", {
      apartment_id: apartmentId,
    });
    if (!res?.success || !res?.report) {
      throw new AdAnalysisError(500, "حدث خطأ، حاول لاحقاً");
    }
    const r = res.report;
    return {
      score: r.score ?? null,
      feedback: r.feedback ?? null,
      listing_type: r.listing_type ?? null,
      strengths: Array.isArray(r.strengths) ? r.strengths : [],
      weaknesses: Array.isArray(r.weaknesses) ? r.weaknesses : [],
      suggestions: Array.isArray(r.suggestions) ? r.suggestions : [],
      optimized_content: {
        title: r.optimized_content?.title ?? null,
        description: r.optimized_content?.description ?? null,
      },
    };
  } catch (error: any) {
    const msg: string = error?.message || "";
    const match = msg.match(/(\d{3})/);
    const status = match ? parseInt(match[1], 10) : 500;
    throw new AdAnalysisError(status, statusToMessage(status));
  }
}
