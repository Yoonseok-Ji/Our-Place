import { useState, useEffect } from 'react';
import { MapPin, Star, Image } from 'lucide-react';
import { visitsApi } from '../api/visits';
import type { PlaceWithVisits } from '../types';
import MainNav from '../components/layout/MainNav';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

function VisitCard({ place, visit }: { place: PlaceWithVisits; visit: PlaceWithVisits['visits'][0] }) {
  return (
    <div className="bg-surface rounded-3xl border border-border shadow-xs overflow-hidden">
      {visit.photos.length > 0 ? (
        <div className="overflow-x-auto flex gap-1 bg-bg no-scrollbar" style={{ height: 180 }}>
          {visit.photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.image_url}
              className="h-full object-cover shrink-0"
              style={{ width: visit.photos.length === 1 ? '100%' : 240 }}
              alt=""
            />
          ))}
        </div>
      ) : (
        <div className="h-[72px] bg-gradient-to-r from-brand-50 to-brand-100 flex items-center justify-center">
          <Image size={20} className="text-brand/30" />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted">
            {format(new Date(visit.visited_date), 'yyyy. M. d (eee)', { locale: ko })}
          </span>
          <span className="text-xs font-semibold text-brand bg-brand-50 px-2.5 py-1 rounded-full border border-brand/15">
            {visit.visit_number}번째 방문
          </span>
        </div>

        <h3 className="font-semibold text-ink">{place.name}</h3>
        {place.category && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-muted" />
            <p className="text-xs text-muted">{place.category}</p>
          </div>
        )}

        {visit.rating != null && (
          <div className="flex items-center gap-0.5 mt-2">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={13} className={s <= visit.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
            ))}
          </div>
        )}

        {visit.memo && (
          <p className="text-sm text-muted italic leading-relaxed mt-2 bg-bg rounded-xl px-3 py-2.5">
            "{visit.memo}"
          </p>
        )}

        {visit.mood_tags && visit.mood_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {visit.mood_tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-bg text-muted text-xs rounded-full border border-border">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TimelinePage() {
  const [timeline, setTimeline] = useState<PlaceWithVisits[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    visitsApi.getTimeline()
      .then(setTimeline)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const allVisits = timeline
    .flatMap((place) => place.visits.map((visit) => ({ place, visit })))
    .sort((a, b) => new Date(b.visit.visited_date).getTime() - new Date(a.visit.visited_date).getTime());

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-surface/90 backdrop-blur-xl border-b border-border/50 px-5 py-4">
        <h1 className="text-xl font-bold text-ink">우리의 기록</h1>
        <p className="text-xs text-muted mt-0.5">
          {allVisits.length > 0 ? `총 ${allVisits.length}번의 데이트` : '첫 방문을 기록해보세요'}
        </p>
      </div>

      <div className="px-4 py-5">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface rounded-3xl h-52 animate-pulse border border-border" />
            ))}
          </div>
        ) : allVisits.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 gap-5">
            <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center">
              <MapPin size={32} className="text-brand/50" />
            </div>
            <div className="text-center">
              <p className="text-ink font-semibold">아직 방문 기록이 없어요</p>
              <p className="text-sm text-muted mt-1.5">지도에서 장소를 방문하면<br />여기에 기록됩니다</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {allVisits.map(({ place, visit }) => (
              <VisitCard key={visit.id} place={place} visit={visit} />
            ))}
          </div>
        )}
      </div>

      <MainNav />
    </div>
  );
}
