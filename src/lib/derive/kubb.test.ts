import { describe, expect, it } from 'vitest';
import type { Athlete, KubbEvent } from '../../types';
import { deriveKubbMatches, ensureKubbShape, kubbContributions, kubbPoints } from './kubb';

const ATHLETES: Athlete[] = [
  { id: 'a', name: 'Aaron' },
  { id: 'b', name: 'Ben' },
  { id: 'c', name: 'Carl' },
  { id: 'd', name: 'Dave' },
  { id: 'e', name: 'Ed' },
  { id: 'f', name: 'Frank' },
  { id: 'g', name: 'George' }
];

const emptyKubb = (): KubbEvent => ({
  teams: [
    { name: 'Team 1', members: [null, null] },
    { name: 'Team 2', members: [null, null] },
    { name: 'Team 3', members: [null, null] },
    { name: 'Team 4', members: [null] }
  ],
  sf1: { home: null, away: null, winner: null },
  sf2: { home: null, away: null, winner: null },
  finalWinner: null
});

const populated = (): KubbEvent => ({
  teams: [
    { name: 'Team 1', members: ['a', 'b'] },
    { name: 'Team 2', members: ['c', 'd'] },
    { name: 'Team 3', members: ['e', 'f'] },
    { name: 'Team 4', members: ['g'] }
  ],
  sf1: { home: 0, away: 1, winner: null },
  sf2: { home: 2, away: 3, winner: null },
  finalWinner: null
});

describe('ensureKubbShape', () => {
  it('produces defaults for an empty input', () => {
    const shaped = ensureKubbShape(undefined);
    expect(shaped.teams).toHaveLength(4);
    expect(shaped.teams[0].members).toHaveLength(2);
    expect(shaped.teams[1].members).toHaveLength(2);
    expect(shaped.teams[2].members).toHaveLength(2);
    expect(shaped.teams[3].members).toHaveLength(1);
    expect(shaped.sf1).toEqual({ home: null, away: null, winner: null });
    expect(shaped.sf2).toEqual({ home: null, away: null, winner: null });
    expect(shaped.finalWinner).toBeNull();
  });

  it('tolerates legacy { placeholder: true } shape', () => {
    const shaped = ensureKubbShape({ placeholder: true });
    expect(shaped.teams).toHaveLength(4);
    expect(shaped.teams[3].members).toEqual([null]);
  });

  it('preserves valid existing values', () => {
    const shaped = ensureKubbShape(populated());
    expect(shaped.teams[0].members).toEqual(['a', 'b']);
    expect(shaped.sf1.home).toBe(0);
  });

  it('rejects out-of-range team indices in sf slots', () => {
    const shaped = ensureKubbShape({
      ...populated(),
      sf1: { home: 5 as unknown as 0, away: 1, winner: null }
    });
    expect(shaped.sf1.home).toBeNull();
    expect(shaped.sf1.away).toBe(1);
  });
});

describe('kubbContributions', () => {
  it('returns pending for everyone when teams are empty', () => {
    const contribs = kubbContributions(ATHLETES, emptyKubb());
    for (const a of ATHLETES) {
      expect(contribs.get(a.id)).toBe('pending');
    }
  });

  it('returns pending for athlete in team that has no SF assignment', () => {
    const ev = populated();
    ev.sf1 = { home: null, away: null, winner: null };
    ev.sf2 = { home: null, away: null, winner: null };
    const contribs = kubbContributions(ATHLETES, ev);
    for (const a of ATHLETES) {
      expect(contribs.get(a.id)).toBe('pending');
    }
  });

  it('gives 0 to SF losers as soon as a SF winner is set', () => {
    const ev = populated();
    ev.sf1.winner = 'home'; // team 0 beats team 1; team 1 members → 0
    const contribs = kubbContributions(ATHLETES, ev);
    expect(contribs.get('c')).toBe(0);
    expect(contribs.get('d')).toBe(0);
    expect(contribs.get('a')).toBe('pending');
    expect(contribs.get('b')).toBe('pending');
  });

  it('awards 2 to winners and 1 to runners-up when final is decided', () => {
    const ev = populated();
    ev.sf1.winner = 'home'; // team 0 wins SF1
    ev.sf2.winner = 'away'; // team 3 wins SF2
    ev.finalWinner = 'home'; // home of final = SF1 winner = team 0
    const contribs = kubbContributions(ATHLETES, ev);
    expect(contribs.get('a')).toBe(2);
    expect(contribs.get('b')).toBe(2);
    expect(contribs.get('g')).toBe(1);
    expect(contribs.get('c')).toBe(0);
    expect(contribs.get('d')).toBe(0);
    expect(contribs.get('e')).toBe(0);
    expect(contribs.get('f')).toBe(0);
  });

  it('handles final winner = away (SF2 winner)', () => {
    const ev = populated();
    ev.sf1.winner = 'away'; // team 1 wins SF1
    ev.sf2.winner = 'home'; // team 2 wins SF2
    ev.finalWinner = 'away'; // final.away = SF2 winner = team 2
    const contribs = kubbContributions(ATHLETES, ev);
    expect(contribs.get('e')).toBe(2);
    expect(contribs.get('f')).toBe(2);
    expect(contribs.get('c')).toBe(1);
    expect(contribs.get('d')).toBe(1);
  });

  it('returns pending for finalists while final is undecided', () => {
    const ev = populated();
    ev.sf1.winner = 'home';
    ev.sf2.winner = 'home';
    // finalWinner null
    const contribs = kubbContributions(ATHLETES, ev);
    expect(contribs.get('a')).toBe('pending');
    expect(contribs.get('b')).toBe('pending');
    expect(contribs.get('e')).toBe('pending');
    expect(contribs.get('f')).toBe('pending');
    expect(contribs.get('c')).toBe(0);
    expect(contribs.get('d')).toBe(0);
    expect(contribs.get('g')).toBe(0);
  });

  it('returns pending for athlete not on any team', () => {
    const ev = emptyKubb();
    const contribs = kubbContributions(ATHLETES, ev);
    expect(contribs.get('a')).toBe('pending');
  });
});

describe('kubbPoints', () => {
  it('flattens pending to 0', () => {
    const pts = kubbPoints(ATHLETES, emptyKubb());
    for (const a of ATHLETES) {
      expect(pts.get(a.id)).toBe(0);
    }
  });

  it('matches kubbContributions when all numeric', () => {
    const ev = populated();
    ev.sf1.winner = 'home';
    ev.sf2.winner = 'away';
    ev.finalWinner = 'home';
    const pts = kubbPoints(ATHLETES, ev);
    expect(pts.get('a')).toBe(2);
    expect(pts.get('g')).toBe(1);
    expect(pts.get('c')).toBe(0);
  });
});

describe('deriveKubbMatches', () => {
  it('returns null sides when SFs are unassigned', () => {
    const m = deriveKubbMatches(emptyKubb());
    expect(m.sf1).toEqual({ home: null, away: null, winner: null });
    expect(m.final).toEqual({ home: null, away: null, winner: null });
  });

  it('computes final home/away from SF winners', () => {
    const ev = populated();
    ev.sf1.winner = 'home'; // team 0
    ev.sf2.winner = 'away'; // team 3
    const m = deriveKubbMatches(ev);
    expect(m.final.home).toBe(0);
    expect(m.final.away).toBe(3);
  });
});
