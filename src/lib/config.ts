import type { EventId } from '../types';

export interface EventConfig {
  id: EventId;
  label: string;
  icon: string;
  status: 'live' | 'placeholder';
  instructions: string[];
}

export const EVENTS: EventConfig[] = [
  {
    id: 'fifa',
    label: 'FIFA',
    icon: '🎮',
    status: 'live',
    instructions: [
      'Two leagues; 11 games total',
      'League winners play final for overall winner',
      'League runners-up play 3rd place play-off',
      'Winner gets 3 pts',
      'Runner-up gets 2 pts',
      '3rd place gets 1 pt',
      'League ties decided by GD → GF → Thumb War'
    ]
  },
  {
    id: 'pool',
    label: 'Pool',
    icon: '🎱',
    status: 'live',
    instructions: [
      'Knock-out tournament; 7 games total',
      'Quarters → Semis → Final',
      '3rd place play-off',
      '1 player gets a bye to the semi-final',
      'Winner gets 3 pts',
      'Runner-up gets 2 pts',
      '3rd place gets 1 pt'
    ]
  },
  {
    id: 'footgolf',
    label: 'FootGolf',
    icon: '⚽',
    status: 'live',
    instructions: [
      'Three teams — 3 vs 2 vs 2',
      'Winner = 2 pts to each member',
      'Runner-up = 1 pt to each member'
    ]
  },
  {
    id: 'frisbeegolf',
    label: 'FrisbeeGolf',
    icon: '🥏',
    status: 'live',
    instructions: [
      'Three teams — 3 vs 2 vs 2',
      'Winner = 2 pts to each member',
      'Runner-up = 1 pt to each member'
    ]
  },
  {
    id: 'aarticulate',
    label: 'Aarticulate!',
    icon: '🗣️',
    status: 'live',
    instructions: [
      'Three teams — 3 vs 2 vs 2',
      'Winner = 2 pts to each member',
      'Runner-up = 1 pt to each member',
      'Describer takes a shot when their time is up'
    ]
  },
  {
    id: 'challenges',
    label: 'Challenges',
    icon: '❓',
    status: 'live',
    instructions: [
      'Everyone has a secret challenge for the weekend',
      'Each challenge can be done multiple times',
      'You get a set number of points each time you complete your challenge',
      'If you fail to complete your challenge at least once, you will lose 5 pts',
      'If you get caught doing your challenge, you will lose 5 pts',
      'If by the end of the weekend nobody knows what your challenge was, and you completed it at least once, you get 5 bonus points',
      'While your challenge is still unknown, Lewis must see you complete it to earn a point'
    ]
  }
];

export const eventById = (id: string): EventConfig | undefined =>
  EVENTS.find((e) => e.id === id);

export const LEAGUE_SIZES = { 1: 3, 2: 4 } as const;

export function pairFixtureId(league: 1 | 2, a: string, b: string): string {
  const [x, y] = [a, b].sort();
  return `l${league}-${x}-${y}`;
}
