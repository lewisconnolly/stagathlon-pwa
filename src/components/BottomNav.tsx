import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition',
    isActive ? 'text-ink' : 'text-slate-400'
  ].join(' ');

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md border-t border-line bg-white/95 backdrop-blur">
      <NavLink to="/" end className={linkClass}>
        <span aria-hidden className="text-lg">🏆</span>
        Leaderboard
      </NavLink>
      <NavLink to="/events" className={linkClass}>
        <span aria-hidden className="text-lg">🎯</span>
        Events
      </NavLink>
    </nav>
  );
}
