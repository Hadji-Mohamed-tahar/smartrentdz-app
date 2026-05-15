import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Upload, X, MapPin, DollarSign, ShieldCheck, FileCheck, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { wilayas } from "@/data/wilayas";
import { useAuth } from "@/contexts/AuthContext";
import { createApartment } from "@/services/apartmentService";
import { getVerificationStatus, uploadVerificationDocument } from "@/services/verificationService";
import { suggestApartmentContent, AIBusyError } from "@/services/aiContentService";

const amenitiesList = [
  "واي فاي", "تكييف", "تدفئة", "موقف سيارات", "مطبخ مجهز",
  "غسالة", "تلفزيون", "شرفة", "مصعد", "أمن 24/7",
];

const AddApartment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, userData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>("loading");
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [verificationPreview, setVerificationPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "", description: "", wilayaId: "", municipality: "",
    price: "", priceUnit: "day", rooms: "", bathrooms: "", area: "",
    amenities: [] as string[],
  });

  useEffect(() => {
    const checkVerification = async () => {
      if (userData?.type !== "landlord") return;
      const status = await getVerificationStatus();
      setVerificationStatus(status);
    };
    checkVerification();
  }, [userData]);

  const handleVerificationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVerificationFile(file);
      setVerificationPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitVerification = async () => {
    if (!verificationFile) return;
    setIsUploading(true);
    try {
      await uploadVerificationDocument("ID Card", verificationFile);
      setVerificationStatus("pending");
      toast({ title: "تم رفع الوثيقة بنجاح", description: "سيتم مراجعتها خلال 24 ساعة" });
    } catch (error: any) {
      if (error.message?.includes("already been submitted")) {
        setVerificationStatus("pending");
        toast({ title: "تم رفع الوثيقة مسبقاً", description: "وثيقتك قيد المراجعة" });
      } else {
        toast({ title: "خطأ", description: error.message || "حدث خطأ أثناء رفع الوثيقة", variant: "destructive" });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImageFiles((prev) => [...prev, ...newFiles].slice(0, 10));
      setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 10));
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const wilayaName = wilayas.find((w) => w.id.toString() === formData.wilayaId)?.name || "";
  const canGenerateAI = Boolean(
    wilayaName && formData.municipality.trim() && formData.rooms && formData.price
  );

  const handleGenerateAIContent = async () => {
    if (!canGenerateAI) return;
    setIsGeneratingAI(true);
    try {
      const result = await suggestApartmentContent({
        province: wilayaName,
        city: formData.municipality.trim(),
        rooms: parseInt(formData.rooms),
        price: parseInt(formData.price),
      });
      setFormData((prev) => ({
        ...prev,
        title: result.title,
        description: result.description,
      }));
      toast({ title: "تم توليد المحتوى بنجاح", description: "يمكنك تعديله قبل النشر" });
    } catch (error: any) {
      toast({
        title: error instanceof AIBusyError ? "الخدمة مشغولة" : "خطأ",
        description: error?.message || "حدث خطأ أثناء توليد المحتوى",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userData) {
      toast({ title: "خطأ", description: "يرجى تسجيل الدخول أولاً", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (imageFiles.length === 0) {
      toast({ title: "خطأ", description: "يرجى إضافة صورة واحدة على الأقل", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const wilaya = wilayas.find((w) => w.id.toString() === formData.wilayaId);
      await createApartment({
        title: formData.title,
        description: formData.description,
        wilaya: wilaya?.name || "",
        municipality: formData.municipality,
        price: parseInt(formData.price),
        price_unit: formData.priceUnit,
        rooms: parseInt(formData.rooms),
        bathrooms: parseInt(formData.bathrooms),
        area: parseInt(formData.area),
        amenities: formData.amenities,
        images: imageFiles,
      });
      toast({ title: "تم إضافة الشقة بنجاح", description: "ستظهر شقتك في نتائج البحث قريباً" });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding apartment:", error);
      toast({ title: "خطأ", description: "حدث خطأ أثناء إضافة الشقة. يرجى المحاولة مرة أخرى", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Show verification gate for unverified landlords
  const needsVerification = verificationStatus !== "verified" && verificationStatus !== "loading";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-3xl">
          <div className="mb-8">
            <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
              <ArrowRight className="h-4 w-4 ml-2" />رجوع
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">إضافة شقة جديدة</h1>
            <p className="text-muted-foreground mt-1">أضف تفاصيل شقتك لعرضها للمستأجرين</p>
          </div>

          {verificationStatus === "loading" ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : verificationStatus === "pending" ? (
            <div className="bg-card rounded-xl border p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">وثيقتك قيد المراجعة</h2>
              <p className="text-muted-foreground mb-4">
                تم رفع وثيقة التحقق من الهوية بنجاح وهي قيد المراجعة من قبل الإدارة.
                سيتم إعلامك فور الموافقة عليها.
              </p>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                العودة للوحة التحكم
              </Button>
            </div>
          ) : needsVerification ? (
            <div className="bg-card rounded-xl border p-8">
              <div className="text-center mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">التحقق من الهوية مطلوب</h2>
                <p className="text-muted-foreground">
                  لنشر شقتك، يرجى رفع نسخة من بطاقة التعريف الوطنية للتحقق من هويتك
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                {verificationPreview ? (
                  <div className="relative rounded-lg overflow-hidden border">
                    <img src={verificationPreview} alt="وثيقة التحقق" className="w-full h-48 object-contain bg-muted" />
                    <button
                      type="button"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                      onClick={() => { setVerificationFile(null); setVerificationPreview(""); }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
                    <FileCheck className="h-10 w-10 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium">اضغط لرفع صورة بطاقة التعريف</span>
                    <span className="text-xs text-muted-foreground mt-1">PNG, JPG أو PDF — حد أقصى 5 ميغابايت</span>
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleVerificationUpload} />
                  </label>
                )}

                <Button
                  className="w-full bg-gradient-hero hover:opacity-90"
                  disabled={!verificationFile || isUploading}
                  onClick={handleSubmitVerification}
                >
                  <Upload className="h-4 w-4 ml-2" />
                  {isUploading ? "جاري الرفع..." : "رفع الوثيقة والتحقق"}
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-semibold mb-4">صور الشقة</h2>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {imagePreviews.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      <button type="button" className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center" onClick={() => removeImage(idx)}>
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < 10 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">إضافة</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3">أضف حتى 10 صور للشقة. الصورة الأولى ستكون الصورة الرئيسية.</p>
              </div>

              <div className="bg-card rounded-xl border p-6 space-y-4">
                <h2 className="font-semibold mb-4">المعلومات الأساسية</h2>

                <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-primary/50 text-primary hover:bg-primary/10"
                    disabled={!canGenerateAI || isGeneratingAI}
                    onClick={handleGenerateAIContent}
                  >
                    {isGeneratingAI ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 ml-2" />
                    )}
                    {isGeneratingAI ? "جاري التوليد..." : "توليد العنوان والوصف بالذكاء الاصطناعي"}
                  </Button>
                  {!canGenerateAI && (
                    <p className="text-xs text-muted-foreground text-center">
                      يرجى تعبئة الولاية، البلدية، عدد الغرف والسعر لتفعيل التوليد بالذكاء الاصطناعي
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">عنوان الإعلان</Label>
                  <Input id="title" placeholder="مثال: شقة فاخرة بإطلالة بحرية" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea id="description" placeholder="صف شقتك بالتفصيل..." rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
                </div>
              </div>

              <div className="bg-card rounded-xl border p-6 space-y-4">
                <h2 className="font-semibold mb-4 flex items-center gap-2"><MapPin className="h-5 w-5" />الموقع</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>الولاية</Label>
                    <Select value={formData.wilayaId} onValueChange={(v) => setFormData({ ...formData, wilayaId: v })} required>
                      <SelectTrigger><SelectValue placeholder="اختر الولاية" /></SelectTrigger>
                      <SelectContent>{wilayas.map((w) => (<SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="municipality">البلدية</Label>
                    <Input id="municipality" placeholder="اسم البلدية" value={formData.municipality} onChange={(e) => setFormData({ ...formData, municipality: e.target.value })} required />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border p-6 space-y-4">
                <h2 className="font-semibold mb-4 flex items-center gap-2"><DollarSign className="h-5 w-5" />السعر</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">السعر (د.ج)</Label>
                    <Input id="price" type="number" placeholder="5000" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>مدة الكراء</Label>
                    <Select value={formData.priceUnit} onValueChange={(v) => setFormData({ ...formData, priceUnit: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">يومي</SelectItem>
                        <SelectItem value="week">أسبوعي</SelectItem>
                        <SelectItem value="month">شهري</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border p-6 space-y-4">
                <h2 className="font-semibold mb-4">تفاصيل الشقة</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>عدد الغرف</Label>
                    <Select value={formData.rooms} onValueChange={(v) => setFormData({ ...formData, rooms: v })} required>
                      <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                      <SelectContent>{[1,2,3,4,5,6].map((n) => (<SelectItem key={n} value={n.toString()}>{n}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>عدد الحمامات</Label>
                    <Select value={formData.bathrooms} onValueChange={(v) => setFormData({ ...formData, bathrooms: v })} required>
                      <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                      <SelectContent>{[1,2,3,4].map((n) => (<SelectItem key={n} value={n.toString()}>{n}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">المساحة (م²)</Label>
                    <Input id="area" type="number" placeholder="100" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} required />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl border p-6">
                <h2 className="font-semibold mb-4">المرافق والخدمات</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenitiesList.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                      <Checkbox checked={formData.amenities.includes(amenity)} onCheckedChange={() => toggleAmenity(amenity)} />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" size="lg" className="flex-1 bg-gradient-hero hover:opacity-90" disabled={isLoading}>
                  {isLoading ? "جاري النشر..." : "نشر الشقة"}
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)}>إلغاء</Button>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddApartment;
