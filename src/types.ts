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

export type Side = 'home' | 'away';
export type KnockoutSide = Side;

export interface FifaKnockoutScore {
  homeGoals: number | null;
  awayGoals: number | null;
  wonOnPens: KnockoutSide | null;
}

export type LeagueSlot = AthleteId | null;

export interface FifaEvent {
  league1: LeagueSlot[];
  league2: LeagueSlot[];
  fixtures: FifaFixture[];
  final: FifaKnockoutScore;
  thirdPlace: FifaKnockoutScore;
}

export interface PlaceholderEvent {
  placeholder: true;
}

export interface PoolQuarterFinal {
  home: AthleteId | null;
  away: AthleteId | null;
  winner: Side | null;
}

export interface PoolEvent {
  qf1: PoolQuarterFinal;
  qf2: PoolQuarterFinal;
  qf3: PoolQuarterFinal;
  byePlayer: AthleteId | null;
  sf1Winner: Side | null;
  sf2Winner: Side | null;
  finalWinner: Side | null;
  thirdPlaceWinner: Side | null;
}

export type EventId = 'fifa' | 'pool' | 'footgolf' | 'frisbeegolf' | 'aarticulate' | 'challenges';

export interface CompetitionEvents {
  fifa: FifaEvent;
  pool: PoolEvent;
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

export type FifaContribution = number | 'pending';
export type EventContribution = FifaContribution;
