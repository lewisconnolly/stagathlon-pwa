import { useEffect, useState } from 'react';
import { useAdminStore } from '../store/admin';

interface ScoreInputProps {
  value: number | null;
  onCommit: (next: number | null) => void;
  ariaLabel: string;
}

export function ScoreInput({ value, onCommit, ariaLabel }: ScoreInputProps) {
  const isAdmin = useAdminStore((s) => s.isAdmin);
  const [local, setLocal] = useState<string>(value === null ? '' : String(value));

  useEffect(() => {
    setLocal(value === null ? '' : String(value));
  }, [value]);

  const commit = () => {
    if (local.trim() === '') {
      if (value !== null) onCommit(null);
      return;
    }
    const n = Number(local);
    if (!Number.isInteger(n) || n < 0) {
      setLocal(value === null ? '' : String(value));
      return;
    }
    if (n !== value) onCommit(n);
  };

  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      step={1}
      aria-label={ariaLabel}
      value={local}
      readOnly={!isAdmin}
      disabled={!isAdmin}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      }}
      className="w-12 rounded-lg border border-line bg-white px-1 py-1.5 text-center text-base tabular-nums shadow-sm focus:border-ink focus:outline-none disabled:bg-slate-100 disabled:text-sub"
    />
  );
}
