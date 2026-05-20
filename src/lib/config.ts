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
  { id: 'footgolf', label: 'Footgolf', icon: '⚽', status: 'placeholder', instructions: ['Coming soon.'] },
  { id: 'frisbeegolf', label: 'Frisbeegolf', icon: '🥏', status: 'placeholder', instructions: ['Coming soon.'] },
  { id: 'aarticulate', label: 'Aarticulate', icon: '🗣️', status: 'placeholder', instructions: ['Coming soon.'] },
  { id: 'challenges', label: 'Challenges', icon: '❓', status: 'placeholder', instructions: ['Coming soon.'] }
];

export const eventById = (id: string): EventConfig | undefined =>
  EVENTS.find((e) => e.id === id);

export const LEAGUE_SIZES = { 1: 3, 2: 4 } as const;

export function pairFixtureId(league: 1 | 2, a: string, b: string): string {
  const [x, y] = [a, b].sort();
  return `l${league}-${x}-${y}`;
}
