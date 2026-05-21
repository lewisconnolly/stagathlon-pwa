import { useMemo, useState } from 'react';
import { useAdminStore } from '../../store/admin';
import { shuffleDeck, type ArticulateCard, type CardCategory } from '../../lib/cards';
import cardsData from '../../aarticulate.json';

const CATEGORIES: Array<{
  key: CardCategory;
  label: string;
  letter: string;
  badgeBg: string;
  suitBg: string;
}> = [
  { key: 'person', label: 'Person', letter: 'P', badgeBg: 'bg-yellow-400', suitBg: 'bg-yellow-400' },
  { key: 'world', label: 'World', letter: 'W', badgeBg: 'bg-sky-400', suitBg: 'bg-sky-400' },
  { key: 'object', label: 'Object', letter: 'O', badgeBg: 'bg-blue-600', suitBg: 'bg-blue-600' },
  { key: 'action', label: 'Action', letter: 'A', badgeBg: 'bg-orange-500', suitBg: 'bg-orange-500' },
  { key: 'media', label: 'Media', letter: 'M', badgeBg: 'bg-green-600', suitBg: 'bg-green-600' },
  { key: 'random', label: 'Random', letter: 'R', badgeBg: 'bg-red-600', suitBg: 'bg-red-600' }
];

const ALL_CARDS = cardsData.cards as ArticulateCard[];

export function Cards() {
  const isAdmin = useAdminStore((s) => s.isAdmin);
  const deck = useMemo(() => shuffleDeck(ALL_CARDS), []);

  const [position, setPosition] = useState(0);
  const [score, setScore] = useState(0);
  const [passedCardId, setPassedCardId] = useState<string | null>(null);
  const [viewingPassed, setViewingPassed] = useState(false);

  const deckExhausted = position >= deck.length;
  const currentCard = deckExhausted ? null : deck[position];
  const passedCard = passedCardId
    ? deck.find((c) => c.id === passedCardId) ?? null
    : null;
  const displayedCard = viewingPassed && passedCard ? passedCard : currentCard;

  const onCorrect = () => {
    if (viewingPassed && passedCard) {
      setPassedCardId(null);
      setViewingPassed(false);
      setScore((s) => s + 1);
      return;
    }
    if (!deckExhausted) {
      setPosition((p) => p + 1);
      setScore((s) => s + 1);
    }
  };

  const onPass = () => {
    if (deckExhausted || passedCardId !== null || !currentCard) return;
    setPassedCardId(currentCard.id);
    setPosition((p) => p + 1);
  };

  const onTogglePassed = () => {
    if (!passedCard) return;
    setViewingPassed((v) => !v);
  };

  const onReset = () => {
    setScore(0);
    setPassedCardId(null);
    setViewingPassed(false);
  };

  if (!isAdmin) {
    return (
      <section className="rounded-2xl border border-line bg-white p-6 text-center text-sm italic text-sub shadow-sm">
        Cards are visible to the describer (admin) only.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <header className="border-b border-line px-4 py-2 text-center">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-sub">Cards</h3>
        <p className="mt-1 text-base font-medium tabular-nums">
          {Math.min(position + 1, deck.length)}/{deck.length}
        </p>
      </header>

      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <span className="text-sm font-semibold uppercase tracking-wide text-sub">
          Total: <span className="text-ink tabular-nums">{score}</span>
        </span>
        <button
          type="button"
          onClick={onReset}
          className="rounded-md border border-line bg-white px-3 py-1 text-sm font-medium text-ink shadow-sm hover:bg-slate-50"
        >
          Reset
        </button>
      </div>

      <div className="p-4">
        {displayedCard ? (
          <CardFace card={displayedCard} highlighted={viewingPassed} />
        ) : (
          <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm italic text-sub">
            Deck exhausted — reload the page to shuffle a new deck.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-line p-3">
        <button
          type="button"
          onClick={onPass}
          disabled={deckExhausted || passedCardId !== null}
          className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold uppercase tracking-wide text-ink shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Pass
        </button>
        <button
          type="button"
          onClick={onCorrect}
          disabled={!displayedCard}
          className="rounded-md border border-green-600 bg-green-600 px-3 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Correct
        </button>
        <button
          type="button"
          onClick={onTogglePassed}
          disabled={!passedCard}
          className="col-span-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold uppercase tracking-wide text-ink shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {viewingPassed ? 'Back to current card' : 'Passed card'}
        </button>
      </div>
    </section>
  );
}

function CardFace({ card, highlighted }: { card: ArticulateCard; highlighted: boolean }) {
  return (
    <div
      className={[
        'overflow-hidden rounded-lg border-2 bg-white',
        highlighted ? 'border-amber-500 ring-2 ring-amber-200' : 'border-line'
      ].join(' ')}
    >
      {CATEGORIES.map((cat) => (
        <div
          key={cat.key}
          className="flex items-center gap-3 border-b border-line bg-slate-50 px-2 py-2 last:border-b-0 odd:bg-white"
        >
          <span
            className={[
              'flex h-7 w-7 shrink-0 items-center justify-center rounded text-base font-bold text-white',
              cat.badgeBg
            ].join(' ')}
          >
            {cat.letter}
          </span>
          <span className="flex-1 truncate text-base font-medium text-ink">{card[cat.key]}</span>
          <span
            className={[
              'flex h-7 w-7 shrink-0 items-center justify-center rounded text-sm text-white',
              cat.suitBg
            ].join(' ')}
            aria-hidden
          >
            ♠
          </span>
        </div>
      ))}
    </div>
  );
}
