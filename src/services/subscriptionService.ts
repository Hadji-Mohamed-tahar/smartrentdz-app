/**
 * Subscription & Packages Service - Connected to SmartRent API
 */
import { apiGet, apiPost, apiPostForm } from "@/lib/api";

export interface Package {
  id: number;
  name: string;
  description: string;
  price: string;
  duration_in_days: number;
  features: {
    max_listings: number;
    listing_duration: string;
    visibility_rank: string;
    max_images: number;
    analytics: string;
    featured_ads: boolean;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  package_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface Payment {
  id: number;
  package_name: string;
  amount: string;
  payment_method: string;
  status: 'pending_verification' | 'approved' | 'rejected';
  receipt_image_path?: string | null;
  created_at: string;
}

export interface SubscriptionStatus {
  id?: number;
  package_name?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  status?: string;
}

export const getPackages = async (): Promise<Package[]> => {
  const res = await apiGet<{ packages: Package[] }>('/user/packages');
  return res.packages || [];
};

export const getPackageById = async (packageId: number): Promise<Package> => {
  const res = await apiGet<{ package: Package }>(`/user/packages/${packageId}`);
  return res.package;
};

export const subscribe = async (packageId: number, paymentMethod?: string): Promise<{
  subscription?: any;
  payment?: any;
  message: string;
}> => {
  const body: any = { package_id: packageId };
  if (paymentMethod && paymentMethod !== 'free') {
    body.payment_method = paymentMethod;
  }
  const res = await apiPost<{
    message: string;
    subscription?: any;
    payment?: any;
  }>('/user/subscribe', body);
  return {
    subscription: res.subscription,
    payment: res.payment,
    message: res.message,
  };
};

export const uploadPaymentReceipt = async (paymentId: number, receiptFile: File): Promise<Payment> => {
  const formData = new FormData();
  formData.append('receipt_image', receiptFile);
  const res = await apiPostForm<{ message: string; payment: Payment }>(
    `/user/payments/${paymentId}/upload-receipt`,
    formData
  );
  return res.payment;
};

export const getSubscriptionStatus = async (): Promise<SubscriptionStatus | null> => {
  const res = await apiGet<{ subscription?: SubscriptionStatus | null; message?: string }>('/user/subscription/status');
  return res.subscription || null;
};

export const getMySubscriptions = async (): Promise<Subscription[]> => {
  const res = await apiGet<{ subscriptions: Subscription[] }>('/user/subscriptions');
  return res.subscriptions || [];
};

export const getMyPayments = async (): Promise<Payment[]> => {
  const res = await apiGet<{ payments: Payment[] }>('/user/payments');
  return res.payments || [];
};

export const getPaymentById = async (paymentId: number): Promise<Payment> => {
  const res = await apiGet<{ payment: Payment }>(`/user/payments/${paymentId}`);
  return res.payment;
};
