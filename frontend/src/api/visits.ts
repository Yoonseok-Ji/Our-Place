import client from './client';
import type { Visit, PlaceWithVisits } from '../types';

export interface VisitCreate {
  visited_date: string;
  rating?: number;
  memo?: string;
  mood_tags?: string[];
}

export const visitsApi = {
  getTimeline: () => client.get<PlaceWithVisits[]>('/visits/timeline').then((r) => r.data),

  logVisit: (placeId: string, data: VisitCreate) =>
    client.post<Visit>(`/visits/${placeId}`, data).then((r) => r.data),

  getPlaceVisits: (placeId: string) =>
    client.get<PlaceWithVisits>(`/visits/${placeId}`).then((r) => r.data),

  uploadPhoto: (placeId: string, visitId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return client.post(`/visits/${placeId}/${visitId}/photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};
