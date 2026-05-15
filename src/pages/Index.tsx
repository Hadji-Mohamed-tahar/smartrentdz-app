import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Star, Shield, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import ApartmentCard from "@/components/ApartmentCard";
import { Apartment as LocalApartment } from "@/data/apartments";
import { wilayas } from "@/data/wilayas";
import heroImage from "@/assets/hero-apartment.jpg";
import { getAllApartments, getFeaturedApartments, Apartment } from "@/services/apartmentService";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { currentUser, userData, loading: authLoading } = useAuth();
  const [featuredApartments, setFeaturedApartments] = useState<Apartment[]>([]);
  const [latestApartments, setLatestApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const [featured, all] = await Promise.all([
          getFeaturedApartments(),
          getAllApartments(),
        ]);
        setFeaturedApartments(featured);
        setLatestApartments(all.slice(0, 6));
      } catch (error) {
        console.error("Error fetching apartments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApartments();
  }, []);

  const convertToLocal = (apt: Apartment): LocalApartment => ({
    id: apt.id, title: apt.title, description: apt.description, images: apt.images,
    price: apt.price, priceUnit: apt.price_unit, wilaya: apt.wilaya, wilayaId: apt.wilaya_id,
    municipality: apt.municipality, rooms: apt.rooms, bathrooms: apt.bathrooms, area: apt.area,
    amenities: apt.amenities, isFeatured: apt.is_featured, isActive: apt.is_active,
    views: apt.views, phoneClicks: apt.phone_clicks, createdAt: apt.created_at,
    landlordId: apt.landlord_id, landlordPhone: apt.landlord_phone, landlordName: apt.landlord_name,
  });

  const popularWilayas = [
    { id: 16, name: "الجزائر", count: 156 },
    { id: 31, name: "وهران", count: 98 },
    { id: 25, name: "قسنطينة", count: 67 },
    { id: 23, name: "عنابة", count: 45 },
    { id: 19, name: "سطيف", count: 38 },
    { id: 6, name: "بجاية", count: 32 },
  ];

  // Redirect logged-in users to dashboard
  if (!authLoading && currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img src={heroImage} alt="شقة مفروشة" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-l from-background/95 via-background/80 to-background/60" />
          </div>
          <div className="container relative py-20 md:py-32">
            <div className="max-w-2xl space-y-6">
              <Badge variant="secondary" className="text-sm px-4 py-1.5">🇩🇿 منصة جزائرية 100%</Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                ابحث عن <span className="text-gradient-hero">شقتك المفروشة</span><br />في كل الجزائر
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                اكتشف أفضل الشقق المفروشة للإيجار اليومي، الأسبوعي والشهري في جميع الولايات الـ 58
              </p>
              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><MapPin className="h-5 w-5 text-primary" /></div>
                  <div><p className="font-bold">58</p><p className="text-xs text-muted-foreground">ولاية</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20"><Star className="h-5 w-5 text-accent" /></div>
                  <div><p className="font-bold">+500</p><p className="text-xs text-muted-foreground">شقة</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20"><Shield className="h-5 w-5 text-success" /></div>
                  <div><p className="font-bold">+1000</p><p className="text-xs text-muted-foreground">مؤجر موثوق</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container -mt-8 relative z-10"><SearchBar variant="hero" /></section>

        <section className="container py-16 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">✨ الشقق المميزة</h2>
              <p className="text-muted-foreground mt-1">أفضل العروض المختارة لك</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/search?featured=true" className="flex items-center gap-2">عرض الكل<ArrowLeft className="h-4 w-4" /></Link>
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
          ) : featuredApartments.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredApartments.map((apartment) => (<ApartmentCard key={apartment.id} apartment={convertToLocal(apartment)} />))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">لا توجد شقق مميزة حالياً</div>
          )}
        </section>

        <section className="bg-secondary/30 py-16 md:py-20">
          <div className="container">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold">الولايات الأكثر طلباً</h2>
              <p className="text-muted-foreground mt-2">اختر ولايتك واكتشف الشقق المتاحة</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {popularWilayas.map((wilaya) => (
                <Link key={wilaya.id} to={`/search?wilaya=${wilaya.id}`} className="group bg-card rounded-xl p-5 text-center border shadow-sm card-hover">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-3 group-hover:bg-primary/20 transition-colors"><MapPin className="h-6 w-6 text-primary" /></div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{wilaya.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{wilaya.count} شقة</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-16 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">أحدث الإعلانات</h2>
              <p className="text-muted-foreground mt-1">شقق أُضيفت مؤخراً</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/search" className="flex items-center gap-2">عرض الكل<ArrowLeft className="h-4 w-4" /></Link>
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
          ) : latestApartments.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestApartments.map((apartment) => (<ApartmentCard key={apartment.id} apartment={convertToLocal(apartment)} />))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">لا توجد شقق حالياً. كن أول من يضيف شقة!</div>
          )}
        </section>

        {(!currentUser || userData?.type === 'renter') && (
          <section className="bg-gradient-hero py-16 md:py-20">
            <div className="container text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">هل لديك شقة للكراء؟</h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">انضم إلى آلاف المؤجرين واعرض شقتك لملايين الباحثين عن السكن في الجزائر</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild><Link to="/register">سجّل كمؤجّر</Link></Button>
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild><Link to="/subscription">تعرف على الاشتراكات</Link></Button>
              </div>
            </div>
          </section>
        )}

        <section className="container py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">لماذا سَكَني؟</h2>
            <p className="text-muted-foreground mt-2">نوفر لك أفضل تجربة للبحث عن شقة مفروشة</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4"><Clock className="h-7 w-7 text-primary" /></div>
              <h3 className="font-semibold text-lg mb-2">سريع وسهل</h3>
              <p className="text-muted-foreground">ابحث وتصفح الشقق بسهولة مع فلاتر متقدمة توصلك لما تريد بسرعة</p>
            </div>
            <div className="text-center p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20 mx-auto mb-4"><Shield className="h-7 w-7 text-accent" /></div>
              <h3 className="font-semibold text-lg mb-2">مؤجرون موثوقون</h3>
              <p className="text-muted-foreground">جميع المؤجرين مسجلون ومعلوماتهم موثقة لضمان تجربة آمنة</p>
            </div>
            <div className="text-center p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success/20 mx-auto mb-4"><MapPin className="h-7 w-7 text-success" /></div>
              <h3 className="font-semibold text-lg mb-2">كل الجزائر</h3>
              <p className="text-muted-foreground">شقق في جميع الولايات الـ 58، من الشمال إلى الجنوب</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
