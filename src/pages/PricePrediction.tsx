import { type FormEvent, useMemo, useState } from "react";
import { z } from "zod";
import { Calculator, CheckCircle2, Loader2, Sparkles, TrendingUp } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AMENITIES,
  ApartmentFeatures,
  MUNICIPALITIES_BY_WILAYA,
  PredictResponse,
  PROPERTY_TYPES,
  RENT_TYPES,
  SUPPORTED_WILAYAS,
  predictRentPrice,
} from "@/services/rentPredictionService";
import { useToast } from "@/hooks/use-toast";

const predictionSchema = z.object({
  area: z.coerce.number().gt(20, "المساحة يجب أن تكون أكبر من 20 م²"),
  rooms: z.coerce.number().int("عدد الغرف يجب أن يكون رقماً صحيحاً").min(1, "عدد الغرف يجب أن يكون 1 على الأقل"),
  bathrooms: z.coerce.number().int("عدد الحمامات يجب أن يكون رقماً صحيحاً").min(1, "عدد الحمامات يجب أن يكون 1 على الأقل"),
  wilaya: z.string().min(1, "اختر الولاية"),
  municipality: z.string().min(1, "اختر البلدية"),
  property_type: z.enum(["Apartment", "Villa", "Studio"]),
  floor: z.coerce.number().int("الطابق يجب أن يكون رقماً صحيحاً").min(0, "الطابق لا يمكن أن يكون أقل من 0").default(0),
  is_furnished: z.union([z.literal(0), z.literal(1)]),
  has_elevator: z.union([z.literal(0), z.literal(1)]).default(0),
  rent_type: z.enum(["monthly", "daily"]),
  amenities: z.array(z.string()).default([]),
});

const initialForm: ApartmentFeatures = {
  area: 100,
  rooms: 3,
  bathrooms: 2,
  wilaya: "Algiers",
  municipality: "Hydra",
  property_type: "Apartment",
  floor: 2,
  is_furnished: 1,
  has_elevator: 1,
  rent_type: "monthly",
  amenities: ["Wifi", "Parking"],
};

const labels = {
  Apartment: "شقة",
  Villa: "فيلا",
  Studio: "استوديو",
  monthly: "شهري",
  daily: "يومي / ليلي",
  "per month": "شهرياً",
  "per night": "لليلة",
};

const formatDzd = (value: number) => `${Math.round(value).toLocaleString("ar-DZ")} دج`;

