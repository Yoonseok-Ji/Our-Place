import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { getOAuthUrl } from '../api/auth';
import toast from 'react-hot-toast';

/* ── 로고 아이콘 ─────────────────────────────────────── */
function DuoLogIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="14" fill="#EC4899" fillOpacity="0.12" />
      <path
        d="M14 22 C14 22 6 15.5 6 10.5 A5 5 0 0 1 14 8 A5 5 0 0 1 22 10.5 C22 15.5 14 22 14 22Z"
        fill="#EC4899"
      />
      <circle cx="14" cy="11" r="2.5" fill="white" />
    </svg>
  );
}

/* ── 폰 목업 일러스트 ─────────────────────────────────── */
function AppMockup() {
  return (
    <div className="relative mx-auto select-none" style={{ width: 'min(260px, 75vw)' }}>
      {/* 배경 글로우 */}
      <div
        className="absolute inset-0 rounded-[50px] blur-3xl opacity-25 scale-110 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, #EC4899 0%, #A855F7 100%)' }}
      />
      <svg viewBox="0 0 260 520" className="relative w-full drop-shadow-2xl" aria-hidden>
        <defs>
          <linearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDF2F8" />
            <stop offset="100%" stopColor="#F5F3FF" />
          </linearGradient>
          <clipPath id="screen">
            <rect x="12" y="12" width="236" height="496" rx="36" />
          </clipPath>
          <filter id="cardBlur">
            <feDropShadow dx="0" dy="3" stdDeviation="8" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* 폰 바디 */}
        <rect x="1" y="1" width="258" height="518" rx="46" fill="white" stroke="#FCE7F3" strokeWidth="2" />

        {/* 스크린 영역 */}
        <rect x="12" y="12" width="236" height="496" rx="36" fill="url(#mapBg)" />

        <g clipPath="url(#screen)">
          {/* 지도 그리드 */}
          {[65, 130, 195].map((x) => (
            <line key={x} x1={x} y1="68" x2={x} y2="440" stroke="#EDE9F4" strokeWidth="0.7" />
          ))}
          {[110, 175, 240, 305, 370].map((y) => (
            <line key={y} x1="12" y1={y} x2="248" y2={y} stroke="#EDE9F4" strokeWidth="0.7" />
          ))}

          {/* 도로 */}
          <path
            d="M 30 410 Q 100 340 140 270 Q 180 200 220 140"
            stroke="#E2E8F0" strokeWidth="14" fill="none" strokeLinecap="round"
          />
          <path
            d="M 30 410 Q 100 340 140 270 Q 180 200 220 140"
            stroke="white" strokeWidth="5" strokeDasharray="18 10" fill="none" strokeLinecap="round"
          />
          <path
            d="M 12 250 Q 80 240 140 270"
            stroke="#E2E8F0" strokeWidth="10" fill="none" strokeLinecap="round"
          />
          <path
            d="M 12 250 Q 80 240 140 270"
            stroke="white" strokeWidth="4" strokeDasharray="12 8" fill="none" strokeLinecap="round"
          />

          {/* 핑크 핀 (브랜드 메인) */}
          <g transform="translate(135, 232)">
            <circle cx="0" cy="0" r="26" fill="#EC4899" fillOpacity="0.08" />
            <circle cx="0" cy="0" r="16" fill="#EC4899" fillOpacity="0.12" />
            <path d="M0 36 C0 36 -19 21 -19 8 A19 19 0 0 1 19 8 C19 21 0 36 0 36Z" fill="#EC4899" />
            <circle cx="0" cy="7" r="8.5" fill="white" />
            <circle cx="0" cy="7" r="4" fill="#EC4899" />
          </g>

          {/* 블루 핀 */}
          <g transform="translate(78, 308)">
            <path d="M0 24 C0 24 -13 14 -13 5 A13 13 0 0 1 13 5 C13 14 0 24 0 24Z" fill="#3B82F6" />
            <circle cx="0" cy="4" r="5.5" fill="white" />
            <circle cx="0" cy="4" r="2.5" fill="#3B82F6" />
          </g>

          {/* 퍼플 핀 */}
          <g transform="translate(196, 338)">
            <path d="M0 22 C0 22 -12 13 -12 5 A12 12 0 0 1 12 5 C12 13 0 22 0 22Z" fill="#8B5CF6" />
            <circle cx="0" cy="4" r="5" fill="white" />
            <circle cx="0" cy="4" r="2.5" fill="#8B5CF6" />
          </g>

          {/* 방문 점 */}
          <circle cx="178" cy="378" r="9" fill="#EF4444" fillOpacity="0.75" />
          <circle cx="178" cy="378" r="3.5" fill="white" />

          {/* 헤더 바 */}
          <rect x="12" y="12" width="236" height="64" fill="white" fillOpacity="0.96" />

          {/* 다이나믹 아일랜드 */}
          <rect x="96" y="18" width="68" height="13" rx="6.5" fill="#F1F5F9" />

          {/* 검색 바 */}
          <rect x="20" y="35" width="220" height="33" rx="16.5" fill="#FDF2F8" stroke="#FCE7F3" strokeWidth="1" />
          <circle cx="40" cy="51.5" r="7.5" fill="#FCE7F3" />
          <circle cx="40" cy="51.5" r="3.5" fill="#EC4899" fillOpacity="0.6" />
          <rect x="54" y="48" width="90" height="7" rx="3.5" fill="#EDE9F4" />

          {/* 장소 카드 */}
          <rect x="18" y="372" width="224" height="104" rx="20" fill="white" filter="url(#cardBlur)" />
          <rect x="18" y="372" width="224" height="1" fill="#FCE7F3" />

          {/* 카드 이미지 영역 */}
          <rect x="28" y="382" width="70" height="82" rx="14" fill="#FDF2F8" />
          <circle cx="63" cy="423" r="20" fill="#FCE7F3" />
          <circle cx="48" cy="413" r="13" fill="#F9D8EC" />

          {/* 카드 텍스트 */}
          <rect x="108" y="390" width="70" height="8" rx="4" fill="#FCE7F3" />
          <rect x="108" y="404" width="120" height="8" rx="4" fill="#F1F5F9" />
          <rect x="108" y="418" width="100" height="7" rx="3.5" fill="#F1F5F9" />

          {/* 별점 */}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={108 + i * 13} y="433" width="9" height="9" rx="2"
              fill={i < 5 ? '#EC4899' : '#FCE7F3'} fillOpacity={i < 5 ? 0.8 : 1} />
          ))}

          {/* 분위기 태그 */}
          <rect x="108" y="450" width="44" height="14" rx="7" fill="#FDF2F8" />
          <rect x="158" y="450" width="44" height="14" rx="7" fill="#FDF2F8" />

          {/* 하단 내비게이션 */}
          <rect x="12" y="460" width="236" height="48" fill="white" fillOpacity="0.97" />
          <rect x="12" y="460" width="236" height="1" fill="#FCE7F3" />

          {[46, 130, 214].map((cx, i) => (
            <g key={i} transform={`translate(${cx}, 484)`}>
              <rect x="-18" y="-16" width="36" height="28" rx="11"
                fill={i === 0 ? '#FDF2F8' : 'transparent'} />
              <circle cx="0" cy="-4" r="7"
                fill={i === 0 ? '#EC4899' : '#D1D6DB'} fillOpacity={i === 0 ? 1 : 0.7} />
            </g>
          ))}
        </g>
      </svg>

      {/* 플로팅 배지들 */}
      <div className="absolute -left-6 top-1/4 bg-white shadow-lg rounded-2xl px-3 py-2 flex items-center gap-2 border border-pink-100 animate-float">
        <span className="text-base">📍</span>
        <div>
          <p className="text-[10px] font-bold text-ink leading-none">성수 카페</p>
          <p className="text-[9px] text-muted mt-0.5">위시리스트 추가</p>
        </div>
      </div>

      <div className="absolute -right-4 top-2/5 bg-white shadow-lg rounded-2xl px-3 py-2 flex items-center gap-1.5 border border-pink-100" style={{ animationDelay: '1s' }}>
        <span className="text-base">⭐</span>
        <p className="text-[11px] font-bold text-ink">5.0</p>
      </div>

      <div className="absolute -left-4 bottom-1/4 bg-brand text-white shadow-lg rounded-2xl px-3 py-2 flex items-center gap-1.5 animate-float" style={{ animationDelay: '1.5s' }}>
        <Heart size={11} className="fill-white text-white" />
        <p className="text-[10px] font-bold">함께 가고 싶어요</p>
      </div>
    </div>
  );
}

