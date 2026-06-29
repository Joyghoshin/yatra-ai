import { useQuery, useMutation as useConvexMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTripStore } from "../store/useTripStore";
import { useAuthStore } from "../store/authStore";
import { formatDate } from "../lib/utils";
import { INDIAN_CITIES } from "../lib/indianCities";
import { INTERNATIONAL_CITIES } from "../lib/internationalCities";

export function MyTrips() {
  const {
    setSelectedCity, setSelectedIntlCity,
    setDates, setActiveTab, setTravelMode,
  } = useTripStore();
  const { user } = useAuthStore();
  const trips = useQuery(api.tripsFunctions.getTrips, { userId: user?.userId ?? "" });
  const deleteTrip = useConvexMutation(api.tripsFunctions.deleteTrip);

  const handleView = (trip: any) => {
    const isIntl = trip.travelMode === "international";
    setTravelMode(isIntl ? "international" : "india");
    setDates(trip.startDate, trip.endDate);

    if (isIntl) {
      // Try to find matching intl city, else reconstruct from saved data
      const found = INTERNATIONAL_CITIES.find(c => c.name === trip.city);
      if (found) {
        setSelectedIntlCity(found);
      } else {
        setSelectedIntlCity({
          name: trip.city,
          country: trip.state,
          lat: trip.lat ?? 0,
          lon: trip.lon ?? 0,
          timezone: trip.timezone ?? "UTC",
          currency: trip.currency ?? "USD",
        });
      }
      setSelectedCity(null);
    } else {
      // Try to find matching Indian city
      const found = INDIAN_CITIES.find(c => c.city === trip.city);
      if (found) {
        setSelectedCity(found);
      } else {
        setSelectedCity({
          city: trip.city,
          state: trip.state,
          lat: trip.lat ?? 0,
          lon: trip.lon ?? 0,
        });
      }
      setSelectedIntlCity(null);
    }

    // Restore AI recommendations and weather via store
    if (trip.aiRecommendations || trip.weatherData) {
      useTripStore.getState().restoreTrip({
        aiRecommendations: trip.aiRecommendations ? JSON.parse(trip.aiRecommendations) : null,
        weatherData: trip.weatherData ? JSON.parse(trip.weatherData) : null,
      });
    }

    setActiveTab("plan");
  };

  if (trips === undefined) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-white/5 rounded-2xl h-28 animate-pulse border border-white/5" />
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🗺️</div>
        <h3 className="text-lg font-semibold text-white mb-2">No trips saved yet</h3>
        <p className="text-sm text-gray-500 mb-6">Plan your first trip and save it!</p>
        <button
          onClick={() => setActiveTab("plan")}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700"
        >
          ✈️ Plan a Trip
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">🗂️ My Saved Trips ({trips.length})</h2>
      {trips.map((trip: any) => (
        <div
          key={trip._id}
          className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-base">
                  📍 {trip.city}, {trip.state}
                </h3>
                {trip.travelMode === "international" && (
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20">
                    ✈️ International
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
              </p>
              <p className="text-xs text-gray-700 mt-1">
                Saved on {new Date(trip.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric"
                })}
              </p>
              {trip.aiRecommendations && (
                <span className="inline-block mt-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                  ✅ AI data saved
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleView(trip)}
                className="text-xs px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-full hover:bg-blue-600/30 border border-blue-500/20"
              >
                ✈️ View
              </button>
              <button
                onClick={() => deleteTrip({ tripId: trip._id, userId: user?.userId ?? "" })}
                className="text-xs px-3 py-1.5 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 border border-red-500/20"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}