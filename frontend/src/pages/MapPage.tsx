import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Bookmark, MapPin, ExternalLink, Navigation, Search, ChevronLeft } from 'lucide-react';
import type { Place, KakaoSearchResult } from '../types';
import { placesApi, kakaoResultToRequest } from '../api/places';
import { useAuthStore } from '../store/authStore';
import { useKakaoSearch } from '../hooks/useKakaoSearch';
import KakaoMapComponent from '../components/map/KakaoMap';
import PlaceSearchBar from '../components/map/PlaceSearchBar';
import PlaceDetailPanel from '../components/place/PlaceDetailPanel';
import DiscoveryDetailPanel from '../components/place/DiscoveryDetailPanel';
import Modal from '../components/ui/Modal';
import VisitForm from '../components/place/VisitForm';
import MainNav from '../components/layout/MainNav';
import toast from 'react-hot-toast';

/* ── 카테고리 ─────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'all',  label: '전체' },
  { id: '한식', label: '한식' },
  { id: '일식', label: '일식' },
  { id: '양식', label: '양식' },
  { id: '중식', label: '중식' },
  { id: '카페', label: '카페' },
  { id: '술집', label: '술집' },
  { id: '분식', label: '분식' },
];

/* ── 지역 ──────────────────────────────────────────────── */
const REGIONS = [
  { id: 'hongdae', label: '홍대/합정', lat: 37.5563, lng: 126.9245 },
  { id: 'gangnam', label: '강남',      lat: 37.4979, lng: 127.0276 },
  { id: 'itaewon', label: '이태원',    lat: 37.5345, lng: 126.9942 },
  { id: 'jongno',  label: '종로',      lat: 37.5704, lng: 126.9780 },
  { id: 'sungsu',  label: '성수',      lat: 37.5445, lng: 127.0557 },
  { id: 'sinchon', label: '신촌',      lat: 37.5556, lng: 126.9369 },
  { id: 'yeouido', label: '여의도',    lat: 37.5217, lng: 126.9244 },
  { id: 'jamsil',  label: '잠실',      lat: 37.5148, lng: 127.1060 },
  { id: 'mapo',    label: '마포',      lat: 37.5638, lng: 126.9084 },
];

/* ── 카테고리 필터 ───────────────────────────────────────── */
function matchesCategory(place: Place, cat: string): boolean {
  if (cat === 'all') return true;
  const h = ((place.category ?? '') + ' ' + place.name).toLowerCase();
  if (cat === '한식') return /한식|국밥|설렁탕|갈비|삼겹|불고기|된장|순두부|한정식/.test(h);
  if (cat === '일식') return /일식|초밥|스시|라멘|우동|돈카츠|일본|야키/.test(h);
  if (cat === '양식') return /양식|이탈리안|파스타|피자|스테이크|버거|브런치|서양/.test(h);
  if (cat === '중식') return /중식|중국|짜장|짬뽕|탕수|마라/.test(h);
  if (cat === '카페') return /카페|coffee|커피|디저트|케이크|cafe/.test(h);
  if (cat === '술집') return /술|bar|바|이자카야|포차|호프|펍/.test(h);
  if (cat === '분식') return /분식|떡볶이|순대|튀김|김밥/.test(h);
  return true;
}

/* ── 저장 장소 카드 ─────────────────────────────────────── */
const STATUS_DOT: Record<string, string> = {
  MALE_ONLY:   'bg-blue-male',
  FEMALE_ONLY: 'bg-rose-pin',
  BOTH:        'bg-blue-both',
  VISITED:     'bg-heart',
};

