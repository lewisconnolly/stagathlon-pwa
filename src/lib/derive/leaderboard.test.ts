import { describe, expect, it } from 'vitest';
import type { Competition, EventId } from '../../types';
import { leaderboard } from './leaderboard';

const baseCompetition = (overrides: Partial<Competition['events']['fifa']> = {}): Competition => ({
  athletes: [
    { id: 'a', name: 'Alex' },
    { id: 'b', name: 'Ben' },
    { id: 'c', name: 'Carl' },
    { id: 'd', name: 'Dave' },
    { id: 'e', name: 'Ed' },
    { id: 'f', name: 'Frank' },
    { id: 'g', name: 'George' }
  ],
  events: {
    fifa: {
      league1: ['a', 'b', 'c'],
      league2: ['d', 'e', 'f', 'g'],
      fixtures: [],
      final: { homeGoals: null, awayGoals: null, wonOnPens: null },
      thirdPlace: { homeGoals: null, awayGoals: null, wonOnPens: null },
      ...overrides
    },
    pool: {
      qf1: { home: null, away: null, winner: null },
      qf2: { home: null, away: null, winner: null },
      qf3: { home: null, away: null, winner: null },
      byePlayer: null,
      sf1Winner: null,
      sf2Winner: null,
      finalWinner: null,
      thirdPlaceWinner: null
    },
    footgolf: {
      teams: [
        { name: 'Team 1', members: [null, null, null] },
        { name: 'Team 2', members: [null, null] },
        { name: 'Team 3', members: [null, null] }
      ],
      standings: { first: null, second: null, third: null }
    },
    frisbeegolf: {
      teams: [
        { name: 'Team 1', members: [null, null, null] },
        { name: 'Team 2', members: [null, null] },
        { name: 'Team 3', members: [null, null] }
      ],
      standings: { first: null, second: null, third: null }
    },
    aarticulate: {
      teams: [
        { name: 'Team 1', members: [null, null, null] },
        { name: 'Team 2', members: [null, null] },
        { name: 'Team 3', members: [null, null] }
      ],
      standings: { first: null, second: null, third: null }
    },
    challenges: { placeholder: true }
  }
});

const completeFixtures = [
  { id: 'l1-1', league: 1 as const, home: 'a', away: 'b', homeGoals: 2, awayGoals: 1 },
  { id: 'l1-2', league: 1 as const, home: 'a', away: 'c', homeGoals: 3, awayGoals: 0 },
  { id: 'l1-3', league: 1 as const, home: 'b', away: 'c', homeGoals: 1, awayGoals: 0 },
  { id: 'l2-1', league: 2 as const, home: 'd', away: 'e', homeGoals: 2, awayGoals: 1 },
  { id: 'l2-2', league: 2 as const, home: 'd', away: 'f', homeGoals: 1, awayGoals: 0 },
  { id: 'l2-3', league: 2 as const, home: 'd', away: 'g', homeGoals: 1, awayGoals: 0 },
  { id: 'l2-4', league: 2 as const, home: 'e', away: 'f', homeGoals: 2, awayGoals: 0 },
  { id: 'l2-5', league: 2 as const, home: 'e', away: 'g', homeGoals: 1, awayGoals: 1 },
  { id: 'l2-6', league: 2 as const, home: 'f', away: 'g', homeGoals: 0, awayGoals: 0 }
];

describe('leaderboard', () => {
  it('returns a row per athlete with all events at 0 when nothing scored', () => {
    const rows = leaderboard(baseCompetition());
    expect(rows).toHaveLength(7);
    rows.forEach((r) => {
      expect(r.total).toBe(0);
      (Object.keys(r.perEvent) as EventId[]).forEach((eid) => {
        expect(r.perEvent[eid]).toBe(0);
      });
    });
  });

  it('includes columns for all 6 events on every row', () => {
    const rows = leaderboard(baseCompetition());
    rows.forEach((r) => {
      expect(Object.keys(r.perEvent).sort()).toEqual(
        ['aarticulate', 'challenges', 'fifa', 'footgolf', 'frisbeegolf', 'pool']
      );
    });
  });

  it('attributes FIFA points to the right athletes once knockouts are entered', () => {
    const rows = leaderboard(
      baseCompetition({
        fixtures: completeFixtures,
        final: { homeGoals: 3, awayGoals: 1, wonOnPens: null },
        thirdPlace: { homeGoals: 2, awayGoals: 0, wonOnPens: null }
      })
    );
    const byId = Object.fromEntries(rows.map((r) => [r.athleteId, r]));
    expect(byId.a.perEvent.fifa).toBe(3);
    expect(byId.d.perEvent.fifa).toBe(2);
    expect(byId.b.perEvent.fifa).toBe(1);
    expect(byId.e.perEvent.fifa).toBe(0);
    expect(byId.a.total).toBe(3);
    expect(byId.d.total).toBe(2);
    expect(byId.b.total).toBe(1);
  });

  it('sorts rows by total descending', () => {
    const rows = leaderboard(
      baseCompetition({
        fixtures: completeFixtures,
        final: { homeGoals: 3, awayGoals: 1, wonOnPens: null },
        thirdPlace: { homeGoals: 2, awayGoals: 0, wonOnPens: null }
      })
    );
    const totals = rows.map((r) => r.total);
    const sortedTotals = [...totals].sort((x, y) => y - x);
    expect(totals).toEqual(sortedTotals);
    expect(rows[0].athleteId).toBe('a');
    expect(rows[1].athleteId).toBe('d');
    expect(rows[2].athleteId).toBe('b');
  });
});
