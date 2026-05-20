import { describe, expect, it } from 'vitest';
import type { Athlete, FifaEvent, FifaFixture } from '../../types';
import { fifaPoints, knockoutPairings, leagueTable } from './fifa';

const athletes: Athlete[] = [
  { id: 'a', name: 'Alex' },
  { id: 'b', name: 'Ben' },
  { id: 'c', name: 'Carl' },
  { id: 'd', name: 'Dave' },
  { id: 'e', name: 'Ed' },
  { id: 'f', name: 'Frank' },
  { id: 'g', name: 'George' }
];

const league1Ids = ['a', 'b', 'c'];
const league2Ids = ['d', 'e', 'f', 'g'];

const fixture = (
  id: string,
  league: 1 | 2,
  home: string,
  away: string,
  homeGoals: number | null,
  awayGoals: number | null
): FifaFixture => ({ id, league, home, away, homeGoals, awayGoals });

const league1RoundRobin = (results: Array<[string, string, number | null, number | null]>): FifaFixture[] =>
  results.map(([h, a, hg, ag], i) => fixture(`l1-${i + 1}`, 1, h, a, hg, ag));

const league2RoundRobin = (results: Array<[string, string, number | null, number | null]>): FifaFixture[] =>
  results.map(([h, a, hg, ag], i) => fixture(`l2-${i + 1}`, 2, h, a, hg, ag));

describe('leagueTable', () => {
  it('returns zero rows when no fixtures are scored', () => {
    const rows = leagueTable(athletes, [], league1Ids);
    expect(rows.map((r) => r.athleteId).sort()).toEqual(['a', 'b', 'c']);
    rows.forEach((r) => {
      expect(r.gf).toBe(0);
      expect(r.ga).toBe(0);
      expect(r.gd).toBe(0);
      expect(r.w).toBe(0);
      expect(r.d).toBe(0);
      expect(r.l).toBe(0);
      expect(r.pts).toBe(0);
      expect(r.tiebreakNeeded).toBe(false);
    });
  });

  it('ignores fixtures with null goals', () => {
    const fixtures = league1RoundRobin([
      ['a', 'b', 3, null],
      ['a', 'c', null, 1],
      ['b', 'c', 2, 1]
    ]);
    const rows = leagueTable(athletes, fixtures, league1Ids);
    const byId = Object.fromEntries(rows.map((r) => [r.athleteId, r]));
    expect(byId.b.pts).toBe(3);
    expect(byId.c.pts).toBe(0);
    expect(byId.a.pts).toBe(0);
    expect(byId.a.gf).toBe(0);
    expect(byId.a.ga).toBe(0);
  });

  it('counts wins, draws, losses, GF/GA correctly', () => {
    const fixtures = league1RoundRobin([
      ['a', 'b', 3, 1],
      ['a', 'c', 2, 2],
      ['b', 'c', 0, 1]
    ]);
    const rows = leagueTable(athletes, fixtures, league1Ids);
    const byId = Object.fromEntries(rows.map((r) => [r.athleteId, r]));

    expect(byId.a.w).toBe(1);
    expect(byId.a.d).toBe(1);
    expect(byId.a.l).toBe(0);
    expect(byId.a.gf).toBe(5);
    expect(byId.a.ga).toBe(3);
    expect(byId.a.pts).toBe(4);

    expect(byId.b.w).toBe(0);
    expect(byId.b.d).toBe(0);
    expect(byId.b.l).toBe(2);
    expect(byId.b.gf).toBe(1);
    expect(byId.b.ga).toBe(4);
    expect(byId.b.pts).toBe(0);

    expect(byId.c.w).toBe(1);
    expect(byId.c.d).toBe(1);
    expect(byId.c.l).toBe(0);
    expect(byId.c.gf).toBe(3);
    expect(byId.c.ga).toBe(2);
    expect(byId.c.pts).toBe(4);
  });

  it('sorts pts → GD → GF', () => {
    const fixtures = league1RoundRobin([
      ['a', 'b', 3, 1],
      ['a', 'c', 2, 2],
      ['b', 'c', 0, 1]
    ]);
    const rows = leagueTable(athletes, fixtures, league1Ids);
    expect(rows.map((r) => r.athleteId)).toEqual(['a', 'c', 'b']);
  });

  it('breaks pts tie by GD', () => {
    const fixtures = league1RoundRobin([
      ['a', 'b', 5, 0],
      ['b', 'c', 1, 0],
      ['a', 'c', 0, 1]
    ]);
    const rows = leagueTable(athletes, fixtures, league1Ids);
    expect(rows.map((r) => r.athleteId)).toEqual(['a', 'c', 'b']);
    expect(rows[0].pts).toBe(3);
    expect(rows[1].pts).toBe(3);
    expect(rows[2].pts).toBe(3);
    expect(rows[0].gd).toBe(4);
    expect(rows[1].gd).toBe(0);
    expect(rows[2].gd).toBe(-4);
    rows.forEach((r) => expect(r.tiebreakNeeded).toBe(false));
  });

  it('breaks pts + GD tie by GF', () => {
    const fixtures = league1RoundRobin([
      ['a', 'b', 2, 0],
      ['b', 'c', 2, 0],
      ['c', 'a', 2, 0]
    ]);
    const rows = leagueTable(athletes, fixtures, league1Ids);
    rows.forEach((r) => {
      expect(r.pts).toBe(3);
      expect(r.gd).toBe(0);
      expect(r.gf).toBe(2);
    });
    rows.forEach((r) => expect(r.tiebreakNeeded).toBe(true));
  });

  it('flags rows that share all three sort keys as tiebreak-needed', () => {
    const fixtures = league1RoundRobin([
      ['a', 'b', 1, 1],
      ['a', 'c', 2, 0],
      ['b', 'c', 0, 0]
    ]);
    const rows = leagueTable(athletes, fixtures, league1Ids);
    const byId = Object.fromEntries(rows.map((r) => [r.athleteId, r]));
    expect(byId.a.tiebreakNeeded).toBe(false);
    expect(byId.b.tiebreakNeeded).toBe(false);
    expect(byId.c.tiebreakNeeded).toBe(false);
  });
});

