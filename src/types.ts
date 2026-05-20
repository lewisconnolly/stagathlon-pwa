export type AthleteId = string;

export interface Athlete {
  id: AthleteId;
  name: string;
}

export type LeagueNum = 1 | 2;

export interface FifaFixture {
  id: string;
  league: LeagueNum;
  home: AthleteId;
  away: AthleteId;
  homeGoals: number | null;
  awayGoals: number | null;
}

export interface FifaKnockoutScore {
  homeGoals: number | null;
  awayGoals: number | null;
}

export interface FifaEvent {
  league1: AthleteId[];
  league2: AthleteId[];
  fixtures: FifaFixture[];
  final: FifaKnockoutScore;
  thirdPlace: FifaKnockoutScore;
}

export interface PlaceholderEvent {
  placeholder: true;
}

export type EventId = 'fifa' | 'pool' | 'footgolf' | 'frisbeegolf' | 'aarticulate' | 'challenges';

export interface CompetitionEvents {
  fifa: FifaEvent;
  pool: PlaceholderEvent;
  footgolf: PlaceholderEvent;
  frisbeegolf: PlaceholderEvent;
  aarticulate: PlaceholderEvent;
  challenges: PlaceholderEvent;
}

export interface Competition {
  athletes: Athlete[];
  events: CompetitionEvents;
}

export interface LeagueRow {
  athleteId: AthleteId;
  gf: number;
  ga: number;
  gd: number;
  w: number;
  d: number;
  l: number;
  pts: number;
  tiebreakNeeded: boolean;
}

export interface KnockoutPairing {
  home: AthleteId;
  away: AthleteId;
}

export interface KnockoutPairings {
  final: KnockoutPairing | null;
  thirdPlace: KnockoutPairing | null;
}

export interface LeaderboardRow {
  athleteId: AthleteId;
  perEvent: Record<EventId, number>;
  total: number;
}
