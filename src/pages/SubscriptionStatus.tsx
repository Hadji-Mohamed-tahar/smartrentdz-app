import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Clock, CheckCircle, XCircle, Upload, Eye, Loader2,
  CreditCard, ArrowLeft, FileText, Image as ImageIcon, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMyPayments, uploadPaymentReceipt, Payment,
} from "@/services/subscriptionService";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending_verification: { label: "في انتظار رفع الوصل", color: "bg-accent/20 text-accent", icon: Clock },
  pending_review: { label: "قيد المراجعة", color: "bg-primary/20 text-primary", icon: Clock },
  approved: { label: "تم الموافقة", color: "bg-success/20 text-success", icon: CheckCircle },
  rejected: { label: "مرفوض", color: "bg-destructive/20 text-destructive", icon: XCircle },
};

const SubscriptionStatus = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [currentUser]);

  const fetchPayments = async () => {
    if (!currentUser) return;
    try {
      const data = await getMyPayments();
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReceipt = async (paymentId: number, file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "نوع ملف غير مدعوم", description: "يرجى رفع صورة JPG أو PNG أو WebP", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "حجم الملف كبير", description: "الحد الأقصى 5 ميغابايت", variant: "destructive" });
      return;
    }
    setUploadingId(paymentId);
    try {
      await uploadPaymentReceipt(paymentId, file);
      toast({ title: "تم رفع الوصل بنجاح", description: "طلبك الآن قيد المراجعة" });
      await fetchPayments();
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "حدث خطأ أثناء رفع الوصل", variant: "destructive" });
    } finally {
      setUploadingId(null);
    }
  };

  const getStatus = (payment: Payment) => {
    if (payment.status === "pending_verification" && !payment.receipt_image_path) {
      return statusConfig.pending_verification;
    }
    if (payment.status === "pending_verification" && payment.receipt_image_path) {
      return statusConfig.pending_review;
    }
    return statusConfig[payment.status] || statusConfig.pending_verification;
  };

  const getReceiptUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL.replace("/api", "")}/storage/${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-hero py-10 text-center">
          <div className="container">
            <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">حالة الاشتراكات والمدفوعات</h1>
            <p className="text-primary-foreground/80">تابع جميع طلبات الاشتراك والمدفوعات الخاصة بك</p>
          </div>
        </section>

        <section className="container py-8 max-w-3xl">
          {payments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">لا توجد طلبات اشتراك</h3>
                <p className="text-muted-foreground mb-4">لم تقم بأي عملية اشتراك بعد</p>
                <Button asChild>
                  <Link to="/subscription">تصفح الباقات</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => {
                const status = getStatus(payment);
                const StatusIcon = status.icon;
                const canUpload = payment.status === "pending_verification" && !payment.receipt_image_path;
                const isPendingReview = payment.status === "pending_verification" && !!payment.receipt_image_path;

                return (
                  <Card key={payment.id}>
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{payment.package_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.created_at).toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg">{parseFloat(payment.amount).toLocaleString("ar-DZ")} د.ج</span>
                          <Badge className={`${status.color} border-0`}>
                            <StatusIcon className="h-3.5 w-3.5 ml-1" />
                            {status.label}
                          </Badge>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      {isPendingReview && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <p className="text-sm font-semibold text-primary">جاري المعالجة...</p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            لقد قمت بالفعل برفع وصل الدفع. فريقنا يقوم حالياً بمراجعة عملية الدفع الخاصة بك.
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            لا يمكنك رفع وصل جديد حتى تنتهي عملية المراجعة.
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {canUpload && (
                          <>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadReceipt(payment.id, file);
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingId === payment.id}
                            >
                              {uploadingId === payment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin ml-1" />
                              ) : (
                                <Upload className="h-4 w-4 ml-1" />
                              )}
                              رفع وصل الدفع
                            </Button>
                          </>
                        )}

                        {payment.receipt_image_path && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewUrl(getReceiptUrl(payment.receipt_image_path!))}
                          >
                            <Eye className="h-4 w-4 ml-1" />
                            عرض الوصل
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/subscription">
                <ArrowLeft className="h-4 w-4 mr-2" />
                تصفح الباقات
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />

      {/* Receipt Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-3 -left-3 h-8 w-8 z-10"
              onClick={() => setPreviewUrl(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img src={previewUrl} alt="وصل الدفع" className="w-full rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatus;
