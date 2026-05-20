import type { Athlete, AthleteId, Side } from '../../types';
import { useAdminStore } from '../../store/admin';

interface SlotConfig {
  player: AthleteId | null;
  placeholder?: string;
  onChange?: (next: AthleteId | null) => void;
}

interface Props {
  label: string;
  home: SlotConfig;
  away: SlotConfig;
  winner: Side | null;
  athletes: Athlete[];
  unavailable: Set<AthleteId>;
  onWinnerChange: (side: Side | null) => void;
  size?: 'normal' | 'compact';
}

export function MatchBox({
  label,
  home,
  away,
  winner,
  athletes,
  unavailable,
  onWinnerChange,
  size = 'normal'
}: Props) {
  const isAdmin = useAdminStore((s) => s.isAdmin);

  const toggleWinner = (side: Side) => {
    onWinnerChange(winner === side ? null : side);
  };

  return (
    <section className="rounded-xl border border-line bg-white shadow-sm">
      <header className="border-b border-line px-3 py-1">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-sub">{label}</h4>
      </header>
      <div className="divide-y divide-line">
        <PlayerRow
          slot={home}
          isWinner={winner === 'home'}
          athletes={athletes}
          unavailable={unavailable}
          isAdmin={isAdmin}
          onToggleWinner={() => toggleWinner('home')}
          size={size}
        />
        <PlayerRow
          slot={away}
          isWinner={winner === 'away'}
          athletes={athletes}
          unavailable={unavailable}
          isAdmin={isAdmin}
          onToggleWinner={() => toggleWinner('away')}
          size={size}
        />
      </div>
    </section>
  );
}

function PlayerRow({
  slot,
  isWinner,
  athletes,
  unavailable,
  isAdmin,
  onToggleWinner,
  size
}: {
  slot: SlotConfig;
  isWinner: boolean;
  athletes: Athlete[];
  unavailable: Set<AthleteId>;
  isAdmin: boolean;
  onToggleWinner: () => void;
  size: 'normal' | 'compact';
}) {
  const nameOf = (id: AthleteId) => athletes.find((a) => a.id === id)?.name ?? id;
  const padding = size === 'compact' ? 'px-2 py-1' : 'px-3 py-1.5';
  const text = size === 'compact' ? 'text-xs' : 'text-sm';
  const canMarkWinner = isAdmin && slot.player !== null;

  return (
    <div className={['flex items-center justify-between gap-2', padding].join(' ')}>
      <PlayerDisplay
        slot={slot}
        nameOf={nameOf}
        athletes={athletes}
        unavailable={unavailable}
        isAdmin={isAdmin}
        textSize={text}
      />
      <button
        type="button"
        onClick={onToggleWinner}
        disabled={!canMarkWinner}
        aria-label={`Mark as winner`}
        aria-pressed={isWinner}
        className={[
          'shrink-0 rounded-md px-1.5 text-base leading-none transition',
          isWinner ? 'opacity-100' : 'opacity-30 hover:opacity-60',
          canMarkWinner ? 'cursor-pointer' : 'cursor-default opacity-20'
        ].join(' ')}
      >
        👑
      </button>
    </div>
  );
}

function PlayerDisplay({
  slot,
  nameOf,
  athletes,
  unavailable,
  isAdmin,
  textSize
}: {
  slot: SlotConfig;
  nameOf: (id: AthleteId) => string;
  athletes: Athlete[];
  unavailable: Set<AthleteId>;
  isAdmin: boolean;
  textSize: string;
}) {
  const configurable = slot.onChange !== undefined;

  if (!configurable) {
    const name = slot.player ? nameOf(slot.player) : slot.placeholder ?? '—';
    return (
      <span
        className={['flex-1 truncate font-medium', textSize, slot.player ? '' : 'italic text-slate-400'].join(' ')}
      >
        {name}
      </span>
    );
  }

  if (!isAdmin) {
    return (
      <span
        className={['flex-1 truncate font-medium', textSize, slot.player ? '' : 'italic text-slate-400'].join(' ')}
      >
        {slot.player ? nameOf(slot.player) : '—'}
      </span>
    );
  }

  return (
    <select
      value={slot.player ?? ''}
      onChange={(e) => slot.onChange!(e.target.value === '' ? null : (e.target.value as AthleteId))}
      className={[
        'min-w-0 flex-1 cursor-pointer truncate rounded-md border border-line bg-white px-1.5 py-1 font-medium shadow-sm focus:border-ink focus:outline-none',
        textSize,
        slot.player ? '' : 'italic text-slate-400'
      ].join(' ')}
    >
      <option value="">+ Add player</option>
      {athletes.map((a) => {
        const taken = unavailable.has(a.id) && a.id !== slot.player;
        return (
          <option key={a.id} value={a.id} disabled={taken}>
            {a.name}
            {taken ? ' (in other slot)' : ''}
          </option>
        );
      })}
    </select>
  );
}
