import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Link2, LogOut } from 'lucide-react';
import { couplesApi } from '../api/couples';
import { useAuthStore } from '../store/authStore';
import type { Couple } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

export default function ConnectCouplePage() {
  const navigate = useNavigate();
  const { user, couple, coupleResolved, setCouple, logout } = useAuthStore();
  const [tab, setTab]                   = useState<'invite' | 'accept'>('invite');
  const [inviteCouple, setInviteCouple] = useState<Couple | null>(null);
  const [code, setCode]                 = useState('');
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [loadingAccept, setLoadingAccept] = useState(false);
  const [copied, setCopied]             = useState(false);

  useEffect(() => {
    if (couple?.status === 'active') navigate('/', { replace: true });
  }, [couple, navigate]);

  useEffect(() => {
    if (!coupleResolved) return;
    couplesApi.getMyCouple()
      .then((c) => {
        if (c.status === 'active') {
          setCouple(c);
          navigate('/', { replace: true });
        } else if (c.status === 'pending' && c.user1.id === user?.id) {
          setInviteCouple(c);
        }
      })
      .catch(() => null);
  }, [coupleResolved]);

  const handleCreateInvite = async () => {
    setLoadingInvite(true);
    try {
      const c = await couplesApi.createInvite();
      setInviteCouple(c);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || '오류가 발생했어요');
    } finally {
      setLoadingInvite(false);
    }
  };

  const handleCopy = () => {
    if (!inviteCouple?.invite_token) return;
    navigator.clipboard.writeText(inviteCouple.invite_token);
    setCopied(true);
    toast.success('복사됐어요!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAccept = async () => {
    if (!code.trim()) return toast.error('초대 코드를 입력해주세요');
    setLoadingAccept(true);
    try {
      const c = await couplesApi.acceptInvite(code.trim());
      setCouple(c);
      toast.success('연결됐어요! 함께 지도를 만들어요');
      navigate('/', { replace: true });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || '유효하지 않은 코드예요');
    } finally {
      setLoadingAccept(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="w-14 h-14 rounded-3xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <Link2 size={24} className="text-brand" />
          </div>
          <h1 className="text-2xl font-bold text-ink">파트너 연결</h1>
          <p className="text-sm text-muted mt-2">초대 코드로 서로를 연결하세요</p>
        </div>

        {/* 탭 */}
        <div className="flex bg-brand-50 rounded-2xl p-1 mb-6 gap-1">
          {(['invite', 'accept'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                tab === t
                  ? 'bg-surface text-ink shadow-xs'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {t === 'invite' ? '코드 생성' : '코드 입력'}
            </button>
          ))}
        </div>

        {tab === 'invite' ? (
          <div className="flex flex-col gap-3">
            {inviteCouple?.invite_token ? (
              <>
                <div className="bg-surface rounded-2xl p-5 border border-border">
                  <p className="text-xs text-muted mb-3 font-medium tracking-wider uppercase">초대 코드</p>
                  <p className="font-mono text-xl font-bold text-ink tracking-widest break-all leading-relaxed">
                    {inviteCouple.invite_token}
                  </p>
                  <p className="text-xs text-muted mt-3">24시간 유효 · 파트너에게 공유하세요</p>
                </div>
                <Button
                  onClick={handleCopy}
                  variant="secondary"
                  fullWidth
                  icon={copied ? <Check size={15} /> : <Copy size={15} />}
                >
                  {copied ? '복사됐어요' : '코드 복사하기'}
                </Button>
                <button
                  onClick={handleCreateInvite}
                  disabled={loadingInvite}
                  className="text-xs text-muted hover:text-ink text-center py-2 transition-colors"
                >
                  코드 재발급
                </button>
              </>
            ) : (
              <>
                <div className="bg-brand-50 rounded-2xl p-5 text-center">
                  <p className="text-sm text-muted leading-relaxed">
                    초대 코드를 생성하고<br />파트너에게 공유하면 연결돼요
                  </p>
                </div>
                <Button onClick={handleCreateInvite} size="lg" loading={loadingInvite} fullWidth>
                  초대 코드 생성
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Input
              label="초대 코드"
              placeholder="파트너의 초대 코드를 입력하세요"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button onClick={handleAccept} size="lg" loading={loadingAccept} fullWidth>
              연결하기
            </Button>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full mt-10 text-sm text-muted hover:text-ink transition-colors py-2"
        >
          <LogOut size={14} />
          로그아웃
        </button>
      </div>
    </div>
  );
}
