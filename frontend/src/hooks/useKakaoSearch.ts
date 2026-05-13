import { useCallback } from 'react';
import type { KakaoSearchResult } from '../types';

const CATEGORY_CODES: Record<string, string> = {
  '카페': 'CE7',
  '음식점': 'FD6',
};

export function useKakaoSearch() {
  const searchByKeyword = useCallback(
    (keyword: string, callback: (results: KakaoSearchResult[]) => void) => {
      if (!window.kakao?.maps?.services) return;
      const ps = new window.kakao.maps.services.Places();
      ps.keywordSearch(keyword, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          callback(result as unknown as KakaoSearchResult[]);
        } else {
          callback([]);
        }
      });
    },
    [],
  );

  const searchNearby = useCallback(
    (
      category: string,
      lat: number,
      lng: number,
      callback: (results: KakaoSearchResult[]) => void,
    ) => {
      if (!window.kakao?.maps?.services) return;
      const ps       = new window.kakao.maps.services.Places();
      const location = new window.kakao.maps.LatLng(lat, lng);
      const code     = CATEGORY_CODES[category];

      const handler = (result: unknown, status: string) => {
        if (status === window.kakao.maps.services.Status.OK) {
          callback(result as unknown as KakaoSearchResult[]);
        } else {
          callback([]);
        }
      };

      if (code) {
        ps.categorySearch(code, handler, { location, radius: 2000 });
      } else {
        ps.keywordSearch(category, handler, { location, radius: 2000 });
      }
    },
    [],
  );

  return { searchByKeyword, searchNearby };
}
