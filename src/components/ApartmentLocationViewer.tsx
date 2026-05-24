import { useEffect, useRef, useState } from "react";
import { Navigation, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";

interface ApartmentLocationViewerProps {
  latitude: number;
  longitude: number;
  title?: string;
}

const ApartmentLocationViewer = ({ latitude, longitude, title }: ApartmentLocationViewerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !containerRef.current) return;
        const position = { lat: latitude, lng: longitude };
        const map = new google.maps.Map(containerRef.current, {
          center: position,
          zoom: 16,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        new google.maps.Marker({
          position,
          map,
          title: title || "موقع الشقة",
          animation: google.maps.Animation.DROP,
        });
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "تعذر تحميل الخريطة");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, title]);

  const openDirections = () => {
    const dest = `${latitude},${longitude}`;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
          window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`,
            "_blank"
          );
        },
        () => {
          window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`,
            "_blank"
          );
        },
        { timeout: 5000 }
      );
    } else {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`,
        "_blank"
      );
    }
  };

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="w-full h-[420px] sm:h-[500px] rounded-xl overflow-hidden bg-muted border"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/60 rounded-xl">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted rounded-xl text-center p-4">
          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}
      {!loading && !error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <Button
            onClick={openDirections}
            size="lg"
            className="bg-gradient-hero hover:opacity-90 shadow-lg"
          >
            <Navigation className="h-4 w-4 ml-2" />
            الاتجاه إلى الشقة
          </Button>
        </div>
      )}
    </div>
  );
};

export default ApartmentLocationViewer;
