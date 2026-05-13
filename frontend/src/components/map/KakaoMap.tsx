import { useEffect, useRef, useState } from 'react';
import type { Place, KakaoSearchResult } from '../../types';

interface KakaoMapProps {
  places: Place[];
  discoveryPlaces?: KakaoSearchResult[];
  onPlaceClick: (place: Place) => void;
  onDiscoveryClick?: (result: KakaoSearchResult) => void;
  selectedPlaceId?: string;
  selectedDiscoveryId?: string;
  onCenterChange?: (lat: number, lng: number) => void;
  centerTo?: { lat: number; lng: number; level?: number } | null;
}

function getSavedPinHtml(place: Place, isSelected: boolean): string {
  const scale = isSelected ? 1.25 : 1;
  let bg: string, shadow: string, size: number;

  if (place.status === 'VISITED' || place.visit_count > 0) {
    bg = '#EF4444'; shadow = 'rgba(239,68,68,0.40)'; size = 44;
  } else if (place.status === 'BOTH') {
    bg = '#8B5CF6'; shadow = 'rgba(139,92,246,0.40)'; size = 44;
  } else if (place.status === 'MALE_ONLY') {
    bg = '#3B82F6'; shadow = 'rgba(59,130,246,0.35)'; size = 36;
  } else {
    bg = '#F472B6'; shadow = 'rgba(244,114,182,0.35)'; size = 36;
  }

  const showLabel = place.status === 'VISITED' || place.status === 'BOTH' || place.visit_count > 0;
  const name = place.name.length > 8 ? place.name.slice(0, 8) + '…' : place.name;

  return `
    <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;transform:scale(${scale});transition:transform 0.15s;transform-origin:bottom center">
      <div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};box-shadow:0 4px 14px ${shadow};border:3px solid #fff;display:flex;align-items:center;justify-content:center;">
        <svg width="${size * 0.44}" height="${size * 0.44}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
        </svg>
      </div>
      <div style="width:0;height:0;border-left:${size*0.14}px solid transparent;border-right:${size*0.14}px solid transparent;border-top:${size*0.22}px solid ${bg};margin-top:-1px"></div>
      ${showLabel ? `<div style="background:${bg};color:#fff;font-size:10px;font-weight:600;padding:2px 7px;border-radius:10px;margin-top:3px;white-space:nowrap;font-family:'Pretendard Variable',Pretendard,sans-serif;box-shadow:0 2px 6px ${shadow};">${name}</div>` : ''}
    </div>`;
}

function getDiscoveryPinHtml(result: KakaoSearchResult, isSelected: boolean): string {
  const scale = isSelected ? 1.2 : 1;
  const border = isSelected ? '#3182F6' : '#B0B8C1';
  const bg     = isSelected ? '#EBF2FF' : '#FFFFFF';
  const dot    = isSelected ? '#3182F6' : '#8B95A1';
  return `
    <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;transform:scale(${scale});transition:transform 0.15s;transform-origin:bottom center">
      <div style="width:28px;height:28px;border-radius:50%;background:${bg};border:2.5px solid ${border};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.10);">
        <div style="width:8px;height:8px;border-radius:50%;background:${dot};"></div>
      </div>
      <div style="width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:6px solid ${border};margin-top:-1px;opacity:0.7"></div>
    </div>`;
}

export default function KakaoMapComponent({
  places, discoveryPlaces = [], onPlaceClick, onDiscoveryClick,
  selectedPlaceId, selectedDiscoveryId, onCenterChange, centerTo,
}: KakaoMapProps) {
  const containerRef     = useRef<HTMLDivElement>(null);
  const mapRef           = useRef<KakaoMapInstance | null>(null);
  const savedOverlaysRef = useRef<KakaoOverlay[]>([]);
  const discOverlaysRef  = useRef<KakaoOverlay[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // Init map
  useEffect(() => {
    const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;
    if (!apiKey || apiKey === 'YOUR_KAKAO_MAP_KEY_HERE') return;

    const init = () => {
      window.kakao.maps.load(() => {
        if (!containerRef.current) return;
        const map = new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 5,
        });
        mapRef.current = map;

        if (onCenterChange) {
          window.kakao.maps.event.addListener(map, 'dragend', () => {
            const c = map.getCenter();
            onCenterChange(c.getLat(), c.getLng());
          });
        }

        setMapReady(true);
      });
    };

    if (window.kakao?.maps) { init(); return; }

    const script = document.createElement('script');
    script.src   = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = init;
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  // Pan to region when centerTo changes
  useEffect(() => {
    if (!mapReady || !mapRef.current || !centerTo) return;
    mapRef.current.panTo(new window.kakao.maps.LatLng(centerTo.lat, centerTo.lng));
    if (centerTo.level) mapRef.current.setLevel(centerTo.level);
  }, [mapReady, centerTo]);

  // Render saved place pins
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    savedOverlaysRef.current.forEach((o) => o.setMap(null));
    savedOverlaysRef.current = [];

    places.forEach((place) => {
      if (!place.lat || !place.lng) return;
      const isSelected = place.id === selectedPlaceId;
      const content    = document.createElement('div');
      content.innerHTML = getSavedPinHtml(place, isSelected);
      content.addEventListener('click', () => onPlaceClick(place));

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(place.lat, place.lng),
        content, map: mapRef.current!, yAnchor: 1,
        zIndex: isSelected ? 10 : 1,
      });
      savedOverlaysRef.current.push(overlay);
    });
  }, [mapReady, places, selectedPlaceId, onPlaceClick]);

  // Render discovery pins
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    discOverlaysRef.current.forEach((o) => o.setMap(null));
    discOverlaysRef.current = [];

    discoveryPlaces.forEach((result) => {
      const lat = parseFloat(result.y);
      const lng = parseFloat(result.x);
      if (!lat || !lng) return;

      const isSelected = result.id === selectedDiscoveryId;
      const content    = document.createElement('div');
      content.innerHTML = getDiscoveryPinHtml(result, isSelected);
      content.addEventListener('click', () => onDiscoveryClick?.(result));

      const overlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(lat, lng),
        content, map: mapRef.current!, yAnchor: 1,
        zIndex: isSelected ? 9 : 0,
      });
      discOverlaysRef.current.push(overlay);
    });
  }, [mapReady, discoveryPlaces, selectedDiscoveryId, onDiscoveryClick]);

  const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;
  if (!apiKey || apiKey === 'YOUR_KAKAO_MAP_KEY_HERE') {
    return (
      <div className="w-full h-full bg-brand-50 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3182F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
        </div>
        <p className="text-sm text-muted text-center">.env 파일에 KAKAO_MAP_KEY를 입력하면<br />지도가 표시됩니다</p>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
}
