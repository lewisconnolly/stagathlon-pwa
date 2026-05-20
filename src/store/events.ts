import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EventId } from '../types';
import { EVENTS, eventById } from '../lib/config';

interface EventsState {
  selected: EventId;
  setSelected: (id: EventId) => void;
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set) => ({
      selected: EVENTS[0].id,
      setSelected: (id) => set({ selected: id })
    }),
    {
      name: 'stagathlon-events',
      onRehydrateStorage: () => (state) => {
        if (state && !eventById(state.selected)) {
          state.selected = EVENTS[0].id;
        }
      }
    }
  )
);
