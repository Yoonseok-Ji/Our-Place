import { useState, useEffect } from 'react';
import { X, MapPin, Star, Plus, Bookmark, BookmarkX, ExternalLink } from 'lucide-react';
import type { Place, PlaceWithVisits } from '../../types';
import { visitsApi } from '../../api/visits';
import { placesApi } from '../../api/places';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import VisitForm from './VisitForm';
import toast from 'react-hot-toast';

interface PlaceDetailPanelProps {
  place: Place;
  onClose: () => void;
  onPlaceUpdated: (place: Place) => void;
  onPlaceDeleted: (placeId: string) => void;
}

export default function PlaceDetailPanel({ place, onClose, onPlaceUpdated, onPlaceDeleted }: PlaceDetailPanelProps) {
  const { user, couple } = useAuthStore();
  const isMale = user?.gender === 'male';

  const partnerName = couple
    ? (couple.user1?.id === user?.id ? couple.user2?.name : couple.user1?.name) ?? '파트너'
    : '파트너';

  const iMySaved     = isMale ? place.saved_by_male : place.saved_by_female;
  const isPartnerSaved = isMale ? place.saved_by_female : place.saved_by_male;

  const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    MALE_ONLY: isMale
      ? { label: '내 위시리스트',           cls: 'bg-blue-50 text-blue-male border-blue-male/20' }
      : { label: `${partnerName} 위시리스트`, cls: 'bg-blue-50 text-blue-male border-blue-male/20' },
    FEMALE_ONLY: !isMale
      ? { label: '내 위시리스트',           cls: 'bg-pink-50 text-rose-pin border-rose-pin/20' }
      : { label: `${partnerName} 위시리스트`, cls: 'bg-pink-50 text-rose-pin border-rose-pin/20' },
    BOTH:    { label: '함께 가고 싶어요', cls: 'bg-brand-50 text-brand border-brand/20'  },
    VISITED: { label: '방문 완료',        cls: 'bg-heart-light text-heart border-heart/20' },
  };

  const kakaoUrl = place.place_url || (place.kakao_place_id ? `https://place.map.kakao.com/${place.kakao_place_id}` : null);

  const [detail, setDetail]               = useState<PlaceWithVisits | null>(null);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [loadingUnsave, setLoadingUnsave] = useState(false);
  const [loadingAdd, setLoadingAdd]       = useState(false);
  const badge = STATUS_BADGE[place.status];

  useEffect(() => {
    if (place.visit_count > 0) {
      visitsApi.getPlaceVisits(place.id).then(setDetail).catch(() => null);
    } else {
      setDetail(null);
    }
  }, [place.id, place.visit_count]);

  const handleUnsaveWishlist = async () => {
    if (!confirm(`내 위시리스트에서 "${place.name}"을 제거할까요?`)) return;
    setLoadingUnsave(true);
    try {
      await placesApi.unsaveWishlist(place.id);
      const newMale   = isMale ? false : place.saved_by_male;
      const newFemale = !isMale ? false : place.saved_by_female;
      if (!newMale && !newFemale && place.visit_count === 0) {
        toast.success('위시리스트에서 제거됐어요');
        onPlaceDeleted(place.id);
      } else {
        const newStatus = newMale && newFemale ? 'BOTH'
          : newMale ? 'MALE_ONLY'
          : newFemale ? 'FEMALE_ONLY'
          : 'VISITED';
        onPlaceUpdated({ ...place, saved_by_male: newMale, saved_by_female: newFemale, status: newStatus });
        toast.success('내 위시리스트에서 제거됐어요');
      }
    } catch {
      toast.error('제거에 실패했어요');
    } finally {
      setLoadingUnsave(false);
    }
  };

  const handleAddMyWishlist = async () => {
    setLoadingAdd(true);
    try {
      const updated = await placesApi.addToWishlist(place.id);
      onPlaceUpdated(updated);
      toast.success('내 위시리스트에 추가됐어요');
    } catch {
      toast.error('추가에 실패했어요');
    } finally {
      setLoadingAdd(false);
    }
  };

  return (
    <>
      <div className="absolute bottom-[72px] left-2 right-2 z-40 animate-slide-up">
        <div className="bg-surface rounded-3xl shadow-xl border border-border overflow-hidden max-h-[65vh] flex flex-col">

          {/* 헤더 */}
          <div className="p-5 pb-4 border-b border-border/50 shrink-0">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
                <h2 className="font-semibold text-ink text-lg leading-tight truncate">{place.name}</h2>
                {place.category && <p className="text-xs text-muted mt-0.5">{place.category}</p>}
                {(place.road_address || place.address) && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <MapPin size={11} className="text-muted shrink-0" />
                    <p className="text-xs text-muted truncate">{place.road_address || place.address}</p>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-muted hover:bg-gray-100 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {place.visit_count > 0 && (
              <div className="mt-3 bg-brand-50 rounded-2xl px-4 py-2.5 border border-brand/10">
                <p className="text-sm font-semibold text-brand text-center">
                  함께 {place.visit_count}번 방문한 곳
                </p>
              </div>
            )}
          </div>

          {/* 카카오맵 링크 */}
          {kakaoUrl && (
            <div className="px-5 py-3 border-b border-border/50 shrink-0">
              <a
                href={kakaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#FEE500] rounded-2xl text-[#191919] text-xs font-bold hover:bg-yellow-300 transition-colors"
              >
                <ExternalLink size={13} />
                카카오맵에서 사진·메뉴 보기
              </a>
            </div>
          )}

          {/* 방문 기록 목록 */}
          {detail && detail.visits.length > 0 && (
            <div className="overflow-y-auto flex-1">
              <div className="px-5 pt-4 pb-2 flex flex-col gap-3">
                {detail.visits
                  .slice()
                  .sort((a, b) => new Date(b.visited_date).getTime() - new Date(a.visited_date).getTime())
                  .map((visit) => (
                  <div key={visit.id} className="bg-bg rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-ink">
                        {format(new Date(visit.visited_date), 'yyyy. M. d (eee)', { locale: ko })}
                      </span>
                      <span className="text-xs text-muted bg-surface px-2.5 py-1 rounded-full border border-border">
                        {visit.visit_number}번째
                      </span>
                    </div>
                    {visit.rating != null && (
                      <div className="flex items-center gap-0.5 mb-1.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={12} className={s <= visit.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                        ))}
                      </div>
                    )}
                    {visit.memo && (
                      <p className="text-sm text-muted italic leading-relaxed">"{visit.memo}"</p>
                    )}
                    {visit.mood_tags && visit.mood_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {visit.mood_tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 bg-surface text-xs text-muted rounded-full border border-border">{t}</span>
                        ))}
                      </div>
                    )}
                    {visit.photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                        {visit.photos.map((ph) => (
                          <img key={ph.id} src={ph.image_url} className="w-full aspect-square object-cover rounded-xl border border-border" alt="" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 액션 버튼 영역 */}
          <div className="p-4 pt-3 border-t border-border/50 shrink-0">
            <div className="flex gap-2.5">
              {/* 방문 기록 버튼 (항상 표시) */}
              <Button
                onClick={() => setShowVisitForm(true)}
                className="flex-1"
                icon={<Plus size={15} />}
              >
                {place.visit_count > 0 ? '또 방문했어요' : '방문 기록'}
              </Button>

              {/* 내 위시 취소 (내가 저장한 경우만) */}
              {iMySaved && place.status !== 'VISITED' && (
                <Button
                  variant="ghost"
                  onClick={handleUnsaveWishlist}
                  loading={loadingUnsave}
                  className="px-3 !text-muted hover:!text-red-400 hover:!bg-red-50"
                  icon={<BookmarkX size={15} />}
                  title="내 위시 취소"
                />
              )}
            </div>

            {/* 나도 위시에 추가 (파트너가 저장, 나는 미저장인 경우) */}
            {!iMySaved && isPartnerSaved && place.status !== 'VISITED' && (
              <Button
                variant="secondary"
                onClick={handleAddMyWishlist}
                loading={loadingAdd}
                fullWidth
                className="mt-2"
                icon={<Bookmark size={15} />}
              >
                나도 위시에 추가
              </Button>
            )}
          </div>
        </div>
      </div>

      <Modal open={showVisitForm} onClose={() => setShowVisitForm(false)} title="방문 기록">
        <VisitForm
          place={place}
          onDone={(updated) => { setShowVisitForm(false); onPlaceUpdated(updated); }}
          onCancel={() => setShowVisitForm(false)}
        />
      </Modal>
    </>
  );
}
