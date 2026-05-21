import { useState, type FormEvent } from 'react';
import challengesData from '../../challenges.json';

interface ChallengeEntry {
  key: string;
  name: string;
  points: number;
  challenge: string;
}

const ALL_CHALLENGES = challengesData.challenges as ChallengeEntry[];

type View = { mode: 'locked' } | { mode: 'input' } | { mode: 'unlocked'; entry: ChallengeEntry };

export function UnlockChallenge() {
  const [view, setView] = useState<View>({ mode: 'locked' });
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim().toLowerCase();
    const found = ALL_CHALLENGES.find((c) => c.key.toLowerCase() === trimmed);
    if (found) {
      setView({ mode: 'unlocked', entry: found });
      setInput('');
      setError(false);
    } else {
      setError(true);
      setView({ mode: 'locked' });
    }
  };

  const onTapLock = () => {
    setError(false);
    setView({ mode: 'input' });
  };

  const onCancel = () => {
    setInput('');
    setError(false);
    setView({ mode: 'locked' });
  };

  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <header className="border-b border-line px-4 py-2 text-center">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-sub">Unlock Challenge</h3>
      </header>

      <div className="p-6">
        {view.mode === 'locked' && (
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onTapLock}
              aria-label="Tap to unlock"
              className="flex flex-col items-center gap-2 text-ink transition hover:opacity-80"
            >
              <LockIcon />
              <span className="text-sm font-medium">Tap to unlock</span>
            </button>
            {error && <p className="text-sm font-medium text-red-700">Invalid password</p>}
          </div>
        )}

        {view.mode === 'input' && (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <label className="text-xs font-medium uppercase tracking-wide text-sub" htmlFor="pw">
              Password
            </label>
            <input
              id="pw"
              type="password"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2 text-base shadow-sm focus:border-ink focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={input.trim() === ''}
                className="rounded-md border border-ink bg-ink px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit
              </button>
            </div>
          </form>
        )}

        {view.mode === 'unlocked' && (
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              Hello <span className="font-semibold">{view.entry.name}</span>, here are the details of
              your challenge:
            </p>
            <p className="whitespace-pre-line rounded-md bg-slate-50 p-3 text-ink">
              {view.entry.challenge}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="80"
      height="80"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}
