import type { AthleteId, PoolEvent, Side } from '../types';

type QfId = 'qf1' | 'qf2' | 'qf3';
type MatchId = QfId | 'sf1' | 'sf2' | 'final' | 'thirdPlace';

// Which SF depends on which QF.
const QF_TO_SF: Record<QfId, 'sf1' | 'sf2'> = {
  qf1: 'sf1',
  qf2: 'sf1',
  qf3: 'sf2'
};

function clearDownstreamOfQf(pool: PoolEvent, qf: QfId): PoolEvent {
  const sf = QF_TO_SF[qf];
  return {
    ...pool,
    [sf === 'sf1' ? 'sf1Winner' : 'sf2Winner']: null,
    finalWinner: null,
    thirdPlaceWinner: null
  };
}

function clearDownstreamOfBye(pool: PoolEvent): PoolEvent {
  return {
    ...pool,
    sf2Winner: null,
    finalWinner: null,
    thirdPlaceWinner: null
  };
}

function clearDownstreamOfSf(pool: PoolEvent, _sf: 'sf1' | 'sf2'): PoolEvent {
  return { ...pool, finalWinner: null, thirdPlaceWinner: null };
}

export function setQfSlot(
  pool: PoolEvent,
  qf: QfId,
  side: Side,
  athleteId: AthleteId | null
): PoolEvent {
  const updatedQf = { ...pool[qf], [side]: athleteId, winner: null };
  const next: PoolEvent = { ...pool, [qf]: updatedQf };
  return clearDownstreamOfQf(next, qf);
}

export function setBye(pool: PoolEvent, athleteId: AthleteId | null): PoolEvent {
  return clearDownstreamOfBye({ ...pool, byePlayer: athleteId });
}

export function setMatchWinner(pool: PoolEvent, match: MatchId, winner: Side | null): PoolEvent {
  if (match === 'qf1' || match === 'qf2' || match === 'qf3') {
    const next: PoolEvent = { ...pool, [match]: { ...pool[match], winner } };
    return clearDownstreamOfQf(next, match);
  }
  if (match === 'sf1' || match === 'sf2') {
    const next: PoolEvent = {
      ...pool,
      [match === 'sf1' ? 'sf1Winner' : 'sf2Winner']: winner
    };
    return clearDownstreamOfSf(next, match);
  }
  if (match === 'final') {
    return { ...pool, finalWinner: winner };
  }
  return { ...pool, thirdPlaceWinner: winner };
}
