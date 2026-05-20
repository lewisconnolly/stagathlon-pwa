import type { Athlete, AthleteId, LeagueRow, LeagueSlot } from '../types';
import { useAdminStore } from '../store/admin';

interface Props {
  title: string;
  slots: LeagueSlot[];
  rows: LeagueRow[];
  athletes: Athlete[];
  unavailable: Set<AthleteId>;
  onSlotChange: (slotIdx: number, newId: AthleteId | null) => void;
}

export function LeagueTable({ title, slots, rows, athletes, unavailable, onSlotChange }: Props) {
  const isAdmin = useAdminStore((s) => s.isAdmin);
  const rowByAthlete = new Map(rows.map((r) => [r.athleteId, r]));

  const filledSlots = slots
    .map((id, idx) => ({ idx, id }))
    .filter((s): s is { idx: number; id: AthleteId } => s.id !== null)
    .sort((a, b) => {
      const ra = rowByAthlete.get(a.id);
      const rb = rowByAthlete.get(b.id);
      if (!ra || !rb) return 0;
      if (ra.pts !== rb.pts) return rb.pts - ra.pts;
      if (ra.gd !== rb.gd) return rb.gd - ra.gd;
      if (ra.gf !== rb.gf) return rb.gf - ra.gf;
      return 0;
    });
  const emptySlots = slots
    .map((id, idx) => ({ idx, id }))
    .filter((s) => s.id === null);

  const display = [...filledSlots, ...emptySlots];
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
            {display.map(({ idx, id }) => {
              const row = id ? rowByAthlete.get(id) : null;
              return (
                <tr
                  key={idx}
                  className={[
                    'border-t border-line tabular-nums',
                    row?.tiebreakNeeded ? 'bg-amber-50' : ''
                  ].join(' ')}
                >
                  <td className="px-3 py-1.5">
                    <PlayerCell
                      slotIdx={idx}
                      currentId={id}
                      athletes={athletes}
                      unavailable={unavailable}
                      isAdmin={isAdmin}
                      onChange={(next) => onSlotChange(idx, next)}
                    />
                  </td>
                  <td className="px-1 py-2 text-center">{row?.w ?? '—'}</td>
                  <td className="px-1 py-2 text-center">{row?.d ?? '—'}</td>
                  <td className="px-1 py-2 text-center">{row?.l ?? '—'}</td>
                  <td className="px-1 py-2 text-center">{row?.gf ?? '—'}</td>
                  <td className="px-1 py-2 text-center">{row?.ga ?? '—'}</td>
                  <td className="px-1 py-2 text-center">{row?.gd ?? '—'}</td>
                  <td className="px-2 py-2 text-right font-semibold">{row?.pts ?? '—'}</td>
                </tr>
              );
            })}
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

function PlayerCell({
  slotIdx: _slotIdx,
  currentId,
  athletes,
  unavailable,
  isAdmin,
  onChange
}: {
  slotIdx: number;
  currentId: AthleteId | null;
  athletes: Athlete[];
  unavailable: Set<AthleteId>;
  isAdmin: boolean;
  onChange: (next: AthleteId | null) => void;
}) {
  const nameOf = (id: AthleteId) => athletes.find((a) => a.id === id)?.name ?? id;

  if (!isAdmin) {
    return (
      <span className={['text-sm font-medium', currentId ? '' : 'italic text-slate-400'].join(' ')}>
        {currentId ? nameOf(currentId) : '—'}
      </span>
    );
  }

  return (
    <select
      value={currentId ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? null : (e.target.value as AthleteId))}
      className={[
        'w-full max-w-[10rem] cursor-pointer rounded-md border border-line bg-white px-2 py-1 text-sm font-medium shadow-sm focus:border-ink focus:outline-none',
        currentId ? '' : 'italic text-slate-400'
      ].join(' ')}
    >
      <option value="">+ Add player</option>
      {athletes.map((a) => {
        const taken = unavailable.has(a.id) && a.id !== currentId;
        return (
          <option key={a.id} value={a.id} disabled={taken}>
            {a.name}
            {taken ? ' (in other league)' : ''}
          </option>
        );
      })}
    </select>
  );
}
