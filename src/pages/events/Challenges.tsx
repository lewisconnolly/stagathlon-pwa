import { useMemo } from 'react';
import { setChallenges, useCompetition } from '../../lib/competition';
import { ensureChallengesShape } from '../../lib/derive';
import { addChallengePoints } from '../../lib/challenge-mutations';
import { PointsTable } from '../../components/challenges/PointsTable';
import { UnlockChallenge } from '../../components/challenges/UnlockChallenge';
import { AllChallenges } from '../../components/challenges/AllChallenges';
import type { AthleteId } from '../../types';

export function Challenges() {
  const { status, data } = useCompetition();
  const event = useMemo(
    () => (data ? ensureChallengesShape(data.events.challenges) : null),
    [data]
  );

  if (status === 'loading') {
    return <p className="py-6 text-sm text-sub">Loading…</p>;
  }
  if (!data || !event) return null;

  const onAdjust = (athleteId: AthleteId, delta: number) => {
    void setChallenges(addChallengePoints(event, athleteId, delta));
  };

  return (
    <div className="space-y-5">
      <PointsTable athletes={data.athletes} event={event} onAdjust={onAdjust} />
      <UnlockChallenge />
      <AllChallenges />
    </div>
  );
}
