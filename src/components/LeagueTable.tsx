import type { Athlete, LeagueRow } from '../types';

interface Props {
  title: string;
  rows: LeagueRow[];
  athletes: Athlete[];
}

export function LeagueTable({ title, rows, athletes }: Props) {
  const nameOf = (id: string) => athletes.find((a) => a.id === id)?.name ?? id;
  const hasTiebreak = rows.some((r) => r.tiebreakNeeded);

  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <header className="border-b border-line px-4 py-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-sub">{title}</h3>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-sub">
            <tr>
              <th className="px-3 py-2 text-left">Player</th>
              <th className="px-1 py-2 text-center">W</th>
              <th className="px-1 py-2 text-center">D</th>
              <th className="px-1 py-2 text-center">L</th>
              <th className="px-1 py-2 text-center">GF</th>
              <th className="px-1 py-2 text-center">GA</th>
              <th className="px-1 py-2 text-center">GD</th>
              <th className="px-2 py-2 text-right">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.athleteId}
                className={[
                  'border-t border-line tabular-nums',
                  r.tiebreakNeeded ? 'bg-amber-50' : ''
                ].join(' ')}
              >
                <td className="px-3 py-2 font-medium">{nameOf(r.athleteId)}</td>
                <td className="px-1 py-2 text-center">{r.w}</td>
                <td className="px-1 py-2 text-center">{r.d}</td>
                <td className="px-1 py-2 text-center">{r.l}</td>
                <td className="px-1 py-2 text-center">{r.gf}</td>
                <td className="px-1 py-2 text-center">{r.ga}</td>
                <td className="px-1 py-2 text-center">{r.gd}</td>
                <td className="px-2 py-2 text-right font-semibold">{r.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasTiebreak && (
        <p className="border-t border-line bg-amber-50 px-4 py-2 text-xs text-amber-800">
          Tiebreak needed — settle with a Thumb War, then adjust GF in a fixture to reflect the winner.
        </p>
      )}
    </section>
  );
}
