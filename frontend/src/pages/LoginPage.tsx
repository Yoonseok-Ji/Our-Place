import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

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
