import type {
  Athlete,
  AthleteId,
  FifaEvent,
  FifaFixture,
  KnockoutPairings,
  LeagueRow
} from '../../types';

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

export function leagueTable(
  _athletes: Athlete[],
  fixtures: FifaFixture[],
  leagueIds: AthleteId[]
): LeagueRow[] {
  const rows = new Map<AthleteId, LeagueRow>(leagueIds.map((id) => [id, blankRow(id)]));

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

function leagueHasAllResults(fixtures: FifaFixture[], league: 1 | 2): boolean {
  const leagueFixtures = fixtures.filter((f) => f.league === league);
  if (leagueFixtures.length === 0) return false;
  return leagueFixtures.every(isCompleted);
}

export function knockoutPairings(
  league1Ids: AthleteId[],
  league2Ids: AthleteId[],
  fixtures: FifaFixture[]
): KnockoutPairings {
  if (!leagueHasAllResults(fixtures, 1) || !leagueHasAllResults(fixtures, 2)) {
    return { final: null, thirdPlace: null };
  }

  const l1 = leagueTable([], fixtures, league1Ids);
  const l2 = leagueTable([], fixtures, league2Ids);

  if (l1[0].tiebreakNeeded || l2[0].tiebreakNeeded) {
    return { final: null, thirdPlace: null };
  }

  return {
    final: { home: l1[0].athleteId, away: l2[0].athleteId },
    thirdPlace: { home: l1[1].athleteId, away: l2[1].athleteId }
  };
}

function isKnockoutDecided(score: { homeGoals: number | null; awayGoals: number | null }): boolean {
  return (
    Number.isInteger(score.homeGoals) &&
    Number.isInteger(score.awayGoals) &&
    score.homeGoals !== score.awayGoals
  );
}

export function fifaPoints(athletes: Athlete[], fifa: FifaEvent): Map<AthleteId, number> {
  const pts = new Map<AthleteId, number>(athletes.map((a) => [a.id, 0]));

  if (!isKnockoutDecided(fifa.final) || !isKnockoutDecided(fifa.thirdPlace)) {
    return pts;
  }

  const pairings = knockoutPairings(fifa.league1, fifa.league2, fifa.fixtures);
  if (!pairings.final || !pairings.thirdPlace) return pts;

  const finalWinner =
    fifa.final.homeGoals! > fifa.final.awayGoals! ? pairings.final.home : pairings.final.away;
  const thirdWinner =
    fifa.thirdPlace.homeGoals! > fifa.thirdPlace.awayGoals!
      ? pairings.thirdPlace.home
      : pairings.thirdPlace.away;
  const finalLoser = pairings.final.home === finalWinner ? pairings.final.away : pairings.final.home;

  pts.set(finalWinner, 3);
  pts.set(finalLoser, 2);
  pts.set(thirdWinner, 1);

  return pts;
}
