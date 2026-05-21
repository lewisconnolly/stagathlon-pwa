import type { Athlete, AthleteId, ChallengesEvent, EventContribution } from '../../types';

// Tolerates Firestore docs that still have the old `{ placeholder: true }`
// shape (or partially-missing fields).
export function ensureChallengesShape(raw: unknown): ChallengesEvent {
  const e = (raw as Partial<ChallengesEvent> | null | undefined) ?? {};
  const rawPoints = (e.points ?? {}) as Record<string, unknown>;
  const points: Record<AthleteId, number> = {};
  for (const [id, v] of Object.entries(rawPoints)) {
    if (typeof v === 'number' && Number.isFinite(v)) points[id] = v;
  }
  return { points };
}

export function challengesContributions(
  athletes: Athlete[],
  event: ChallengesEvent
): Map<AthleteId, EventContribution> {
  const out = new Map<AthleteId, EventContribution>();
  for (const a of athletes) {
    const v = event.points[a.id];
    out.set(a.id, typeof v === 'number' ? v : 'pending');
  }
  return out;
}

export function challengesPoints(
  athletes: Athlete[],
  event: ChallengesEvent
): Map<AthleteId, number> {
  const out = new Map<AthleteId, number>();
  for (const [id, val] of challengesContributions(athletes, event)) {
    out.set(id, typeof val === 'number' ? val : 0);
  }
  return out;
}
