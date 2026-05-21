import type { KubbEvent, KubbTeamIndex, Side } from '../../types';
import { useAdminStore } from '../../store/admin';

interface TeamSlotConfig {
  team: KubbTeamIndex | null;
  placeholder?: string;
  onChange?: (next: KubbTeamIndex | null) => void;
}

interface Props {
  label: string;
  home: TeamSlotConfig;
  away: TeamSlotConfig;
  winner: Side | null;
  teams: KubbEvent['teams'];
  unavailable: Set<KubbTeamIndex>;
  onWinnerChange: (side: Side | null) => void;
  size?: 'normal' | 'compact';
}

export function KubbMatchBox({
  label,
  home,
  away,
  winner,
  teams,
  unavailable,
  onWinnerChange,
  size = 'normal'
}: Props) {
  const isAdmin = useAdminStore((s) => s.isAdmin);

  const toggleWinner = (side: Side) => {
    onWinnerChange(winner === side ? null : side);
  };

  return (
    <section className="min-w-0 rounded-xl border border-line bg-white shadow-sm">
      <header className="border-b border-line px-3 py-1">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-sub">{label}</h4>
      </header>
      <div className="divide-y divide-line">
        <TeamRow
          slot={home}
          isWinner={winner === 'home'}
          teams={teams}
          unavailable={unavailable}
          isAdmin={isAdmin}
          onToggleWinner={() => toggleWinner('home')}
          size={size}
        />
        <TeamRow
          slot={away}
          isWinner={winner === 'away'}
          teams={teams}
          unavailable={unavailable}
          isAdmin={isAdmin}
          onToggleWinner={() => toggleWinner('away')}
          size={size}
        />
      </div>
    </section>
  );
}

function TeamRow({
  slot,
  isWinner,
  teams,
  unavailable,
  isAdmin,
  onToggleWinner,
  size
}: {
  slot: TeamSlotConfig;
  isWinner: boolean;
  teams: KubbEvent['teams'];
  unavailable: Set<KubbTeamIndex>;
  isAdmin: boolean;
  onToggleWinner: () => void;
  size: 'normal' | 'compact';
}) {
  const padding = size === 'compact' ? 'px-2 py-1' : 'px-3 py-1.5';
  const text = size === 'compact' ? 'text-xs' : 'text-sm';
  const canMarkWinner = isAdmin && slot.team !== null;

  return (
    <div className={['flex min-w-0 items-center justify-between gap-2', padding].join(' ')}>
      <TeamDisplay
        slot={slot}
        teams={teams}
        unavailable={unavailable}
        isAdmin={isAdmin}
        textSize={text}
      />
      <button
        type="button"
        onClick={onToggleWinner}
        disabled={!canMarkWinner}
        aria-label="Mark as winner"
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

function TeamDisplay({
  slot,
  teams,
  unavailable,
  isAdmin,
  textSize
}: {
  slot: TeamSlotConfig;
  teams: KubbEvent['teams'];
  unavailable: Set<KubbTeamIndex>;
  isAdmin: boolean;
  textSize: string;
}) {
  const configurable = slot.onChange !== undefined;
  const nameOf = (idx: KubbTeamIndex) => teams[idx].name;

  if (!configurable) {
    const name = slot.team !== null ? nameOf(slot.team) : slot.placeholder ?? '—';
    return (
      <span
        className={[
          'flex-1 truncate font-medium',
          textSize,
          slot.team !== null ? '' : 'italic text-slate-400'
        ].join(' ')}
      >
        {name}
      </span>
    );
  }

  if (!isAdmin) {
    return (
      <span
        className={[
          'flex-1 truncate font-medium',
          textSize,
          slot.team !== null ? '' : 'italic text-slate-400'
        ].join(' ')}
      >
        {slot.team !== null ? nameOf(slot.team) : '—'}
      </span>
    );
  }

  return (
    <select
      value={slot.team === null ? '' : String(slot.team)}
      onChange={(e) =>
        slot.onChange!(e.target.value === '' ? null : (Number(e.target.value) as KubbTeamIndex))
      }
      className={[
        'min-w-0 flex-1 cursor-pointer truncate rounded-md border border-line bg-white px-1.5 py-1 font-medium shadow-sm focus:border-ink focus:outline-none',
        textSize,
        slot.team !== null ? '' : 'italic text-slate-400'
      ].join(' ')}
    >
      <option value="">+ Add team</option>
      {teams.map((team, i) => {
        const idx = i as KubbTeamIndex;
        const taken = unavailable.has(idx) && idx !== slot.team;
        return (
          <option key={i} value={i} disabled={taken}>
            {team.name}
            {taken ? ' (in other slot)' : ''}
          </option>
        );
      })}
    </select>
  );
}
