import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BookOpen, Heart, ArrowRight, Map, Camera, Star } from 'lucide-react';

function HeroIllustration() {
  return (
    <svg viewBox="0 0 360 300" className="w-full max-w-xs sm:max-w-sm lg:max-w-none mx-auto drop-shadow-lg" aria-hidden>
      {/* Background circle */}
      <circle cx="180" cy="150" r="140" fill="#EBF2FF" />

      {/* Map grid lines */}
      {[60, 120, 180, 240, 300].map((x) => (
        <line key={`v${x}`} x1={x} y1="10" x2={x} y2="290" stroke="#3182F6" strokeOpacity="0.07" strokeWidth="1" />
      ))}
      {[50, 100, 150, 200, 250].map((y) => (
        <line key={`h${y}`} x1="40" y1={y} x2="320" y2={y} stroke="#3182F6" strokeOpacity="0.07" strokeWidth="1" />
      ))}

      {/* Curved road */}
      <path d="M 70 260 Q 130 200 180 160 Q 230 120 280 80" stroke="#D1D6DB" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M 70 260 Q 130 200 180 160 Q 230 120 280 80" stroke="white" strokeWidth="5" strokeLinecap="round" strokeDasharray="18 10" fill="none" />

      {/* Blue pin (male) */}
      <g transform="translate(105, 95)">
        <ellipse cx="0" cy="56" rx="14" ry="4" fill="#3182F6" fillOpacity="0.12" />
        <path d="M0 52 C0 52 -20 28 -20 16 A20 20 0 0 1 20 16 C20 28 0 52 0 52Z" fill="#3182F6" />
        <circle cx="0" cy="15" r="9" fill="white" />
        <circle cx="0" cy="15" r="5" fill="#3182F6" />
      </g>

      {/* Pink pin (female) */}
      <g transform="translate(245, 140)">
        <ellipse cx="0" cy="56" rx="14" ry="4" fill="#F472B6" fillOpacity="0.12" />
        <path d="M0 52 C0 52 -20 28 -20 16 A20 20 0 0 1 20 16 C20 28 0 52 0 52Z" fill="#F472B6" />
        <circle cx="0" cy="15" r="9" fill="white" />
        <circle cx="0" cy="15" r="5" fill="#F472B6" />
      </g>

      {/* Dashed connection line */}
      <line x1="105" y1="95" x2="245" y2="140" stroke="#3182F6" strokeOpacity="0.18" strokeWidth="2" strokeDasharray="8 5" />

      {/* Heart at center */}
      <g transform="translate(175, 112)">
        <path d="M0 10 C-1 6 -14 2 -14 -6 A7 7 0 0 1 0 -6 A7 7 0 0 1 14 -6 C14 2 1 6 0 10Z" fill="#EF4444" />
      </g>

      {/* Small visited pins */}
      <g transform="translate(150, 210)">
        <circle cx="0" cy="0" r="8" fill="#EF4444" opacity="0.7" />
        <circle cx="0" cy="0" r="3.5" fill="white" />
      </g>
      <g transform="translate(290, 185)">
        <circle cx="0" cy="0" r="7" fill="#8B5CF6" opacity="0.6" />
        <circle cx="0" cy="0" r="3" fill="white" />
      </g>
      <g transform="translate(80, 175)">
        <circle cx="0" cy="0" r="6" fill="#3B82F6" opacity="0.5" />
        <circle cx="0" cy="0" r="2.5" fill="white" />
      </g>

      {/* Decorative sparkles */}
      <g opacity="0.5">
        <path d="M315 90 L317 96 L323 98 L317 100 L315 106 L313 100 L307 98 L313 96Z" fill="#3182F6" />
        <path d="M55 130 L56.5 134 L60.5 135.5 L56.5 137 L55 141 L53.5 137 L49.5 135.5 L53.5 134Z" fill="#F472B6" />
      </g>
    </svg>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-3 p-5 lg:p-6 bg-surface rounded-3xl border border-border shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-default">
      <div className="w-11 h-11 rounded-2xl bg-brand-50 flex items-center justify-center group-hover:bg-brand/15 transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-ink text-sm">{title}</h3>
        <p className="text-xs text-muted mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 flex-1">
      <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-sm font-bold shrink-0">
        {n}
      </div>
      <div className="pt-0.5">
        <p className="font-semibold text-ink text-sm">{title}</p>
        <p className="text-xs text-muted mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* ── 상단 내비게이션 ─────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-surface/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-brand flex items-center justify-center">
              <MapPin size={13} className="text-white" />
            </div>
            <span className="font-bold text-ink text-sm">우리들의 지도</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-medium text-muted hover:text-ink transition-colors px-3 py-1.5"
            >
              로그인
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold bg-brand text-white px-4 py-1.5 rounded-xl hover:bg-brand-hover transition-colors"
            >
              시작하기
            </Link>
          </div>
        </div>
      </header>

      {/* ── 히어로 섹션 ─────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50/60 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-5 lg:px-8 pt-14 lg:pt-24 pb-16 lg:pb-28">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">

            {/* 텍스트 */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:flex-1">
              <div className="inline-flex items-center gap-1.5 bg-brand-50 text-brand text-xs font-semibold px-3 py-1.5 rounded-full border border-brand/20 mb-6">
                <Heart size={11} className="fill-current" />
                커플 전용 장소 기록 서비스
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-ink leading-[1.15] tracking-tight mb-5">
                우리 둘만의<br />
                <span className="text-brand">추억 지도</span>를<br />
                만들어요
              </h1>
              <p className="text-muted text-sm lg:text-base leading-relaxed mb-8 max-w-xs lg:max-w-sm">
                함께 가고 싶은 곳, 다녀온 곳을 지도에 기록하고<br className="hidden sm:block" />
                소중한 데이트 추억을 쌓아가세요
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none lg:w-auto">
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 py-3.5 px-6 bg-brand text-white rounded-2xl font-semibold text-sm hover:bg-brand-hover transition-colors shadow-md"
                >
                  무료로 시작하기
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 py-3.5 px-6 bg-surface text-ink-2 rounded-2xl font-semibold text-sm border border-border hover:bg-gray-50 transition-colors"
                >
                  이미 계정이 있어요
                </Link>
              </div>
            </div>

            {/* 일러스트 */}
            <div className="mt-14 lg:mt-0 lg:flex-shrink-0 lg:w-[400px] xl:w-[460px]">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ── 통계 배너 ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 lg:px-8 w-full mb-16 lg:mb-20">
        <div className="bg-brand rounded-3xl px-6 lg:px-10 py-6 lg:py-8 text-white">
          <div className="flex justify-around lg:gap-0">
            {[
              { value: '지도', label: '위에 기록해요' },
              { value: '함께', label: '추억을 쌓아요' },
              { value: '영원히', label: '간직해요' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center px-4">
                <p className="text-xl lg:text-2xl font-bold">{value}</p>
                <p className="text-xs lg:text-sm text-white/70 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 기능 소개 ────────────────────────────────────── */}
      <section className="px-4 lg:px-8 mb-16 lg:mb-24 max-w-6xl mx-auto w-full">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-5 lg:mb-6">주요 기능</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <FeatureCard
            icon={<Map size={20} className="text-brand" />}
            title="지도에 장소 기록"
            desc="위시리스트와 방문 기록을 지도 위에 핀으로 표시해요. 우리만의 특별한 지도가 완성됩니다."
          />
          <FeatureCard
            icon={<BookOpen size={20} className="text-brand" />}
            title="데이트 일지 작성"
            desc="방문 날짜, 별점, 사진, 분위기 태그를 기록해 소중한 순간을 추억할 수 있어요."
          />
          <FeatureCard
            icon={<Camera size={20} className="text-brand" />}
            title="사진으로 기억하기"
            desc="방문할 때마다 사진을 첨부해 시간이 지나도 생생하게 기억할 수 있어요."
          />
          <FeatureCard
            icon={<Star size={20} className="text-brand" />}
            title="함께 가고 싶은 곳"
            desc="각자의 위시리스트를 공유하고, 둘 다 원하는 장소를 쉽게 찾아볼 수 있어요."
          />
        </div>
      </section>

      {/* ── 이용 방법 ────────────────────────────────────── */}
      <section className="px-4 lg:px-8 mb-16 lg:mb-24 max-w-6xl mx-auto w-full">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-5 lg:mb-6">이용 방법</p>
        <div className="bg-surface rounded-3xl border border-border p-6 lg:p-10 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:gap-0 gap-6">
            <Step n={1} title="회원가입" desc="이메일로 간단하게 가입하고 프로필을 만들어요" />
            <div className="w-px h-4 bg-border ml-4 lg:hidden" />
            <div className="hidden lg:block w-px bg-border mx-8 xl:mx-12" />
            <Step n={2} title="파트너 연결" desc="초대 코드를 생성해서 파트너와 공유하면 바로 연결돼요" />
            <div className="w-px h-4 bg-border ml-4 lg:hidden" />
            <div className="hidden lg:block w-px bg-border mx-8 xl:mx-12" />
            <Step n={3} title="함께 기록 시작" desc="지도에서 가고 싶은 곳과 다녀온 곳을 함께 쌓아가요" />
          </div>
        </div>
      </section>

      {/* ── 하단 CTA ─────────────────────────────────────── */}
      <section className="px-4 lg:px-8 mb-10 max-w-4xl mx-auto w-full">
        <div className="bg-gradient-to-br from-brand to-brand-dark rounded-3xl p-8 lg:p-14 text-center text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Heart size={22} className="text-white fill-white" />
          </div>
          <h2 className="text-xl lg:text-3xl font-bold mb-3">지금 시작해보세요</h2>
          <p className="text-white/75 text-sm lg:text-base mb-8 leading-relaxed max-w-md mx-auto">
            우리 둘만의 특별한 지도를<br />지금 바로 만들어보세요
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-brand font-semibold text-sm lg:text-base px-7 py-3.5 rounded-2xl hover:bg-gray-50 transition-colors shadow"
          >
            무료로 시작하기
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── 푸터 ─────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-6">
          <p className="text-xs text-muted/60 text-center">우리들의 지도 · 커플 전용 지도 서비스</p>
        </div>
      </footer>
    </div>
  );
}
