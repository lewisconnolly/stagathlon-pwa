import type { Competition, EventId, LeaderboardRow } from '../../types';
import { EVENTS } from '../config';
import { fifaPoints } from './fifa';
import { ensurePoolShape, poolPoints } from './pool';
import { ensureTeamEventShape, teamPoints } from './teams';
import { challengesPoints, ensureChallengesShape } from './challenges';

const EVENT_IDS: EventId[] = EVENTS.map((e) => e.id);

export function leaderboard(competition: Competition): LeaderboardRow[] {
  const fifaPts = fifaPoints(competition.athletes, competition.events.fifa);
  const poolPts = poolPoints(competition.athletes, ensurePoolShape(competition.events.pool));
  const footgolfPts = teamPoints(
    competition.athletes,
    ensureTeamEventShape(competition.events.footgolf)
  );
  const frisbeegolfPts = teamPoints(
    competition.athletes,
    ensureTeamEventShape(competition.events.frisbeegolf)
  );
  const aarticulatePts = teamPoints(
    competition.athletes,
    ensureTeamEventShape(competition.events.aarticulate)
  );
  const challengesPts = challengesPoints(
    competition.athletes,
    ensureChallengesShape(competition.events.challenges)
  );

  const rows: LeaderboardRow[] = competition.athletes.map((a) => {
    const perEvent = Object.fromEntries(EVENT_IDS.map((id) => [id, 0])) as Record<EventId, number>;
    perEvent.fifa = fifaPts.get(a.id) ?? 0;
    perEvent.pool = poolPts.get(a.id) ?? 0;
    perEvent.footgolf = footgolfPts.get(a.id) ?? 0;
    perEvent.frisbeegolf = frisbeegolfPts.get(a.id) ?? 0;
    perEvent.aarticulate = aarticulatePts.get(a.id) ?? 0;
    perEvent.challenges = challengesPts.get(a.id) ?? 0;
    const total = EVENT_IDS.reduce((sum, id) => sum + perEvent[id], 0);
    return { athleteId: a.id, perEvent, total };
  });

  rows.sort((x, y) => y.total - x.total);
  return rows;
}
