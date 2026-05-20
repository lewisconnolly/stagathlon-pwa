import { describe, expect, it } from 'vitest';
import type { Athlete, PoolEvent } from '../../types';
import { derivePoolMatches, poolContributions, poolPoints } from './pool';

const athletes: Athlete[] = [
  { id: 'a', name: 'Alice' },
  { id: 'b', name: 'Bob' },
  { id: 'c', name: 'Carl' },
  { id: 'd', name: 'Dave' },
  { id: 'e', name: 'Ed' },
  { id: 'f', name: 'Frank' },
  { id: 'g', name: 'George' }
];

const emptyPool: PoolEvent = {
  qf1: { home: null, away: null, winner: null },
  qf2: { home: null, away: null, winner: null },
  qf3: { home: null, away: null, winner: null },
  byePlayer: null,
  sf1Winner: null,
  sf2Winner: null,
  finalWinner: null,
  thirdPlaceWinner: null
};

const filledNoWinners: PoolEvent = {
  qf1: { home: 'a', away: 'b', winner: null },
  qf2: { home: 'c', away: 'd', winner: null },
  qf3: { home: 'e', away: 'f', winner: null },
  byePlayer: 'g',
  sf1Winner: null,
  sf2Winner: null,
  finalWinner: null,
  thirdPlaceWinner: null
};

// 'a' beats 'b', 'c' beats 'd', 'e' beats 'f'. 'g' has the bye.
const allQfsDone: PoolEvent = {
  qf1: { home: 'a', away: 'b', winner: 'home' },
  qf2: { home: 'c', away: 'd', winner: 'home' },
  qf3: { home: 'e', away: 'f', winner: 'home' },
  byePlayer: 'g',
  sf1Winner: null,
  sf2Winner: null,
  finalWinner: null,
  thirdPlaceWinner: null
};

// 'a' beats 'c' in SF1; 'e' beats 'g' in SF2. So Final = a vs e; 3rd-place = c vs g.
const allSfsDone: PoolEvent = {
  ...allQfsDone,
  sf1Winner: 'home', // a beats c
  sf2Winner: 'home'  // e beats g
};

describe('derivePoolMatches', () => {
  it('returns null slots when nothing is filled', () => {
    const m = derivePoolMatches(emptyPool);
    expect(m.sf1.home).toBeNull();
    expect(m.sf1.away).toBeNull();
    expect(m.sf2.away).toBeNull();
    expect(m.final.home).toBeNull();
    expect(m.thirdPlace.home).toBeNull();
  });

  it('resolves SF home/away as winners of upstream QFs', () => {
    const m = derivePoolMatches(allQfsDone);
    expect(m.sf1.home).toBe('a'); // QF1 winner
    expect(m.sf1.away).toBe('c'); // QF2 winner
    expect(m.sf2.home).toBe('e'); // QF3 winner
    expect(m.sf2.away).toBe('g'); // bye
  });

  it('resolves final.home/away from SF winners', () => {
    const m = derivePoolMatches(allSfsDone);
    expect(m.final.home).toBe('a');
    expect(m.final.away).toBe('e');
  });

  it('resolves 3rd-place.home/away from SF losers', () => {
    const m = derivePoolMatches(allSfsDone);
    expect(m.thirdPlace.home).toBe('c');
    expect(m.thirdPlace.away).toBe('g');
  });
});

