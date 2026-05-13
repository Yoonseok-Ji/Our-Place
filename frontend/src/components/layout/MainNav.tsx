import { NavLink } from 'react-router-dom';
import { Map, BookOpen, User } from 'lucide-react';

const navItems = [
  { to: '/',         Icon: Map,      label: '지도' },
  { to: '/timeline', Icon: BookOpen, label: '기록' },
  { to: '/profile',  Icon: User,     label: '우리' },
];

export default function MainNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-border safe-pb">
      <div className="flex items-center justify-around max-w-md mx-auto px-2 pt-2 pb-1">
        {navItems.map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-8 py-2 rounded-2xl transition-all duration-200 ${
                isActive ? 'text-brand' : 'text-muted hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                </span>
                <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-brand' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
