import type { AthleteId, TeamEvent, TeamIndex, TeamStandings } from '../types';

type Position = keyof TeamStandings;
const POSITIONS: Position[] = ['first', 'second', 'third'];

export function setTeamName(event: TeamEvent, teamIdx: TeamIndex, name: string): TeamEvent {
  const teams = event.teams.map((t, i) => (i === teamIdx ? { ...t, name } : t)) as TeamEvent['teams'];
  return { ...event, teams };
}

export function setTeamMember(
  event: TeamEvent,
  teamIdx: TeamIndex,
  memberIdx: number,
  athleteId: AthleteId | null
): TeamEvent {
  const teams = event.teams.map((t, i) => {
    if (i === teamIdx) {
      const members = [...t.members];
      members[memberIdx] = athleteId;
      return { ...t, members };
    }
    // Remove athleteId from other teams (uniqueness)
    if (athleteId !== null && t.members.includes(athleteId)) {
      return { ...t, members: t.members.map((m) => (m === athleteId ? null : m)) };
    }
    return t;
  }) as TeamEvent['teams'];
  return { ...event, teams };
}

export function setStanding(
  event: TeamEvent,
  position: Position,
  teamIdx: TeamIndex | null
): TeamEvent {
  const standings: TeamStandings = { ...event.standings };
  // Clear any other position that previously held this team
  if (teamIdx !== null) {
    for (const p of POSITIONS) {
      if (standings[p] === teamIdx) standings[p] = null;
    }
  }
  standings[position] = teamIdx;
  return { ...event, standings };
}
