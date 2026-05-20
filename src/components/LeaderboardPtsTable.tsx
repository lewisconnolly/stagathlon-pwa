import type { Athlete, AthleteId, FifaContribution } from '../types';

interface Props {
  athletes: Athlete[];
  contributions: Map<AthleteId, FifaContribution>;
}

export function LeaderboardPtsTable({ athletes, contributions }: Props) {
  const sorted = [...athletes].sort((a, b) => {
    const ca = contributions.get(a.id);
    const cb = contributions.get(b.id);
    const va = typeof ca === 'number' ? ca : -1;
    const vb = typeof cb === 'number' ? cb : -1;
    if (va !== vb) return vb - va;
    return a.name.localeCompare(b.name);
  });

  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <header className="border-b border-line px-4 py-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-sub">
          Leaderboard pts contribution
        </h3>
      </header>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-sub">
          <tr>
            <th className="px-3 py-2 text-left">Athlete</th>
            <th className="px-3 py-2 text-right">PTS</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((a) => {
            const c = contributions.get(a.id);
            return (
              <tr key={a.id} className="border-t border-line">
                <td className="px-3 py-2 font-medium">{a.name}</td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums">
                  {typeof c === 'number' ? c : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
