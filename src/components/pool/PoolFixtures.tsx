import type { Athlete, PoolEvent, Side } from '../../types';
import { derivePoolMatches } from '../../lib/derive';
import { MatchBox } from './MatchBox';

interface Props {
  pool: PoolEvent;
  athletes: Athlete[];
  onWinner: (
    match: 'qf1' | 'qf2' | 'qf3' | 'sf1' | 'sf2' | 'final' | 'thirdPlace',
    side: Side | null
  ) => void;
}

export function PoolFixtures({ pool, athletes, onWinner }: Props) {
  const m = derivePoolMatches(pool);
  const empty = new Set<string>();

  const rows: Array<{
    id: 'qf1' | 'qf2' | 'qf3' | 'sf1' | 'sf2' | 'thirdPlace' | 'final';
    label: string;
    home: typeof m.qf1;
    homePlaceholder?: string;
    awayPlaceholder?: string;
  }> = [
    { id: 'qf1', label: 'QF1', home: m.qf1 },
    { id: 'qf2', label: 'QF2', home: m.qf2 },
    { id: 'qf3', label: 'QF3', home: m.qf3 },
    { id: 'sf1', label: 'SF1', home: m.sf1, homePlaceholder: 'QF1 winner', awayPlaceholder: 'QF2 winner' },
    { id: 'sf2', label: 'SF2', home: m.sf2, homePlaceholder: 'QF3 winner', awayPlaceholder: 'Bye' },
    { id: 'thirdPlace', label: '3rd place', home: m.thirdPlace, homePlaceholder: 'SF1 loser', awayPlaceholder: 'SF2 loser' },
    { id: 'final', label: 'Final', home: m.final, homePlaceholder: 'SF1 winner', awayPlaceholder: 'SF2 winner' }
  ];

  return (
    <section className="space-y-2">
      <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-sub">Fixtures</h3>
      {rows.map((row) => (
        <MatchBox
          key={row.id}
          label={row.label}
          home={{ player: row.home.home, placeholder: row.homePlaceholder }}
          away={{ player: row.home.away, placeholder: row.awayPlaceholder }}
          winner={row.home.winner}
          athletes={athletes}
          unavailable={empty}
          onWinnerChange={(s) => onWinner(row.id, s)}
        />
      ))}
    </section>
  );
}
