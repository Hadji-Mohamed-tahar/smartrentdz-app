import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Upload, CheckCircle, Loader2, ArrowRight, CreditCard,
  Building2, Image as ImageIcon, Clock, X, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPackageById, subscribe, uploadPaymentReceipt,
  Package as ApiPackage,
} from "@/services/subscriptionService";
import { useToast } from "@/hooks/use-toast";

const PAYMENT_INFO = {
  accountName: "SmartRent DZ",
  accountNumber: "00799999001234567890",
  bankName: "بريد الجزائر / CCP",
};

const ManualPayment = () => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pkg, setPkg] = useState<ApiPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod] = useState("manual_bank_transfer");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [step, setStep] = useState<"instructions" | "upload" | "success">("instructions");

  // Auto-redirect to subscription status after success
  useEffect(() => {
    if (step === "success") {
      const timer = setTimeout(() => navigate("/subscription-status"), 5000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    const fetchPackage = async () => {
      try {
        const data = await getPackageById(Number(packageId));
        setPkg(data);
      } catch {
        toast({ title: "خطأ", description: "لم يتم العثور على الباقة", variant: "destructive" });
        navigate("/subscription");
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [packageId, currentUser]);

  const handleSubscribe = async () => {
    if (!pkg) return;
    setSubscribing(true);
    try {
      const result = await subscribe(pkg.id, paymentMethod);
      if (result.payment?.id) {
        setPaymentId(result.payment.id);
      }
      setStep("upload");
      toast({ title: "تم إنشاء طلب الاشتراك", description: "قم بالدفع ثم ارفع صورة الوصل" });
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "حدث خطأ أثناء إنشاء الطلب", variant: "destructive" });
    } finally {
      setSubscribing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "نوع ملف غير مدعوم", description: "يرجى رفع صورة بصيغة JPG أو PNG أو WebP", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "حجم الملف كبير", description: "الحد الأقصى 5 ميغابايت", variant: "destructive" });
      return;
    }
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setReceiptPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile || !paymentId) return;
    setUploading(true);
    try {
      await uploadPaymentReceipt(paymentId, receiptFile);
      setStep("success");
      toast({ title: "تم بنجاح", description: "تم إرسال وصل الدفع بنجاح" });
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message || "حدث خطأ أثناء رفع الوصل", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const price = pkg ? parseFloat(pkg.price) : 0;
  const features = pkg?.features;

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

  if (step === "success") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <Card className="max-w-md w-full mx-4 text-center">
            <CardContent className="pt-8 pb-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/20 mb-6">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h2 className="text-xl font-bold mb-3">تم رفع وصل الدفع بنجاح</h2>
              <p className="text-muted-foreground mb-2">
                طلب الاشتراك الخاص بك قيد المراجعة حالياً.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                سيتم تحويلك تلقائياً إلى صفحة حالة الاشتراك...
              </p>
              <div className="flex flex-col gap-3">
                <Button asChild>
                  <Link to="/subscription-status">عرض حالة الاشتراك</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/dashboard">العودة للوحة التحكم</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
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
            <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">إتمام عملية الدفع</h1>
            <p className="text-primary-foreground/80">أكمل الخطوات التالية لتفعيل باقتك</p>
          </div>
        </section>

        <section className="container py-8">
          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 mb-8 max-w-md mx-auto">
            <div className={`flex items-center gap-2 ${step === "instructions" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${step === "instructions" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>1</div>
              <span className="text-sm hidden sm:inline">تعليمات الدفع</span>
            </div>
            <div className="h-px flex-1 bg-border" />
            <div className={`flex items-center gap-2 ${step === "upload" ? "text-primary font-semibold" : "text-muted-foreground"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${step === "upload" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>2</div>
              <span className="text-sm hidden sm:inline">رفع الوصل</span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Package Summary - always visible */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  ملخص الباقة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الباقة</span>
                  <span className="font-semibold">{pkg?.name}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">السعر</span>
                  <span className="font-bold text-lg">{price.toLocaleString("ar-DZ")} د.ج</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المدة</span>
                  <span>{pkg?.duration_in_days} يوم</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">عدد الشقق</span>
                  <span>{features?.max_listings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">عدد الصور</span>
                  <span>{features?.max_images}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ترتيب الظهور</span>
                  <span>{features?.visibility_rank === "low" ? "منخفض" : features?.visibility_rank === "normal" ? "عادي" : "أولوية"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الإحصائيات</span>
                  <span>{features?.analytics === "basic" ? "أساسية" : "متقدمة"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Main content area */}
            <div className="md:col-span-2 space-y-6">
              {step === "instructions" && (
                <>
                  {/* Payment Instructions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        تعليمات الدفع
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/50 rounded-xl p-5 mb-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          قم بتحويل المبلغ إلى الحساب التالي، ثم عد إلى هذه الصفحة لرفع صورة وصل الدفع.
                        </p>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                            <span className="text-sm text-muted-foreground">اسم الحساب</span>
                            <span className="font-medium text-sm">{PAYMENT_INFO.accountName}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                            <span className="text-sm text-muted-foreground">رقم الحساب / CCP</span>
                            <span className="font-mono font-medium text-sm" dir="ltr">{PAYMENT_INFO.accountNumber}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-card rounded-lg border">
                            <span className="text-sm text-muted-foreground">البنك</span>
                            <span className="font-medium text-sm">{PAYMENT_INFO.bankName}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <span className="text-sm text-muted-foreground">المبلغ المطلوب</span>
                            <span className="font-bold text-primary">{price.toLocaleString("ar-DZ")} د.ج</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Method */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        طريقة الدفع
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup value={paymentMethod} dir="rtl">
                        <div className="flex items-center gap-3 p-4 border rounded-xl bg-primary/5 border-primary/30">
                          <RadioGroupItem value="manual_bank_transfer" id="manual" checked />
                          <Label htmlFor="manual" className="flex-1 cursor-pointer">
                            <div className="font-medium">تحويل بنكي يدوي</div>
                            <div className="text-sm text-muted-foreground">قم بالتحويل ثم ارفع صورة الوصل</div>
                          </Label>
                          <Badge variant="secondary">متاح</Badge>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  <Button
                    className="w-full bg-gradient-hero hover:opacity-90 h-12 text-base"
                    onClick={handleSubscribe}
                    disabled={subscribing}
                  >
                    {subscribing ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : null}
                    تأكيد الاشتراك والمتابعة لرفع الوصل
                    <ArrowRight className="h-5 w-5 mr-2" />
                  </Button>
                </>
              )}

              {step === "upload" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Upload className="h-5 w-5 text-primary" />
                      رفع صورة وصل الدفع
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-accent mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">يمكنك رفع الوصل لاحقاً</p>
                          <p className="text-sm text-muted-foreground">
                            إذا لم تقم بالدفع بعد، يمكنك العودة لاحقاً من صفحة "حالة الاشتراكات" لرفع الوصل.
                          </p>
                        </div>
                      </div>
                    </div>

                    {!receiptPreview ? (
                      <div
                        className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="font-medium mb-1">اضغط لاختيار صورة الوصل</p>
                        <p className="text-sm text-muted-foreground">JPG, PNG, WebP — الحد الأقصى 5 ميغابايت</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <img src={receiptPreview} alt="معاينة الوصل" className="w-full max-h-80 object-contain rounded-xl border" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 left-2 h-8 w-8"
                          onClick={removeFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <p className="text-sm text-muted-foreground mt-2 text-center">{receiptFile?.name}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-gradient-hero hover:opacity-90 h-12"
                        onClick={handleUploadReceipt}
                        disabled={!receiptFile || uploading}
                      >
                        {uploading ? <Loader2 className="h-5 w-5 animate-spin ml-2" /> : <Upload className="h-5 w-5 ml-2" />}
                        إرسال وصل الدفع
                      </Button>
                      <Button variant="outline" className="h-12" asChild>
                        <Link to="/subscription-status">رفع لاحقاً</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ManualPayment;
