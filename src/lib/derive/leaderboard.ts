import type { Competition, EventId, LeaderboardRow } from '../../types';
import { EVENTS } from '../config';
import { fifaPoints } from './fifa';
import { ensurePoolShape, poolPoints } from './pool';

const EVENT_IDS: EventId[] = EVENTS.map((e) => e.id);

export function leaderboard(competition: Competition): LeaderboardRow[] {
  const fifaPts = fifaPoints(competition.athletes, competition.events.fifa);
  const poolPts = poolPoints(competition.athletes, ensurePoolShape(competition.events.pool));

  const rows: LeaderboardRow[] = competition.athletes.map((a) => {
    const perEvent = Object.fromEntries(EVENT_IDS.map((id) => [id, 0])) as Record<EventId, number>;
    perEvent.fifa = fifaPts.get(a.id) ?? 0;
    perEvent.pool = poolPts.get(a.id) ?? 0;
    const total = EVENT_IDS.reduce((sum, id) => sum + perEvent[id], 0);
    return { athleteId: a.id, perEvent, total };
  });

  rows.sort((x, y) => y.total - x.total);
  return rows;
}
