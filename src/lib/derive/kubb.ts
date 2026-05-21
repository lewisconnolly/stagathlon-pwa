import type {
  Athlete,
  AthleteId,
  EventContribution,
  KubbEvent,
  KubbSemiFinal,
  KubbTeamIndex,
  Side,
  TeamConfig
} from '../../types';

const TEAM_SIZES = [2, 2, 2, 1] as const;

const defaultTeam = (name: string, size: number): TeamConfig => ({
  name,
  members: Array(size).fill(null)
});

function isValidTeamIndex(v: unknown): v is KubbTeamIndex {
  return v === 0 || v === 1 || v === 2 || v === 3;
}

function isValidSide(v: unknown): v is Side {
  return v === 'home' || v === 'away';
}

function ensureSf(raw: unknown): KubbSemiFinal {
  const r = (raw as Partial<KubbSemiFinal> | null | undefined) ?? {};
  return {
    home: isValidTeamIndex(r.home) ? r.home : null,
    away: isValidTeamIndex(r.away) ? r.away : null,
    winner: isValidSide(r.winner) ? r.winner : null
  };
}

export function ensureKubbShape(raw: unknown): KubbEvent {
  const e = (raw as Partial<KubbEvent> | null | undefined) ?? {};
  const rawTeams = Array.isArray(e.teams) ? e.teams : [];
  const teams = TEAM_SIZES.map((size, i) => {
    const t = rawTeams[i] as Partial<TeamConfig> | undefined;
    if (!t || typeof t !== 'object') return defaultTeam(`Team ${i + 1}`, size);
    const members = Array.isArray(t.members) ? t.members.slice(0, size) : [];
    while (members.length < size) members.push(null);
    return {
      name: typeof t.name === 'string' ? t.name : `Team ${i + 1}`,
      members
    };
  }) as [TeamConfig, TeamConfig, TeamConfig, TeamConfig];

  return {
    teams,
    sf1: ensureSf(e.sf1),
    sf2: ensureSf(e.sf2),
    finalWinner: isValidSide(e.finalWinner) ? e.finalWinner : null
  };
}

function findKubbTeamIndexOf(athleteId: AthleteId, event: KubbEvent): KubbTeamIndex | null {
  for (let i = 0; i < event.teams.length; i++) {
    if (event.teams[i].members.includes(athleteId)) {
      return i as KubbTeamIndex;
    }
  }
  return null;
}

function findSfFor(
  teamIdx: KubbTeamIndex,
  event: KubbEvent
): { sf: KubbSemiFinal; side: Side } | null {
  if (event.sf1.home === teamIdx) return { sf: event.sf1, side: 'home' };
  if (event.sf1.away === teamIdx) return { sf: event.sf1, side: 'away' };
  if (event.sf2.home === teamIdx) return { sf: event.sf2, side: 'home' };
  if (event.sf2.away === teamIdx) return { sf: event.sf2, side: 'away' };
  return null;
}

function winnerTeam(sf: KubbSemiFinal): KubbTeamIndex | null {
  if (sf.winner === 'home') return sf.home;
  if (sf.winner === 'away') return sf.away;
  return null;
}

export interface KubbMatchView {
  sf1: { home: KubbTeamIndex | null; away: KubbTeamIndex | null; winner: Side | null };
  sf2: { home: KubbTeamIndex | null; away: KubbTeamIndex | null; winner: Side | null };
  final: { home: KubbTeamIndex | null; away: KubbTeamIndex | null; winner: Side | null };
}

export function deriveKubbMatches(event: KubbEvent): KubbMatchView {
  return {
    sf1: { home: event.sf1.home, away: event.sf1.away, winner: event.sf1.winner },
    sf2: { home: event.sf2.home, away: event.sf2.away, winner: event.sf2.winner },
    final: {
      home: winnerTeam(event.sf1),
      away: winnerTeam(event.sf2),
      winner: event.finalWinner
    }
  };
}

export function kubbContributions(
  athletes: Athlete[],
  event: KubbEvent
): Map<AthleteId, EventContribution> {
  const out = new Map<AthleteId, EventContribution>();
  const sf1Winner = winnerTeam(event.sf1);
  const sf2Winner = winnerTeam(event.sf2);

  for (const a of athletes) {
    const teamIdx = findKubbTeamIndexOf(a.id, event);
    if (teamIdx === null) {
      out.set(a.id, 'pending');
      continue;
    }
    const sfMatch = findSfFor(teamIdx, event);
    if (!sfMatch) {
      out.set(a.id, 'pending');
      continue;
    }
    if (sfMatch.sf.winner === null) {
      out.set(a.id, 'pending');
      continue;
    }
    if (sfMatch.sf.winner !== sfMatch.side) {
      // Lost in SF
      out.set(a.id, 0);
      continue;
    }
    // Won the SF — go to final
    if (event.finalWinner === null) {
      out.set(a.id, 'pending');
      continue;
    }
    // Are they final.home or final.away?
    const isFinalHome = sf1Winner === teamIdx;
    const isFinalAway = sf2Winner === teamIdx;
    const finalSide: Side | null = isFinalHome ? 'home' : isFinalAway ? 'away' : null;
    if (finalSide === null) {
      out.set(a.id, 'pending');
      continue;
    }
    out.set(a.id, finalSide === event.finalWinner ? 2 : 1);
  }
  return out;
}

export function kubbPoints(athletes: Athlete[], event: KubbEvent): Map<AthleteId, number> {
  const out = new Map<AthleteId, number>();
  for (const [id, val] of kubbContributions(athletes, event)) {
    out.set(id, typeof val === 'number' ? val : 0);
  }
  return out;
}
