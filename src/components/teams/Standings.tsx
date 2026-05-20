import type { TeamEvent, TeamIndex, TeamStandings } from '../../types';
import { useAdminStore } from '../../store/admin';

type Position = keyof TeamStandings;

const ROWS: { key: Position; label: string }[] = [
  { key: 'first', label: '1st' },
  { key: 'second', label: '2nd' },
  { key: 'third', label: '3rd' }
];

interface Props {
  event: TeamEvent;
  onChange: (position: Position, teamIdx: TeamIndex | null) => void;
}

export function Standings({ event, onChange }: Props) {
  const isAdmin = useAdminStore((s) => s.isAdmin);

  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <header className="border-b border-line px-4 py-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-sub">Standings</h3>
      </header>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-sub">
          <tr>
            <th className="px-4 py-2 text-left">Team</th>
            <th className="w-16 px-3 py-2 text-right">Position</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ key, label }) => {
            const currentIdx = event.standings[key];
            return (
              <tr key={key} className="border-t border-line">
                <td className="px-4 py-1.5">
                  {isAdmin ? (
                    <select
                      value={currentIdx === null ? '' : String(currentIdx)}
                      onChange={(e) =>
                        onChange(
                          key,
                          e.target.value === '' ? null : (Number(e.target.value) as TeamIndex)
                        )
                      }
                      className={[
                        'w-full max-w-[12rem] cursor-pointer rounded-md border border-line bg-white px-2 py-1 text-sm font-medium shadow-sm focus:border-ink focus:outline-none',
                        currentIdx === null ? 'italic text-slate-400' : ''
                      ].join(' ')}
                    >
                      <option value="">+ Choose team</option>
                      {event.teams.map((team, i) => {
                        const idx = i as TeamIndex;
                        const inPosition = ROWS.find(
                          (r) => r.key !== key && event.standings[r.key] === idx
                        );
                        return (
                          <option key={i} value={i} disabled={!!inPosition}>
                            {team.name}
                            {inPosition ? ` (already ${inPosition.label})` : ''}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <span
                      className={[
                        'text-sm font-medium',
                        currentIdx === null ? 'italic text-slate-400' : ''
                      ].join(' ')}
                    >
                      {currentIdx === null ? '—' : event.teams[currentIdx].name}
                    </span>
                  )}
                </td>
                <td className="px-3 py-1.5 text-right font-semibold text-sub">{label}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
