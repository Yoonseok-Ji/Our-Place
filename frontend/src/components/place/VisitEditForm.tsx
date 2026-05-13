import { useState } from 'react';
import { Star, CalendarDays, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { visitsApi } from '../../api/visits';
import type { Visit, Place } from '../../types';
import Button from '../ui/Button';
import MoodTagSelector from './MoodTagSelector';
import { format } from 'date-fns';

interface VisitEditFormProps {
  place: Place;
  visit: Visit;
  onDone: (updatedVisit: Visit) => void;
  onCancel: () => void;
}

export default function VisitEditForm({ place, visit, onDone, onCancel }: VisitEditFormProps) {
  const [loading, setLoading]       = useState(false);
  const [visitedDate, setVisitedDate] = useState(format(new Date(visit.visited_date), 'yyyy-MM-dd'));
  const [rating, setRating]         = useState(visit.rating ?? 0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [memo, setMemo]             = useState(visit.memo ?? '');
  const [moodTags, setMoodTags]     = useState<string[]>(visit.mood_tags ?? []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const updated = await visitsApi.updateVisit(place.id, visit.id, {
        visited_date: visitedDate,
        rating: rating || null,
        memo: memo.trim() || null,
        mood_tags: moodTags.length > 0 ? moodTags : [],
      });
      toast.success('기록이 수정됐어요');
      onDone(updated);
    } catch {
      toast.error('수정에 실패했어요');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 장소명 */}
      <div className="flex items-center gap-3 pb-1 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
          <MapPin size={16} className="text-brand" />
        </div>
        <div>
          <p className="text-[11px] text-muted">{visit.visit_number}번째 방문</p>
          <p className="font-bold text-ink">{place.name}</p>
        </div>
      </div>

      {/* 날짜 */}
      <div>
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
          <CalendarDays size={14} />
          방문 날짜
        </label>
        <input
          type="date"
          value={visitedDate}
          max={format(new Date(), 'yyyy-MM-dd')}
          onChange={(e) => setVisitedDate(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-50 transition-all text-sm"
        />
      </div>

      {/* 별점 */}
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-2">
          <Star size={14} />
          별점
          {rating > 0 && <span className="text-amber-400 font-semibold">{rating}점</span>}
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s === rating ? 0 : s)}
              onMouseEnter={() => setHoveredStar(s)}
              onMouseLeave={() => setHoveredStar(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                size={26}
                className={`transition-colors ${
                  s <= (hoveredStar || rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-border fill-border'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 메모 */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">그날의 기억</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="이 날의 기억을 남겨보세요"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-ink text-sm placeholder:text-muted/50 outline-none focus:border-brand focus:ring-2 focus:ring-brand-50 transition-all resize-none"
        />
      </div>

      {/* 분위기 태그 */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">분위기</label>
        <MoodTagSelector selected={moodTags} onChange={setMoodTags} />
      </div>

      <div className="flex gap-2.5 pt-1">
        <Button variant="secondary" onClick={onCancel} className="flex-1">취소</Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">저장하기</Button>
      </div>
    </div>
  );
}
