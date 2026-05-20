import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminState {
  isAdmin: boolean;
  tryUnlock: (pin: string) => boolean;
  lock: () => void;
}

const ADMIN_PIN = String(import.meta.env.VITE_ADMIN_PIN ?? '');

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAdmin: false,
      tryUnlock: (pin: string) => {
        if (ADMIN_PIN && pin === ADMIN_PIN) {
          set({ isAdmin: true });
          return true;
        }
        return false;
      },
      lock: () => set({ isAdmin: false })
    }),
    { name: 'stagathlon-admin' }
  )
);
