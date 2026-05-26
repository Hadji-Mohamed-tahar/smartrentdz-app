/**
 * Image moderation/safety check service.
 * Calls POST /check-image before allowing apartment creation.
 */
import { API_BASE_URL, getAuthToken, removeAuthToken } from "@/lib/api";

export interface ImageCheckSuccess {
  success: true;
  is_safe: true;
  model?: string;
  message: string;
}

export interface ImageCheckRejected {
  success: false;
  is_safe: false;
  failed_image_index: number;
  message: string;
  model?: string;
}

export type ImageCheckResult = ImageCheckSuccess | ImageCheckRejected;

export class ImageCheckError extends Error {
  status: number;
  failedIndex?: number;
  constructor(message: string, status: number, failedIndex?: number) {
    super(message);
    this.status = status;
    this.failedIndex = failedIndex;
  }
}

export async function checkImages(files: File[]): Promise<ImageCheckResult> {
  if (!files.length) {
    throw new ImageCheckError("لا توجد صور للفحص", 400);
  }

  const token = getAuthToken();
  const formData = new FormData();
  files.forEach((f) => formData.append("images[]", f));

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/check-image`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
  } catch {
    throw new ImageCheckError("تعذر الاتصال بالخادم، تحقق من الإنترنت وحاول مجدداً", 0);
  }

  if (response.status === 401) {
    removeAuthToken();
    localStorage.removeItem("user_data");
    throw new ImageCheckError("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً", 401);
  }

  if (response.status === 500 || response.status === 503) {
    throw new ImageCheckError("تعذر فحص الصور حالياً، حاول مرة أخرى لاحقاً", response.status);
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    throw new ImageCheckError("استجابة غير صالحة من الخادم", response.status);
  }

  if (response.ok && data?.is_safe === true) {
    return data as ImageCheckSuccess;
  }

  if (response.status === 422) {
    // Could be a validation error OR a rejected image
    if (typeof data?.failed_image_index === "number") {
      return data as ImageCheckRejected;
    }
    const validationMsg =
      data?.errors && typeof data.errors === "object"
        ? Object.values(data.errors).flat().join("، ")
        : data?.message || "بيانات غير صالحة";
    throw new ImageCheckError(validationMsg, 422);
  }

  throw new ImageCheckError(data?.message || `خطأ ${response.status}`, response.status);
}
