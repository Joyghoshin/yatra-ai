import { create } from "zustand";
import { useTripStore } from "./useTripStore";

interface AuthUser {
  userId: string;
  name: string;
  email: string;
}

interface AuthStore {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    useTripStore.getState().reset(); // ← clears all trip state
    set({ user: null });
  },
}));