import { useState } from 'react';
import { useAdminStore } from '../store/admin';

export function AdminLock() {
  const { isAdmin, tryUnlock, lock } = useAdminStore();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tryUnlock(pin)) {
      setOpen(false);
      setPin('');
      setError(null);
    } else {
      setError('Wrong PIN');
    }
  };

  if (isAdmin) {
    return (
      <button
        type="button"
        onClick={lock}
        className="text-xs font-medium text-amber-700 hover:text-amber-900"
        title="Lock editing"
      >
        🔓 admin
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-slate-500 hover:text-slate-800"
        title="Unlock to edit"
      >
        🔒 view
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="mb-1 text-lg font-semibold text-ink">Enter admin PIN</h2>
            <p className="mb-4 text-sm text-sub">
              Unlocks score editing on this device.
            </p>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(null);
              }}
              className="mb-2 w-full rounded-lg border border-line px-3 py-2 text-center text-xl tracking-widest"
            />
            {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setPin('');
                  setError(null);
                }}
                className="flex-1 rounded-lg border border-line py-2 text-sm font-medium text-sub"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-ink py-2 text-sm font-semibold text-white"
              >
                Unlock
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
