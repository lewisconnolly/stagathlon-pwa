import { useState } from 'react';
import { EVENTS, eventById } from '../lib/config';
import type { EventId } from '../types';
import { Fifa } from './events/Fifa';

export function EventsIndex() {
  const [selected, setSelected] = useState<EventId>(EVENTS[0].id);
  const event = eventById(selected)!;

  return (
    <div className="space-y-5 py-4">
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-sub">Event</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value as EventId)}
          className="w-full rounded-xl border border-line bg-white px-3 py-3 text-base font-medium shadow-sm"
        >
          {EVENTS.map((e) => (
            <option key={e.id} value={e.id}>
              {e.icon} {e.label}
              {e.status === 'placeholder' ? ' (coming soon)' : ''}
            </option>
          ))}
        </select>
      </div>

      <section className="rounded-2xl border border-line bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-base font-semibold">Instructions</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-sub">
          {event.instructions.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>

      {event.id === 'fifa' ? (
        <Fifa />
      ) : (
        <section className="rounded-2xl border border-line bg-white p-6 text-center text-sm italic text-sub shadow-sm">
          {event.label} is not yet implemented — coming soon.
        </section>
      )}
    </div>
  );
}
