export interface User {
  id: string;
  email: string;
  name: string;
  gender: 'male' | 'female';
  profile_image?: string;
  created_at: string;
}

export interface Couple {
  id: string;
  user1: User;
  user2?: User;
  status: 'pending' | 'active';
  anniversary?: string;
  invite_token?: string;
  created_at: string;
}

export type PlaceStatus = 'MALE_ONLY' | 'FEMALE_ONLY' | 'BOTH' | 'VISITED';

export interface Place {
  id: string;
  couple_id: string;
  kakao_place_id?: string;
  name: string;
  category?: string;
  address?: string;
  road_address?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  place_url?: string;
  saved_by_male: boolean;
  saved_by_female: boolean;
  visit_count: number;
  status: PlaceStatus;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  visit_id: string;
  image_url: string;
  uploaded_by_user_id: string;
  created_at: string;
}

export interface Visit {
  id: string;
  couple_place_id: string;
  couple_id: string;
  visited_date: string;
  rating?: number;
  memo?: string;
  mood_tags?: string[];
  visit_number: number;
  photos: Photo[];
  created_at: string;
}

export interface PlaceWithVisits extends Place {
  visits: Visit[];
}

export interface KakaoSearchResult {
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

export const MOOD_TAGS = [
  '분위기 좋음',
  '조용함',
  '데이트 느낌',
  '재방문 의사 있음',
  '가성비 좋음',
  '감성적',
  '특별한 날',
  '뷰 맛집',
  '음식 맛있음',
  '서비스 좋음',
] as const;
