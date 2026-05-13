import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm]       = useState({ email: '', password: '', name: '', gender: '' as 'male' | 'female' | '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gender) return toast.error('성별을 선택해주세요');
    if (form.password.length < 8) return toast.error('비밀번호는 8자 이상이어야 해요');
    setLoading(true);
    try {
      const data = await authApi.register({ ...form, gender: form.gender as 'male' | 'female' });
      setAuth(data.access_token, data.user);
      navigate('/connect', { replace: true });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || '회원가입에 실패했어요');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/login"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted hover:text-ink hover:bg-brand-50 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-ink">새 계정 만들기</h1>
            <p className="text-xs text-muted mt-0.5">가입 후 파트너와 연결하세요</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <Input
            label="이름"
            placeholder="이름을 입력해주세요"
            icon={<User size={15} />}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="이메일"
            type="email"
            placeholder="hello@example.com"
            icon={<Mail size={15} />}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="비밀번호"
            type="password"
            placeholder="8자 이상"
            icon={<Lock size={15} />}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {/* 성별 선택 */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">성별</label>
            <div className="grid grid-cols-2 gap-2.5">
              {([
                { val: 'male',   label: '남자', active: 'border-blue-male bg-blue-50 text-blue-male' },
                { val: 'female', label: '여자', active: 'border-rose-pin bg-pink-50 text-rose-pin'   },
              ] as const).map(({ val, label, active }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setForm({ ...form, gender: val })}
                  className={`
                    py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-150
                    ${form.gender === val ? active : 'border-border text-muted bg-surface hover:border-gray-300'}
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            loading={loading}
            fullWidth
            className="mt-1 flex-row-reverse"
            icon={<ArrowRight size={18} />}
          >
            시작하기
          </Button>
        </form>
      </div>
    </div>
  );
}
