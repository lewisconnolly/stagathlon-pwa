import type { Athlete, AthleteId, ChallengesEvent } from '../../types';
import { useAdminStore } from '../../store/admin';
import challengesData from '../../challenges.json';

interface ChallengeEntry {
  key: string;
  name: string;
  points: number;
  challenge: string;
}

const ALL_CHALLENGES = challengesData.challenges as ChallengeEntry[];

const pointsPerInstanceFor = (name: string): number | null => {
  const c = ALL_CHALLENGES.find((c) => c.name === name);
  return c ? c.points : null;
};

interface Props {
  athletes: Athlete[];
  event: ChallengesEvent;
  onAdjust: (athleteId: AthleteId, delta: number) => void;
}

export function PointsTable({ athletes, event, onAdjust }: Props) {
  const isAdmin = useAdminStore((s) => s.isAdmin);

  // Sort by points desc; pending (no entry) is treated as 0 for sort purposes.
  const sorted = [...athletes].sort((x, y) => {
    const xv = event.points[x.id] ?? 0;
    const yv = event.points[y.id] ?? 0;
    return yv - xv;
  });

  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <header className="border-b border-line px-4 py-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-sub">Points</h3>
      </header>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-sub">
          <tr>
            {isAdmin && <th className="w-12 px-2 py-2 text-center" title="Points per instance">PPI</th>}
            <th className="px-3 py-2 text-left">Athlete</th>
            <th className="px-3 py-2 text-right">Pts</th>
            {isAdmin && <th className="w-24 px-2 py-2 text-right" />}
          </tr>
        </thead>
        <tbody>
          {sorted.map((a) => {
            const pts = event.points[a.id];
            const ppi = pointsPerInstanceFor(a.name);
            return (
              <tr key={a.id} className="border-t border-line tabular-nums">
                {isAdmin && (
                  <td className="px-2 py-1.5 text-center text-xs text-sub">
                    {ppi !== null ? `+${ppi}` : '—'}
                  </td>
                )}
                <td className="px-3 py-1.5 font-medium">{a.name}</td>
                <td className="px-3 py-1.5 text-right font-semibold">
                  {typeof pts === 'number' ? pts : '—'}
                </td>
                {isAdmin && (
                  <td className="px-2 py-1.5 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        type="button"
                        onClick={() => onAdjust(a.id, -1)}
                        aria-label={`Subtract 1 from ${a.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-red-600 bg-red-600 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        onClick={() => onAdjust(a.id, +1)}
                        aria-label={`Add 1 to ${a.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-green-600 bg-green-600 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
                      >
                        +
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
