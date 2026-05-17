import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Heart, MapPin, Bed, Bath, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Apartment, getPriceUnitLabel } from "@/data/apartments";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toggleFavorite, isApartmentFavorited } from "@/services/favoritesService";
import { useToast } from "@/hooks/use-toast";

interface ApartmentCardProps {
  apartment: Apartment;
  onFavoriteClick?: (id: string) => void;
  isFavorite?: boolean;
}

const ApartmentCard = ({ apartment, onFavoriteClick, isFavorite }: ApartmentCardProps) => {
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [internalFav, setInternalFav] = useState<boolean>(!!isFavorite);
  const [busy, setBusy] = useState(false);

  const controlled = isFavorite !== undefined;
  const favState = controlled ? !!isFavorite : internalFav;

  useEffect(() => {
    if (controlled || authLoading || !currentUser) return;
    let active = true;
    isApartmentFavorited(String(currentUser.id), apartment.id)
      .then((v) => { if (active) setInternalFav(v); })
      .catch(() => {});
    return () => { active = false; };
  }, [controlled, authLoading, currentUser, apartment.id]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    if (onFavoriteClick) {
      onFavoriteClick(apartment.id);
      return;
    }

    if (authLoading) return;
    if (!currentUser) {
      toast({ title: "تسجيل الدخول مطلوب", description: "يرجى تسجيل الدخول لإضافة الشقة إلى المفضلة" });
      navigate("/login");
      return;
    }

    setBusy(true);
    const prev = internalFav;
    setInternalFav(!prev);
    try {
      await toggleFavorite(apartment.id);
      toast({ title: !prev ? "تمت الإضافة إلى المفضلة" : "تمت الإزالة من المفضلة" });
    } catch (err: any) {
      setInternalFav(prev);
      toast({ title: "خطأ", description: err?.message || "حدث خطأ، يرجى المحاولة لاحقاً", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Link
      to={`/apartment/${apartment.id}`}
      className="group block overflow-hidden rounded-xl bg-card border shadow-sm card-hover"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={apartment.images[0]}
          alt={apartment.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Featured Badge */}
        {apartment.isFeatured && (
          <Badge className="absolute top-3 right-3 bg-gradient-featured text-featured-foreground border-0 shadow-featured">
            ✨ مميز
          </Badge>
        )}

        {/* Favorite Button */}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          disabled={busy}
          className={cn(
            "absolute top-3 left-3 h-9 w-9 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card",
            favState && "text-destructive"
          )}
          onClick={handleFavorite}
        >
          <Heart className={cn("h-4 w-4", favState && "fill-current")} />
        </Button>

        {/* Price Overlay */}
        <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
          <span className="font-bold text-primary">{apartment.price.toLocaleString("ar-DZ")}</span>
          <span className="text-sm text-muted-foreground mr-1">
            د.ج{apartment.priceUnit ? ` / ${getPriceUnitLabel(apartment.priceUnit)}` : ''}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {apartment.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{apartment.municipality ? `${apartment.municipality}، ` : ''}{apartment.wilaya}</span>
        </div>

        {/* Features */}
        {(apartment.rooms > 0 || apartment.bathrooms > 0 || apartment.area > 0) && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {apartment.rooms > 0 && (
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4" />
                <span>{apartment.rooms} غرف</span>
              </div>
            )}
            {apartment.bathrooms > 0 && (
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" />
                <span>{apartment.bathrooms} حمام</span>
              </div>
            )}
            {apartment.area > 0 && (
              <div className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4" />
                <span>{apartment.area} م²</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ApartmentCard;
