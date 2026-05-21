import type { AthleteId, KubbEvent, KubbTeamIndex, Side } from '../types';

export type KubbMatchId = 'sf1' | 'sf2' | 'final';
export type SfId = 'sf1' | 'sf2';

export function setKubbTeamName(
  event: KubbEvent,
  teamIdx: KubbTeamIndex,
  name: string
): KubbEvent {
  const teams = event.teams.map((t, i) => (i === teamIdx ? { ...t, name } : t)) as KubbEvent['teams'];
  return { ...event, teams };
}

export function setKubbTeamMember(
  event: KubbEvent,
  teamIdx: KubbTeamIndex,
  memberIdx: number,
  athleteId: AthleteId | null
): KubbEvent {
  const teams = event.teams.map((t, i) => {
    if (i === teamIdx) {
      const members = [...t.members];
      members[memberIdx] = athleteId;
      return { ...t, members };
    }
    if (athleteId !== null && t.members.includes(athleteId)) {
      return { ...t, members: t.members.map((m) => (m === athleteId ? null : m)) };
    }
    return t;
  }) as KubbEvent['teams'];
  return { ...event, teams };
}

export function setSfTeam(
  event: KubbEvent,
  sf: SfId,
  side: Side,
  teamIdx: KubbTeamIndex | null
): KubbEvent {
  // Build new sf1/sf2; if assigning a team, vacate any other slot it already holds.
  const sfState: Record<SfId, KubbEvent['sf1']> = {
    sf1: { ...event.sf1 },
    sf2: { ...event.sf2 }
  };

  if (teamIdx !== null) {
    for (const k of ['sf1', 'sf2'] as SfId[]) {
      for (const s of ['home', 'away'] as Side[]) {
        if (sfState[k][s] === teamIdx && !(k === sf && s === side)) {
          // Vacating this slot — clear the winner of that SF since its lineup changed.
          sfState[k] = { ...sfState[k], [s]: null, winner: null };
        }
      }
    }
  }

  // If the target slot currently holds a different team, changing it changes the lineup → clear its winner.
  const target = sfState[sf];
  const previousAtTarget = target[side];
  const lineupChanged = previousAtTarget !== teamIdx;
  sfState[sf] = {
    ...target,
    [side]: teamIdx,
    winner: lineupChanged ? null : target.winner
  };

  const sfWinnerChanged =
    sfState.sf1.winner !== event.sf1.winner || sfState.sf2.winner !== event.sf2.winner;

  return {
    ...event,
    sf1: sfState.sf1,
    sf2: sfState.sf2,
    finalWinner: sfWinnerChanged ? null : event.finalWinner
  };
}

export function setKubbMatchWinner(
  event: KubbEvent,
  match: KubbMatchId,
  winner: Side | null
): KubbEvent {
  if (match === 'final') {
    return { ...event, finalWinner: winner };
  }
  const next: KubbEvent = {
    ...event,
    [match]: { ...event[match], winner }
  };
  // Changing a SF winner invalidates the final pairing.
  if (winner !== event[match].winner) {
    next.finalWinner = null;
  }
  return next;
}
