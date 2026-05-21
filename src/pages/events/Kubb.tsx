import { useMemo } from 'react';
import { setKubb, useCompetition } from '../../lib/competition';
import { ensureKubbShape, kubbContributions } from '../../lib/derive';
import {
  setKubbMatchWinner,
  setKubbTeamMember,
  setKubbTeamName,
  setSfTeam,
  type KubbMatchId,
  type SfId
} from '../../lib/kubb-mutations';
import { Bracket } from '../../components/kubb/Bracket';
import { Fixtures } from '../../components/kubb/Fixtures';
import { Teams } from '../../components/kubb/Teams';
import { LeaderboardPtsTable } from '../../components/LeaderboardPtsTable';
import type { AthleteId, KubbTeamIndex, Side } from '../../types';

export function Kubb() {
  const { status, data } = useCompetition();

  const event = useMemo(() => (data ? ensureKubbShape(data.events.kubb) : null), [data]);
  const contributions = useMemo(
    () => (data && event ? kubbContributions(data.athletes, event) : null),
    [data, event]
  );

  if (status === 'loading') {
    return <p className="py-6 text-sm text-sub">Loading…</p>;
  }
  if (!data || !event || !contributions) return null;

  const onSfSlot = (sf: SfId, side: Side, team: KubbTeamIndex | null) => {
    void setKubb(setSfTeam(event, sf, side, team));
  };
  const onWinner = (match: KubbMatchId, side: Side | null) => {
    void setKubb(setKubbMatchWinner(event, match, side));
  };
  const onNameChange = (teamIdx: KubbTeamIndex, name: string) => {
    void setKubb(setKubbTeamName(event, teamIdx, name));
  };
  const onMemberChange = (
    teamIdx: KubbTeamIndex,
    memberIdx: number,
    athleteId: AthleteId | null
  ) => {
    void setKubb(setKubbTeamMember(event, teamIdx, memberIdx, athleteId));
  };

  return (
    <div className="space-y-5">
      <LeaderboardPtsTable athletes={data.athletes} contributions={contributions} />
      <Bracket event={event} onSfSlot={onSfSlot} onWinner={onWinner} />
      <Teams
        event={event}
        athletes={data.athletes}
        onNameChange={onNameChange}
        onMemberChange={onMemberChange}
      />
      <Fixtures event={event} onWinner={onWinner} />
    </div>
  );
}
