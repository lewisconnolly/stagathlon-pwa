import { useState } from 'react';
import { useAdminStore } from '../../store/admin';
import challengesData from '../../challenges.json';

interface ChallengeEntry {
  key: string;
  name: string;
  points: number;
  challenge: string;
}

const ALL_CHALLENGES = challengesData.challenges as ChallengeEntry[];

export function AllChallenges() {
  const isAdmin = useAdminStore((s) => s.isAdmin);
  const [open, setOpen] = useState(false);

  if (!isAdmin) return null;

  return (
    <section className="rounded-2xl border border-line bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between border-b border-line px-4 py-2 text-left"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-sub">
          All challenges
        </h3>
        <span aria-hidden className="text-sub">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <ul className="divide-y divide-line">
          {ALL_CHALLENGES.map((c) => (
            <li key={c.key} className="space-y-1 px-4 py-3 text-sm">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold text-ink">{c.name}</span>
                <span className="text-xs text-sub">
                  password: <code className="rounded bg-slate-100 px-1 py-0.5 text-ink">{c.key}</code>
                </span>
              </div>
              <p className="whitespace-pre-line rounded-md bg-slate-50 p-3 text-ink">
                {c.challenge}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
