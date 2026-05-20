import type {
  Athlete,
  AthleteId,
  FifaContribution,
  FifaEvent,
  FifaFixture,
  FifaKnockoutScore,
  KnockoutPairings,
  KnockoutSide,
  LeagueRow,
  LeagueSlot
} from '../../types';
import { pairFixtureId } from '../config';

function isCompleted(f: FifaFixture): f is FifaFixture & { homeGoals: number; awayGoals: number } {
  return Number.isInteger(f.homeGoals) && Number.isInteger(f.awayGoals);
}

const blankRow = (athleteId: AthleteId): LeagueRow => ({
  athleteId,
  gf: 0,
  ga: 0,
  gd: 0,
  w: 0,
  d: 0,
  l: 0,
  pts: 0,
  tiebreakNeeded: false
});

const filledIds = (slots: LeagueSlot[]): AthleteId[] =>
  slots.filter((id): id is AthleteId => id !== null);

export function leagueTable(
  _athletes: Athlete[],
  fixtures: FifaFixture[],
  leagueSlots: LeagueSlot[]
): LeagueRow[] {
  const ids = filledIds(leagueSlots);
  if (ids.length === 0) return [];

  const rows = new Map<AthleteId, LeagueRow>(ids.map((id) => [id, blankRow(id)]));

  for (const fx of fixtures) {
    if (!isCompleted(fx)) continue;
    if (!rows.has(fx.home) || !rows.has(fx.away)) continue;
    const home = rows.get(fx.home)!;
    const away = rows.get(fx.away)!;
    home.gf += fx.homeGoals;
    home.ga += fx.awayGoals;
    away.gf += fx.awayGoals;
    away.ga += fx.homeGoals;
    if (fx.homeGoals > fx.awayGoals) {
      home.w += 1;
      home.pts += 3;
      away.l += 1;
    } else if (fx.homeGoals < fx.awayGoals) {
      away.w += 1;
      away.pts += 3;
      home.l += 1;
    } else {
      home.d += 1;
      away.d += 1;
      home.pts += 1;
      away.pts += 1;
    }
  }

  for (const row of rows.values()) {
    row.gd = row.gf - row.ga;
  }

  const sorted = [...rows.values()].sort((a, b) => {
    if (a.pts !== b.pts) return b.pts - a.pts;
    if (a.gd !== b.gd) return b.gd - a.gd;
    if (a.gf !== b.gf) return b.gf - a.gf;
    return 0;
  });

  const hasPlayed = (r: LeagueRow) => r.w + r.d + r.l > 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const cur = sorted[i];
    const next = sorted[i + 1];
    if (
      cur.pts === next.pts &&
      cur.gd === next.gd &&
      cur.gf === next.gf &&
      (hasPlayed(cur) || hasPlayed(next))
    ) {
      cur.tiebreakNeeded = true;
      next.tiebreakNeeded = true;
    }
  }

  return sorted;
}

function leagueComplete(slots: LeagueSlot[], fixtures: FifaFixture[], league: 1 | 2): boolean {
  if (slots.some((s) => s === null)) return false;
  const leagueFixtures = fixtures.filter((f) => f.league === league);
  if (leagueFixtures.length === 0) return false;
  return leagueFixtures.every(isCompleted);
}

export function knockoutPairings(
  league1Slots: LeagueSlot[],
  league2Slots: LeagueSlot[],
  fixtures: FifaFixture[]
): KnockoutPairings {
  if (!leagueComplete(league1Slots, fixtures, 1) || !leagueComplete(league2Slots, fixtures, 2)) {
    return { final: null, thirdPlace: null };
  }

  const l1 = leagueTable([], fixtures, league1Slots);
  const l2 = leagueTable([], fixtures, league2Slots);

  if (l1[0].tiebreakNeeded || l2[0].tiebreakNeeded) {
    return { final: null, thirdPlace: null };
  }

  return {
    final: { home: l1[0].athleteId, away: l2[0].athleteId },
    thirdPlace: { home: l1[1].athleteId, away: l2[1].athleteId }
  };
}

export function decideKnockout(score: FifaKnockoutScore): KnockoutSide | null {
  if (!Number.isInteger(score.homeGoals) || !Number.isInteger(score.awayGoals)) return null;
  if (score.homeGoals! > score.awayGoals!) return 'home';
  if (score.awayGoals! > score.homeGoals!) return 'away';
  return score.wonOnPens ?? null;
}

export function fifaContributions(
  athletes: Athlete[],
  fifa: FifaEvent
): Map<AthleteId, FifaContribution> {
  const result = new Map<AthleteId, FifaContribution>(athletes.map((a) => [a.id, 'pending']));

  const pairings = knockoutPairings(fifa.league1, fifa.league2, fifa.fixtures);
  if (!pairings.final || !pairings.thirdPlace) return result;

  const inKnockout = new Set<AthleteId>([
    pairings.final.home,
    pairings.final.away,
    pairings.thirdPlace.home,
    pairings.thirdPlace.away
  ]);
  for (const a of athletes) {
    if (!inKnockout.has(a.id)) result.set(a.id, 0);
  }

  const finalSide = decideKnockout(fifa.final);
  if (finalSide) {
    const winner = finalSide === 'home' ? pairings.final.home : pairings.final.away;
    const loser = finalSide === 'home' ? pairings.final.away : pairings.final.home;
    result.set(winner, 3);
    result.set(loser, 2);
  }

  const thirdSide = decideKnockout(fifa.thirdPlace);
  if (thirdSide) {
    const winner = thirdSide === 'home' ? pairings.thirdPlace.home : pairings.thirdPlace.away;
    const loser = thirdSide === 'home' ? pairings.thirdPlace.away : pairings.thirdPlace.home;
    result.set(winner, 1);
    result.set(loser, 0);
  }

  return result;
}

export function fifaPoints(athletes: Athlete[], fifa: FifaEvent): Map<AthleteId, number> {
  const out = new Map<AthleteId, number>();
  for (const [id, val] of fifaContributions(athletes, fifa)) {
    out.set(id, typeof val === 'number' ? val : 0);
  }
  return out;
}

function pairKey(league: number, a: AthleteId, b: AthleteId): string {
  const [x, y] = [a, b].sort();
  return `${league}|${x}|${y}`;
}

export function regenerateFixtures(
  league1Slots: LeagueSlot[],
  league2Slots: LeagueSlot[],
  existing: FifaFixture[]
): FifaFixture[] {
  const oldByKey = new Map<string, FifaFixture>();
  for (const fx of existing) {
    oldByKey.set(pairKey(fx.league, fx.home, fx.away), fx);
  }

  const out: FifaFixture[] = [];
  const buildLeague = (league: 1 | 2, slots: LeagueSlot[]) => {
    const ids = filledIds(slots);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const home = ids[i];
        const away = ids[j];
        const old = oldByKey.get(pairKey(league, home, away));
        let homeGoals: number | null = null;
        let awayGoals: number | null = null;
        if (old) {
          if (old.home === home) {
            homeGoals = old.homeGoals;
            awayGoals = old.awayGoals;
          } else {
            homeGoals = old.awayGoals;
            awayGoals = old.homeGoals;
          }
        }
        out.push({
          id: pairFixtureId(league, home, away),
          league,
          home,
          away,
          homeGoals,
          awayGoals
        });
      }
    }
  };

  buildLeague(1, league1Slots);
  buildLeague(2, league2Slots);
  return out;
}
