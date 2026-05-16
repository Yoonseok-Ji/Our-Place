import { useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function OAuthCallbackPage() {
  const { provider } = useParams<{ provider: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state') ?? undefined;
    const error = searchParams.get('error');

    if (error || !code || !provider) {
      toast.error('소셜 로그인이 취소됐어요');
      navigate('/login', { replace: true });
      return;
    }

    const redirectUri = `${window.location.origin}/oauth/${provider}`;

    const login = async () => {
      try {
        const data = await authApi.socialLogin(provider, { code, redirect_uri: redirectUri, state });
        setAuth(data.access_token, data.user);
        navigate('/connect', { replace: true });
      } catch (e: unknown) {
        const err = e as { response?: { data?: { detail?: string } } };
        toast.error(err.response?.data?.detail || '소셜 로그인에 실패했어요');
        navigate('/login', { replace: true });
      }
    };

    login();
  }, []);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted">로그인 처리 중...</p>
      </div>
    </div>
  );
}
