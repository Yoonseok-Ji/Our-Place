import client from './client';
import type { User } from '../types';

export interface TokenOut {
  access_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  register: (data: { email: string; password: string; name: string; gender: 'male' | 'female' }) =>
    client.post<TokenOut>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    client.post<TokenOut>('/auth/login', data).then((r) => r.data),
};