/* ── 기능 카드 ────────────────────────────────────────── */
interface FeatureCardProps {
  emoji: string;
  title: string;
  subtitle: string;
  desc: string;
  gradient: string;
}

function FeatureCard({ emoji, title, subtitle, desc, gradient }: FeatureCardProps) {
  return (
    <div className="group relative overflow-hidden bg-white rounded-3xl border border-pink-100 p-5 lg:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default">
      <div className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform duration-300`}>
        {emoji}
      </div>
      <p className="text-[10px] font-bold text-brand uppercase tracking-wider mb-1">{subtitle}</p>
      <h3 className="font-bold text-ink text-base leading-snug mb-2">{title}</h3>
      <p className="text-xs text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

/* ── 단계 카드 ────────────────────────────────────────── */
function StepCard({ n, title, desc, emoji }: { n: number; title: string; desc: string; emoji: string }) {
  return (
    <div className="flex items-start gap-4 flex-1">
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center text-white font-black text-lg shadow-md">
          {n}
        </div>
        <div className="absolute -bottom-1 -right-1 text-base">{emoji}</div>
      </div>
      <div className="pt-1">
        <p className="font-bold text-ink text-sm">{title}</p>
        <p className="text-xs text-muted mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ── 소셜 버튼 ────────────────────────────────────────── */
function StartButtons({ dark = false }: { dark?: boolean }) {
  const navigate = useNavigate();

  const handleSocial = (provider: 'kakao' | 'naver') => {
    const url = getOAuthUrl(provider);
    if (!url) { toast.error('소셜 로그인 설정이 완료되지 않았어요'); return; }
    window.location.href = url;
  };

  return (
    <div className="flex flex-col gap-2.5 w-full max-w-xs">
      <button
        onClick={() => handleSocial('kakao')}
        className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl text-sm font-bold bg-[#FEE500] text-[#191919] active:scale-95 transition-all shadow-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#191919">
          <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.615 5.09 4.077 6.515L5.1 21l4.423-2.912A11.4 11.4 0 0012 18.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
        </svg>
        카카오로 시작하기
      </button>
      <button
        onClick={() => handleSocial('naver')}
        className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl text-sm font-bold bg-[#03C75A] text-white active:scale-95 transition-all shadow-sm"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
        </svg>
        네이버로 시작하기
      </button>
      <button
        onClick={() => navigate('/login')}
        className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-semibold transition-all active:scale-95
          ${dark ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20' : 'bg-white text-ink border border-border hover:bg-gray-50 shadow-sm'}`}
      >
        이메일로 시작하기
      </button>
    </div>
  );
}

