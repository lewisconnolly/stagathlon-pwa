import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompetition } from '../lib/competition';
import { leaderboard } from '../lib/derive';
import { EVENTS } from '../lib/config';
import { useEventsStore } from '../store/events';

export function Leaderboard() {
  const { status, data } = useCompetition();
  const navigate = useNavigate();
  const setSelected = useEventsStore((s) => s.setSelected);

  const rows = useMemo(() => (data ? leaderboard(data) : []), [data]);
  const athleteName = useMemo(() => {
    const map = new Map<string, string>();
    data?.athletes.forEach((a) => map.set(a.id, a.name));
    return map;
  }, [data]);

  if (status === 'loading') {
    return <p className="py-6 text-sm text-sub">Loading leaderboard…</p>;
  }
  if (!data) {
    return null;
  }

  return (
    <div className="space-y-5 py-4">
      <header className="text-center">
        <h2 className="text-3xl font-extrabold uppercase tracking-tight">Stagathlon</h2>
      </header>

      <section className="rounded-2xl border border-line bg-white p-4 shadow-sm">
        <ul className="list-disc space-y-1 pl-5 text-sm text-sub">
          <li>Welcome to the Stagathlon</li>
          <li>7 events across two days</li>
          <li>Doing well in an event can earn you points towards your total on the leaderboard</li>
          <li>You can use this website to track everyone's points</li>
          <li>Only Lewis can update it</li>
          <li>Good luck!</li>
        </ul>
      </section>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-sub">
            <tr>
              <th className="px-3 py-2 text-left">Athlete</th>
              {EVENTS.map((e) => (
                <th key={e.id} className="px-2 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(e.id);
                      navigate('/events');
                    }}
                    aria-label={`Go to ${e.label}`}
                    className="rounded p-1 text-base leading-none hover:bg-slate-200 active:bg-slate-300"
                  >
                    {e.icon}
                  </button>
                </th>
              ))}
              <th className="px-3 py-2 text-right">Tot</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.athleteId} className="border-t border-line">
                <td className="px-3 py-2 font-medium">{athleteName.get(row.athleteId) ?? row.athleteId}</td>
                {EVENTS.map((e) => (
                  <td key={e.id} className="px-2 py-2 text-center tabular-nums text-sub">
                    {row.perEvent[e.id] || ''}
                  </td>
                ))}
                <td className="px-3 py-2 text-right text-base font-semibold tabular-nums">
                  {row.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
