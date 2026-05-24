// Singleton loader for the Google Maps JavaScript SDK
let promise: Promise<any> | null = null;

export function loadGoogleMaps(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps requires a browser"));
  }
  if ((window as any).google?.maps) {
    return Promise.resolve((window as any).google);
  }
  if (promise) return promise;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!apiKey) {
    return Promise.reject(new Error("VITE_GOOGLE_MAPS_API_KEY غير معرف"));
  }

  promise = new Promise((resolve, reject) => {
    const cbName = `__gmapsCb_${Date.now()}`;
    (window as any)[cbName] = () => {
      resolve((window as any).google);
      delete (window as any)[cbName];
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&language=ar&region=DZ&libraries=places,geocoding&loading=async&callback=${cbName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      promise = null;
      reject(new Error("فشل تحميل خرائط Google"));
    };
    document.head.appendChild(script);
  });

  return promise;
}
