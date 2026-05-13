declare global {
  interface Window {
    kakao: KakaoMaps;
  }

  interface KakaoMaps {
    maps: {
      load: (callback: () => void) => void;
      Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMapInstance;
      Marker: new (options: KakaoMarkerOptions) => KakaoMarker;
      CustomOverlay: new (options: KakaoOverlayOptions) => KakaoOverlay;
      LatLng: new (lat: number, lng: number) => KakaoLatLng;
      event: {
        addListener: (target: unknown, type: string, handler: (...args: unknown[]) => void) => void;
        removeListener: (target: unknown, type: string, handler: (...args: unknown[]) => void) => void;
      };
      services: {
        Places: new () => KakaoPlacesService;
        Status: { OK: string; ZERO_RESULT: string; ERROR: string };
      };
    };
  }

  interface KakaoMapOptions {
    center: KakaoLatLng;
    level: number;
  }

  interface KakaoMapInstance {
    setCenter: (latlng: KakaoLatLng) => void;
    setLevel: (level: number) => void;
    getCenter: () => KakaoLatLng;
    panTo: (latlng: KakaoLatLng) => void;
  }

  interface KakaoLatLng {
    getLat: () => number;
    getLng: () => number;
  }

  interface KakaoMarkerOptions {
    position: KakaoLatLng;
    map?: KakaoMapInstance;
  }

  interface KakaoMarker {
    setMap: (map: KakaoMapInstance | null) => void;
    getPosition: () => KakaoLatLng;
  }

  interface KakaoOverlayOptions {
    position: KakaoLatLng;
    content: string | HTMLElement;
    map?: KakaoMapInstance;
    zIndex?: number;
    yAnchor?: number;
  }

  interface KakaoOverlay {
    setMap: (map: KakaoMapInstance | null) => void;
    getPosition: () => KakaoLatLng;
  }

  interface KakaoPlaceResult {
    id: string;
    place_name: string;
    category_name: string;
    category_group_name: string;
    address_name: string;
    road_address_name: string;
    x: string;
    y: string;
    phone: string;
    place_url: string;
  }

  interface KakaoPlacesService {
    keywordSearch: (
      keyword: string,
      callback: (result: KakaoPlaceResult[], status: string) => void,
      options?: { location?: KakaoLatLng; radius?: number; sort?: unknown }
    ) => void;
    categorySearch: (
      categoryCode: string,
      callback: (result: KakaoPlaceResult[], status: string) => void,
      options?: { location?: KakaoLatLng; radius?: number; useMapBounds?: boolean }
    ) => void;
  }
}

export {};
