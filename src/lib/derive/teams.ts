import type {
  Athlete,
  AthleteId,
  EventContribution,
  TeamConfig,
  TeamEvent,
  TeamIndex,
  TeamStandings
} from '../../types';

const defaultTeam = (name: string, size: number): TeamConfig => ({
  name,
  members: Array(size).fill(null)
});

const defaultStandings = (): TeamStandings => ({
  first: null,
  second: null,
  third: null
});

// Tolerates Firestore docs that still have the old `{ placeholder: true }`
// shape (or partially-missing fields) — fills in defaults instead of crashing.
export function ensureTeamEventShape(raw: unknown): TeamEvent {
  const e = (raw as Partial<TeamEvent> | null | undefined) ?? {};
  const rawTeams = Array.isArray(e.teams) ? e.teams : [];
  const sizes = [3, 2, 2];
  const teams = sizes.map((size, i) => {
    const t = rawTeams[i] as Partial<TeamConfig> | undefined;
    if (!t || typeof t !== 'object') return defaultTeam(`Team ${i + 1}`, size);
    return {
      name: typeof t.name === 'string' ? t.name : `Team ${i + 1}`,
      members: Array.isArray(t.members) ? t.members : Array(size).fill(null)
    };
  }) as [TeamConfig, TeamConfig, TeamConfig];

  const s = e.standings ?? defaultStandings();
  return {
    teams,
    standings: {
      first: isValidIndex(s.first) ? s.first : null,
      second: isValidIndex(s.second) ? s.second : null,
      third: isValidIndex(s.third) ? s.third : null
    }
  };
}

function isValidIndex(v: unknown): v is TeamIndex {
  return v === 0 || v === 1 || v === 2;
}

const POSITIONS: Array<keyof TeamStandings> = ['first', 'second', 'third'];

function findTeamIndexOf(athleteId: AthleteId, event: TeamEvent): TeamIndex | null {
  for (let i = 0; i < event.teams.length; i++) {
    if (event.teams[i].members.includes(athleteId)) {
      return i as TeamIndex;
    }
  }
  return null;
}

function pointsForPosition(position: keyof TeamStandings): number {
  if (position === 'first') return 2;
  if (position === 'second') return 1;
  return 0;
}

export function teamContributions(
  athletes: Athlete[],
  event: TeamEvent
): Map<AthleteId, EventContribution> {
  const out = new Map<AthleteId, EventContribution>();

  for (const a of athletes) {
    const teamIdx = findTeamIndexOf(a.id, event);
    if (teamIdx === null) {
      out.set(a.id, 'pending');
      continue;
    }
    const position = POSITIONS.find((p) => event.standings[p] === teamIdx);
    if (!position) {
      out.set(a.id, 'pending');
      continue;
    }
    out.set(a.id, pointsForPosition(position));
  }
  return out;
}

export function teamPoints(athletes: Athlete[], event: TeamEvent): Map<AthleteId, number> {
  const out = new Map<AthleteId, number>();
  for (const [id, val] of teamContributions(athletes, event)) {
    out.set(id, typeof val === 'number' ? val : 0);
  }
  return out;
}
