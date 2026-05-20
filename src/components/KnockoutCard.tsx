import type { Athlete, FifaKnockoutScore, KnockoutPairing } from '../types';
import { ScoreInput } from './ScoreInput';

interface Props {
  title: string;
  pairing: KnockoutPairing | null;
  score: FifaKnockoutScore;
  athletes: Athlete[];
  onChange: (next: FifaKnockoutScore) => void;
  awaitingMessage: string;
}

export function KnockoutCard({ title, pairing, score, athletes, onChange, awaitingMessage }: Props) {
  const nameOf = (id: string) => athletes.find((a) => a.id === id)?.name ?? id;

  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <header className="border-b border-line px-4 py-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-sub">{title}</h3>
      </header>
      {pairing ? (
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <div className="flex-1 text-right text-base font-semibold">{nameOf(pairing.home)}</div>
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
          <div className="flex-1 text-left text-base font-semibold">{nameOf(pairing.away)}</div>
        </div>
      ) : (
        <p className="px-4 py-4 text-sm italic text-sub">{awaitingMessage}</p>
      )}
    </section>
  );
}
