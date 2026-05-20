import type { Athlete, FifaFixture } from '../types';
import { ScoreInput } from './ScoreInput';
import { useAdminStore } from '../store/admin';

interface Props {
  fixture: FifaFixture;
  athletes: Athlete[];
  onChange: (next: FifaFixture) => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function FixtureRow({ fixture, athletes, onChange, onMove, canMoveUp, canMoveDown }: Props) {
  const isAdmin = useAdminStore((s) => s.isAdmin);
  const nameOf = (id: string) => athletes.find((a) => a.id === id)?.name ?? id;

  return (
    <div className="flex items-center gap-3 border-t border-line px-3 py-2 first:border-t-0">
      <span className="w-8 shrink-0 text-xs font-medium uppercase text-slate-400">L{fixture.league}</span>
      <div className="flex flex-1 items-center justify-between gap-2">
        <PlayerCell name={nameOf(fixture.home)} align="right" />
        <ScoreInput
          value={fixture.homeGoals}
          ariaLabel={`${nameOf(fixture.home)} goals`}
          onCommit={(homeGoals) => onChange({ ...fixture, homeGoals })}
        />
        <span className="text-xs text-slate-400">v</span>
        <ScoreInput
          value={fixture.awayGoals}
          ariaLabel={`${nameOf(fixture.away)} goals`}
          onCommit={(awayGoals) => onChange({ ...fixture, awayGoals })}
        />
        <PlayerCell name={nameOf(fixture.away)} align="left" />
      </div>
      {isAdmin && (
        <div className="flex shrink-0 flex-col gap-0.5">
          <ReorderButton direction="up" disabled={!canMoveUp} onClick={() => onMove('up')} />
          <ReorderButton direction="down" disabled={!canMoveDown} onClick={() => onMove('down')} />
        </div>
      )}
    </div>
  );
}

function ReorderButton({
  direction,
  disabled,
  onClick
}: {
  direction: 'up' | 'down';
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'up' ? 'Move fixture up' : 'Move fixture down'}
      className="flex h-5 w-5 items-center justify-center rounded border border-line bg-white text-xs leading-none text-sub shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {direction === 'up' ? '▲' : '▼'}
    </button>
  );
}

function PlayerCell({ name, align }: { name: string; align: 'left' | 'right' }) {
  return (
    <span
      className={['flex-1 truncate text-sm font-medium', align === 'right' ? 'text-right' : 'text-left'].join(' ')}
    >
      {name}
    </span>
  );
}
