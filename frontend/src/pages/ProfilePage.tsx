import { useState, useEffect } from 'react';
import { MapPin, Heart, Navigation, Bookmark, LogOut, Edit3, Check, X } from 'lucide-react';
import { couplesApi } from '../api/couples';
import { placesApi } from '../api/places';
import { useAuthStore } from '../store/authStore';
import type { Place } from '../types';
import MainNav from '../components/layout/MainNav';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

function Avatar({ name, gender }: { name?: string; gender?: string }) {
  const initials = name ? name.slice(0, 1) : '?';
  const isMale = gender === 'male';
  return (
    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2 ${
      isMale ? 'border-blue-male bg-blue-50 text-blue-male' : 'border-rose-pin bg-pink-50 text-rose-pin'
    }`}>
      {initials}
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="bg-surface rounded-2xl p-4 border border-border shadow-xs text-center">
      <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-2.5">
        {icon}
      </div>
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs text-muted mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { user, couple, setCouple, logout } = useAuthStore();
  const [places, setPlaces]       = useState<Place[]>([]);
  const [anniversary, setAnniversary] = useState('');
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    placesApi.list().then(setPlaces).catch(() => null);
    if (!couple) {
      couplesApi.getMyCouple().then(setCouple).catch(() => null);
    } else {
      setAnniversary(couple.anniversary || '');
    }
  }, []);

  useEffect(() => {
    if (couple?.anniversary) setAnniversary(couple.anniversary);
  }, [couple?.anniversary]);

  const partner  = couple?.user1.id === user?.id ? couple?.user2 : couple?.user1;
  const isMale   = user?.gender === 'male';

  const stats = {
    total:       places.length,
    visited:     places.filter((p) => p.visit_count > 0).length,
    both:        places.filter((p) => p.status === 'BOTH' || p.status === 'VISITED').length,
    totalVisits: places.reduce((s, p) => s + p.visit_count, 0),
  };

  const dDay = couple?.anniversary
    ? differenceInDays(new Date(), new Date(couple.anniversary)) + 1
    : null;

  const handleSaveAnniversary = async () => {
    if (!anniversary) return;
    setSaving(true);
    try {
      const updated = await couplesApi.updateAnniversary(anniversary);
      setCouple(updated);
      setEditing(false);
      toast.success('기념일이 저장됐어요');
    } catch {
      toast.error('저장에 실패했어요');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* 커플 카드 */}
      <div className="bg-surface border-b border-border px-5 pt-12 pb-8">
        {/* 프로필 아바타 */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="flex flex-col items-center gap-1">
            <Avatar name={user?.name} gender={user?.gender} />
            <p className="text-xs font-semibold text-ink mt-1">{user?.name}</p>
            <p className="text-[10px] text-muted">나</p>
          </div>

          <Heart size={20} className="text-heart fill-heart animate-float" />

          {partner ? (
            <div className="flex flex-col items-center gap-1">
              <Avatar name={partner.name} gender={partner.gender} />
              <p className="text-xs font-semibold text-ink mt-1">{partner.name}</p>
              <p className="text-[10px] text-muted">파트너</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center text-muted">
                <span className="text-2xl">?</span>
              </div>
              <p className="text-xs text-muted mt-1">연결 대기중</p>
            </div>
          )}
        </div>

        {/* D-Day */}
        {dDay !== null ? (
          <div className="text-center">
            <p className="text-5xl font-bold text-ink tracking-tight">D+{dDay.toLocaleString()}</p>
            <p className="text-sm text-muted mt-2">
              {couple?.anniversary && format(new Date(couple.anniversary), 'yyyy년 M월 d일 시작', { locale: ko })}
            </p>
          </div>
        ) : (
          <p className="text-center text-sm text-muted">기념일을 설정해보세요</p>
        )}

        {/* 기념일 편집 */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {editing ? (
            <>
              <input
                type="date"
                value={anniversary}
                max={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setAnniversary(e.target.value)}
                className="text-sm border border-border rounded-xl px-3 py-2 bg-surface text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-50"
              />
              <button
                onClick={handleSaveAnniversary}
                disabled={saving}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-brand text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => setEditing(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-border text-muted hover:text-ink transition-colors"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-brand transition-colors py-1.5 px-3 rounded-full hover:bg-brand-50"
            >
              <Edit3 size={12} />
              {couple?.anniversary ? '기념일 수정' : '기념일 설정'}
            </button>
          )}
        </div>
      </div>

      {/* 통계 */}
      <div className="px-4 pt-6 pb-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider px-1 mb-3">우리의 지도</p>
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard icon={<MapPin size={16} className="text-brand" />}     value={stats.total}       label="저장한 장소" />
          <StatCard icon={<Navigation size={16} className="text-heart" />} value={stats.visited}     label="함께 방문한 곳" />
          <StatCard icon={<Heart size={16} className="text-heart" />}      value={stats.totalVisits} label="총 방문 횟수" />
          <StatCard icon={<Bookmark size={16} className="text-brand" />}   value={stats.both}        label="둘 다 가고 싶은 곳" />
        </div>
      </div>

      {/* 위시리스트 현황 */}
      <div className="px-4 pb-4">
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-xs">
          <p className="text-xs font-semibold text-muted mb-3">위시리스트</p>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-male" />
              <span className="text-sm text-ink-2">
                {isMale ? '내' : '파트너'} 위시 {places.filter(p => p.saved_by_male && !p.visit_count).length}곳
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-female" />
              <span className="text-sm text-ink-2">
                {!isMale ? '내' : '파트너'} 위시 {places.filter(p => p.saved_by_female && !p.visit_count).length}곳
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 로그아웃 */}
      <div className="px-4">
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-3.5 text-sm text-muted hover:text-ink border border-border rounded-2xl hover:border-gray-300 transition-all"
        >
          <LogOut size={15} />
          로그아웃
        </button>
      </div>

      <MainNav />
    </div>
  );
}
