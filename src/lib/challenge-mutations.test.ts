import { describe, expect, it } from 'vitest';
import type { ChallengesEvent } from '../types';
import { addChallengePoints } from './challenge-mutations';

describe('addChallengePoints', () => {
  it('initialises an athlete with the delta when not yet present', () => {
    const e: ChallengesEvent = { points: {} };
    const next = addChallengePoints(e, 'a', 1);
    expect(next.points).toEqual({ a: 1 });
  });

  it('accumulates onto an existing value', () => {
    const e: ChallengesEvent = { points: { a: 3 } };
    expect(addChallengePoints(e, 'a', 1).points).toEqual({ a: 4 });
  });

  it('accepts negative deltas (penalty)', () => {
    const e: ChallengesEvent = { points: { a: 2 } };
    expect(addChallengePoints(e, 'a', -5).points).toEqual({ a: -3 });
  });

  it('does not mutate the input', () => {
    const e: ChallengesEvent = { points: { a: 2 } };
    addChallengePoints(e, 'a', 1);
    expect(e.points).toEqual({ a: 2 });
  });

  it('leaves other athletes untouched', () => {
    const e: ChallengesEvent = { points: { a: 2, b: 5 } };
    expect(addChallengePoints(e, 'a', 1).points).toEqual({ a: 3, b: 5 });
  });
});
