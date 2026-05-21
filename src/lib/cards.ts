export interface ArticulateCard {
  id: string;
  person: string;
  world: string;
  object: string;
  action: string;
  media: string;
  random: string;
}

export type CardCategory = 'person' | 'world' | 'object' | 'action' | 'media' | 'random';

// Fisher-Yates shuffle. Returns a new array; does not mutate the input.
export function shuffleDeck<T>(cards: T[]): T[] {
  const out = [...cards];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
