import client from './client';
import type { Place, KakaoSearchResult } from '../types';

export interface PlaceSaveRequest {
  kakao_place_id?: string;
  name: string;
  category?: string;
  address?: string;
  road_address?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  place_url?: string;
}

export const placesApi = {
  list: () => client.get<Place[]>('/places/').then((r) => r.data),

  save: (data: PlaceSaveRequest) => client.post<Place>('/places/', data).then((r) => r.data),

  get: (id: string) => client.get<Place>(`/places/${id}`).then((r) => r.data),

  delete: (id: string) => client.delete(`/places/${id}`),
};

export function kakaoResultToRequest(result: KakaoSearchResult): PlaceSaveRequest {
  return {
    kakao_place_id: result.id,
    name: result.place_name,
    category: result.category_group_name || result.category_name,
    address: result.address_name,
    road_address: result.road_address_name,
    lat: parseFloat(result.y),
    lng: parseFloat(result.x),
    phone: result.phone,
    place_url: result.place_url,
  };
}
