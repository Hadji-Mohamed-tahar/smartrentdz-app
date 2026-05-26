import { useCallback, useEffect, useRef, useState } from "react";
import { checkImages, ImageCheckError } from "@/services/imageCheckService";

export type ImageCheckStatus = "idle" | "checking" | "safe" | "rejected" | "error";

export interface UseImageCheckResult {
  status: ImageCheckStatus;
  message: string;
  rejectedIndex: number | null;
  isChecking: boolean;
  canSubmit: boolean;
  recheck: () => void;
}

/**
 * Auto-runs image safety check whenever the files array changes.
 * Returns status + rejected image index so the UI can highlight it.
 */
export function useImageCheck(files: File[]): UseImageCheckResult {
  const [status, setStatus] = useState<ImageCheckStatus>("idle");
  const [message, setMessage] = useState("");
  const [rejectedIndex, setRejectedIndex] = useState<number | null>(null);
  const runIdRef = useRef(0);

  const run = useCallback(async (list: File[]) => {
    const runId = ++runIdRef.current;
    if (!list.length) {
      setStatus("idle");
      setMessage("");
      setRejectedIndex(null);
      return;
    }
    setStatus("checking");
    setMessage("جاري فحص الصور...");
    setRejectedIndex(null);
    try {
      const res = await checkImages(list);
      if (runId !== runIdRef.current) return;
      if (res.is_safe) {
        setStatus("safe");
        setMessage(res.message || "تم قبول جميع الصور");
        setRejectedIndex(null);
      } else {
        setStatus("rejected");
        setMessage(res.message || "تم رفض إحدى الصور");
        const idx = (res as { failed_image_index?: number }).failed_image_index;
        setRejectedIndex(typeof idx === "number" ? idx : null);
      }
    } catch (err) {
      if (runId !== runIdRef.current) return;
      const e = err as ImageCheckError;
      setStatus("error");
      setMessage(e.message || "تعذر فحص الصور");
      setRejectedIndex(null);
    }
  }, []);

  // Build a stable signature so we only re-run when the file list truly changes
  const signature = files.map((f) => `${f.name}-${f.size}-${f.lastModified}`).join("|");

  useEffect(() => {
    run(files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const recheck = useCallback(() => run(files), [run, files]);

  return {
    status,
    message,
    rejectedIndex,
    isChecking: status === "checking",
    canSubmit: status === "safe",
    recheck,
  };
}
