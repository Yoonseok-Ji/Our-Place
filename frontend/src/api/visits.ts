import client from './client';
import type { Visit, PlaceWithVisits } from '../types';

export interface VisitCreate {
  visited_date: string;
  rating?: number;
  memo?: string;
  mood_tags?: string[];
}

export interface VisitUpdate {
  visited_date?: string;
  rating?: number | null;
  memo?: string | null;
  mood_tags?: string[] | null;
}

export const visitsApi = {
  getTimeline: () => client.get<PlaceWithVisits[]>('/visits/timeline').then((r) => r.data),

  logVisit: (placeId: string, data: VisitCreate) =>
    client.post<Visit>(`/visits/${placeId}`, data).then((r) => r.data),

  updateVisit: (placeId: string, visitId: string, data: VisitUpdate) =>
    client.patch<Visit>(`/visits/${placeId}/${visitId}`, data).then((r) => r.data),

  deleteVisit: (placeId: string, visitId: string) =>
    client.delete(`/visits/${placeId}/${visitId}`),

  getPlaceVisits: (placeId: string) =>
    client.get<PlaceWithVisits>(`/visits/${placeId}`).then((r) => r.data),

  uploadPhoto: (placeId: string, visitId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return client.post(`/visits/${placeId}/${visitId}/photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  deletePhoto: (placeId: string, visitId: string, photoId: string) =>
    client.delete(`/visits/${placeId}/${visitId}/photos/${photoId}`),
};
