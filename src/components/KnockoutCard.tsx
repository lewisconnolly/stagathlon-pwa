import type { Athlete, FifaKnockoutScore, KnockoutPairing, KnockoutSide } from '../types';
import { ScoreInput } from './ScoreInput';
import { decideKnockout } from '../lib/derive';
import { useAdminStore } from '../store/admin';

interface Props {
  title: string;
  pairing: KnockoutPairing | null;
  score: FifaKnockoutScore;
  athletes: Athlete[];
  onChange: (next: FifaKnockoutScore) => void;
  awaitingMessage: string;
}

export function KnockoutCard({ title, pairing, score, athletes, onChange, awaitingMessage }: Props) {
  const isAdmin = useAdminStore((s) => s.isAdmin);
  const nameOf = (id: string) => athletes.find((a) => a.id === id)?.name ?? id;

  const togglePens = (side: KnockoutSide, checked: boolean) => {
    if (checked) onChange({ ...score, wonOnPens: side });
    else if (score.wonOnPens === side) onChange({ ...score, wonOnPens: null });
  };

  const winner = decideKnockout(score);

  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <header className="border-b border-line px-4 py-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-sub">{title}</h3>
      </header>
      {pairing ? (
        <div className="space-y-2 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 text-right text-base font-semibold">
              {nameOf(pairing.home)}
              {winner === 'home' ? ' 👑' : ''}
            </div>
            <ScoreInput
              value={score.homeGoals}
              ariaLabel={`${title} ${nameOf(pairing.home)} goals`}
              onCommit={(homeGoals) => onChange({ ...score, homeGoals })}
            />
            <span className="text-xs text-slate-400">v</span>
            <ScoreInput
              value={score.awayGoals}
              ariaLabel={`${title} ${nameOf(pairing.away)} goals`}
              onCommit={(awayGoals) => onChange({ ...score, awayGoals })}
            />
            <div className="flex-1 text-left text-base font-semibold">
              {winner === 'away' ? '👑 ' : ''}
              {nameOf(pairing.away)}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-1 justify-end">
              <PensCheckbox
                ariaLabel={`${nameOf(pairing.home)} won on pens`}
                checked={score.wonOnPens === 'home'}
                disabled={!isAdmin}
                onChange={(c) => togglePens('home', c)}
              />
            </div>
            <div className="flex flex-1 justify-start">
              <PensCheckbox
                ariaLabel={`${nameOf(pairing.away)} won on pens`}
                checked={score.wonOnPens === 'away'}
                disabled={!isAdmin}
                onChange={(c) => togglePens('away', c)}
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="px-4 py-4 text-sm italic text-sub">{awaitingMessage}</p>
      )}
    </section>
  );
}

function PensCheckbox({
  ariaLabel,
  checked,
  disabled,
  onChange
}: {
  ariaLabel: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={[
        'inline-flex items-center gap-1.5 text-xs',
        disabled ? 'cursor-default text-slate-400' : 'cursor-pointer text-sub'
      ].join(' ')}
    >
      <input
        type="checkbox"
        aria-label={ariaLabel}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-ink"
      />
      Won on pens
    </label>
  );
}
