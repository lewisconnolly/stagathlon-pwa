import type { AthleteId, ChallengesEvent } from '../types';

export function addChallengePoints(
  event: ChallengesEvent,
  athleteId: AthleteId,
  delta: number
): ChallengesEvent {
  const current = event.points[athleteId] ?? 0;
  return {
    ...event,
    points: { ...event.points, [athleteId]: current + delta }
  };
}