describe('poolContributions', () => {
  it('returns pending for every athlete on an empty pool', () => {
    const c = poolContributions(athletes, emptyPool);
    athletes.forEach((a) => expect(c.get(a.id)).toBe('pending'));
  });

  it('returns pending for every athlete when bracket filled but no winners', () => {
    const c = poolContributions(athletes, filledNoWinners);
    athletes.forEach((a) => expect(c.get(a.id)).toBe('pending'));
  });

  it('marks QF losers as 0 and QF winners as pending', () => {
    const c = poolContributions(athletes, allQfsDone);
    // QF losers
    expect(c.get('b')).toBe(0);
    expect(c.get('d')).toBe(0);
    expect(c.get('f')).toBe(0);
    // QF winners (and bye)
    expect(c.get('a')).toBe('pending');
    expect(c.get('c')).toBe('pending');
    expect(c.get('e')).toBe('pending');
    expect(c.get('g')).toBe('pending');
  });

  it('keeps SF participants pending until the final + 3rd-place decide', () => {
    const c = poolContributions(athletes, allSfsDone);
    // Everyone in the final + 3rd-place is still pending
    expect(c.get('a')).toBe('pending');
    expect(c.get('e')).toBe('pending');
    expect(c.get('c')).toBe('pending');
    expect(c.get('g')).toBe('pending');
    // QF losers stay at 0
    expect(c.get('b')).toBe(0);
    expect(c.get('d')).toBe(0);
    expect(c.get('f')).toBe(0);
  });

  it('awards 3 and 2 once the final is decided, 3rd-place still pending', () => {
    const c = poolContributions(athletes, {
      ...allSfsDone,
      finalWinner: 'home' // a wins
    });
    expect(c.get('a')).toBe(3);
    expect(c.get('e')).toBe(2);
    // 3rd-place pair still pending
    expect(c.get('c')).toBe('pending');
    expect(c.get('g')).toBe('pending');
  });

  it('awards 1 and 0 once 3rd-place is decided, final still pending', () => {
    const c = poolContributions(athletes, {
      ...allSfsDone,
      thirdPlaceWinner: 'away' // g wins 3rd-place
    });
    expect(c.get('g')).toBe(1);
    expect(c.get('c')).toBe(0);
    // Final pair still pending
    expect(c.get('a')).toBe('pending');
    expect(c.get('e')).toBe('pending');
  });

  it('attributes 3/2/1/0 correctly when everything is decided', () => {
    const c = poolContributions(athletes, {
      ...allSfsDone,
      finalWinner: 'away',     // e wins final → 3 for e, 2 for a
      thirdPlaceWinner: 'home' // c wins 3rd-place → 1 for c, 0 for g
    });
    expect(c.get('e')).toBe(3);
    expect(c.get('a')).toBe(2);
    expect(c.get('c')).toBe(1);
    expect(c.get('g')).toBe(0);
    // All QF losers stay at 0
    expect(c.get('b')).toBe(0);
    expect(c.get('d')).toBe(0);
    expect(c.get('f')).toBe(0);
  });

  it('traces the bye player through SF2 correctly', () => {
    // bye player g goes to SF2.away. If g wins SF2 they advance to FINAL.away.
    const c = poolContributions(athletes, {
      ...allSfsDone,
      sf2Winner: 'away',       // g wins SF2 (instead of e)
      finalWinner: 'away',     // g wins final
      thirdPlaceWinner: 'home' // c wins 3rd-place (vs e)
    });
    expect(c.get('g')).toBe(3);
    expect(c.get('a')).toBe(2); // a still SF1 winner, loses final
    expect(c.get('c')).toBe(1); // c → 3rd-place winner
    expect(c.get('e')).toBe(0); // e → 3rd-place loser
  });
});

describe('poolPoints', () => {
  it('flattens pending to 0', () => {
    const pts = poolPoints(athletes, allQfsDone);
    expect(pts.get('a')).toBe(0); // pending → 0
    expect(pts.get('b')).toBe(0); // already 0
  });

  it('returns numbers when contributions resolve', () => {
    const pts = poolPoints(athletes, {
      ...allSfsDone,
      finalWinner: 'home',
      thirdPlaceWinner: 'home'
    });
    expect(pts.get('a')).toBe(3);
    expect(pts.get('e')).toBe(2);
    expect(pts.get('c')).toBe(1);
    expect(pts.get('g')).toBe(0);
  });
});
