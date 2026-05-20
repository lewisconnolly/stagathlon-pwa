import type {
  Athlete,
  AthleteId,
  EventContribution,
  PoolEvent,
  PoolQuarterFinal,
  Side
} from '../../types';

const emptyQf = (): PoolQuarterFinal => ({ home: null, away: null, winner: null });

// Tolerates Firestore docs that still have the old `{ placeholder: true }`
// shape (or partially-missing fields) — fills in defaults instead of crashing.
export function ensurePoolShape(raw: unknown): PoolEvent {
  const p = (raw as Partial<PoolEvent> | null | undefined) ?? {};
  return {
    qf1: p.qf1 ?? emptyQf(),
    qf2: p.qf2 ?? emptyQf(),
    qf3: p.qf3 ?? emptyQf(),
    byePlayer: p.byePlayer ?? null,
    sf1Winner: p.sf1Winner ?? null,
    sf2Winner: p.sf2Winner ?? null,
    finalWinner: p.finalWinner ?? null,
    thirdPlaceWinner: p.thirdPlaceWinner ?? null
  };
}

interface MatchView {
  home: AthleteId | null;
  away: AthleteId | null;
  winner: Side | null;
}

export interface PoolMatchView {
  qf1: MatchView;
  qf2: MatchView;
  qf3: MatchView;
  sf1: MatchView;
  sf2: MatchView;
  final: MatchView;
  thirdPlace: MatchView;
}

const winnerOf = (m: MatchView): AthleteId | null =>
  m.winner === 'home' ? m.home : m.winner === 'away' ? m.away : null;
const loserOf = (m: MatchView): AthleteId | null =>
  m.winner === 'home' ? m.away : m.winner === 'away' ? m.home : null;

export function derivePoolMatches(pool: PoolEvent): PoolMatchView {
  const sf1: MatchView = {
    home: winnerOf(pool.qf1),
    away: winnerOf(pool.qf2),
    winner: pool.sf1Winner
  };
  const sf2: MatchView = {
    home: winnerOf(pool.qf3),
    away: pool.byePlayer,
    winner: pool.sf2Winner
  };
  const final: MatchView = {
    home: winnerOf(sf1),
    away: winnerOf(sf2),
    winner: pool.finalWinner
  };
  const thirdPlace: MatchView = {
    home: loserOf(sf1),
    away: loserOf(sf2),
    winner: pool.thirdPlaceWinner
  };
  return { qf1: pool.qf1, qf2: pool.qf2, qf3: pool.qf3, sf1, sf2, final, thirdPlace };
}

type StartSlot =
  | { kind: 'qf'; match: 'qf1' | 'qf2' | 'qf3'; side: Side }
  | { kind: 'bye' };

function findStartingSlot(id: AthleteId, pool: PoolEvent): StartSlot | null {
  if (pool.qf1.home === id) return { kind: 'qf', match: 'qf1', side: 'home' };
  if (pool.qf1.away === id) return { kind: 'qf', match: 'qf1', side: 'away' };
  if (pool.qf2.home === id) return { kind: 'qf', match: 'qf2', side: 'home' };
  if (pool.qf2.away === id) return { kind: 'qf', match: 'qf2', side: 'away' };
  if (pool.qf3.home === id) return { kind: 'qf', match: 'qf3', side: 'home' };
  if (pool.qf3.away === id) return { kind: 'qf', match: 'qf3', side: 'away' };
  if (pool.byePlayer === id) return { kind: 'bye' };
  return null;
}

function traceFromSf(
  sfName: 'sf1' | 'sf2',
  sfSide: Side,
  pool: PoolEvent
): EventContribution {
  const sfWinner = sfName === 'sf1' ? pool.sf1Winner : pool.sf2Winner;
  if (sfWinner === null) return 'pending';

  if (sfWinner === sfSide) {
    const finalSide: Side = sfName === 'sf1' ? 'home' : 'away';
    if (pool.finalWinner === null) return 'pending';
    return pool.finalWinner === finalSide ? 3 : 2;
  }
  const thirdSide: Side = sfName === 'sf1' ? 'home' : 'away';
  if (pool.thirdPlaceWinner === null) return 'pending';
  return pool.thirdPlaceWinner === thirdSide ? 1 : 0;
}

function traceAthlete(id: AthleteId, pool: PoolEvent): EventContribution {
  const start = findStartingSlot(id, pool);
  if (!start) return 'pending';

  if (start.kind === 'bye') {
    return traceFromSf('sf2', 'away', pool);
  }

  const qf = pool[start.match];
  if (qf.winner === null) return 'pending';
  if (qf.winner !== start.side) return 0;

  const sfName: 'sf1' | 'sf2' = start.match === 'qf3' ? 'sf2' : 'sf1';
  const sfSide: Side = start.match === 'qf1' || start.match === 'qf3' ? 'home' : 'away';
  return traceFromSf(sfName, sfSide, pool);
}

export function poolContributions(
  athletes: Athlete[],
  pool: PoolEvent
): Map<AthleteId, EventContribution> {
  const result = new Map<AthleteId, EventContribution>();
  for (const a of athletes) {
    result.set(a.id, traceAthlete(a.id, pool));
  }
  return result;
}

export function poolPoints(athletes: Athlete[], pool: PoolEvent): Map<AthleteId, number> {
  const out = new Map<AthleteId, number>();
  for (const [id, val] of poolContributions(athletes, pool)) {
    out.set(id, typeof val === 'number' ? val : 0);
  }
  return out;
}