function PlaceCard({ place, onClick, active }: { place: Place; onClick: () => void; active: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${active ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
    >
      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[place.status]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink truncate">{place.name}</p>
        <p className="text-xs text-muted truncate mt-0.5">{place.category || '—'}</p>
      </div>
      {place.visit_count > 0 && (
        <span className="shrink-0 text-xs font-semibold text-heart bg-heart-light px-2 py-0.5 rounded-full border border-heart/15 mt-0.5">
          {place.visit_count}회
        </span>
      )}
    </button>
  );
}

/* ── 섹션 헤더 ──────────────────────────────────────────── */
function SectionHeader({ dot, title, count }: { dot: string; title: string; count: number }) {
  return (
    <div className="px-4 pt-3 pb-1 flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      <p className="text-[10px] font-semibold text-muted uppercase tracking-wider flex-1">{title}</p>
      <span className="text-[10px] text-muted">{count}곳</span>
    </div>
  );
}

/* ── 발견 장소 카드 (오른쪽 목록) ───────────────────────── */
function DiscoveryCard({
  result, onSave, onVisit, active, onClick, saving,
}: {
  result: KakaoSearchResult;
  onSave: () => void;
  onVisit: () => void;
  active: boolean;
  onClick: () => void;
  saving: boolean;
}) {
  return (
    <div
      className={`px-4 py-3 border-b border-border/40 last:border-0 transition-colors ${active ? 'bg-brand-50' : 'hover:bg-gray-50'} cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-muted/40 border-2 border-muted mt-1.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink truncate">{result.place_name}</p>
          <p className="text-xs text-brand mt-0.5">{result.category_group_name || result.category_name}</p>
          <p className="text-xs text-muted truncate mt-0.5">{result.road_address_name || result.address_name}</p>
        </div>
        {result.place_url && (
          <a
            href={result.place_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted hover:text-brand transition-colors shrink-0 mt-0.5"
          >
            <ExternalLink size={13} />
          </a>
        )}
      </div>
      <div className="flex gap-2 ml-4">
        <button
          onClick={(e) => { e.stopPropagation(); onSave(); }}
          disabled={saving}
          className="flex-1 text-xs font-semibold py-1.5 rounded-lg border border-border text-muted hover:border-brand hover:text-brand transition-colors disabled:opacity-40"
        >
          <Bookmark size={11} className="inline mr-1" />위시 저장
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onVisit(); }}
          className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-brand text-white hover:bg-brand-hover transition-colors"
        >
          <MapPin size={11} className="inline mr-1" />방문 기록
        </button>
      </div>
    </div>
  );
}

/* ── 메인 컴포넌트 ─────────────────────────────────────── */
export default function MapPage() {
  const { user } = useAuthStore();
  const { searchNearby } = useKakaoSearch();

  const isMale = user?.gender === 'male';
  const myStatus     = isMale ? 'MALE_ONLY'   : 'FEMALE_ONLY';
  const partnerStatus = isMale ? 'FEMALE_ONLY' : 'MALE_ONLY';

  const [places, setPlaces]                 = useState<Place[]>([]);
  const [discovery, setDiscovery]           = useState<KakaoSearchResult[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeRegion, setActiveRegion]     = useState<string | null>(null);
  const [centerTo, setCenterTo]             = useState<{ lat: number; lng: number; level?: number } | null>(null);
  const [mapCenter, setMapCenter]           = useState({ lat: 37.5665, lng: 126.9780 });

  const [selectedPlace, setSelectedPlace]         = useState<Place | null>(null);
  const [selectedDiscovery, setSelectedDiscovery] = useState<KakaoSearchResult | null>(null);
  const [showRightPanel, setShowRightPanel]       = useState(true);

  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitTarget, setVisitTarget]       = useState<KakaoSearchResult | null>(null);
  const [savingId, setSavingId]             = useState<string | null>(null);

  const searchDebounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    placesApi.list().then(setPlaces).catch(() => null);
  }, []);

  /* 카테고리/위치 변경 시 주변 검색 */
  useEffect(() => {
    if (activeCategory === 'all') { setDiscovery([]); return; }
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      searchNearby(activeCategory, mapCenter.lat, mapCenter.lng, (results) => {
        setDiscovery(results.slice(0, 20));
      });
    }, 400);
  }, [activeCategory, mapCenter, searchNearby]);

  /* 지역 선택 → 지도 이동 */
  const handleRegionSelect = (regionId: string) => {
    const region = REGIONS.find((r) => r.id === regionId);
    if (!region) return;
    const newRegion = activeRegion === regionId ? null : regionId;
    setActiveRegion(newRegion);
    if (newRegion) {
      setCenterTo({ lat: region.lat, lng: region.lng, level: 4 });
      setMapCenter({ lat: region.lat, lng: region.lng });
    }
  };

  /* 장소 섹션별 분류 */
  const filteredSaved = useMemo(
    () => places.filter((p) => matchesCategory(p, activeCategory)),
    [places, activeCategory],
  );

  const { visitedSaved, bothSaved, mySaved, partnerSaved } = useMemo(() => ({
    visitedSaved:  filteredSaved.filter((p) => p.status === 'VISITED'),
    bothSaved:     filteredSaved.filter((p) => p.status === 'BOTH'),
    mySaved:       filteredSaved.filter((p) => p.status === myStatus),
    partnerSaved:  filteredSaved.filter((p) => p.status === partnerStatus),
  }), [filteredSaved, myStatus, partnerStatus]);

  /* 전체 통계 (필터 무관) */
  const stats = useMemo(() => ({
    visited: places.filter((p) => p.status === 'VISITED').length,
    both:    places.filter((p) => p.status === 'BOTH').length,
    mine:    places.filter((p) => p.status === myStatus).length,
    partner: places.filter((p) => p.status === partnerStatus).length,
  }), [places, myStatus, partnerStatus]);

  /* 저장된 핀/카드 클릭 → 줌인 + 상세 */
  const handlePlaceClick = useCallback((place: Place) => {
    setSelectedPlace(place);
    setSelectedDiscovery(null);
    if (place.lat && place.lng) {
      setCenterTo({ lat: place.lat, lng: place.lng, level: 3 });
    }
  }, []);

  /* 발견 핀/카드 클릭 → 줌인 + 상세 */
  const handleDiscoveryClick = useCallback((result: KakaoSearchResult) => {
    setSelectedDiscovery(result);
    setSelectedPlace(null);
    const lat = parseFloat(result.y);
    const lng = parseFloat(result.x);
    if (lat && lng) setCenterTo({ lat, lng, level: 3 });
  }, []);

  /* 검색바 결과 선택 */
  const handleSearchSelect = useCallback((result: KakaoSearchResult) => {
    const existing = places.find((p) => p.kakao_place_id === result.id);
    if (existing) {
      setSelectedPlace(existing);
      setSelectedDiscovery(null);
      if (existing.lat && existing.lng) {
        setCenterTo({ lat: existing.lat, lng: existing.lng, level: 3 });
      }
    } else {
      setSelectedDiscovery(result);
      setSelectedPlace(null);
      const lat = parseFloat(result.y);
      const lng = parseFloat(result.x);
      if (lat && lng) setCenterTo({ lat, lng, level: 3 });
    }
  }, [places]);

  /* 위시리스트 저장 */
  const handleSaveWishlist = useCallback(async (result: KakaoSearchResult) => {
    setSavingId(result.id);
    try {
      const newPlace = await placesApi.save(kakaoResultToRequest(result));
      setPlaces((prev) => {
        const exists = prev.find((p) => p.id === newPlace.id);
        return exists ? prev.map((p) => p.id === newPlace.id ? newPlace : p) : [newPlace, ...prev];
      });
      setSelectedPlace(newPlace);
      setSelectedDiscovery(null);
      toast.success('위시리스트에 저장됐어요');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || '저장에 실패했어요');
    } finally {
      setSavingId(null);
    }
  }, []);

  /* 검색바에서 방문 기록 바로 열기 */
  const handleSearchVisit = useCallback((result: KakaoSearchResult) => {
    const existing = places.find((p) => p.kakao_place_id === result.id);
    if (existing) {
      setSelectedPlace(existing);
      setSelectedDiscovery(null);
      if (existing.lat && existing.lng) {
        setCenterTo({ lat: existing.lat, lng: existing.lng, level: 3 });
      }
    }
    setVisitTarget(result);
    setShowVisitModal(true);
  }, [places]);

  const handlePlaceUpdated = useCallback((updated: Place) => {
    setPlaces((prev) => prev.map((p) => p.id === updated.id ? updated : p));
    setSelectedPlace(updated);
  }, []);

  const handlePlaceDeleted = useCallback((placeId: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== placeId));
    setSelectedPlace(null);
  }, []);

  const handleVisitDone = (newPlace: Place) => {
    setPlaces((prev) => {
      const exists = prev.find((p) => p.id === newPlace.id);
      return exists ? prev.map((p) => p.id === newPlace.id ? newPlace : p) : [newPlace, ...prev];
    });
    setSelectedPlace(newPlace);
    setSelectedDiscovery(null);
    setShowVisitModal(false);
    setVisitTarget(null);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-bg">
      <div className="flex-1 flex min-h-0">

        {/* ── 왼쪽: 지도 ──────────────────────────────── */}
        <div className="relative flex-1 min-w-0">
          <KakaoMapComponent
            places={filteredSaved}
            discoveryPlaces={activeCategory !== 'all' ? discovery : []}
            onPlaceClick={handlePlaceClick}
            onDiscoveryClick={handleDiscoveryClick}
            selectedPlaceId={selectedPlace?.id}
            selectedDiscoveryId={selectedDiscovery?.id}
            onCenterChange={(lat, lng) => setMapCenter({ lat, lng })}
            centerTo={centerTo}
          />

          {/* 검색바 (위시·방문 빠른 버튼 포함) */}
          <PlaceSearchBar
            onSelect={handleSearchSelect}
            onSaveWishlist={handleSaveWishlist}
            onVisit={handleSearchVisit}
          />

          {/* 발견 장소 상세 패널 */}
          {selectedDiscovery && (
            <DiscoveryDetailPanel
              result={selectedDiscovery}
              onClose={() => setSelectedDiscovery(null)}
              onSave={() => handleSaveWishlist(selectedDiscovery)}
              onVisit={() => { setVisitTarget(selectedDiscovery); setShowVisitModal(true); }}
              saving={savingId === selectedDiscovery.id}
            />
          )}

          {/* 저장된 장소 상세 패널 */}
          {selectedPlace && !selectedDiscovery && (
            <PlaceDetailPanel
              place={selectedPlace}
              onClose={() => setSelectedPlace(null)}
              onPlaceUpdated={handlePlaceUpdated}
              onPlaceDeleted={handlePlaceDeleted}
            />
          )}

          {/* 오른쪽 패널 토글 버튼 */}
          <button
            onClick={() => setShowRightPanel((p) => !p)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-surface border border-r-0 border-border rounded-l-2xl shadow-md w-5 h-14 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft
              size={13}
              className={`text-muted transition-transform duration-300 ${!showRightPanel ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* ── 오른쪽: 장소 패널 ───────────────────────── */}
        <div
          className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden bg-surface ${
            showRightPanel ? 'w-72 border-l border-border' : 'w-0'
          }`}
        >
          <div className="w-72 h-full flex flex-col overflow-hidden">

            {/* 헤더 통계 */}
            <div className="px-4 pt-4 pb-3 border-b border-border shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-ink text-sm">우리들의 장소</h2>
                <span className="text-xs font-semibold text-brand bg-brand-50 px-2.5 py-1 rounded-full">
                  총 {places.length}곳
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center">
                <div className="bg-heart-light rounded-xl py-1.5">
                  <p className="text-sm font-bold text-heart">{stats.visited}</p>
                  <p className="text-[9px] text-heart/70 font-medium mt-0.5">방문</p>
                </div>
                <div className="bg-violet-50 rounded-xl py-1.5">
                  <p className="text-sm font-bold text-blue-both">{stats.both}</p>
                  <p className="text-[9px] text-blue-both/70 font-medium mt-0.5">함께</p>
                </div>
                <div className="bg-blue-50 rounded-xl py-1.5">
                  <p className="text-sm font-bold text-blue-male">{stats.mine}</p>
                  <p className="text-[9px] text-blue-male/70 font-medium mt-0.5">내 위시</p>
                </div>
                <div className="bg-pink-50 rounded-xl py-1.5">
                  <p className="text-sm font-bold text-rose-pin">{stats.partner}</p>
                  <p className="text-[9px] text-rose-pin/70 font-medium mt-0.5">파트너</p>
                </div>
              </div>
            </div>

            {/* 카테고리 필터 */}
            <div className="px-3 py-2 border-b border-border shrink-0">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {CATEGORIES.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveCategory(id)}
                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                      activeCategory === id
                        ? 'bg-brand text-white border-brand'
                        : 'bg-bg text-muted border-border hover:border-brand/40 hover:text-brand'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 지역 필터 */}
            <div className="px-3 py-2 border-b border-border shrink-0">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {REGIONS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => handleRegionSelect(id)}
                    className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                      activeRegion === id
                        ? 'bg-ink text-white border-ink'
                        : 'bg-bg text-muted border-border hover:border-ink/30 hover:text-ink'
                    }`}
                  >
                    <Navigation size={9} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 장소 목록 (섹션별) */}
            <div className="flex-1 overflow-y-auto pb-[72px]">

              {/* ① 방문한 곳 */}
              {visitedSaved.length > 0 && (
                <>
                  <SectionHeader dot="bg-heart" title="방문한 곳" count={visitedSaved.length} />
                  <div className="divide-y divide-border/30">
                    {visitedSaved.map((p) => (
                      <PlaceCard key={p.id} place={p} active={selectedPlace?.id === p.id} onClick={() => handlePlaceClick(p)} />
                    ))}
                  </div>
                </>
              )}

              {/* ② 함께 가고 싶어요 */}
              {bothSaved.length > 0 && (
                <>
                  <SectionHeader dot="bg-blue-both" title="함께 가고 싶어요" count={bothSaved.length} />
                  <div className="divide-y divide-border/30">
                    {bothSaved.map((p) => (
                      <PlaceCard key={p.id} place={p} active={selectedPlace?.id === p.id} onClick={() => handlePlaceClick(p)} />
                    ))}
                  </div>
                </>
              )}

              {/* ③ 내 위시리스트 */}
              {mySaved.length > 0 && (
                <>
                  <SectionHeader
                    dot={isMale ? 'bg-blue-male' : 'bg-rose-pin'}
                    title="내 위시리스트"
                    count={mySaved.length}
                  />
                  <div className="divide-y divide-border/30">
                    {mySaved.map((p) => (
                      <PlaceCard key={p.id} place={p} active={selectedPlace?.id === p.id} onClick={() => handlePlaceClick(p)} />
                    ))}
                  </div>
                </>
              )}

              {/* ④ 파트너 위시리스트 */}
              {partnerSaved.length > 0 && (
                <>
                  <SectionHeader
                    dot={isMale ? 'bg-rose-pin' : 'bg-blue-male'}
                    title="파트너 위시리스트"
                    count={partnerSaved.length}
                  />
                  <div className="divide-y divide-border/30">
                    {partnerSaved.map((p) => (
                      <PlaceCard key={p.id} place={p} active={selectedPlace?.id === p.id} onClick={() => handlePlaceClick(p)} />
                    ))}
                  </div>
                </>
              )}

              {/* ⑤ 카테고리 검색 결과 (발견 장소) */}
              {activeCategory !== 'all' && (
                <div>
                  <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                      <Search size={9} className="inline mr-1" />
                      {activeRegion ? REGIONS.find((r) => r.id === activeRegion)?.label : '주변'} {activeCategory}
                    </p>
                    <span className="text-[10px] text-muted">{discovery.length}곳</span>
                  </div>
                  {discovery.length === 0 ? (
                    <p className="text-xs text-muted/60 text-center py-6">검색 중이에요...</p>
                  ) : (
                    <div className="divide-y divide-border/30">
                      {discovery.map((result) => {
                        if (places.some((p) => p.kakao_place_id === result.id)) return null;
                        return (
                          <DiscoveryCard
                            key={result.id}
                            result={result}
                            active={selectedDiscovery?.id === result.id}
                            onClick={() => handleDiscoveryClick(result)}
                            onSave={() => handleSaveWishlist(result)}
                            onVisit={() => { setVisitTarget(result); setShowVisitModal(true); }}
                            saving={savingId === result.id}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 빈 상태 */}
              {filteredSaved.length === 0 && activeCategory === 'all' && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 px-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center">
                    <MapPin size={24} className="text-brand/50" />
                  </div>
                  <p className="text-sm font-semibold text-ink">아직 저장된 장소가 없어요</p>
                  <p className="text-xs text-muted leading-relaxed">
                    지도 위 검색창에서 장소를 찾아<br />위시리스트나 방문 기록을 남겨보세요
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MainNav />

      {/* 방문 기록 모달 */}
      <Modal
        open={showVisitModal}
        onClose={() => { setShowVisitModal(false); setVisitTarget(null); }}
        title="방문 기록"
      >
        {visitTarget && (
          <VisitForm
            searchResult={visitTarget}
            onDone={handleVisitDone}
            onCancel={() => { setShowVisitModal(false); setVisitTarget(null); }}
          />
        )}
      </Modal>
    </div>
  );
}
