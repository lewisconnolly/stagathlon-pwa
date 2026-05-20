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
  { id: 'pool', label: 'Pool', icon: '🎱', status: 'placeholder', instructions: ['Coming soon.'] },
  { id: 'footgolf', label: 'Footgolf', icon: '⚽', status: 'placeholder', instructions: ['Coming soon.'] },
  { id: 'frisbeegolf', label: 'Frisbeegolf', icon: '🥏', status: 'placeholder', instructions: ['Coming soon.'] },
  { id: 'aarticulate', label: 'Aarticulate', icon: '🗣️', status: 'placeholder', instructions: ['Coming soon.'] },
  { id: 'challenges', label: 'Challenges', icon: '❓', status: 'placeholder', instructions: ['Coming soon.'] }
];

export const eventById = (id: string): EventConfig | undefined =>
  EVENTS.find((e) => e.id === id);

export function generateRoundRobin(
  leagueNum: 1 | 2,
  athleteIds: string[]
): { id: string; league: 1 | 2; home: string; away: string }[] {
  const fixtures: { id: string; league: 1 | 2; home: string; away: string }[] = [];
  let n = 1;
  for (let i = 0; i < athleteIds.length; i++) {
    for (let j = i + 1; j < athleteIds.length; j++) {
      fixtures.push({
        id: `l${leagueNum}-${n++}`,
        league: leagueNum,
        home: athleteIds[i],
        away: athleteIds[j]
      });
    }
  }
  return fixtures;
}
