import { useState, useEffect } from 'react';
import { X, Trash2, MapPin, Star, Plus } from 'lucide-react';
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
  const { user } = useAuthStore();
  const isMale = user?.gender === 'male';

  const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    MALE_ONLY:   isMale
      ? { label: '내 위시리스트',    cls: 'bg-blue-50 text-blue-male border-blue-male/20' }
      : { label: '파트너 위시리스트', cls: 'bg-blue-50 text-blue-male border-blue-male/20' },
    FEMALE_ONLY: !isMale
      ? { label: '내 위시리스트',    cls: 'bg-pink-50 text-rose-pin border-rose-pin/20' }
      : { label: '파트너 위시리스트', cls: 'bg-pink-50 text-rose-pin border-rose-pin/20' },
    BOTH:    { label: '함께 가고 싶어요', cls: 'bg-brand-50 text-brand border-brand/20'  },
    VISITED: { label: '방문 완료',        cls: 'bg-heart-light text-heart border-heart/20' },
  };

  const [detail, setDetail]               = useState<PlaceWithVisits | null>(null);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const badge = STATUS_BADGE[place.status];

  useEffect(() => {
    if (place.visit_count > 0) {
      visitsApi.getPlaceVisits(place.id).then(setDetail).catch(() => null);
    } else {
      setDetail(null);
    }
  }, [place.id, place.visit_count]);

  const handleDelete = async () => {
    if (!confirm(`"${place.name}"을 삭제할까요?`)) return;
    setLoadingDelete(true);
    try {
      await placesApi.delete(place.id);
      toast.success('삭제됐어요');
      onPlaceDeleted(place.id);
    } catch {
      toast.error('삭제에 실패했어요');
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <>
      <div className="absolute bottom-[72px] left-2 right-2 z-40 animate-slide-up">
        <div className="bg-surface rounded-3xl shadow-xl border border-border overflow-hidden max-h-[60vh] flex flex-col">

          {/* 헤더 */}
          <div className="p-5 pb-4 border-b border-border/50">
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

          {/* 액션 */}
          <div className="p-4 pt-3 flex gap-2.5 border-t border-border/50">
            <Button
              onClick={() => setShowVisitForm(true)}
              className="flex-1"
              icon={<Plus size={15} />}
            >
              {place.visit_count > 0 ? '또 방문했어요' : '방문 기록'}
            </Button>
            <Button
              variant="ghost"
              onClick={handleDelete}
              loading={loadingDelete}
              className="px-3 !text-red-400 hover:!text-red-600 hover:!bg-red-50"
              icon={<Trash2 size={15} />}
            />
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
