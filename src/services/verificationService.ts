/**
 * Verification Service - Connected to SmartRent API
 */
import { apiPostForm, apiGet } from "@/lib/api";

export interface VerificationData {
  id: number;
  user_id: number;
  document_type: string;
  document_path: string;
  status: 'pending' | 'approved' | 'rejected';
  user_verification_status: string;
}

export const uploadVerificationDocument = async (
  documentType: 'ID Card' | 'Driving License',
  documentFile: File
): Promise<VerificationData> => {
  const formData = new FormData();
  formData.append('document_type', documentType);
  formData.append('document_file', documentFile);

  const res = await apiPostForm<{
    status: string;
    message: string;
    data: any;
  }>('/landlord/verify', formData);

  return {
    id: res.data.id,
    user_id: res.data.user_id,
    document_type: res.data.document_type,
    document_path: res.data.document_path,
    status: res.data.status,
    user_verification_status: res.data.user_verification_status,
  };
};

export const getVerificationStatus = async (): Promise<string> => {
  try {
    const res = await apiGet<{ status: string; data: { user: { verification_status: string } } }>('/user/profile');
    return res.data.user.verification_status || 'unverified';
  } catch {
    return 'unverified';
  }
};
