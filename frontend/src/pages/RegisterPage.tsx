import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

type Step = 'form' | 'verify';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [emailVerificationEnabled, setEmailVerificationEnabled] = useState(true);
  const [form, setForm]       = useState({ email: '', password: '', name: '', gender: '' as 'male' | 'female' | '' });
  const [code, setCode]       = useState('');
  const [step, setStep]       = useState<Step>('form');
  const [verified, setVerified] = useState(false);

  const [loadingSend, setLoadingSend]     = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    authApi.features().then((f) => {
      setEmailVerificationEnabled(f.email_verification);
      if (!f.email_verification) setVerified(true); // SES 미설정 시 인증 건너뜀
    }).catch(() => {});
  }, []);

  // 1단계: 인증 코드 발송
  const handleSendCode = async () => {
    if (!form.email) return toast.error('이메일을 먼저 입력해주세요');
    setLoadingSend(true);
    try {
      await authApi.sendCode(form.email);
      setStep('verify');
      toast.success('인증 코드를 발송했어요. 이메일을 확인해주세요');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || '코드 발송에 실패했어요');
    } finally {
      setLoadingSend(false);
    }
  };

  // 2단계: 코드 확인
  const handleVerify = async () => {
    if (!code.trim()) return toast.error('인증 코드를 입력해주세요');
    setLoadingVerify(true);
    try {
      await authApi.verifyCode(form.email, code);
      setVerified(true);
      toast.success('이메일이 인증됐어요!');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || '인증 코드가 올바르지 않아요');
    } finally {
      setLoadingVerify(false);
    }
  };

  // 3단계: 회원가입
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verified) return toast.error('이메일 인증을 먼저 완료해주세요');
    if (!form.gender) return toast.error('성별을 선택해주세요');
    if (form.password.length < 8) return toast.error('비밀번호는 8자 이상이어야 해요');
    setLoadingSubmit(true);
    try {
      const data = await authApi.register({ ...form, gender: form.gender as 'male' | 'female' });
      setAuth(data.access_token, data.user);
      navigate('/connect', { replace: true });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || '회원가입에 실패했어요');
    } finally {
      setLoadingSubmit(false);
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

          {/* 이메일 + 인증 */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  label="이메일"
                  type="email"
                  placeholder="hello@example.com"
                  icon={
                    verified && emailVerificationEnabled
                      ? <CheckCircle2 size={15} className="text-green-500" />
                      : <Mail size={15} />
                  }
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (emailVerificationEnabled) {
                      setVerified(false);
                      setStep('form');
                      setCode('');
                    }
                  }}
                  required
                  disabled={emailVerificationEnabled && verified}
                />
              </div>
              {emailVerificationEnabled && (
                <button
                  type="button"
                  onClick={verified ? undefined : handleSendCode}
                  disabled={loadingSend || verified}
                  className={`
                    shrink-0 h-[46px] px-3.5 rounded-xl text-sm font-semibold transition-all
                    flex items-center gap-1.5
                    ${verified
                      ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
                      : 'bg-brand text-white hover:bg-brand-hover active:scale-95'
                    }
                  `}
                >
                  {loadingSend ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : verified ? (
                    <><CheckCircle2 size={14} /> 인증완료</>
                  ) : step === 'verify' ? (
                    <><RefreshCw size={14} /> 재발송</>
                  ) : (
                    '코드 받기'
                  )}
                </button>
              )}
            </div>

            {/* 코드 입력 */}
            {emailVerificationEnabled && step === 'verify' && !verified && (
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    label="인증 코드"
                    placeholder="6자리 코드 입력"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={loadingVerify}
                  className="shrink-0 h-[46px] px-3.5 rounded-xl text-sm font-semibold bg-brand text-white hover:bg-brand-hover active:scale-95 transition-all"
                >
                  {loadingVerify ? <RefreshCw size={14} className="animate-spin" /> : '확인'}
                </button>
              </div>
            )}
          </div>

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
            loading={loadingSubmit}
            fullWidth
            className="mt-1 flex-row-reverse"
            icon={<ArrowRight size={18} />}
            disabled={!verified}
          >
            시작하기
          </Button>

          {emailVerificationEnabled && !verified && (
            <p className="text-xs text-center text-muted">이메일 인증 후 가입이 완료돼요</p>
          )}
        </form>
      </div>
    </div>
  );
}
