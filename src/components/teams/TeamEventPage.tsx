import { useMemo } from 'react';
import { useCompetition } from '../../lib/competition';
import { ensureTeamEventShape, teamContributions } from '../../lib/derive';
import { setStanding, setTeamMember, setTeamName } from '../../lib/team-mutations';
import { LeaderboardPtsTable } from '../LeaderboardPtsTable';
import { Standings } from './Standings';
import { Teams } from './Teams';
import type { AthleteId, TeamEvent, TeamIndex, TeamStandings } from '../../types';

interface Props {
  rawEvent: unknown;
  save: (state: TeamEvent) => Promise<void>;
}

export function TeamEventPage({ rawEvent, save }: Props) {
  const { status, data } = useCompetition();
  const event = useMemo(() => ensureTeamEventShape(rawEvent), [rawEvent]);
  const contributions = useMemo(
    () => (data ? teamContributions(data.athletes, event) : null),
    [data, event]
  );

  if (status === 'loading') {
    return <p className="py-6 text-sm text-sub">Loading…</p>;
  }
  if (!data || !contributions) return null;

  const onNameChange = (teamIdx: TeamIndex, name: string) => {
    void save(setTeamName(event, teamIdx, name));
  };
  const onMemberChange = (teamIdx: TeamIndex, memberIdx: number, athleteId: AthleteId | null) => {
    void save(setTeamMember(event, teamIdx, memberIdx, athleteId));
  };
  const onStandingChange = (position: keyof TeamStandings, teamIdx: TeamIndex | null) => {
    void save(setStanding(event, position, teamIdx));
  };

  return (
    <div className="space-y-5">
      <LeaderboardPtsTable athletes={data.athletes} contributions={contributions} />
      <Standings event={event} onChange={onStandingChange} />
      <Teams
        event={event}
        athletes={data.athletes}
        onNameChange={onNameChange}
        onMemberChange={onMemberChange}
      />
    </div>
  );
}
