import { create } from 'zustand';
import type { User, Couple } from '../types';

interface AuthState {
  user: User | null;
  couple: Couple | null;
  coupleResolved: boolean;
  token: string | null;
  setAuth: (token: string, user: User) => void;
  setCouple: (couple: Couple | null) => void;
  logout: () => void;
}

const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  user: storedUser ? JSON.parse(storedUser) : null,
  couple: null,
  coupleResolved: !storedToken, // 토큰 없으면 바로 resolved (null)

  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, coupleResolved: false });
  },

  setCouple: (couple) => set({ couple, coupleResolved: true }),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, couple: null, coupleResolved: true });
  },
}));
