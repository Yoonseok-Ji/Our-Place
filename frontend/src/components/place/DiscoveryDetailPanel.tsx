import { X, MapPin, Phone, ExternalLink, Bookmark } from 'lucide-react';
import type { KakaoSearchResult } from '../../types';
import Button from '../ui/Button';

interface DiscoveryDetailPanelProps {
  result: KakaoSearchResult;
  onClose: () => void;
  onSave: () => void;
  onVisit: () => void;
  saving: boolean;
}

export default function DiscoveryDetailPanel({
  result, onClose, onSave, onVisit, saving,
}: DiscoveryDetailPanelProps) {
  const categoryLabel =
    result.category_group_name ||
    result.category_name?.split(' > ').slice(-1)[0] ||
    '장소';

  return (
    <div className="absolute bottom-[72px] left-2 right-2 z-40 animate-slide-up">
      <div className="bg-surface rounded-3xl shadow-xl border border-border overflow-hidden">

        {/* 헤더 */}
        <div className="p-5 pb-4 border-b border-border/50">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand border border-brand/20">
                  {categoryLabel}
                </span>
              </div>
              <h2 className="font-semibold text-ink text-lg leading-tight">{result.place_name}</h2>
              {(result.road_address_name || result.address_name) && (
                <div className="flex items-center gap-1 mt-1.5">
                  <MapPin size={11} className="text-muted shrink-0" />
                  <p className="text-xs text-muted truncate">
                    {result.road_address_name || result.address_name}
                  </p>
                </div>
              )}
              {result.phone && (
                <div className="flex items-center gap-1 mt-1">
                  <Phone size={11} className="text-muted shrink-0" />
                  <p className="text-xs text-muted">{result.phone}</p>
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
        </div>

        {/* 카카오맵 사진·메뉴 링크 */}
        {result.place_url && (
          <div className="px-5 py-3 border-b border-border/50">
            <a
              href={result.place_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#FEE500] rounded-2xl text-[#191919] text-xs font-bold hover:bg-yellow-300 transition-colors"
            >
              <ExternalLink size={13} />
              카카오맵에서 사진·메뉴 보기
            </a>
          </div>
        )}

        {/* 액션 */}
        <div className="p-4 pt-3 flex gap-2.5">
          <Button
            variant="secondary"
            onClick={onSave}
            loading={saving}
            icon={<Bookmark size={15} />}
            className="flex-1"
          >
            위시리스트
          </Button>
          <Button
            onClick={onVisit}
            icon={<MapPin size={15} />}
            className="flex-1"
          >
            방문 기록
          </Button>
        </div>
      </div>
    </div>
  );
}
