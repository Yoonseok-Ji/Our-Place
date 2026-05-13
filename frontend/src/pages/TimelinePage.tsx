import { useState, useEffect } from 'react';
import { MapPin, Star, Image, Pencil, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { visitsApi } from '../api/visits';
import type { PlaceWithVisits, Visit, Photo } from '../types';
import MainNav from '../components/layout/MainNav';
import Modal from '../components/ui/Modal';
import VisitEditForm from '../components/place/VisitEditForm';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import toast from 'react-hot-toast';

/* ── 사진 그리드 ─────────────────────────────────────── */
function PhotoGrid({ photos, onView }: { photos: Photo[]; onView: (i: number) => void }) {
  if (photos.length === 0) return null;

  if (photos.length === 1) {
    return (
      <div
        className="aspect-[4/3] overflow-hidden cursor-pointer"
        onClick={() => onView(0)}
      >
        <img src={photos[0].image_url} className="w-full h-full object-cover" alt="" />
      </div>
    );
  }

  if (photos.length === 2) {
    return (
      <div className="flex gap-0.5 h-52">
        {photos.map((p, i) => (
          <div key={p.id} className="flex-1 overflow-hidden cursor-pointer" onClick={() => onView(i)}>
            <img src={p.image_url} className="w-full h-full object-cover" alt="" />
          </div>
        ))}
      </div>
    );
  }

  /* 3장 이상: 왼쪽 큰 사진 + 오른쪽 2장 세로 */
  return (
    <div className="flex gap-0.5 h-56">
      <div className="flex-[2] overflow-hidden cursor-pointer" onClick={() => onView(0)}>
        <img src={photos[0].image_url} className="w-full h-full object-cover" alt="" />
      </div>
      <div className="flex-1 flex flex-col gap-0.5">
        {photos.slice(1, 3).map((p, i) => (
          <div
            key={p.id}
            className="flex-1 overflow-hidden cursor-pointer relative"
            onClick={() => onView(i + 1)}
          >
            <img src={p.image_url} className="w-full h-full object-cover" alt="" />
            {i === 1 && photos.length > 3 && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">+{photos.length - 3}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 사진 라이트박스 ─────────────────────────────────── */
function PhotoLightbox({
  photos, startIndex, onClose,
}: { photos: Photo[]; startIndex: number; onClose: () => void }) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  setCurrent((c) => Math.max(0, c - 1));
      if (e.key === 'ArrowRight') setCurrent((c) => Math.min(photos.length - 1, c + 1));
      if (e.key === 'Escape')     onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, photos.length]);

  return (
    <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col" onClick={onClose}>
      {/* 상단 카운터 + 닫기 */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white/60 text-sm font-medium">
          {current + 1} / {photos.length}
        </span>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10"
        >
          <X size={20} />
        </button>
      </div>

      {/* 사진 */}
      <div
        className="flex-1 flex items-center justify-center px-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photos[current].image_url}
          className="max-w-full max-h-full object-contain rounded-2xl"
          alt=""
        />
      </div>

      {/* 이전/다음 컨트롤 */}
      {photos.length > 1 && (
        <div
          className="flex items-center justify-center gap-6 py-6 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="w-10 h-10 flex items-center justify-center rounded-full text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-2">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? 'bg-white w-5' : 'bg-white/30 w-1.5'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrent((c) => Math.min(photos.length - 1, c + 1))}
            disabled={current === photos.length - 1}
            className="w-10 h-10 flex items-center justify-center rounded-full text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── 방문 카드 ────────────────────────────────────────── */
interface VisitCardProps {
  place: PlaceWithVisits;
  visit: Visit;
  onEdit: () => void;
  onDelete: () => void;
}

function VisitCard({ place, visit, onEdit, onDelete }: VisitCardProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <article className="bg-surface rounded-3xl border border-border shadow-xs overflow-hidden">

        {/* 사진 그리드 */}
        {visit.photos.length > 0 ? (
          <PhotoGrid photos={visit.photos} onView={setLightboxIndex} />
        ) : (
          <div className="h-12 bg-gradient-to-r from-brand-50 to-blue-50 flex items-center px-4 gap-2">
            <Image size={14} className="text-brand/20" />
            <span className="text-[11px] text-brand/30 font-medium">사진 없음</span>
          </div>
        )}

        <div className="px-4 pt-3.5 pb-4">
          {/* 헤더: 날짜 + 장소명 + 수정·삭제 */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted">
                  {format(new Date(visit.visited_date), 'yyyy. M. d (eee)', { locale: ko })}
                </span>
                <span className="text-[10px] font-semibold text-brand bg-brand-50 px-2 py-0.5 rounded-full border border-brand/15">
                  {visit.visit_number}번째
                </span>
              </div>
              <h3 className="font-bold text-ink text-[15px] leading-snug truncate">{place.name}</h3>
              {place.category && (
                <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                  <MapPin size={10} className="shrink-0" />
                  <span className="truncate">{place.category}</span>
                </p>
              )}
            </div>
            <div className="flex gap-1 shrink-0 mt-0.5">
              <button
                onClick={onEdit}
                className="w-7 h-7 flex items-center justify-center rounded-xl text-muted hover:bg-brand-50 hover:text-brand transition-colors"
                title="수정"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={onDelete}
                className="w-7 h-7 flex items-center justify-center rounded-xl text-muted hover:bg-red-50 hover:text-red-400 transition-colors"
                title="삭제"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* 별점 */}
          {visit.rating != null && visit.rating > 0 && (
            <div className="flex items-center gap-0.5 mb-2.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className={s <= visit.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
                />
              ))}
            </div>
          )}

          {/* 메모 */}
          {visit.memo && (
            <div className="bg-bg rounded-2xl px-3.5 py-2.5 mb-2.5 border-l-[3px] border-brand/20">
              <p className="text-sm text-ink/80 leading-relaxed">{visit.memo}</p>
            </div>
          )}

          {/* 분위기 태그 */}
          {visit.mood_tags && visit.mood_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {visit.mood_tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-bg text-muted text-xs rounded-full border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* 라이트박스 */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={visit.photos}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

/* ── 메인 페이지 ──────────────────────────────────────── */
export default function TimelinePage() {
  const [timeline, setTimeline]     = useState<PlaceWithVisits[]>([]);
  const [loading, setLoading]       = useState(true);
  const [editingVisit, setEditingVisit] = useState<{ place: PlaceWithVisits; visit: Visit } | null>(null);

  useEffect(() => {
    visitsApi.getTimeline()
      .then(setTimeline)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const allVisits = timeline
    .flatMap((place) => place.visits.map((visit) => ({ place, visit })))
    .sort((a, b) => new Date(b.visit.visited_date).getTime() - new Date(a.visit.visited_date).getTime());

  /* 월별 그룹 */
  const grouped = allVisits.reduce<Record<string, typeof allVisits>>((acc, item) => {
    const month = format(new Date(item.visit.visited_date), 'yyyy년 M월', { locale: ko });
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {});

  const handleDelete = async (place: PlaceWithVisits, visit: Visit) => {
    if (!confirm(`"${place.name}" 방문 기록을 삭제할까요?`)) return;
    try {
      await visitsApi.deleteVisit(place.id, visit.id);
      setTimeline((prev) => {
        const updated = prev.map((p) => {
          if (p.id !== place.id) return p;
          const newVisits = p.visits.filter((v) => v.id !== visit.id);
          return { ...p, visits: newVisits, visit_count: newVisits.length };
        });
        return updated.filter((p) => p.visits.length > 0);
      });
      toast.success('삭제됐어요');
    } catch {
      toast.error('삭제에 실패했어요');
    }
  };

  const handleEditDone = (updatedVisit: Visit) => {
    setTimeline((prev) =>
      prev.map((place) => ({
        ...place,
        visits: place.visits.map((v) => v.id === updatedVisit.id ? updatedVisit : v),
      }))
    );
    setEditingVisit(null);
  };

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-surface/90 backdrop-blur-xl border-b border-border/50 px-5 py-4">
        <h1 className="text-xl font-bold text-ink">우리의 기록</h1>
        <p className="text-xs text-muted mt-0.5">
          {allVisits.length > 0
            ? `${allVisits.length}번의 데이트 기록`
            : '첫 방문을 기록해보세요'}
        </p>
      </div>

      <div className="px-4 py-5">
        {loading ? (
          /* 스켈레톤 */
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface rounded-3xl overflow-hidden border border-border">
                <div className="h-44 bg-gray-100 animate-pulse" />
                <div className="p-4 flex flex-col gap-2">
                  <div className="h-3 bg-gray-100 rounded-full w-24 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-full w-40 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded-full w-32 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : allVisits.length === 0 ? (
          /* 빈 상태 */
          <div className="flex flex-col items-center justify-center pt-24 gap-5">
            <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center">
              <MapPin size={32} className="text-brand/40" />
            </div>
            <div className="text-center">
              <p className="text-ink font-bold">아직 방문 기록이 없어요</p>
              <p className="text-sm text-muted mt-1.5 leading-relaxed">
                지도에서 장소를 찾아<br />방문 기록을 남겨보세요
              </p>
            </div>
          </div>
        ) : (
          /* 월별 피드 */
          <div className="flex flex-col gap-8">
            {Object.entries(grouped).map(([month, items]) => (
              <div key={month}>
                {/* 월 구분선 */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-bold text-ink whitespace-nowrap">{month}</span>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted whitespace-nowrap">{items.length}번</span>
                </div>

                <div className="flex flex-col gap-4">
                  {items.map(({ place, visit }) => (
                    <VisitCard
                      key={visit.id}
                      place={place}
                      visit={visit}
                      onEdit={() => setEditingVisit({ place, visit })}
                      onDelete={() => handleDelete(place, visit)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MainNav />

      {/* 수정 모달 */}
      <Modal
        open={!!editingVisit}
        onClose={() => setEditingVisit(null)}
        title="기록 수정"
      >
        {editingVisit && (
          <VisitEditForm
            place={editingVisit.place}
            visit={editingVisit.visit}
            onDone={handleEditDone}
            onCancel={() => setEditingVisit(null)}
          />
        )}
      </Modal>
    </div>
  );
}
