import type { KubbEvent, Side } from '../../types';
import { deriveKubbMatches } from '../../lib/derive';
import type { KubbMatchId } from '../../lib/kubb-mutations';
import { KubbMatchBox } from './KubbMatchBox';

interface Props {
  event: KubbEvent;
  onWinner: (match: KubbMatchId, side: Side | null) => void;
}

export function Fixtures({ event, onWinner }: Props) {
  const m = deriveKubbMatches(event);

  return (
    <section className="rounded-2xl border border-line bg-white p-3 shadow-sm">
      <header className="mb-3">
        <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-sub">
          Fixtures
        </h3>
      </header>
      <div className="space-y-2">
        <KubbMatchBox
          label="SF1"
          home={{ team: m.sf1.home, placeholder: 'TBC' }}
          away={{ team: m.sf1.away, placeholder: 'TBC' }}
          winner={m.sf1.winner}
          teams={event.teams}
          unavailable={new Set()}
          onWinnerChange={(s) => onWinner('sf1', s)}
        />
        <KubbMatchBox
          label="SF2"
          home={{ team: m.sf2.home, placeholder: 'TBC' }}
          away={{ team: m.sf2.away, placeholder: 'TBC' }}
          winner={m.sf2.winner}
          teams={event.teams}
          unavailable={new Set()}
          onWinnerChange={(s) => onWinner('sf2', s)}
        />
        <KubbMatchBox
          label="Final"
          home={{ team: m.final.home, placeholder: 'SF1 winner' }}
          away={{ team: m.final.away, placeholder: 'SF2 winner' }}
          winner={m.final.winner}
          teams={event.teams}
          unavailable={new Set()}
          onWinnerChange={(s) => onWinner('final', s)}
        />
      </div>
    </section>
  );
}
