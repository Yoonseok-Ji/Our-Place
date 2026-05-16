import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi, getOAuthUrl } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

function SocialButton({
  onClick,
  logo,
  label,
  bgColor,
  textColor = 'text-gray-700',
  border = true,
}: {
  onClick: () => void;
  logo: React.ReactNode;
  label: string;
  bgColor: string;
  textColor?: string;
  border?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center justify-center gap-2.5 w-full py-3 rounded-xl text-sm font-semibold
        transition-all duration-150 active:scale-95
        ${bgColor} ${textColor} ${border ? 'border border-border' : ''}
      `}
    >
      {logo}
      {label}
    </button>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(form);
      setAuth(data.access_token, data.user);
      navigate('/connect', { replace: true });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError(err.response?.data?.detail || '이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (provider: 'kakao' | 'naver' | 'google') => {
    const url = getOAuthUrl(provider);
    if (!url) {
      toast.error('소셜 로그인 설정이 완료되지 않았어요');
      return;
    }
    window.location.href = url;
  };

  // HTTPS 환경에서만 구글 활성화
  const isHttps = window.location.protocol === 'https:';

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div className="w-full max-w-sm">
          {/* 로고 */}
          <div className="mb-10">
            <div className="w-14 h-14 rounded-3xl bg-brand flex items-center justify-center mb-5 shadow-md">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-ink">Duo-Log</h1>
            <p className="text-muted text-sm mt-1.5">우리 둘만의 데이트 기록 공간</p>
          </div>

          {/* 소셜 로그인 */}
          <div className="flex flex-col gap-2.5 mb-6">
            <SocialButton
              onClick={() => handleSocial('kakao')}
              bgColor="bg-[#FEE500]"
              textColor="text-[#191919]"
              border={false}
              label="카카오로 시작하기"
              logo={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919">
                  <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.615 5.09 4.077 6.515L5.1 21l4.423-2.912A11.4 11.4 0 0012 18.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
                </svg>
              }
            />
            <SocialButton
              onClick={() => handleSocial('naver')}
              bgColor="bg-[#03C75A]"
              textColor="text-white"
              border={false}
              label="네이버로 시작하기"
              logo={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
                </svg>
              }
            />
            {isHttps && (
              <SocialButton
                onClick={() => handleSocial('google')}
                bgColor="bg-surface"
                label="Google로 시작하기"
                logo={
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                }
              />
            )}
          </div>

          {/* 구분선 */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">이메일로 로그인</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <Input
              label="이메일"
              type="email"
              placeholder="hello@example.com"
              icon={<Mail size={15} />}
              value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); setError(''); }}
              required
              autoComplete="email"
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder="비밀번호 입력"
              icon={<Lock size={15} />}
              value={form.password}
              onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(''); }}
              required
              autoComplete="current-password"
            />
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              loading={loading}
              fullWidth
              className="mt-2 flex-row-reverse"
              icon={<ArrowRight size={18} />}
            >
              로그인
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted">
              계정이 없으신가요?{' '}
              <Link to="/register" className="text-brand font-semibold hover:text-brand-hover transition-colors">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-10 text-center">
        <p className="text-xs text-muted/60">둘만의 장소를 기록하고 추억을 쌓아가세요</p>
      </div>
    </div>
  );
}
