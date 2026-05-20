import type { Athlete, AthleteId, PoolEvent, Side } from '../../types';
import { derivePoolMatches } from '../../lib/derive';
import { MatchBox } from './MatchBox';
import { useAdminStore } from '../../store/admin';

interface Props {
  pool: PoolEvent;
  athletes: Athlete[];
  onQfSlot: (qf: 'qf1' | 'qf2' | 'qf3', side: Side, id: AthleteId | null) => void;
  onBye: (id: AthleteId | null) => void;
  onWinner: (
    match: 'qf1' | 'qf2' | 'qf3' | 'sf1' | 'sf2' | 'final' | 'thirdPlace',
    side: Side | null
  ) => void;
}

export function Bracket({ pool, athletes, onQfSlot, onBye, onWinner }: Props) {
  const m = derivePoolMatches(pool);
  const unavailable = new Set<AthleteId>(
    [
      pool.qf1.home,
      pool.qf1.away,
      pool.qf2.home,
      pool.qf2.away,
      pool.qf3.home,
      pool.qf3.away,
      pool.byePlayer
    ].filter((id): id is AthleteId => id !== null)
  );

  return (
    <section className="rounded-2xl border border-line bg-white p-3 shadow-sm">
      <header className="mb-3">
        <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-sub">Bracket</h3>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {/* Left column: QF1 + QF2 */}
        <div className="flex min-w-0 flex-col justify-between gap-3">
          <MatchBox
            label="QF1"
            home={{ player: pool.qf1.home, onChange: (id) => onQfSlot('qf1', 'home', id) }}
            away={{ player: pool.qf1.away, onChange: (id) => onQfSlot('qf1', 'away', id) }}
            winner={pool.qf1.winner}
            athletes={athletes}
            unavailable={unavailable}
            onWinnerChange={(s) => onWinner('qf1', s)}
            size="compact"
          />
          <MatchBox
            label="QF2"
            home={{ player: pool.qf2.home, onChange: (id) => onQfSlot('qf2', 'home', id) }}
            away={{ player: pool.qf2.away, onChange: (id) => onQfSlot('qf2', 'away', id) }}
            winner={pool.qf2.winner}
            athletes={athletes}
            unavailable={unavailable}
            onWinnerChange={(s) => onWinner('qf2', s)}
            size="compact"
          />
        </div>

        {/* Middle column: SF1, FINAL, SF2 */}
        <div className="flex min-w-0 flex-col justify-center gap-2">
          <MatchBox
            label="SF1"
            home={{ player: m.sf1.home, placeholder: 'QF1 winner' }}
            away={{ player: m.sf1.away, placeholder: 'QF2 winner' }}
            winner={m.sf1.winner}
            athletes={athletes}
            unavailable={unavailable}
            onWinnerChange={(s) => onWinner('sf1', s)}
            size="compact"
          />
          <MatchBox
            label="Final"
            home={{ player: m.final.home, placeholder: 'SF1 winner' }}
            away={{ player: m.final.away, placeholder: 'SF2 winner' }}
            winner={m.final.winner}
            athletes={athletes}
            unavailable={unavailable}
            onWinnerChange={(s) => onWinner('final', s)}
            size="compact"
          />
          <MatchBox
            label="SF2"
            home={{ player: m.sf2.home, placeholder: 'QF3 winner' }}
            away={{ player: m.sf2.away, placeholder: 'Bye' }}
            winner={m.sf2.winner}
            athletes={athletes}
            unavailable={unavailable}
            onWinnerChange={(s) => onWinner('sf2', s)}
            size="compact"
          />
        </div>

        {/* Right column: QF3 + BYE */}
        <div className="flex min-w-0 flex-col justify-between gap-3">
          <MatchBox
            label="QF3"
            home={{ player: pool.qf3.home, onChange: (id) => onQfSlot('qf3', 'home', id) }}
            away={{ player: pool.qf3.away, onChange: (id) => onQfSlot('qf3', 'away', id) }}
            winner={pool.qf3.winner}
            athletes={athletes}
            unavailable={unavailable}
            onWinnerChange={(s) => onWinner('qf3', s)}
            size="compact"
          />
          <ByeBox
            byePlayer={pool.byePlayer}
            athletes={athletes}
            unavailable={unavailable}
            onChange={onBye}
          />
        </div>
      </div>

      <div className="mt-3">
        <MatchBox
          label="3rd place play-off"
          home={{ player: m.thirdPlace.home, placeholder: 'SF1 loser' }}
          away={{ player: m.thirdPlace.away, placeholder: 'SF2 loser' }}
          winner={m.thirdPlace.winner}
          athletes={athletes}
          unavailable={unavailable}
          onWinnerChange={(s) => onWinner('thirdPlace', s)}
        />
      </div>
    </section>
  );
}

function ByeBox({
  byePlayer,
  athletes,
  unavailable,
  onChange
}: {
  byePlayer: AthleteId | null;
  athletes: Athlete[];
  unavailable: Set<AthleteId>;
  onChange: (id: AthleteId | null) => void;
}) {
  const isAdmin = useAdminStore((s) => s.isAdmin);
  const nameOf = (id: AthleteId) => athletes.find((a) => a.id === id)?.name ?? id;

  return (
    <section className="min-w-0 rounded-xl border border-line bg-white shadow-sm">
      <header className="border-b border-line px-3 py-1">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-sub">Bye</h4>
      </header>
      <div className="px-2 py-1">
        {isAdmin ? (
          <select
            value={byePlayer ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? null : (e.target.value as AthleteId))}
            className={[
              'min-w-0 w-full cursor-pointer truncate rounded-md border border-line bg-white px-1.5 py-1 text-xs font-medium shadow-sm focus:border-ink focus:outline-none',
              byePlayer ? '' : 'italic text-slate-400'
            ].join(' ')}
          >
            <option value="">+ Add player</option>
            {athletes.map((a) => {
              const taken = unavailable.has(a.id) && a.id !== byePlayer;
              return (
                <option key={a.id} value={a.id} disabled={taken}>
                  {a.name}
                  {taken ? ' (in other slot)' : ''}
                </option>
              );
            })}
          </select>
        ) : (
          <span
            className={['truncate text-xs font-medium', byePlayer ? '' : 'italic text-slate-400'].join(' ')}
          >
            {byePlayer ? nameOf(byePlayer) : '—'}
          </span>
        )}
      </div>
    </section>
  );
}
