import client from './client';
import type { Couple } from '../types';

export const couplesApi = {
  getMyCouple: () => client.get<Couple>('/couples/me').then((r) => r.data),

  createInvite: () => client.post<Couple>('/couples/invite').then((r) => r.data),

  acceptInvite: (token: string) =>
    client.post<Couple>('/couples/accept', { token }).then((r) => r.data),

  updateAnniversary: (anniversary: string) =>
    client.patch<Couple>('/couples/anniversary', { anniversary }).then((r) => r.data),
};
