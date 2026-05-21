import { describe, expect, it } from 'vitest';
import type { KubbEvent } from '../types';
import {
  setKubbMatchWinner,
  setKubbTeamMember,
  setKubbTeamName,
  setSfTeam
} from './kubb-mutations';

const base = (): KubbEvent => ({
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

describe('setKubbTeamName', () => {
  it('renames the chosen team', () => {
    const next = setKubbTeamName(base(), 1, 'Alpha');
    expect(next.teams[1].name).toBe('Alpha');
    expect(next.teams[0].name).toBe('Team 1');
  });
});

describe('setKubbTeamMember', () => {
  it('assigns a member to a slot', () => {
    const ev = base();
    ev.teams[0].members = [null, null];
    const next = setKubbTeamMember(ev, 0, 0, 'a');
    expect(next.teams[0].members[0]).toBe('a');
  });

  it('removes the athlete from other teams (uniqueness)', () => {
    const next = setKubbTeamMember(base(), 1, 0, 'a'); // 'a' was on team 0
    expect(next.teams[0].members).toEqual([null, 'b']);
    expect(next.teams[1].members[0]).toBe('a');
  });

  it('clearing a slot leaves others untouched', () => {
    const next = setKubbTeamMember(base(), 0, 1, null);
    expect(next.teams[0].members).toEqual(['a', null]);
    expect(next.teams[1].members).toEqual(['c', 'd']);
  });
});

describe('setSfTeam', () => {
  it('assigns a team to an SF slot', () => {
    const ev = base();
    ev.sf1.home = null;
    const next = setSfTeam(ev, 'sf1', 'home', 0);
    expect(next.sf1.home).toBe(0);
  });

  it('moves the team if it was in a different SF slot', () => {
    const next = setSfTeam(base(), 'sf2', 'home', 0); // team 0 was at sf1.home
    expect(next.sf1.home).toBeNull();
    expect(next.sf2.home).toBe(0);
  });

  it('clears finalWinner when an SF winner-bearing slot changes', () => {
    const ev = base();
    ev.sf1.winner = 'home';
    ev.sf2.winner = 'home';
    ev.finalWinner = 'home';
    const next = setSfTeam(ev, 'sf1', 'home', 1);
    // team in winning slot changed → SF1 winner cleared → final cleared
    expect(next.sf1.winner).toBeNull();
    expect(next.finalWinner).toBeNull();
  });

  it('clearing a slot removes the team', () => {
    const next = setSfTeam(base(), 'sf1', 'home', null);
    expect(next.sf1.home).toBeNull();
  });
});

describe('setKubbMatchWinner', () => {
  it('sets the winner of SF1', () => {
    const next = setKubbMatchWinner(base(), 'sf1', 'home');
    expect(next.sf1.winner).toBe('home');
  });

  it('toggles winner to null when called with null', () => {
    const ev = base();
    ev.sf1.winner = 'home';
    const next = setKubbMatchWinner(ev, 'sf1', null);
    expect(next.sf1.winner).toBeNull();
  });

  it('clears finalWinner when SF1 winner changes', () => {
    const ev = base();
    ev.sf1.winner = 'home';
    ev.sf2.winner = 'home';
    ev.finalWinner = 'home';
    const next = setKubbMatchWinner(ev, 'sf1', 'away');
    expect(next.finalWinner).toBeNull();
  });

  it('clears finalWinner when SF2 winner changes', () => {
    const ev = base();
    ev.sf1.winner = 'home';
    ev.sf2.winner = 'home';
    ev.finalWinner = 'away';
    const next = setKubbMatchWinner(ev, 'sf2', null);
    expect(next.finalWinner).toBeNull();
  });

  it('setting the final winner does not affect SFs', () => {
    const ev = base();
    ev.sf1.winner = 'home';
    ev.sf2.winner = 'away';
    const next = setKubbMatchWinner(ev, 'final', 'home');
    expect(next.finalWinner).toBe('home');
    expect(next.sf1.winner).toBe('home');
    expect(next.sf2.winner).toBe('away');
  });
});
