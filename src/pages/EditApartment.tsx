import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Upload, X, MapPin, DollarSign } from "lucide-react";
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
import { getApartmentById, updateApartment } from "@/services/apartmentService";
import ApartmentLocationPicker, { Coordinates } from "@/components/ApartmentLocationPicker";

const amenitiesList = [
  "واي فاي", "تكييف", "تدفئة", "موقف سيارات", "مطبخ مجهز",
  "غسالة", "تلفزيون", "شرفة", "مصعد", "أمن 24/7",
];

const EditApartment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [initialCoords, setInitialCoords] = useState<Coordinates | null>(null);
  const [formData, setFormData] = useState({
    title: "", description: "", wilayaId: "", municipality: "",
    price: "", priceUnit: "day", rooms: "", bathrooms: "", area: "",
    amenities: [] as string[],
  });

  useEffect(() => {
    const fetchApartment = async () => {
      if (!id) return;
      try {
        const apt = await getApartmentById(id);
        if (!apt || String(apt.landlord_id) !== String(currentUser?.id)) {
          toast({ title: "غير مصرح", description: "لا يمكنك تعديل هذه الشقة", variant: "destructive" });
          navigate("/dashboard");
          return;
        }
        setExistingImages(apt.images);
        setFormData({
          title: apt.title,
          description: apt.description,
          wilayaId: apt.wilaya_id.toString(),
          municipality: apt.municipality,
          price: apt.price.toString(),
          priceUnit: apt.price_unit,
          rooms: apt.rooms.toString(),
          bathrooms: apt.bathrooms.toString(),
          area: apt.area.toString(),
          amenities: apt.amenities,
        });
        if (apt.latitude != null && apt.longitude != null) {
          const c = { latitude: apt.latitude, longitude: apt.longitude };
          setCoords(c);
          setInitialCoords(c);
        }
      } catch (error) {
        console.error("Error fetching apartment:", error);
        toast({ title: "خطأ", description: "حدث خطأ أثناء تحميل بيانات الشقة", variant: "destructive" });
        navigate("/dashboard");
      } finally {
        setPageLoading(false);
      }
    };
    fetchApartment();
  }, [id, currentUser]);

  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const totalAllowed = 10 - existingImages.length;
    const newFiles = Array.from(files).slice(0, totalAllowed - newImageFiles.length);
    const previews = newFiles.map((f) => URL.createObjectURL(f));
    setNewImageFiles((prev) => [...prev, ...newFiles]);
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !currentUser) return;
    if (existingImages.length + newImageFiles.length === 0) {
      toast({ title: "خطأ", description: "يرجى إضافة صورة واحدة على الأقل", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const wilaya = wilayas.find((w) => w.id.toString() === formData.wilayaId);

      await updateApartment(id, {
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
        images: newImageFiles.length > 0 ? newImageFiles : undefined,
        existing_images: existingImages,
        latitude:
          coords &&
          (!initialCoords ||
            coords.latitude !== initialCoords.latitude ||
            coords.longitude !== initialCoords.longitude)
            ? coords.latitude
            : undefined,
        longitude:
          coords &&
          (!initialCoords ||
            coords.latitude !== initialCoords.latitude ||
            coords.longitude !== initialCoords.longitude)
            ? coords.longitude
            : undefined,
      });

      toast({ title: "تم تحديث الشقة بنجاح" });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating apartment:", error);
      toast({ title: "خطأ", description: "حدث خطأ أثناء تحديث الشقة", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (<div className="min-h-screen flex flex-col"><Header /><main className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></main><Footer /></div>);
  }

  const totalImages = existingImages.length + newImagePreviews.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container py-8 max-w-3xl">
          <div className="mb-8">
            <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
              <ArrowRight className="h-4 w-4 ml-2" />رجوع
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">تعديل الشقة</h1>
            <p className="text-muted-foreground mt-1">قم بتعديل معلومات شقتك</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-card rounded-xl border p-6">
              <h2 className="font-semibold mb-4">صور الشقة</h2>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {existingImages.map((img, idx) => (
                  <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                    <button type="button" className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center" onClick={() => removeExistingImage(idx)}><X className="h-3 w-3" /></button>
                  </div>
                ))}
                {newImagePreviews.map((img, idx) => (
                  <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                    <button type="button" className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center" onClick={() => removeNewImage(idx)}><X className="h-3 w-3" /></button>
                  </div>
                ))}
                {totalImages < 10 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">إضافة</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleNewImageUpload} />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3">أضف حتى 10 صور للشقة.</p>
            </div>

            <div className="bg-card rounded-xl border p-6 space-y-4">
              <h2 className="font-semibold mb-4">المعلومات الأساسية</h2>
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الإعلان</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea id="description" rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>
            </div>

            <div className="bg-card rounded-xl border p-6 space-y-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><MapPin className="h-5 w-5" />الموقع</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>الولاية</Label>
                  <Select value={formData.wilayaId} onValueChange={(v) => setFormData({ ...formData, wilayaId: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر الولاية" /></SelectTrigger>
                    <SelectContent>{wilayas.map((w) => (<SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="municipality">البلدية</Label>
                  <Input id="municipality" value={formData.municipality} onChange={(e) => setFormData({ ...formData, municipality: e.target.value })} required />
                </div>
              </div>
              <div className="pt-2">
                {(() => {
                  const wName = wilayas.find((w) => w.id.toString() === formData.wilayaId)?.name || "";
                  const query = wName || formData.municipality
                    ? `${formData.municipality ? formData.municipality + "، " : ""}${wName}، الجزائر`.trim()
                    : undefined;
                  return (
                    <ApartmentLocationPicker
                      value={coords}
                      onChange={setCoords}
                      locationQuery={query}
                    />
                  );
                })()}
              </div>
            </div>

            <div className="bg-card rounded-xl border p-6 space-y-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><DollarSign className="h-5 w-5" />السعر</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">السعر (د.ج)</Label>
                  <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
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
                  <Select value={formData.rooms} onValueChange={(v) => setFormData({ ...formData, rooms: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>{[1,2,3,4,5,6].map((n) => (<SelectItem key={n} value={n.toString()}>{n}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>عدد الحمامات</Label>
                  <Select value={formData.bathrooms} onValueChange={(v) => setFormData({ ...formData, bathrooms: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>{[1,2,3,4].map((n) => (<SelectItem key={n} value={n.toString()}>{n}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">المساحة (م²)</Label>
                  <Input id="area" type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} required />
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
                {isLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)}>إلغاء</Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditApartment;
