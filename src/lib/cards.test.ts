import { describe, expect, it } from 'vitest';
import { shuffleDeck } from './cards';

describe('shuffleDeck', () => {
  it('returns the same length as input', () => {
    const input = [1, 2, 3, 4, 5];
    expect(shuffleDeck(input)).toHaveLength(5);
  });

  it('returns the same set of elements', () => {
    const input = ['a', 'b', 'c', 'd', 'e'];
    const out = shuffleDeck(input);
    expect(out.slice().sort()).toEqual(input.slice().sort());
  });

  it('does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5];
    const snapshot = [...input];
    shuffleDeck(input);
    expect(input).toEqual(snapshot);
  });

  it('handles empty arrays', () => {
    expect(shuffleDeck([])).toEqual([]);
  });

  it('handles single-element arrays', () => {
    expect(shuffleDeck([42])).toEqual([42]);
  });

  it('actually changes the order for sufficiently large inputs', () => {
    // Probability of identical order for 10 elements is 1/10! ≈ 2.8e-7.
    // Run 5 trials; effectively zero chance all match.
    const input = Array.from({ length: 10 }, (_, i) => i);
    const anyShuffled = [0, 0, 0, 0, 0].some(
      () => !shuffleDeck(input).every((v, idx) => v === input[idx])
    );
    expect(anyShuffled).toBe(true);
  });
});
