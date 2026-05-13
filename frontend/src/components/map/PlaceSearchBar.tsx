import { useState, useRef } from 'react';
import { Search, X, MapPin, Bookmark } from 'lucide-react';
import type { KakaoSearchResult } from '../../types';
import { useKakaoSearch } from '../../hooks/useKakaoSearch';

interface PlaceSearchBarProps {
  onSelect: (result: KakaoSearchResult) => void;
  onSaveWishlist?: (result: KakaoSearchResult) => void;
  onVisit?: (result: KakaoSearchResult) => void;
}

export default function PlaceSearchBar({ onSelect, onSaveWishlist, onVisit }: PlaceSearchBarProps) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<KakaoSearchResult[]>([]);
  const [open, setOpen]       = useState(false);
  const timeoutRef            = useRef<ReturnType<typeof setTimeout>>();
  const { searchByKeyword }   = useKakaoSearch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timeoutRef.current);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    timeoutRef.current = setTimeout(() => {
      searchByKeyword(val, (res) => {
        setResults(res.slice(0, 6));
        setOpen(true);
      });
    }, 300);
  };

  const handleSelect = (result: KakaoSearchResult) => {
    onSelect(result);
    setQuery(result.place_name);
    setOpen(false);
    setResults([]);
  };

  const quickAction = (e: React.MouseEvent, fn: (() => void) | undefined) => {
    e.stopPropagation();
    fn?.();
    setOpen(false);
    setResults([]);
    setQuery('');
  };

  const clear = () => { setQuery(''); setResults([]); setOpen(false); };

  return (
    <div className="absolute top-4 left-4 right-4 z-30">
      <div className="flex items-center bg-surface rounded-2xl shadow-md border border-border overflow-hidden">
        <Search size={16} className="ml-4 text-muted shrink-0" />
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="장소 이름, 주소 검색"
          className="flex-1 px-3 py-3.5 text-ink placeholder:text-muted/60 outline-none bg-transparent text-sm"
        />
        {query && (
          <button onClick={clear} className="pr-4 text-muted hover:text-ink transition-colors">
            <X size={15} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="mt-1.5 bg-surface rounded-2xl shadow-lg border border-border overflow-hidden animate-fade-in max-h-[50vh] overflow-y-auto">
          {results.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-2 pr-2.5 border-b border-border/40 last:border-0 hover:bg-brand-50/50 transition-colors"
            >
              {/* 장소 정보 (클릭 시 지도 이동) */}
              <button
                onClick={() => handleSelect(r)}
                className="flex-1 flex items-start gap-3 px-4 py-3 text-left min-w-0"
              >
                <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={13} className="text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{r.place_name}</p>
                  <p className="text-xs text-muted truncate mt-0.5">
                    {r.category_group_name && (
                      <span className="text-brand mr-1.5">{r.category_group_name}</span>
                    )}
                    {r.road_address_name || r.address_name}
                  </p>
                </div>
              </button>

              {/* 빠른 액션 버튼 */}
              <div className="flex gap-1.5 shrink-0">
                {onSaveWishlist && (
                  <button
                    onClick={(e) => quickAction(e, () => onSaveWishlist(r))}
                    title="위시리스트 저장"
                    className="w-8 h-8 flex items-center justify-center rounded-xl border border-border text-muted hover:border-brand hover:text-brand hover:bg-brand-50 transition-colors"
                  >
                    <Bookmark size={13} />
                  </button>
                )}
                {onVisit && (
                  <button
                    onClick={(e) => quickAction(e, () => onVisit(r))}
                    title="방문 기록"
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-brand/10 text-brand hover:bg-brand hover:text-white transition-colors"
                  >
                    <MapPin size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
