import { describe, expect, it } from 'vitest';
import type { Athlete, ChallengesEvent } from '../../types';
import { challengesContributions, challengesPoints, ensureChallengesShape } from './challenges';

const athletes: Athlete[] = [
  { id: 'a', name: 'Alice' },
  { id: 'b', name: 'Bob' },
  { id: 'c', name: 'Carl' }
];

describe('ensureChallengesShape', () => {
  it('returns empty points map for null/undefined input', () => {
    expect(ensureChallengesShape(null)).toEqual({ points: {} });
    expect(ensureChallengesShape(undefined)).toEqual({ points: {} });
  });

  it('tolerates old placeholder shape', () => {
    expect(ensureChallengesShape({ placeholder: true })).toEqual({ points: {} });
  });

  it('preserves valid points map', () => {
    expect(ensureChallengesShape({ points: { a: 3, b: -2 } })).toEqual({
      points: { a: 3, b: -2 }
    });
  });

  it('drops non-numeric values defensively', () => {
    expect(
      ensureChallengesShape({ points: { a: 3, b: 'oops' as unknown as number, c: 5 } })
    ).toEqual({ points: { a: 3, c: 5 } });
  });
});

describe('challengesContributions', () => {
  it('returns pending for athletes with no points set', () => {
    const e: ChallengesEvent = { points: {} };
    const c = challengesContributions(athletes, e);
    expect(c.get('a')).toBe('pending');
    expect(c.get('b')).toBe('pending');
  });

  it('returns numbers for athletes with points set', () => {
    const e: ChallengesEvent = { points: { a: 3, b: 0, c: -2 } };
    const c = challengesContributions(athletes, e);
    expect(c.get('a')).toBe(3);
    expect(c.get('b')).toBe(0);
    expect(c.get('c')).toBe(-2);
  });

  it('mixes pending and resolved values', () => {
    const e: ChallengesEvent = { points: { a: 5 } };
    const c = challengesContributions(athletes, e);
    expect(c.get('a')).toBe(5);
    expect(c.get('b')).toBe('pending');
    expect(c.get('c')).toBe('pending');
  });
});

describe('challengesPoints', () => {
  it('flattens pending to 0 for the leaderboard', () => {
    const e: ChallengesEvent = { points: { a: 5 } };
    const pts = challengesPoints(athletes, e);
    expect(pts.get('a')).toBe(5);
    expect(pts.get('b')).toBe(0);
  });

  it('preserves negative values', () => {
    const e: ChallengesEvent = { points: { a: -3 } };
    expect(challengesPoints(athletes, e).get('a')).toBe(-3);
  });
});
