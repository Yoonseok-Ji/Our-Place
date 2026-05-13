import { useState, useRef } from 'react';
import { Camera, Star, CalendarDays, MapPin, X } from 'lucide-react';

async function resizeImage(file: File, maxPx = 1200, quality = 0.82): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(maxPx / w, maxPx / h, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('canvas context unavailable'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('toBlob failed'));
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality,
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}
import toast from 'react-hot-toast';
import { visitsApi, type VisitCreate } from '../../api/visits';
import { placesApi, type PlaceSaveRequest } from '../../api/places';
import type { Place, KakaoSearchResult } from '../../types';
import Button from '../ui/Button';
import MoodTagSelector from './MoodTagSelector';
import { format } from 'date-fns';

interface VisitFormProps {
  place?: Place;
  searchResult?: KakaoSearchResult;
  onDone: (place: Place) => void;
  onCancel: () => void;
}

export default function VisitForm({ place, searchResult, onDone, onCancel }: VisitFormProps) {
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [memo, setMemo] = useState('');
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [visitedDate, setVisitedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [photos, setPhotos] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let targetPlace = place;
      if (!targetPlace && searchResult) {
        const req: PlaceSaveRequest = {
          kakao_place_id: searchResult.id,
          name: searchResult.place_name,
          category: searchResult.category_group_name || searchResult.category_name,
          address: searchResult.address_name,
          road_address: searchResult.road_address_name,
          lat: parseFloat(searchResult.y),
          lng: parseFloat(searchResult.x),
          phone: searchResult.phone,
          place_url: searchResult.place_url,
        };
        targetPlace = await placesApi.save(req);
      }
      if (!targetPlace) return;

      const visitData: VisitCreate = {
        visited_date: visitedDate,
        rating: rating || undefined,
        memo: memo || undefined,
        mood_tags: moodTags.length > 0 ? moodTags : undefined,
      };
      const visit = await visitsApi.logVisit(targetPlace.id, visitData);
      let photoErrors = 0;
      for (const file of photos) {
        try {
          const resized = await resizeImage(file).catch(() => file);
          await visitsApi.uploadPhoto(targetPlace.id, visit.id, resized);
        } catch {
          photoErrors++;
        }
      }
      const updatedPlace = await placesApi.get(targetPlace.id);
      if (photoErrors > 0) {
        toast.error(`사진 ${photoErrors}장 업로드에 실패했어요. 형식(JPG/PNG)을 확인해주세요.`);
      }
      toast.success('방문이 기록됐어요');
      onDone(updatedPlace);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || '오류가 발생했어요. 네트워크 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPhotos((prev) => [...prev, ...Array.from(e.target.files!)]);
    e.target.value = '';
  };

  const removePhoto = (i: number) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const placeName = place?.name || searchResult?.place_name || '';

  return (
    <div className="flex flex-col gap-5">
      {/* 장소명 */}
      <div className="flex items-center gap-3 pb-1">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
          <MapPin size={16} className="text-brand" />
        </div>
        <div>
          <p className="text-xs text-muted">방문 장소</p>
          <p className="font-semibold text-ink">{placeName}</p>
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
                size={24}
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
          placeholder={"비 오는 날 분위기 진짜 좋았음\n여기 또 가고 싶다"}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-ink text-sm placeholder:text-muted/50 outline-none focus:border-brand focus:ring-2 focus:ring-brand-50 transition-all resize-none"
        />
      </div>

      {/* 분위기 태그 */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">분위기</label>
        <MoodTagSelector selected={moodTags} onChange={setMoodTags} />
      </div>

      {/* 사진 */}
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-2">
          <Camera size={14} />
          사진
        </label>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted text-sm hover:border-brand/40 hover:text-brand transition-colors"
        >
          <Camera size={14} className="inline mr-1.5" />
          사진 추가 (자동 리사이즈)
        </button>
        {photos.length > 0 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {photos.map((f, i) => (
              <div key={i} className="relative flex-shrink-0">
                <img src={URL.createObjectURL(f)} className="w-20 h-20 object-cover rounded-xl border border-border" alt="" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white rounded-full flex items-center justify-center"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2.5 pt-1">
        <Button variant="secondary" onClick={onCancel} className="flex-1">취소</Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">기록하기</Button>
      </div>
    </div>
  );
}
