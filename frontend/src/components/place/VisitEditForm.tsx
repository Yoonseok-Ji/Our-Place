import { useState, useRef } from 'react';
import { mediaUrl } from '../../utils/mediaUrl';
import { Star, CalendarDays, MapPin, Camera, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { visitsApi } from '../../api/visits';
import type { Visit, Place, Photo } from '../../types';
import Button from '../ui/Button';
import MoodTagSelector from './MoodTagSelector';
import { format } from 'date-fns';

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
      if (!ctx) return reject(new Error('canvas unavailable'));
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

interface VisitEditFormProps {
  place: Place;
  visit: Visit;
  onDone: (updatedVisit: Visit) => void;
  onCancel: () => void;
}

export default function VisitEditForm({ place, visit, onDone, onCancel }: VisitEditFormProps) {
  const [loading, setLoading]           = useState(false);
  const [visitedDate, setVisitedDate]   = useState(format(new Date(visit.visited_date), 'yyyy-MM-dd'));
  const [rating, setRating]             = useState(visit.rating ?? 0);
  const [hoveredStar, setHoveredStar]   = useState(0);
  const [memo, setMemo]                 = useState(visit.memo ?? '');
  const [moodTags, setMoodTags]         = useState<string[]>(visit.mood_tags ?? []);

  /* 기존 사진 */
  const [existingPhotos, setExistingPhotos] = useState<Photo[]>(visit.photos);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<Set<string>>(new Set());

  /* 새로 추가할 사진 */
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewPhotos((prev) => [...prev, ...Array.from(e.target.files!)]);
      setPhotoError('');
    }
    e.target.value = '';
  };

  const removeExisting = (photoId: string) => {
    setDeletedPhotoIds((prev) => new Set([...prev, photoId]));
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const removeNew = (i: number) => setNewPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    setLoading(true);
    setPhotoError('');
    try {
      /* 1. 텍스트 필드 업데이트 */
      const updated = await visitsApi.updateVisit(place.id, visit.id, {
        visited_date: visitedDate,
        rating: rating || null,
        memo: memo.trim() || null,
        mood_tags: moodTags.length > 0 ? moodTags : [],
      });

      /* 2. 삭제 표시된 사진 제거 */
      let photoDeleteErrors = 0;
      for (const photoId of deletedPhotoIds) {
        try {
          await visitsApi.deletePhoto(place.id, visit.id, photoId);
        } catch {
          photoDeleteErrors++;
        }
      }

      /* 3. 새 사진 업로드 */
      const uploadedPhotos: Photo[] = [];
      let photoUploadErrors = 0;
      for (const file of newPhotos) {
        try {
          const resized = await resizeImage(file).catch(() => file);
          const photo = await visitsApi.uploadPhoto(place.id, visit.id, resized) as Photo;
          uploadedPhotos.push(photo);
        } catch {
          photoUploadErrors++;
        }
      }

      if (photoUploadErrors > 0) {
        setPhotoError(`사진 ${photoUploadErrors}장 업로드에 실패했어요. 파일 형식이나 크기를 확인해주세요.`);
      }
      if (photoDeleteErrors > 0) {
        toast.error(`사진 ${photoDeleteErrors}장 삭제에 실패했어요`);
      }

      /* 4. 최종 Visit 객체 구성 */
      const finalPhotos: Photo[] = [
        ...existingPhotos.filter((p) => !deletedPhotoIds.has(p.id)),
        ...uploadedPhotos,
      ];

      toast.success('기록이 수정됐어요');
      onDone({ ...updated, photos: finalPhotos });
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
          {rating > 0 && <span className="text-amber-400 font-semibold ml-1">{rating}점</span>}
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

      {/* 사진 관리 */}
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-2">
          <Camera size={14} />
          사진
        </label>

        {/* 기존 사진 */}
        {existingPhotos.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-muted mb-1.5">현재 사진</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {existingPhotos.map((p) => (
                <div key={p.id} className="relative flex-shrink-0">
                  <img
                    src={mediaUrl(p.image_url)}
                    className="w-20 h-20 object-cover rounded-xl border border-border"
                    alt=""
                  />
                  <button
                    type="button"
                    onClick={() => removeExisting(p.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 새 사진 미리보기 */}
        {newPhotos.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-muted mb-1.5">추가할 사진</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {newPhotos.map((f, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <img
                    src={URL.createObjectURL(f)}
                    className="w-20 h-20 object-cover rounded-xl border border-border"
                    alt=""
                  />
                  <button
                    type="button"
                    onClick={() => removeNew(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white rounded-full flex items-center justify-center shadow"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full py-2.5 border-2 border-dashed border-border rounded-xl text-muted text-sm hover:border-brand/40 hover:text-brand transition-colors"
        >
          <Camera size={14} className="inline mr-1.5" />
          사진 추가
        </button>

        {/* 에러 메세지 */}
        {photoError && (
          <div className="flex items-start gap-2 mt-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <span>{photoError}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2.5 pt-1">
        <Button variant="secondary" onClick={onCancel} className="flex-1">취소</Button>
        <Button onClick={handleSubmit} loading={loading} className="flex-1">저장하기</Button>
      </div>
    </div>
  );
}
