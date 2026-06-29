import { create } from "zustand";
import { INDIAN_CITIES } from "../lib/indianCities";

import type { InternationalCity } from "../lib/internationalCities";

export type IndianCity = typeof INDIAN_CITIES[0];

export interface AIRecommendations {
  packing: string[];
  places: string[];
  food: string[];
  budgetINR: { budget: string; mid: string; luxury: string };
  monsoonAlert?: string | null;
  currency?: { code: string; rate: string; tip: string };
  flights?: { bestTime: string; avgPriceINR: string; airlines: string[] };
  hotels?: { budget: string; mid: string; luxury: string; areas: string[] };
  visaInfo?: string;
}

export interface Trip {
  _id?: string;
  userId: string;
  city: string;
  state: string;
  startDate: string;
  endDate: string;
  aiRecommendations?: AIRecommendations;
  createdAt?: number;
}

interface TripStore {
  travelMode: "india" | "international";
  selectedCity: IndianCity | null;
  selectedIntlCity: InternationalCity | null;
  startDate: string;
  endDate: string;
  currentTrip: Trip | null;
  savedTrips: Trip[];
  isGeneratingAI: boolean;
  activeTab: "plan" | "trips";
  // ✅ NEW
  restoredReco: any | null;
  restoredWeather: any | null;
  setTravelMode: (mode: "india" | "international") => void;
  setSelectedCity: (city: IndianCity | null) => void;
  setSelectedIntlCity: (city: InternationalCity | null) => void;
  setDates: (start: string, end: string) => void;
  setCurrentTrip: (trip: Trip | null) => void;
  setSavedTrips: (trips: Trip[]) => void;
  addSavedTrip: (trip: Trip) => void;
  removeSavedTrip: (id: string) => void;
  setIsGeneratingAI: (val: boolean) => void;
  setActiveTab: (tab: "plan" | "trips") => void;
  reset: () => void;
  // ✅ NEW
  restoreTrip: (data: { aiRecommendations: any; weatherData: any }) => void;
  clearRestored: () => void;
}

const initialState = {
  travelMode: "india" as const,
  selectedCity: null,
  selectedIntlCity: null,
  startDate: "",
  endDate: "",
  currentTrip: null,
  savedTrips: [],
  isGeneratingAI: false,
  activeTab: "plan" as const,
  // ✅ NEW
  restoredReco: null,
  restoredWeather: null,
};

export const useTripStore = create<TripStore>((set) => ({
  ...initialState,
  setTravelMode: (mode) =>
    set({ travelMode: mode, selectedCity: null, selectedIntlCity: null }),
  setSelectedCity: (city) => set({ selectedCity: city }),
  setSelectedIntlCity: (city) => set({ selectedIntlCity: city }),
  setDates: (start, end) => set({ startDate: start, endDate: end }),
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  setSavedTrips: (trips) => set({ savedTrips: trips }),
  addSavedTrip: (trip) =>
    set((state) => ({ savedTrips: [trip, ...state.savedTrips] })),
  removeSavedTrip: (id) =>
    set((state) => ({
      savedTrips: state.savedTrips.filter((t) => t._id !== id),
    })),
  setIsGeneratingAI: (val) => set({ isGeneratingAI: val }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  reset: () => set(initialState),
  // ✅ NEW
  restoreTrip: (data) => set({
    restoredReco: data.aiRecommendations,
    restoredWeather: data.weatherData,
  }),
  clearRestored: () => set({ restoredReco: null, restoredWeather: null }),
}));