/* ── 메인 ─────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">

      {/* ── 상단 내비 ──────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-pink-100">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DuoLogIcon size={30} />
            <span className="font-black text-ink text-base tracking-tight">Duo-Log</span>
          </div>
          <button
            onClick={() => { window.location.href = '/login'; }}
            className="text-sm font-bold bg-brand text-white px-4 py-2 rounded-xl hover:bg-brand-hover transition-colors shadow-sm"
          >
            시작하기
          </button>
        </div>
      </header>

      {/* ── 히어로 섹션 ────────────────────────────────── */}
      <section className="relative overflow-hidden pt-14 lg:pt-24 pb-16 lg:pb-28">
        {/* 배경 그라디언트 블롭 */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none opacity-20"
          style={{
            background: 'radial-gradient(circle, #EC4899 0%, transparent 65%)',
            transform: 'translate(30%, -25%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none opacity-10"
          style={{
            background: 'radial-gradient(circle, #A855F7 0%, transparent 65%)',
            transform: 'translate(-30%, 30%)',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">

            {/* 텍스트 */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:flex-1">

              {/* 배지 */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-50 to-purple-50 text-brand text-xs font-bold px-4 py-2 rounded-full border border-pink-200 mb-7 shadow-sm">
                <span>💕</span>
                <span>커플 전용 데이트 다이어리</span>
              </div>

              {/* 헤드라인 */}
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-ink leading-[1.1] tracking-tight mb-5">
                함께한<br />
                모든 순간을<br />
                <span
                  className="inline-block"
                  style={{
                    background: 'linear-gradient(135deg, #EC4899 0%, #A855F7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  지도로 남겨요
                </span>
              </h1>

              <p className="text-muted text-sm lg:text-base leading-relaxed mb-8 max-w-xs lg:max-w-sm">
                가고 싶은 곳엔 핀을 꽂고,<br />
                다녀온 곳엔 사진과 기억을 쌓아요.<br className="hidden sm:block" />
                우리 둘만의 지도가 완성됩니다 🗺️
              </p>

              {/* CTA 버튼 */}
              <StartButtons />

              {/* 피처 필 태그 */}
              <div className="flex flex-wrap gap-2 mt-7 justify-center lg:justify-start">
                {['📍 핀으로 기록', '📸 사진 첨부', '⭐ 별점 남기기', '💝 위시리스트'].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium text-ink/60 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 앱 목업 */}
            <div className="mt-16 lg:mt-0 lg:flex-shrink-0 lg:w-[380px] xl:w-[420px] flex justify-center">
              <AppMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── MVP 기능 소개 ───────────────────────────────── */}
      <section className="px-4 lg:px-8 py-16 lg:py-24 max-w-6xl mx-auto w-full">

        {/* 섹션 헤더 */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-brand uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-2xl lg:text-3xl font-black text-ink">
            Duo-Log이
            <span
              className="ml-2"
              style={{
                background: 'linear-gradient(135deg, #EC4899 0%, #A855F7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              특별한 이유
            </span>
          </h2>
          <p className="text-sm text-muted mt-3 max-w-sm mx-auto leading-relaxed">
            커플의 데이트를 더 소중하게 만드는<br />4가지 핵심 기능
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            emoji="🗺️"
            title="지도에 핀 꽂기"
            subtitle="Map Pin"
            desc="카카오맵 기반으로 가고 싶은 곳은 위시 핀, 다녀온 곳은 방문 핀으로 우리만의 지도를 완성해요."
            gradient="bg-gradient-to-br from-pink-50 to-rose-100"
          />
          <FeatureCard
            emoji="📸"
            title="데이트 다이어리"
            subtitle="Diary"
            desc="방문마다 사진을 첨부하고 별점, 메모, 분위기 태그로 그날의 감성을 기록해요."
            gradient="bg-gradient-to-br from-purple-50 to-violet-100"
          />
          <FeatureCard
            emoji="💝"
            title="위시리스트 공유"
            subtitle="Wishlist"
            desc="각자의 위시리스트를 쌓아가다 보면, 둘 다 원하는 장소가 자동으로 표시돼요."
            gradient="bg-gradient-to-br from-amber-50 to-orange-100"
          />
          <FeatureCard
            emoji="📅"
            title="타임라인"
            subtitle="Timeline"
            desc="월별로 정리된 데이트 기록으로 우리의 이야기를 한눈에 돌아봐요."
            gradient="bg-gradient-to-br from-emerald-50 to-teal-100"
          />
        </div>
      </section>

      {/* ── 핀 색상 범례 ────────────────────────────────── */}
      <section className="px-4 lg:px-8 pb-16 max-w-6xl mx-auto w-full">
        <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 rounded-3xl border border-pink-100 p-6 lg:p-10">
          <p className="text-xs font-bold text-brand uppercase tracking-widest mb-2 text-center">지도 핀 가이드</p>
          <h3 className="text-xl font-black text-ink text-center mb-8">핀 색으로 한눈에 파악</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { color: '#F472B6', label: '내 위시리스트', desc: '내가 가고 싶은 곳' },
              { color: '#3B82F6', label: '파트너 위시', desc: '파트너가 가고 싶은 곳' },
              { color: '#8B5CF6', label: '함께 가고 싶어요', desc: '둘 다 원하는 장소' },
              { color: '#EF4444', label: '방문 완료', desc: '함께 다녀온 곳' },
            ].map(({ color, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="shrink-0">
                  <svg width="28" height="36" viewBox="0 0 28 36" aria-hidden>
                    <path
                      d="M14 34 C14 34 1 20 1 9 A13 13 0 0 1 27 9 C27 20 14 34 14 34Z"
                      fill={color}
                    />
                    <circle cx="14" cy="9" r="5" fill="white" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-ink leading-tight">{label}</p>
                  <p className="text-[10px] text-muted mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 이용 방법 ────────────────────────────────────── */}
      <section className="px-4 lg:px-8 pb-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-brand uppercase tracking-widest mb-3">How to Start</p>
          <h2 className="text-2xl lg:text-3xl font-black text-ink">3단계로 시작해요</h2>
        </div>

        <div className="bg-white rounded-3xl border border-pink-100 p-6 lg:p-10 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
            <StepCard
              n={1}
              emoji="✍️"
              title="회원가입"
              desc="이메일로 간단하게 가입하고 내 프로필을 만들어요"
            />
            <div className="hidden lg:flex items-center px-6 xl:px-10">
              <div className="flex-1 h-px bg-pink-100" />
              <ArrowRight size={16} className="text-brand mx-2 shrink-0" />
              <div className="flex-1 h-px bg-pink-100" />
            </div>
            <StepCard
              n={2}
              emoji="💑"
              title="파트너 연결"
              desc="초대 코드를 생성해서 파트너와 공유하면 바로 연결돼요"
            />
            <div className="hidden lg:flex items-center px-6 xl:px-10">
              <div className="flex-1 h-px bg-pink-100" />
              <ArrowRight size={16} className="text-brand mx-2 shrink-0" />
              <div className="flex-1 h-px bg-pink-100" />
            </div>
            <StepCard
              n={3}
              emoji="🗺️"
              title="함께 기록 시작"
              desc="지도에서 장소를 찾아 가고 싶은 곳과 다녀온 곳을 함께 쌓아가요"
            />
          </div>
        </div>
      </section>

      {/* ── 하단 CTA ─────────────────────────────────────── */}
      <section className="px-4 lg:px-8 pb-14 max-w-4xl mx-auto w-full">
        <div
          className="rounded-3xl p-8 lg:p-14 text-center text-white overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #EC4899 0%, #A855F7 100%)' }}
        >
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative">
            <div className="text-4xl mb-4">💕</div>
            <h2 className="text-2xl lg:text-3xl font-black mb-3">
              지금 Duo-Log 시작하기
            </h2>
            <p className="text-white/80 text-sm lg:text-base mb-8 leading-relaxed max-w-md mx-auto">
              우리 둘만의 특별한 지도를<br />지금 바로 만들어보세요
            </p>
            <StartButtons dark />
          </div>
        </div>
      </section>

      {/* ── 푸터 ─────────────────────────────────────────── */}
      <footer className="border-t border-pink-50">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-6 flex items-center justify-center gap-2">
          <DuoLogIcon size={20} />
          <p className="text-xs text-muted/60">Duo-Log · 커플 전용 데이트 기록 서비스</p>
        </div>
      </footer>
    </div>
  );
}
