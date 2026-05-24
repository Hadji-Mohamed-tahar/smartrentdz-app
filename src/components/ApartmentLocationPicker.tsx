import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, LocateFixed, MapPin } from "lucide-react";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";
import { useToast } from "@/hooks/use-toast";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Props {
  value: Coordinates | null;
  onChange: (coords: Coordinates) => void;
  /** Used to fly the map when the user changes wilaya/municipality */
  locationQuery?: string;
  /** Optional callback when reverse geocoding resolves a municipality */
  onReverseGeocode?: (info: { wilaya?: string; municipality?: string }) => void;
}

// Default center: Algiers
const DEFAULT_CENTER = { lat: 36.7372, lng: 3.0865 };

export default function ApartmentLocationPicker({
  value,
  onChange,
  locationQuery,
  onReverseGeocode,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const { toast } = useToast();

  const updateCoords = (lat: number, lng: number, runReverse = true) => {
    onChange({ latitude: lat, longitude: lng });
    if (runReverse && geocoderRef.current && onReverseGeocode) {
      geocoderRef.current.geocode(
        { location: { lat, lng }, language: "ar" },
        (results, status) => {
          if (status !== "OK" || !results?.length) return;
          const comps = results[0].address_components;
          const get = (type: string) =>
            comps.find((c) => c.types.includes(type))?.long_name;
          onReverseGeocode({
            wilaya: get("administrative_area_level_1"),
            municipality:
              get("locality") ||
              get("administrative_area_level_2") ||
              get("sublocality"),
          });
        }
      );
    }
  };

  // Initialize map once
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !containerRef.current) return;
        const initial = value
          ? { lat: value.latitude, lng: value.longitude }
          : DEFAULT_CENTER;
        const map = new google.maps.Map(containerRef.current, {
          center: initial,
          zoom: value ? 15 : 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        const marker = new google.maps.Marker({
          map,
          position: initial,
          draggable: true,
        });
        marker.addListener("dragend", () => {
          const p = marker.getPosition();
          if (p) updateCoords(p.lat(), p.lng());
        });
        map.addListener("click", (e: any) => {
          if (!e.latLng) return;
          marker.setPosition(e.latLng);
          updateCoords(e.latLng.lat(), e.latLng.lng());
        });
        mapRef.current = map;
        markerRef.current = marker;
        geocoderRef.current = new google.maps.Geocoder();
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "فشل تحميل الخريطة");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value -> marker (e.g. when loaded from server)
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !value) return;
    const pos = { lat: value.latitude, lng: value.longitude };
    const cur = markerRef.current.getPosition();
    if (cur && cur.lat() === pos.lat && cur.lng() === pos.lng) return;
    markerRef.current.setPosition(pos);
    mapRef.current.panTo(pos);
  }, [value?.latitude, value?.longitude]);

  // Fly to chosen wilaya/municipality
  useEffect(() => {
    if (!locationQuery || !mapRef.current || !markerRef.current) return;
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode(
      { address: locationQuery, region: "DZ", language: "ar" },
      (results, status) => {
        if (status !== "OK" || !results?.length) return;
        const loc = results[0].geometry.location;
        mapRef.current!.panTo(loc);
        mapRef.current!.setZoom(14);
        markerRef.current!.setPosition(loc);
        updateCoords(loc.lat(), loc.lng(), false);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationQuery]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "غير مدعوم", description: "متصفحك لا يدعم تحديد الموقع", variant: "destructive" });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapRef.current && markerRef.current) {
          const p = { lat: latitude, lng: longitude };
          mapRef.current.panTo(p);
          mapRef.current.setZoom(16);
          markerRef.current.setPosition(p);
        }
        updateCoords(latitude, longitude);
        setLocating(false);
      },
      () => {
        toast({ title: "خطأ", description: "تعذر الحصول على موقعك الحالي", variant: "destructive" });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          اسحب العلامة أو اضغط على الخريطة لتحديد الموقع الدقيق
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={useCurrentLocation}
          disabled={locating || loading || !!error}
        >
          {locating ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <LocateFixed className="h-4 w-4 ml-2" />}
          استخدام موقعي الحالي
        </Button>
      </div>

      <div className="relative w-full h-72 md:h-96 rounded-lg overflow-hidden border bg-muted">
        <div ref={containerRef} className="absolute inset-0" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/70">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      {value && (
        <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
          <span>خط العرض: <span className="font-mono text-foreground">{value.latitude.toFixed(6)}</span></span>
          <span>خط الطول: <span className="font-mono text-foreground">{value.longitude.toFixed(6)}</span></span>
        </div>
      )}
    </div>
  );
}
