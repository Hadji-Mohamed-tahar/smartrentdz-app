import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, SlidersHorizontal, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ApartmentCard from "@/components/ApartmentCard";
import { wilayas } from "@/data/wilayas";
import { Apartment as LocalApartment } from "@/data/apartments";
import { getAllApartments, Apartment } from "@/services/apartmentService";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedWilaya = searchParams.get("wilaya") || "";
  const selectedPriceUnit = searchParams.get("priceUnit") || "";
  const selectedRooms = searchParams.get("rooms") || "";

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const data = await getAllApartments();
        setApartments(data);
      } catch (error) {
        console.error("Error fetching apartments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApartments();
  }, []);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "all") { newParams.set(key, value); } else { newParams.delete(key); }
    setSearchParams(newParams);
  };

  const clearFilters = () => { setSearchParams({}); setPriceRange([0, 100000]); };

  const convertToLocal = (apt: Apartment): LocalApartment => ({
    id: apt.id, title: apt.title, description: apt.description, images: apt.images,
    price: apt.price, priceUnit: apt.price_unit, wilaya: apt.wilaya, wilayaId: apt.wilaya_id,
    municipality: apt.municipality, rooms: apt.rooms, bathrooms: apt.bathrooms, area: apt.area,
    amenities: apt.amenities, isFeatured: apt.is_featured, isActive: apt.is_active,
    views: apt.views, phoneClicks: apt.phone_clicks, createdAt: apt.created_at,
    landlordId: apt.landlord_id, landlordPhone: apt.landlord_phone, landlordName: apt.landlord_name,
  });

  const filteredApartments = useMemo(() => {
    const selectedWilayaName = selectedWilaya
      ? wilayas.find((w) => w.id.toString() === selectedWilaya)?.name
      : "";
    return apartments.filter((apartment) => {
      if (selectedWilaya) {
        const matchesId = apartment.wilaya_id && apartment.wilaya_id.toString() === selectedWilaya;
        const matchesName = selectedWilayaName && apartment.wilaya === selectedWilayaName;
        if (!matchesId && !matchesName) return false;
      }
      if (selectedPriceUnit && apartment.price_unit && apartment.price_unit !== selectedPriceUnit) return false;
      if (selectedRooms && apartment.rooms) {
        const rooms = parseInt(selectedRooms);
        if (rooms === 4 && apartment.rooms < 4) return false;
        if (rooms !== 4 && apartment.rooms !== rooms) return false;
      }
      if (apartment.price < priceRange[0] || apartment.price > priceRange[1]) return false;
      return true;
    });
  }, [apartments, selectedWilaya, selectedPriceUnit, selectedRooms, priceRange]);

  const activeFiltersCount = [selectedWilaya, selectedPriceUnit, selectedRooms].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium">الولاية</label>
        <Select value={selectedWilaya || "all"} onValueChange={(v) => updateFilter("wilaya", v)}>
          <SelectTrigger><SelectValue placeholder="جميع الولايات" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الولايات</SelectItem>
            {wilayas.map((w) => (<SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        <label className="text-sm font-medium">مدة الكراء</label>
        <Select value={selectedPriceUnit || "all"} onValueChange={(v) => updateFilter("priceUnit", v)}>
          <SelectTrigger><SelectValue placeholder="جميع المدد" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المدد</SelectItem>
            <SelectItem value="day">يومي</SelectItem>
            <SelectItem value="week">أسبوعي</SelectItem>
            <SelectItem value="month">شهري</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        <label className="text-sm font-medium">عدد الغرف</label>
        <Select value={selectedRooms || "all"} onValueChange={(v) => updateFilter("rooms", v)}>
          <SelectTrigger><SelectValue placeholder="أي عدد" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">أي عدد</SelectItem>
            <SelectItem value="1">غرفة واحدة</SelectItem>
            <SelectItem value="2">غرفتان</SelectItem>
            <SelectItem value="3">3 غرف</SelectItem>
            <SelectItem value="4">4+ غرف</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        <label className="text-sm font-medium">نطاق السعر</label>
        <Slider value={priceRange} onValueChange={setPriceRange} max={100000} step={1000} className="mt-6" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{priceRange[0].toLocaleString("ar-DZ")} د.ج</span>
          <span>{priceRange[1].toLocaleString("ar-DZ")} د.ج</span>
        </div>
      </div>
      {activeFiltersCount > 0 && (<Button variant="outline" className="w-full" onClick={clearFilters}>مسح الفلاتر</Button>)}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">تصفح الشقق</h1>
            <p className="text-muted-foreground mt-1">{filteredApartments.length} شقة متاحة</p>
          </div>
          <div className="flex gap-6">
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-20 bg-card rounded-xl border p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Filter className="h-4 w-4" />الفلاتر</h3>
                <FilterContent />
              </div>
            </aside>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6 gap-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 ml-2" />الفلاتر
                      {activeFiltersCount > 0 && (<Badge variant="secondary" className="mr-2">{activeFiltersCount}</Badge>)}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader><SheetTitle>الفلاتر</SheetTitle></SheetHeader>
                    <div className="mt-6"><FilterContent /></div>
                  </SheetContent>
                </Sheet>
                <div className="flex items-center gap-3 mr-auto">
                  <Select defaultValue="newest">
                    <SelectTrigger className="w-40"><SelectValue placeholder="ترتيب" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">الأحدث</SelectItem>
                      <SelectItem value="price-low">السعر: الأقل</SelectItem>
                      <SelectItem value="price-high">السعر: الأعلى</SelectItem>
                      <SelectItem value="views">الأكثر مشاهدة</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="hidden md:flex border rounded-lg">
                    <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("grid")}><Grid className="h-4 w-4" /></Button>
                    <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedWilaya && (<Badge variant="secondary" className="gap-1">{wilayas.find((w) => w.id.toString() === selectedWilaya)?.name}<button onClick={() => updateFilter("wilaya", "")} className="mr-1 hover:text-destructive">×</button></Badge>)}
                  {selectedPriceUnit && (<Badge variant="secondary" className="gap-1">{selectedPriceUnit === "day" ? "يومي" : selectedPriceUnit === "week" ? "أسبوعي" : "شهري"}<button onClick={() => updateFilter("priceUnit", "")} className="mr-1 hover:text-destructive">×</button></Badge>)}
                  {selectedRooms && (<Badge variant="secondary" className="gap-1">{selectedRooms === "1" ? "غرفة واحدة" : selectedRooms === "2" ? "غرفتان" : selectedRooms === "3" ? "3 غرف" : "4+ غرف"}<button onClick={() => updateFilter("rooms", "")} className="mr-1 hover:text-destructive">×</button></Badge>)}
                </div>
              )}
              {filteredApartments.length > 0 ? (
                <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
                  {filteredApartments.map((apartment) => (<ApartmentCard key={apartment.id} apartment={convertToLocal(apartment)} />))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">لا توجد شقق تطابق معايير البحث</p>
                  <Button variant="link" onClick={clearFilters} className="mt-2">مسح الفلاتر وعرض الكل</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Search;