const PricePrediction = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<ApartmentFeatures>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const municipalities = useMemo(
    () => MUNICIPALITIES_BY_WILAYA[form.wilaya as keyof typeof MUNICIPALITIES_BY_WILAYA] || [],
    [form.wilaya]
  );

  const setField = <K extends keyof ApartmentFeatures>(field: K, value: ApartmentFeatures[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const toggleAmenity = (amenity: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      amenities: checked
        ? [...(prev.amenities || []), amenity]
        : (prev.amenities || []).filter((item) => item !== amenity),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(null);

    const parsed = predictionSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((error) => {
        const field = String(error.path[0]);
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      toast({ title: "خطأ في الإدخال", description: "يرجى مراجعة الحقول المطلوبة", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const prediction = await predictRentPrice(parsed.data as ApartmentFeatures);
      setResult(prediction);
      toast({ title: "تم التنبؤ بنجاح", description: "تم حساب السعر المتوقع بناءً على بيانات العقار" });
    } catch (error) {
      toast({
        title: "فشل الاتصال بالخدمة",
        description: error instanceof Error ? error.message : "تعذر تنفيذ التنبؤ حالياً",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-hero py-14 md:py-16">
          <div className="container grid gap-8 md:grid-cols-[1fr_0.8fr] md:items-center">
            <div className="text-primary-foreground">
              <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-primary-foreground/10 px-3 py-1 text-sm">
                <Sparkles className="h-4 w-4" />
                نموذج ذكاء اصطناعي لتقدير الكراء
              </div>
              <h1 className="text-3xl font-bold leading-tight md:text-5xl">التنبؤ بأسعار كراء الشقق</h1>
              <p className="mt-4 max-w-2xl text-primary-foreground/85">
                أدخل مواصفات العقار واحصل على تقدير فوري للسعر بالدينار الجزائري مع نطاق ثقة واضح.
              </p>
            </div>
            <div className="rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 p-5 text-primary-foreground backdrop-blur">
              <TrendingUp className="mb-4 h-8 w-8" />
              <p className="text-sm text-primary-foreground/85">يدعم الكراء الشهري واليومي للعقارات السكنية وفق الحقول الموثقة في خدمة التنبؤ.</p>
            </div>
          </div>
        </section>

        <section className="container py-10 md:py-14">
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  بيانات العقار
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="area">المساحة م²</Label>
                      <Input id="area" type="number" min="21" step="0.1" value={form.area} onChange={(e) => setField("area", Number(e.target.value))} />
                      {errors.area && <p className="text-sm text-destructive">{errors.area}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rooms">عدد الغرف</Label>
                      <Input id="rooms" type="number" min="1" value={form.rooms} onChange={(e) => setField("rooms", Number(e.target.value))} />
                      {errors.rooms && <p className="text-sm text-destructive">{errors.rooms}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">عدد الحمامات</Label>
                      <Input id="bathrooms" type="number" min="1" value={form.bathrooms} onChange={(e) => setField("bathrooms", Number(e.target.value))} />
                      {errors.bathrooms && <p className="text-sm text-destructive">{errors.bathrooms}</p>}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>الولاية</Label>
                      <Select value={form.wilaya} onValueChange={(value) => setForm((prev) => ({ ...prev, wilaya: value, municipality: MUNICIPALITIES_BY_WILAYA[value as keyof typeof MUNICIPALITIES_BY_WILAYA]?.[0] || "" }))}>
                        <SelectTrigger><SelectValue placeholder="اختر الولاية" /></SelectTrigger>
                        <SelectContent>{SUPPORTED_WILAYAS.map((wilaya) => <SelectItem key={wilaya} value={wilaya}>{wilaya}</SelectItem>)}</SelectContent>
                      </Select>
                      {errors.wilaya && <p className="text-sm text-destructive">{errors.wilaya}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>البلدية</Label>
                      <Select value={form.municipality} onValueChange={(value) => setField("municipality", value)}>
                        <SelectTrigger><SelectValue placeholder="اختر البلدية" /></SelectTrigger>
                        <SelectContent>{municipalities.map((municipality) => <SelectItem key={municipality} value={municipality}>{municipality}</SelectItem>)}</SelectContent>
                      </Select>
                      {errors.municipality && <p className="text-sm text-destructive">{errors.municipality}</p>}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label>نوع العقار</Label>
                      <Select value={form.property_type} onValueChange={(value) => setField("property_type", value as ApartmentFeatures["property_type"])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{PROPERTY_TYPES.map((type) => <SelectItem key={type} value={type}>{labels[type]}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>نوع الكراء</Label>
                      <Select value={form.rent_type} onValueChange={(value) => setField("rent_type", value as ApartmentFeatures["rent_type"])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{RENT_TYPES.map((type) => <SelectItem key={type} value={type}>{labels[type]}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="floor">الطابق</Label>
                      <Input id="floor" type="number" min="0" value={form.floor ?? 0} onChange={(e) => setField("floor", Number(e.target.value))} />
                      {errors.floor && <p className="text-sm text-destructive">{errors.floor}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>التجهيزات الأساسية</Label>
                      <div className="grid grid-cols-2 gap-2 pt-2 text-sm">
                        <label className="flex items-center gap-2"><Checkbox checked={form.is_furnished === 1} onCheckedChange={(checked) => setField("is_furnished", checked ? 1 : 0)} />مؤثث</label>
                        <label className="flex items-center gap-2"><Checkbox checked={form.has_elevator === 1} onCheckedChange={(checked) => setField("has_elevator", checked ? 1 : 0)} />مصعد</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>المرافق</Label>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                      {AMENITIES.map((amenity) => (
                        <label key={amenity} className="flex items-center gap-2 rounded-md border bg-background p-3 text-sm">
                          <Checkbox checked={(form.amenities || []).includes(amenity)} onCheckedChange={(checked) => toggleAmenity(amenity, checked === true)} />
                          {amenity}
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full md:w-auto" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                    {loading ? "جاري حساب السعر" : "تنبأ بالسعر"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  نتيجة التنبؤ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-5">
                    <div className="rounded-lg bg-primary/10 p-5 text-center">
                      <div className="text-sm text-muted-foreground">السعر المتوقع</div>
                      <div className="mt-2 text-4xl font-bold text-primary">{formatDzd(result.predicted_price)}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{labels[result.unit]}</div>
                    </div>
                    {result.confidence_range && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-md border p-4"><p className="text-sm text-muted-foreground">الحد الأدنى</p><p className="font-bold">{formatDzd(result.confidence_range.low)}</p></div>
                        <div className="rounded-md border p-4"><p className="text-sm text-muted-foreground">الحد الأعلى</p><p className="font-bold">{formatDzd(result.confidence_range.high)}</p></div>
                      </div>
                    )}
                    <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
                      نوع الكراء: <span className="font-semibold text-foreground">{labels[result.rent_type]}</span> · العملة: <span className="font-semibold text-foreground">{result.currency}</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    ستظهر نتيجة التنبؤ هنا بعد إدخال البيانات وإرسال النموذج.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PricePrediction;