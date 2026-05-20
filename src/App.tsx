import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { AdminLock } from './components/AdminLock';
import { CompetitionContext, useCompetitionSubscription } from './lib/competition';

const titleFor = (pathname: string): string => {
  if (pathname === '/') return 'Leaderboard';
  if (pathname === '/events') return 'Events';
  return 'Stagathlon';
};

export function App() {
  const state = useCompetitionSubscription();
  const location = useLocation();

  return (
    <CompetitionContext.Provider value={state}>
      <div className="mx-auto flex min-h-full max-w-md flex-col bg-slate-50 pb-24">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-slate-50/90 px-4 py-3 backdrop-blur">
          <h1 className="text-lg font-semibold tracking-tight text-ink">{titleFor(location.pathname)}</h1>
          <AdminLock />
        </header>
        <main className="flex-1 px-4">
          {state.status === 'error' && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              Failed to load competition: {state.error}
            </p>
          )}
          {state.status === 'missing' && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              No competition document found at <code>competition/main</code>. Run{' '}
              <code>npm run seed</code> to create it.
            </p>
          )}
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </CompetitionContext.Provider>
  );
}
