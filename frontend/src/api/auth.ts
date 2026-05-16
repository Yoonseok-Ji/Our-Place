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

  // 이메일 인증 코드 발송
  sendCode: (email: string) =>
    client.post('/auth/send-code', { email }).then((r) => r.data),

  // 인증 코드 확인
  verifyCode: (email: string, code: string) =>
    client.post('/auth/verify-code', { email, code }).then((r) => r.data),

  // 소셜 로그인 (kakao / naver / google)
  socialLogin: (provider: string, data: { code: string; redirect_uri: string; state?: string }) =>
    client.post<TokenOut>(`/auth/${provider}`, data).then((r) => r.data),

  // 기능 플래그 (SES 설정 여부 등)
  features: () =>
    client.get<{ email_verification: boolean }>('/auth/features').then((r) => r.data),
};

// OAuth 리다이렉트 URL 생성 헬퍼
export function getOAuthUrl(provider: 'kakao' | 'naver' | 'google'): string {
  const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/${provider}`);

  if (provider === 'kakao') {
    const clientId = import.meta.env.VITE_KAKAO_OAUTH_CLIENT_ID;
    if (!clientId) return '';
    return `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
  }

  if (provider === 'naver') {
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
    if (!clientId) return '';
    const state = Math.random().toString(36).slice(2);
    sessionStorage.setItem('naver_state', state);
    return `https://nid.naver.com/oauth2.0/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&state=${state}`;
  }

  if (provider === 'google') {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return '';
    const scope = encodeURIComponent('email profile');
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  }

  return '';
}
