import { EVENTS, eventById } from '../lib/config';
import type { EventId } from '../types';
import { useEventsStore } from '../store/events';
import { Aarticulate } from './events/Aarticulate';
import { Challenges } from './events/Challenges';
import { Fifa } from './events/Fifa';
import { Footgolf } from './events/Footgolf';
import { Frisbeegolf } from './events/Frisbeegolf';
import { Pool } from './events/Pool';

export function EventsIndex() {
  const selected = useEventsStore((s) => s.selected);
  const setSelected = useEventsStore((s) => s.setSelected);
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
      ) : event.id === 'pool' ? (
        <Pool />
      ) : event.id === 'footgolf' ? (
        <Footgolf />
      ) : event.id === 'frisbeegolf' ? (
        <Frisbeegolf />
      ) : event.id === 'aarticulate' ? (
        <Aarticulate />
      ) : event.id === 'challenges' ? (
        <Challenges />
      ) : (
        <section className="rounded-2xl border border-line bg-white p-6 text-center text-sm italic text-sub shadow-sm">
          {event.label} is not yet implemented — coming soon.
        </section>
      )}
    </div>
  );
}
