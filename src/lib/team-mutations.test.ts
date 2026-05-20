import { describe, expect, it } from 'vitest';
import type { TeamEvent } from '../types';
import { setStanding, setTeamMember, setTeamName } from './team-mutations';

const baseEvent: TeamEvent = {
  teams: [
    { name: 'Team 1', members: ['a', 'b', 'c'] },
    { name: 'Team 2', members: ['d', 'e'] },
    { name: 'Team 3', members: ['f', 'g'] }
  ],
  standings: { first: null, second: null, third: null }
};

describe('setTeamName', () => {
  it('renames a team without touching others', () => {
    const next = setTeamName(baseEvent, 0, 'Lions');
    expect(next.teams[0].name).toBe('Lions');
    expect(next.teams[1].name).toBe('Team 2');
    expect(next.teams[2].name).toBe('Team 3');
  });

  it('does not affect members or standings', () => {
    const event: TeamEvent = { ...baseEvent, standings: { first: 0, second: 1, third: 2 } };
    const next = setTeamName(event, 1, 'Tigers');
    expect(next.teams[1].members).toEqual(['d', 'e']);
    expect(next.standings).toEqual(event.standings);
  });
});

describe('setTeamMember', () => {
  it('replaces a single slot', () => {
    const next = setTeamMember(baseEvent, 0, 1, 'x');
    expect(next.teams[0].members).toEqual(['a', 'x', 'c']);
  });

  it('clears a slot when athleteId is null', () => {
    const next = setTeamMember(baseEvent, 1, 0, null);
    expect(next.teams[1].members).toEqual([null, 'e']);
  });

  it('removes athlete from other teams if assigned there', () => {
    // Pre-condition: 'a' is in team 0
    const next = setTeamMember(baseEvent, 2, 0, 'a');
    // 'a' should now be in team 2 only
    expect(next.teams[2].members).toContain('a');
    expect(next.teams[0].members).not.toContain('a');
    // Original slot in team 0 should be null
    expect(next.teams[0].members).toEqual([null, 'b', 'c']);
  });

  it('preserves order when removing from previous team', () => {
    const next = setTeamMember(baseEvent, 1, 1, 'c');
    // Team 0 had ['a','b','c'] - removing 'c' should leave ['a','b',null]
    expect(next.teams[0].members).toEqual(['a', 'b', null]);
    expect(next.teams[1].members).toEqual(['d', 'c']);
  });

  it('is a no-op when reassigning to the same slot', () => {
    const next = setTeamMember(baseEvent, 0, 0, 'a');
    expect(next.teams[0].members).toEqual(['a', 'b', 'c']);
  });
});

describe('setStanding', () => {
  it('sets a position', () => {
    const next = setStanding(baseEvent, 'first', 0);
    expect(next.standings.first).toBe(0);
  });

  it('clears a position when teamIdx is null', () => {
    const event: TeamEvent = { ...baseEvent, standings: { first: 0, second: 1, third: 2 } };
    const next = setStanding(event, 'second', null);
    expect(next.standings).toEqual({ first: 0, second: null, third: 2 });
  });

  it('clears any other position the team was already in', () => {
    // Team 0 was 2nd, now set as 1st - 2nd should clear
    const event: TeamEvent = {
      ...baseEvent,
      standings: { first: null, second: 0, third: null }
    };
    const next = setStanding(event, 'first', 0);
    expect(next.standings).toEqual({ first: 0, second: null, third: null });
  });

  it('replaces the team currently in the target position', () => {
    const event: TeamEvent = {
      ...baseEvent,
      standings: { first: 1, second: null, third: null }
    };
    const next = setStanding(event, 'first', 0);
    expect(next.standings.first).toBe(0);
  });
});
