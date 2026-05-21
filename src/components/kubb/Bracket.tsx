import type { KubbEvent, KubbTeamIndex, Side } from '../../types';
import { deriveKubbMatches } from '../../lib/derive';
import type { KubbMatchId, SfId } from '../../lib/kubb-mutations';
import { KubbMatchBox } from './KubbMatchBox';

interface Props {
  event: KubbEvent;
  onSfSlot: (sf: SfId, side: Side, team: KubbTeamIndex | null) => void;
  onWinner: (match: KubbMatchId, side: Side | null) => void;
}

export function Bracket({ event, onSfSlot, onWinner }: Props) {
  const m = deriveKubbMatches(event);
  const unavailable = new Set<KubbTeamIndex>(
    [event.sf1.home, event.sf1.away, event.sf2.home, event.sf2.away].filter(
      (v): v is KubbTeamIndex => v !== null
    )
  );

  return (
    <section className="rounded-2xl border border-line bg-white p-3 shadow-sm">
      <header className="mb-3">
        <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-sub">
          Bracket
        </h3>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {/* Left: SF1 */}
        <div className="flex min-w-0 flex-col justify-center">
          <KubbMatchBox
            label="SF1"
            home={{ team: event.sf1.home, onChange: (id) => onSfSlot('sf1', 'home', id) }}
            away={{ team: event.sf1.away, onChange: (id) => onSfSlot('sf1', 'away', id) }}
            winner={event.sf1.winner}
            teams={event.teams}
            unavailable={unavailable}
            onWinnerChange={(s) => onWinner('sf1', s)}
            size="compact"
          />
        </div>

        {/* Middle: FINAL (derived) */}
        <div className="flex min-w-0 flex-col justify-center">
          <KubbMatchBox
            label="Final"
            home={{ team: m.final.home, placeholder: 'SF1 winner' }}
            away={{ team: m.final.away, placeholder: 'SF2 winner' }}
            winner={m.final.winner}
            teams={event.teams}
            unavailable={unavailable}
            onWinnerChange={(s) => onWinner('final', s)}
            size="compact"
          />
        </div>

        {/* Right: SF2 */}
        <div className="flex min-w-0 flex-col justify-center">
          <KubbMatchBox
            label="SF2"
            home={{ team: event.sf2.home, onChange: (id) => onSfSlot('sf2', 'home', id) }}
            away={{ team: event.sf2.away, onChange: (id) => onSfSlot('sf2', 'away', id) }}
            winner={event.sf2.winner}
            teams={event.teams}
            unavailable={unavailable}
            onWinnerChange={(s) => onWinner('sf2', s)}
            size="compact"
          />
        </div>
      </div>
    </section>
  );
}