describe('knockoutPairings', () => {
  const completeLeague1 = league1RoundRobin([
    ['a', 'b', 2, 1],
    ['a', 'c', 3, 0],
    ['b', 'c', 1, 0]
  ]);
  const completeLeague2 = league2RoundRobin([
    ['d', 'e', 2, 1],
    ['d', 'f', 1, 0],
    ['d', 'g', 1, 0],
    ['e', 'f', 2, 0],
    ['e', 'g', 1, 1],
    ['f', 'g', 0, 0]
  ]);

  it('returns nulls when any league fixture is incomplete', () => {
    const partial = [...completeLeague1.slice(0, 2), { ...completeLeague1[2], homeGoals: null }];
    const result = knockoutPairings(league1Ids, league2Ids, [...partial, ...completeLeague2]);
    expect(result.final).toBeNull();
    expect(result.thirdPlace).toBeNull();
  });

  it('returns winners and runners-up when leagues are complete and unambiguous', () => {
    const result = knockoutPairings(league1Ids, league2Ids, [...completeLeague1, ...completeLeague2]);
    expect(result.final).toEqual({ home: 'a', away: 'd' });
    expect(result.thirdPlace).toEqual({ home: 'b', away: 'e' });
  });

  it('returns nulls when 1st/2nd are tied in either league', () => {
    const ambiguous = league1RoundRobin([
      ['a', 'b', 2, 0],
      ['b', 'c', 2, 0],
      ['c', 'a', 2, 0]
    ]);
    const result = knockoutPairings(league1Ids, league2Ids, [...ambiguous, ...completeLeague2]);
    expect(result.final).toBeNull();
    expect(result.thirdPlace).toBeNull();
  });
});

describe('fifaPoints', () => {
  const completeLeague1 = league1RoundRobin([
    ['a', 'b', 2, 1],
    ['a', 'c', 3, 0],
    ['b', 'c', 1, 0]
  ]);
  const completeLeague2 = league2RoundRobin([
    ['d', 'e', 2, 1],
    ['d', 'f', 1, 0],
    ['d', 'g', 1, 0],
    ['e', 'f', 2, 0],
    ['e', 'g', 1, 1],
    ['f', 'g', 0, 0]
  ]);

  const baseFifa: FifaEvent = {
    league1: league1Ids,
    league2: league2Ids,
    fixtures: [...completeLeague1, ...completeLeague2],
    final: { homeGoals: null, awayGoals: null },
    thirdPlace: { homeGoals: null, awayGoals: null }
  };

  it('returns zero for everyone when knockouts are not complete', () => {
    const pts = fifaPoints(athletes, baseFifa);
    athletes.forEach((a) => expect(pts.get(a.id)).toBe(0));
  });

  it('returns zero when only final is filled', () => {
    const pts = fifaPoints(athletes, {
      ...baseFifa,
      final: { homeGoals: 2, awayGoals: 1 }
    });
    athletes.forEach((a) => expect(pts.get(a.id)).toBe(0));
  });

  it('awards 3/2/1 once final and 3rd-place are decided', () => {
    const pts = fifaPoints(athletes, {
      ...baseFifa,
      final: { homeGoals: 3, awayGoals: 1 },
      thirdPlace: { homeGoals: 2, awayGoals: 0 }
    });
    expect(pts.get('a')).toBe(3);
    expect(pts.get('d')).toBe(2);
    expect(pts.get('b')).toBe(1);
    expect(pts.get('e')).toBe(0);
    expect(pts.get('c')).toBe(0);
    expect(pts.get('f')).toBe(0);
    expect(pts.get('g')).toBe(0);
  });

  it('returns zero when knockout score is a draw (winner undecided)', () => {
    const pts = fifaPoints(athletes, {
      ...baseFifa,
      final: { homeGoals: 2, awayGoals: 2 },
      thirdPlace: { homeGoals: 1, awayGoals: 0 }
    });
    athletes.forEach((a) => expect(pts.get(a.id)).toBe(0));
  });
});
