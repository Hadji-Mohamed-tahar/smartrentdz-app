import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowRight, Heart, Share2, MapPin, Bed, Bath, Maximize, Phone,
  Eye, MousePointerClick, Calendar, Wifi, Car, Snowflake, ChefHat,
  WashingMachine, ChevronLeft, ChevronRight, Map as MapIcon,
} from "lucide-react";
import ApartmentLocationViewer from "@/components/ApartmentLocationViewer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ApartmentCard from "@/components/ApartmentCard";
import { Apartment as LocalApartment, getPriceUnitLabel } from "@/data/apartments";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getApartmentById, getAllApartments, incrementViews, incrementPhoneClicks,
  Apartment,
} from "@/services/apartmentService";
import { toggleFavorite, isApartmentFavorited } from "@/services/favoritesService";
import { useToast } from "@/hooks/use-toast";

const amenityIcons: Record<string, React.ReactNode> = {
  "واي فاي": <Wifi className="h-4 w-4" />,
  "Wi-Fi": <Wifi className="h-4 w-4" />,
  "موقف سيارات": <Car className="h-4 w-4" />,
  "تكييف": <Snowflake className="h-4 w-4" />,
  "مكيف هواء": <Snowflake className="h-4 w-4" />,
  "تدفئة": <Snowflake className="h-4 w-4" />,
  "مطبخ مجهز": <ChefHat className="h-4 w-4" />,
  "مطبخ صغير": <ChefHat className="h-4 w-4" />,
  "غسالة": <WashingMachine className="h-4 w-4" />,
};

const ApartmentDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [similarApartments, setSimilarApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchApartment = async () => {
      if (!id) return;
      try {
        const apt = await getApartmentById(id);
        if (apt) {
          setApartment(apt);
          await incrementViews(id);
          const allApartments = await getAllApartments();
          const similar = allApartments
            .filter((a) => a.id !== id && a.wilaya === apt.wilaya)
            .slice(0, 3);
          setSimilarApartments(similar);
          if (currentUser) {
            const favorited = await isApartmentFavorited(String(currentUser.id), id);
            setIsFavorite(favorited);
          }
        }
      } catch (error) {
        console.error("Error fetching apartment:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApartment();
  }, [id, currentUser]);

  const handleShowPhone = async () => {
    if (!currentUser) {
      toast({ title: "تسجيل الدخول مطلوب", description: "يرجى تسجيل الدخول لعرض رقم الهاتف" });
      return;
    }
    if (id) await incrementPhoneClicks(id);
    setShowPhone(true);
  };

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      toast({ title: "تسجيل الدخول مطلوب", description: "يرجى تسجيل الدخول لحفظ الشقة في المفضلة" });
      return;
    }
    if (!id) return;
    try {
      const result = await toggleFavorite(id);
      const added = result.message.includes('إضافة');
      setIsFavorite(added);
      toast({ title: result.message });
    } catch (error) {
      toast({ title: "خطأ", description: "حدث خطأ. يرجى المحاولة مرة أخرى", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: apartment?.title, text: apartment?.description, url: window.location.href });
      } catch (error) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "تم نسخ الرابط" });
    }
  };

  const convertToLocal = (apt: Apartment): LocalApartment => ({
    id: apt.id, title: apt.title, description: apt.description, images: apt.images,
    price: apt.price, priceUnit: apt.price_unit, wilaya: apt.wilaya, wilayaId: apt.wilaya_id,
    municipality: apt.municipality, rooms: apt.rooms, bathrooms: apt.bathrooms, area: apt.area,
    amenities: apt.amenities, isFeatured: apt.is_featured, isActive: apt.is_active,
    views: apt.views, phoneClicks: apt.phone_clicks, createdAt: apt.created_at,
    landlordId: apt.landlord_id, landlordPhone: apt.landlord_phone, landlordName: apt.landlord_name,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">الشقة غير موجودة</h1>
          <Button asChild><Link to="/search">العودة للبحث</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % apartment.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + apartment.images.length) % apartment.images.length);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <ArrowRight className="h-3 w-3 rotate-180" />
            <Link to="/search" className="hover:text-primary transition-colors">تصفح الشقق</Link>
            <ArrowRight className="h-3 w-3 rotate-180" />
            <span className="text-foreground">{apartment.title}</span>
          </nav>
        </div>

        <div className="container pb-12">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-muted">
                {apartment.images.length > 0 ? (
                  <img src={apartment.images[currentImageIndex]} alt={apartment.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">لا توجد صور</div>
                )}
                {apartment.is_featured && (
                  <Badge className="absolute top-4 right-4 bg-gradient-featured text-featured-foreground border-0 shadow-featured">✨ شقة مميزة</Badge>
                )}
                {apartment.images.length > 1 && (
                  <>
                    <Button variant="secondary" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur-sm" onClick={prevImage}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="secondary" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur-sm" onClick={nextImage}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {apartment.images.map((_, idx) => (
                        <button key={idx} className={`h-2 w-2 rounded-full transition-colors ${idx === currentImageIndex ? "bg-primary-foreground" : "bg-primary-foreground/50"}`} onClick={() => setCurrentImageIndex(idx)} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-3">{apartment.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{apartment.municipality}، {apartment.wilaya}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-xl">
                  <Bed className="h-5 w-5 text-primary" /><span className="font-medium">{apartment.rooms} غرف</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-xl">
                  <Bath className="h-5 w-5 text-primary" /><span className="font-medium">{apartment.bathrooms} حمام</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-xl">
                  <Maximize className="h-5 w-5 text-primary" /><span className="font-medium">{apartment.area} م²</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-muted rounded-xl">
                  <Calendar className="h-5 w-5 text-primary" /><span className="font-medium">إيجار {getPriceUnitLabel(apartment.price_unit)}</span>
                </div>
              </div>

              <Separator />
              <div>
                <h2 className="text-xl font-semibold mb-3">الوصف</h2>
                <p className="text-muted-foreground leading-relaxed">{apartment.description}</p>
              </div>
              <Separator />
              {apartment.amenities.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">المرافق والخدمات</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {apartment.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-3 px-4 py-3 bg-muted rounded-xl">
                        {amenityIcons[amenity] || <div className="h-4 w-4 rounded-full bg-primary" />}
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                <div className="bg-card rounded-2xl border shadow-lg p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-primary">{apartment.price.toLocaleString("ar-DZ")} د.ج</div>
                    <div className="text-muted-foreground">/ {getPriceUnitLabel(apartment.price_unit)}</div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="lg" className="w-full bg-gradient-hero hover:opacity-90">
                        <Phone className="h-5 w-5 ml-2" />اتصل بالمؤجر
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>معلومات التواصل</DialogTitle>
                        <DialogDescription>{currentUser ? "تواصل مع المؤجر مباشرة" : "يرجى تسجيل الدخول لعرض معلومات التواصل"}</DialogDescription>
                      </DialogHeader>
                      <div className="py-6 text-center">
                        {currentUser ? (
                          showPhone ? (
                            <div className="space-y-3">
                              {apartment.landlord_name && <p className="text-lg font-semibold">{apartment.landlord_name}</p>}
                              {apartment.landlord_phone ? (
                                <a href={`tel:${apartment.landlord_phone}`} className="text-2xl font-bold text-primary block" dir="ltr">{apartment.landlord_phone}</a>
                              ) : (
                                <p className="text-muted-foreground">رقم الهاتف غير متوفر</p>
                              )}
                            </div>
                          ) : (
                            <Button onClick={handleShowPhone}>عرض رقم الهاتف</Button>
                          )
                        ) : (
                          <div className="space-y-4">
                            <p>سجّل الدخول لعرض رقم الهاتف</p>
                            <Button asChild><Link to="/login">تسجيل الدخول</Link></Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" className={`flex-1 ${isFavorite ? "text-destructive" : ""}`} onClick={handleToggleFavorite}>
                      <Heart className={`h-4 w-4 ml-2 ${isFavorite ? "fill-current" : ""}`} />{isFavorite ? "محفوظ" : "حفظ"}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleShare}>
                      <Share2 className="h-4 w-4 ml-2" />مشاركة
                    </Button>
                  </div>
                  {typeof apartment.latitude === "number" &&
                    typeof apartment.longitude === "number" &&
                    Number.isFinite(apartment.latitude) &&
                    Number.isFinite(apartment.longitude) && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full mt-2">
                            <MapIcon className="h-4 w-4 ml-2" />
                            عرض الموقع
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl p-4 sm:p-6">
                          <DialogHeader>
                            <DialogTitle>موقع الشقة</DialogTitle>
                            <DialogDescription>
                              {apartment.municipality}، {apartment.wilaya}
                            </DialogDescription>
                          </DialogHeader>
                          <ApartmentLocationViewer
                            latitude={apartment.latitude as number}
                            longitude={apartment.longitude as number}
                            title={apartment.title}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                </div>

                <div className="bg-muted rounded-xl p-4">
                  <div className="flex justify-around text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                        <Eye className="h-4 w-4 text-muted-foreground" />{apartment.views}
                      </div>
                      <div className="text-xs text-muted-foreground">مشاهدة</div>
                    </div>
                    <Separator orientation="vertical" className="h-10" />
                    <div>
                      <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />{apartment.phone_clicks}
                      </div>
                      <div className="text-xs text-muted-foreground">نقرة على الهاتف</div>
                    </div>
                  </div>
                </div>

                {apartment.landlord_name && (
                  <div className="bg-card rounded-xl border p-4">
                    <h3 className="font-semibold mb-3">المؤجر</h3>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">{apartment.landlord_name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{apartment.landlord_name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {similarApartments.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">شقق مشابهة</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similarApartments.map((apt) => (
                  <ApartmentCard key={apt.id} apartment={convertToLocal(apt)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApartmentDetail;
