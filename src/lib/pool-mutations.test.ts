import { describe, expect, it } from 'vitest';
import type { PoolEvent } from '../types';
import { setBye, setMatchWinner, setQfSlot } from './pool-mutations';

const base: PoolEvent = {
  qf1: { home: 'a', away: 'b', winner: 'home' },
  qf2: { home: 'c', away: 'd', winner: 'home' },
  qf3: { home: 'e', away: 'f', winner: 'home' },
  byePlayer: 'g',
  sf1Winner: 'home',
  sf2Winner: 'home',
  finalWinner: 'home',
  thirdPlaceWinner: 'home'
};

describe('setQfSlot', () => {
  it('writes the new athlete into the slot', () => {
    const next = setQfSlot(base, 'qf1', 'home', 'x');
    expect(next.qf1.home).toBe('x');
  });

  it('clears the QF winner and all downstream when slot changes', () => {
    const next = setQfSlot(base, 'qf1', 'home', 'x');
    expect(next.qf1.winner).toBeNull();
    expect(next.sf1Winner).toBeNull();
    expect(next.finalWinner).toBeNull();
    expect(next.thirdPlaceWinner).toBeNull();
  });

  it('does not touch the other SF/winner branches when changing qf3', () => {
    const next = setQfSlot(base, 'qf3', 'away', 'x');
    expect(next.qf3.winner).toBeNull();
    expect(next.sf2Winner).toBeNull();
    expect(next.finalWinner).toBeNull();
    expect(next.thirdPlaceWinner).toBeNull();
    // sf1 was independent of qf3 → preserved
    expect(next.sf1Winner).toBe('home');
  });

  it('returns the same shape on a no-op change', () => {
    const next = setQfSlot(base, 'qf1', 'home', 'a');
    expect(next.qf1.home).toBe('a');
  });

  it('allows clearing a slot by passing null', () => {
    const next = setQfSlot(base, 'qf2', 'away', null);
    expect(next.qf2.away).toBeNull();
    expect(next.qf2.winner).toBeNull();
  });
});

describe('setBye', () => {
  it('writes the new bye player', () => {
    const next = setBye(base, 'x');
    expect(next.byePlayer).toBe('x');
  });

  it('clears sf2Winner and downstream when bye changes', () => {
    const next = setBye(base, 'x');
    expect(next.sf2Winner).toBeNull();
    expect(next.finalWinner).toBeNull();
    expect(next.thirdPlaceWinner).toBeNull();
    // sf1 unaffected
    expect(next.sf1Winner).toBe('home');
  });
});

describe('setMatchWinner', () => {
  it('sets a QF winner without clearing the same QF', () => {
    const fresh: PoolEvent = {
      ...base,
      qf1: { home: 'a', away: 'b', winner: null },
      sf1Winner: null,
      finalWinner: null,
      thirdPlaceWinner: null
    };
    const next = setMatchWinner(fresh, 'qf1', 'home');
    expect(next.qf1.winner).toBe('home');
  });

  it('clears downstream when a QF winner changes', () => {
    const next = setMatchWinner(base, 'qf1', 'away');
    expect(next.qf1.winner).toBe('away');
    expect(next.sf1Winner).toBeNull();
    expect(next.finalWinner).toBeNull();
    expect(next.thirdPlaceWinner).toBeNull();
    // sf2 unaffected
    expect(next.sf2Winner).toBe('home');
  });

  it('clears final and 3rd-place when an SF winner changes', () => {
    const next = setMatchWinner(base, 'sf1', 'away');
    expect(next.sf1Winner).toBe('away');
    expect(next.finalWinner).toBeNull();
    expect(next.thirdPlaceWinner).toBeNull();
    // QFs are upstream → untouched
    expect(next.qf1.winner).toBe('home');
  });

  it('sets the final winner alone', () => {
    const fresh: PoolEvent = { ...base, finalWinner: null };
    const next = setMatchWinner(fresh, 'final', 'away');
    expect(next.finalWinner).toBe('away');
    expect(next.thirdPlaceWinner).toBe('home');
  });

  it('clears a winner when passed null', () => {
    const next = setMatchWinner(base, 'qf1', null);
    expect(next.qf1.winner).toBeNull();
    expect(next.sf1Winner).toBeNull();
  });
});
