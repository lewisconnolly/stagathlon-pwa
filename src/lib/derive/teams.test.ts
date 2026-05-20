import { describe, expect, it } from 'vitest';
import type { Athlete, TeamEvent } from '../../types';
import { ensureTeamEventShape, teamContributions, teamPoints } from './teams';

const athletes: Athlete[] = [
  { id: 'a', name: 'Alice' },
  { id: 'b', name: 'Bob' },
  { id: 'c', name: 'Carl' },
  { id: 'd', name: 'Dave' },
  { id: 'e', name: 'Ed' },
  { id: 'f', name: 'Frank' },
  { id: 'g', name: 'George' }
];

const emptyEvent: TeamEvent = {
  teams: [
    { name: 'Team 1', members: [null, null, null] },
    { name: 'Team 2', members: [null, null] },
    { name: 'Team 3', members: [null, null] }
  ],
  standings: { first: null, second: null, third: null }
};

// All players assigned, no standings yet
const fullyAssignedNoStandings: TeamEvent = {
  teams: [
    { name: 'Team 1', members: ['a', 'b', 'c'] },
    { name: 'Team 2', members: ['d', 'e'] },
    { name: 'Team 3', members: ['f', 'g'] }
  ],
  standings: { first: null, second: null, third: null }
};

// Team 1 = 1st (2 pts each), Team 2 = 2nd (1 pt each), Team 3 = 3rd (0 pts each)
const allSetT1Wins: TeamEvent = {
  ...fullyAssignedNoStandings,
  standings: { first: 0, second: 1, third: 2 }
};

describe('ensureTeamEventShape', () => {
  it('returns a default empty event for null/undefined input', () => {
    const e = ensureTeamEventShape(null);
    expect(e.teams).toHaveLength(3);
    expect(e.teams[0].members).toHaveLength(3);
    expect(e.teams[1].members).toHaveLength(2);
    expect(e.teams[2].members).toHaveLength(2);
    expect(e.standings).toEqual({ first: null, second: null, third: null });
  });

  it('tolerates the old placeholder shape', () => {
    const e = ensureTeamEventShape({ placeholder: true });
    expect(e.teams).toHaveLength(3);
    expect(e.standings.first).toBeNull();
  });

  it('preserves valid existing state', () => {
    const e = ensureTeamEventShape(allSetT1Wins);
    expect(e).toEqual(allSetT1Wins);
  });

  it('fills missing fields with defaults', () => {
    const e = ensureTeamEventShape({ teams: [{ name: 'Custom', members: ['a'] }] });
    expect(e.teams[0].name).toBe('Custom');
    expect(e.teams[0].members).toEqual(['a']);
    expect(e.teams[1].name).toBe('Team 2');
    expect(e.standings).toEqual({ first: null, second: null, third: null });
  });
});

describe('teamContributions', () => {
  it('returns pending for every athlete when nothing is set', () => {
    const c = teamContributions(athletes, emptyEvent);
    for (const a of athletes) {
      expect(c.get(a.id)).toBe('pending');
    }
  });

  it('returns pending when teams are assigned but standings are not', () => {
    const c = teamContributions(athletes, fullyAssignedNoStandings);
    for (const a of athletes) {
      expect(c.get(a.id)).toBe('pending');
    }
  });

  it('awards 2/1/0 once standings are fully set', () => {
    const c = teamContributions(athletes, allSetT1Wins);
    // Team 1 winners
    expect(c.get('a')).toBe(2);
    expect(c.get('b')).toBe(2);
    expect(c.get('c')).toBe(2);
    // Team 2 runners-up
    expect(c.get('d')).toBe(1);
    expect(c.get('e')).toBe(1);
    // Team 3 - 0 pts
    expect(c.get('f')).toBe(0);
    expect(c.get('g')).toBe(0);
  });

  it('returns pending for an athlete not in any team', () => {
    const event: TeamEvent = {
      ...fullyAssignedNoStandings,
      teams: [
        { name: 'Team 1', members: ['a', 'b', 'c'] },
        { name: 'Team 2', members: ['d', 'e'] },
        { name: 'Team 3', members: [null, null] }
      ],
      standings: { first: 0, second: 1, third: 2 }
    };
    const c = teamContributions(athletes, event);
    expect(c.get('a')).toBe(2);
    expect(c.get('d')).toBe(1);
    expect(c.get('f')).toBe('pending');
    expect(c.get('g')).toBe('pending');
  });

  it('only awards once standings are completely set', () => {
    // First and second set, third not yet
    const event: TeamEvent = {
      ...fullyAssignedNoStandings,
      standings: { first: 0, second: 1, third: null }
    };
    const c = teamContributions(athletes, event);
    // We can already compute first and second; third is implicit (only team left) but we wait until explicit
    expect(c.get('a')).toBe(2);
    expect(c.get('d')).toBe(1);
    expect(c.get('f')).toBe('pending');
  });

  it('handles a different standings order (T3 wins, T1 second)', () => {
    const event: TeamEvent = {
      ...fullyAssignedNoStandings,
      standings: { first: 2, second: 0, third: 1 }
    };
    const c = teamContributions(athletes, event);
    // Team 3 members get 2
    expect(c.get('f')).toBe(2);
    expect(c.get('g')).toBe(2);
    // Team 1 members get 1
    expect(c.get('a')).toBe(1);
    expect(c.get('b')).toBe(1);
    expect(c.get('c')).toBe(1);
    // Team 2 members get 0
    expect(c.get('d')).toBe(0);
    expect(c.get('e')).toBe(0);
  });
});

describe('teamPoints', () => {
  it('flattens pending to 0 for the leaderboard sum', () => {
    const pts = teamPoints(athletes, emptyEvent);
    for (const a of athletes) {
      expect(pts.get(a.id)).toBe(0);
    }
  });

  it('matches contributions for resolved standings', () => {
    const pts = teamPoints(athletes, allSetT1Wins);
    expect(pts.get('a')).toBe(2);
    expect(pts.get('d')).toBe(1);
    expect(pts.get('f')).toBe(0);
  });
});
