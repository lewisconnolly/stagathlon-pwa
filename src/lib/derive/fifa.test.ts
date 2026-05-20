import { describe, expect, it } from 'vitest';
import type { Athlete, FifaEvent, FifaFixture } from '../../types';
import {
  decideKnockout,
  fifaContributions,
  fifaPoints,
  knockoutPairings,
  leagueTable,
  regenerateFixtures
} from './fifa';

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

describe('leagueTable with null slots', () => {
  it('ignores null slots and only produces rows for assigned players', () => {
    const fixtures = league1RoundRobin([['a', 'c', 2, 1]]);
    const rows = leagueTable(athletes, fixtures, ['a', null, 'c']);
    expect(rows.map((r) => r.athleteId).sort()).toEqual(['a', 'c']);
  });

  it('returns empty array when all slots are null', () => {
    const rows = leagueTable(athletes, [], [null, null, null]);
    expect(rows).toEqual([]);
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

  it('returns nulls when any league has an empty slot', () => {
    const result = knockoutPairings(
      ['a', null, 'c'],
      league2Ids,
      [...completeLeague1, ...completeLeague2]
    );
    expect(result.final).toBeNull();
    expect(result.thirdPlace).toBeNull();
  });
});

describe('regenerateFixtures', () => {
  it('produces one round-robin fixture per pair within a league', () => {
    const fixtures = regenerateFixtures(['a', 'b', 'c'], ['d', 'e', 'f', 'g'], []);
    expect(fixtures.filter((f) => f.league === 1)).toHaveLength(3);
    expect(fixtures.filter((f) => f.league === 2)).toHaveLength(6);
  });

  it('skips null slots', () => {
    const fixtures = regenerateFixtures(['a', null, 'c'], [null, null, null, null], []);
    expect(fixtures).toHaveLength(1);
    expect(fixtures[0].home).toBe('a');
    expect(fixtures[0].away).toBe('c');
  });

  it('preserves scores for matchups that survive', () => {
    const old: FifaFixture[] = [
      { id: 'l1-a-b', league: 1, home: 'a', away: 'b', homeGoals: 3, awayGoals: 1 },
      { id: 'l1-a-c', league: 1, home: 'a', away: 'c', homeGoals: 2, awayGoals: 2 },
      { id: 'l1-b-c', league: 1, home: 'b', away: 'c', homeGoals: 0, awayGoals: 1 }
    ];
    const fixtures = regenerateFixtures(['a', 'b', 'c'], [null, null, null, null], old);
    const byPair = Object.fromEntries(
      fixtures.map((f) => [[f.home, f.away].sort().join('-'), f])
    );
    expect(byPair['a-b'].homeGoals).toBe(3);
    expect(byPair['a-b'].awayGoals).toBe(1);
    expect(byPair['a-c'].homeGoals).toBe(2);
    expect(byPair['a-c'].awayGoals).toBe(2);
    expect(byPair['b-c'].homeGoals).toBe(0);
    expect(byPair['b-c'].awayGoals).toBe(1);
  });

  it('swaps home/away goals when the new pair is in reversed order', () => {
    const old: FifaFixture[] = [
      { id: 'l1-a-b', league: 1, home: 'b', away: 'a', homeGoals: 4, awayGoals: 1 }
    ];
    const fixtures = regenerateFixtures(['a', 'b', null], [null, null, null, null], old);
    expect(fixtures).toHaveLength(1);
    expect(fixtures[0].home).toBe('a');
    expect(fixtures[0].away).toBe('b');
    expect(fixtures[0].homeGoals).toBe(1);
    expect(fixtures[0].awayGoals).toBe(4);
  });

  it('drops fixtures for matchups that no longer exist', () => {
    const old: FifaFixture[] = [
      { id: 'l1-a-b', league: 1, home: 'a', away: 'b', homeGoals: 3, awayGoals: 1 }
    ];
    const fixtures = regenerateFixtures(['a', null, null], [null, null, null, null], old);
    expect(fixtures).toEqual([]);
  });

  it('uses deterministic IDs based on the league + sorted pair', () => {
    const fixtures = regenerateFixtures(['a', 'b', 'c'], [null, null, null, null], []);
    fixtures.forEach((f) => {
      const sorted = [f.home, f.away].sort().join('-');
      expect(f.id).toBe(`l${f.league}-${sorted}`);
    });
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
    final: { homeGoals: null, awayGoals: null, wonOnPens: null },
    thirdPlace: { homeGoals: null, awayGoals: null, wonOnPens: null }
  };

  it('returns zero for everyone when knockouts are not complete', () => {
    const pts = fifaPoints(athletes, baseFifa);
    athletes.forEach((a) => expect(pts.get(a.id)).toBe(0));
  });

  it('awards 3 and 2 when only the final is decided', () => {
    const pts = fifaPoints(athletes, {
      ...baseFifa,
      final: { homeGoals: 2, awayGoals: 1, wonOnPens: null }
    });
    expect(pts.get('a')).toBe(3); // L1 winner = final winner
    expect(pts.get('d')).toBe(2); // L2 winner = final loser
    expect(pts.get('b')).toBe(0); // L1 runner-up — 3rd-place still pending → 0
    expect(pts.get('e')).toBe(0);
  });

  it('awards 3/2/1 once final and 3rd-place are decided', () => {
    const pts = fifaPoints(athletes, {
      ...baseFifa,
      final: { homeGoals: 3, awayGoals: 1, wonOnPens: null },
      thirdPlace: { homeGoals: 2, awayGoals: 0, wonOnPens: null }
    });
    expect(pts.get('a')).toBe(3);
    expect(pts.get('d')).toBe(2);
    expect(pts.get('b')).toBe(1);
    expect(pts.get('e')).toBe(0);
    expect(pts.get('c')).toBe(0);
    expect(pts.get('f')).toBe(0);
    expect(pts.get('g')).toBe(0);
  });

  it('awards 1 from 3rd-place even if the final is still a draw', () => {
    const pts = fifaPoints(athletes, {
      ...baseFifa,
      final: { homeGoals: 2, awayGoals: 2, wonOnPens: null },
      thirdPlace: { homeGoals: 1, awayGoals: 0, wonOnPens: null }
    });
    expect(pts.get('b')).toBe(1); // 3rd-place winner
    expect(pts.get('e')).toBe(0); // 3rd-place loser
    expect(pts.get('a')).toBe(0); // final pair still pending → 0 in flattened view
    expect(pts.get('d')).toBe(0);
  });
});

describe('fifaContributions', () => {
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
    final: { homeGoals: null, awayGoals: null, wonOnPens: null },
    thirdPlace: { homeGoals: null, awayGoals: null, wonOnPens: null }
  };

  it('marks every athlete pending when leagues are incomplete', () => {
    const partial = [...completeLeague1.slice(0, 2), { ...completeLeague1[2], homeGoals: null }];
    const result = fifaContributions(athletes, {
      ...baseFifa,
      fixtures: [...partial, ...completeLeague2]
    });
    athletes.forEach((a) => expect(result.get(a.id)).toBe('pending'));
  });

  it('marks non-knockout players as 0 once leagues complete, knockout pairs as pending', () => {
    const result = fifaContributions(athletes, baseFifa);
    // a (L1 1st) and d (L2 1st) are in final → pending
    expect(result.get('a')).toBe('pending');
    expect(result.get('d')).toBe('pending');
    // b (L1 2nd) and e (L2 2nd) are in 3rd-place → pending
    expect(result.get('b')).toBe('pending');
    expect(result.get('e')).toBe('pending');
    // c (L1 3rd), f (L2 3rd), g (L2 4th) are not in any knockout → 0
    expect(result.get('c')).toBe(0);
    expect(result.get('f')).toBe(0);
    expect(result.get('g')).toBe(0);
  });

  it('resolves final pair when final is decided, keeps 3rd-place pair pending', () => {
    const result = fifaContributions(athletes, {
      ...baseFifa,
      final: { homeGoals: 3, awayGoals: 1, wonOnPens: null }
    });
    expect(result.get('a')).toBe(3);
    expect(result.get('d')).toBe(2);
    expect(result.get('b')).toBe('pending');
    expect(result.get('e')).toBe('pending');
    expect(result.get('c')).toBe(0);
  });

  it('resolves 3rd-place pair independently of the final', () => {
    const result = fifaContributions(athletes, {
      ...baseFifa,
      thirdPlace: { homeGoals: 2, awayGoals: 0, wonOnPens: null }
    });
    expect(result.get('b')).toBe(1);
    expect(result.get('e')).toBe(0);
    expect(result.get('a')).toBe('pending');
    expect(result.get('d')).toBe('pending');
  });

  it('uses wonOnPens to break a draw in the final', () => {
    const result = fifaContributions(athletes, {
      ...baseFifa,
      final: { homeGoals: 2, awayGoals: 2, wonOnPens: 'away' }
    });
    // pairings.final = { home: 'a', away: 'd' }; away ('d') won on pens
    expect(result.get('d')).toBe(3);
    expect(result.get('a')).toBe(2);
  });

  it('uses wonOnPens to break a draw in the 3rd-place playoff', () => {
    const result = fifaContributions(athletes, {
      ...baseFifa,
      thirdPlace: { homeGoals: 1, awayGoals: 1, wonOnPens: 'home' }
    });
    // pairings.thirdPlace = { home: 'b', away: 'e' }; home ('b') won on pens
    expect(result.get('b')).toBe(1);
    expect(result.get('e')).toBe(0);
  });
});

describe('decideKnockout', () => {
  it('returns null when either score is missing', () => {
    expect(decideKnockout({ homeGoals: null, awayGoals: 2, wonOnPens: null })).toBeNull();
    expect(decideKnockout({ homeGoals: 1, awayGoals: null, wonOnPens: null })).toBeNull();
  });

  it('returns home when home scores more', () => {
    expect(decideKnockout({ homeGoals: 3, awayGoals: 1, wonOnPens: null })).toBe('home');
  });

  it('returns away when away scores more', () => {
    expect(decideKnockout({ homeGoals: 0, awayGoals: 2, wonOnPens: null })).toBe('away');
  });

  it('returns null on a draw without pens', () => {
    expect(decideKnockout({ homeGoals: 2, awayGoals: 2, wonOnPens: null })).toBeNull();
  });

  it('returns the pens side on a draw with pens set', () => {
    expect(decideKnockout({ homeGoals: 2, awayGoals: 2, wonOnPens: 'home' })).toBe('home');
    expect(decideKnockout({ homeGoals: 2, awayGoals: 2, wonOnPens: 'away' })).toBe('away');
  });

  it('ignores pens when goals are decisive', () => {
    expect(decideKnockout({ homeGoals: 3, awayGoals: 1, wonOnPens: 'away' })).toBe('home');
  });
});
