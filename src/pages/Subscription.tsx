import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, X, Star, Zap, Crown, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { getPackages, subscribe, Package as ApiPackage } from "@/services/subscriptionService";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, React.ElementType> = {
  Star, Zap, Crown,
};

const fallbackPackages: ApiPackage[] = [
  {
    id: 1, name: "الباقة المجانية", description: "للمؤجرين الجدد", price: "0.00", duration_in_days: 30,
    features: { max_listings: 1, listing_duration: "15 يوم", visibility_rank: "low", max_images: 5, analytics: "basic", featured_ads: false },
    is_active: true, created_at: "", updated_at: "",
  },
  {
    id: 2, name: "Basic", description: "للمؤجرين النشطين", price: "1800.00", duration_in_days: 30,
    features: { max_listings: 3, listing_duration: "30 يوم", visibility_rank: "normal", max_images: 10, analytics: "basic", featured_ads: false },
    is_active: true, created_at: "", updated_at: "",
  },
  {
    id: 3, name: "Pro", description: "للمحترفين", price: "3900.00", duration_in_days: 30,
    features: { max_listings: 10, listing_duration: "30 يوم", visibility_rank: "high", max_images: 20, analytics: "advanced", featured_ads: true },
    is_active: true, created_at: "", updated_at: "",
  },
];

const Subscription = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [packages, setPackages] = useState<ApiPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const pkgs = await getPackages();
        setPackages(pkgs.filter(p => p.is_active));
      } catch (error) {
        console.error("Error fetching packages:", error);
        // Use fallback data if API requires auth
        setPackages(fallbackPackages);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleSubscribe = async (pkg: ApiPackage) => {
    if (!currentUser) {
      toast({ title: "تسجيل الدخول مطلوب", description: "يرجى تسجيل الدخول أولاً" });
      return;
    }
    const price = parseFloat(pkg.price);
    if (price === 0) {
      // Free package - subscribe directly
      setSubscribing(pkg.id);
      try {
        const result = await subscribe(pkg.id);
        toast({ title: "تم بنجاح", description: result.message });
      } catch (error: any) {
        toast({ title: "خطأ", description: error.message || "حدث خطأ", variant: "destructive" });
      } finally {
        setSubscribing(null);
      }
    } else {
      // Paid package - redirect to manual payment page
      window.location.href = `/payment/${pkg.id}`;
    }
  };

  const getFeatures = (pkg: ApiPackage) => {
    const f = pkg.features;
    return [
      { label: "عدد الشقق", value: String(f?.max_listings || '∞') },
      { label: "مدة الإعلان", value: f?.listing_duration || '-' },
      { label: "ترتيب الظهور", value: f?.visibility_rank === 'low' ? 'منخفض' : f?.visibility_rank === 'normal' ? 'عادي' : f?.visibility_rank === 'high' ? 'أولوية' : f?.visibility_rank || '-' },
      { label: "عدد الصور", value: String(f?.max_images || '-') },
      { label: "الإحصائيات", value: f?.analytics === 'basic' ? 'مشاهدات فقط' : f?.analytics === 'advanced' ? 'متقدمة' : f?.analytics || '-' },
      { label: "إعلان مميز", value: f?.featured_ads ?? false },
    ];
  };

  const icons = [Star, Zap, Crown];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-hero py-16 text-center">
          <div className="container">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">اختر الباقة المناسبة لك</h1>
            <p className="text-primary-foreground/80 max-w-xl mx-auto">ابدأ بنشر شققك المفروشة وتواصل مع آلاف المستأجرين في جميع أنحاء الجزائر</p>
          </div>
        </section>

        <section className="container py-16">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              {packages.map((pkg, idx) => {
                const price = parseFloat(pkg.price);
                const highlighted = idx === 1;
                const Icon = icons[idx] || Star;
                const features = getFeatures(pkg);

                return (
                  <div key={pkg.id} className={`relative bg-card rounded-2xl border p-6 ${highlighted ? "border-primary shadow-xl ring-2 ring-primary/20" : "shadow-sm"}`}>
                    {highlighted && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-featured text-featured-foreground border-0">الأكثر شعبية</Badge>
                    )}
                    <div className="text-center mb-6">
                      <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4 ${highlighted ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-xl font-bold">{pkg.name}</h3>
                    </div>
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold">
                        {price === 0 ? "مجاني" : (<>{price.toLocaleString("ar-DZ")}<span className="text-lg font-normal text-muted-foreground mr-1">د.ج</span></>)}
                      </div>
                      {price > 0 && <div className="text-sm text-muted-foreground">/ {pkg.duration_in_days} يوم</div>}
                    </div>
                    <Separator className="my-6" />
                    <ul className="space-y-3 mb-8">
                      {features.map((feature, fidx) => (
                        <li key={fidx} className="flex items-center justify-between gap-3">
                          <span className="text-sm text-muted-foreground">{feature.label}</span>
                          {typeof feature.value === "boolean" ? (
                            feature.value ? (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20"><Check className="h-3 w-3 text-success" /></div>
                            ) : (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/20"><X className="h-3 w-3 text-destructive" /></div>
                            )
                          ) : (
                            <span className="text-sm font-medium">{feature.value}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                    {currentUser ? (
                      <Button
                        className={`w-full ${highlighted ? "bg-gradient-hero hover:opacity-90" : ""}`}
                        variant={highlighted ? "default" : "outline"}
                        disabled={subscribing === pkg.id}
                        onClick={() => handleSubscribe(pkg)}
                      >
                        {subscribing === pkg.id ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                        {price === 0 ? "ابدأ مجاناً" : "اشترك الآن"}
                      </Button>
                    ) : (
                      <Button className={`w-full ${highlighted ? "bg-gradient-hero hover:opacity-90" : ""}`} variant={highlighted ? "default" : "outline"} asChild>
                        <Link to="/register">{price === 0 ? "ابدأ مجاناً" : "اشترك الآن"}</Link>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-muted/50 py-16">
          <div className="container max-w-3xl">
            <h2 className="text-2xl font-bold text-center mb-8">أسئلة شائعة</h2>
            <div className="space-y-4">
              <div className="bg-card rounded-xl border p-5">
                <h3 className="font-semibold mb-2">هل يمكنني تغيير الباقة لاحقاً؟</h3>
                <p className="text-muted-foreground text-sm">نعم، يمكنك الترقية أو تخفيض باقتك في أي وقت.</p>
              </div>
              <div className="bg-card rounded-xl border p-5">
                <h3 className="font-semibold mb-2">ما هي طرق الدفع المتاحة؟</h3>
                <p className="text-muted-foreground text-sm">نقبل الدفع عبر التحويل البنكي. بعد الاشتراك، ارفع إيصال الدفع وسيتم مراجعته.</p>
              </div>
              <div className="bg-card rounded-xl border p-5">
                <h3 className="font-semibold mb-2">هل هناك فترة تجريبية مجانية؟</h3>
                <p className="text-muted-foreground text-sm">الباقة المجانية متاحة دائماً وتتيح لك نشر شقة واحدة.</p>
              </div>
            </div>
            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">هل لديك أسئلة أخرى؟</p>
              <Button variant="outline" asChild><Link to="/contact">تواصل معنا<ArrowLeft className="h-4 w-4 mr-2" /></Link></Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Subscription;
