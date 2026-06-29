import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAction, useMutation as useConvexMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTripStore } from "../store/useTripStore";
import { useAuthStore } from "../store/authStore";
import { useWeather } from "../hooks/useWeather";
import { getWeatherDesc } from "../lib/utils";

function PlaceImage({ placeName }: { placeName: string }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchWikiImage() {
      try {
        const searchRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(placeName)}&utf8=&format=json&origin=*`
        );
        const searchData = await searchRes.json();
        const title = searchData?.query?.search?.[0]?.title;
        if (!title) throw new Error("No page found");
        const imageRes = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=600&format=json&origin=*`
        );
        const imageData = await imageRes.json();
        const pages = imageData?.query?.pages;
        const pageId = Object.keys(pages)[0];
        const source = pages[pageId]?.thumbnail?.source;
        if (isMounted) { setImgUrl(source || null); setLoading(false); }
      } catch {
        if (isMounted) { setImgUrl(null); setLoading(false); }
      }
    }
    fetchWikiImage();
    return () => { isMounted = false; };
  }, [placeName]);

  if (loading) {
    return (
      <div className="w-full h-full bg-[#161619] flex items-center justify-center animate-pulse">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <img
      src={imgUrl || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=460&h=280&q=80`}
      alt={placeName}
      loading="lazy"
      className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300 opacity-100"
    />
  );
}

export function AIRecommendations() {
  const {
    travelMode, selectedCity, selectedIntlCity,
    startDate, endDate,
  } = useTripStore();
  const { user } = useAuthStore();
  const isInternational = travelMode === "international";
  const { restoredReco, clearRestored } = useTripStore();

const weatherLat = isInternational ? selectedIntlCity?.lat : selectedCity?.lat;
const weatherLon = isInternational ? selectedIntlCity?.lon : selectedCity?.lon;
const weatherTimezone = isInternational ? selectedIntlCity?.timezone : "Asia/Kolkata";
const { data: weather } = useWeather(weatherLat, weatherLon, weatherTimezone, startDate, endDate);

  const [reco, setReco] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"packing" | "places" | "food" | "budget" | "travel">("places");
  const [activePackingCat, setActivePackingCat] = useState<"clothing" | "electronics" | "toiletries" | "miscellaneous">("clothing");
  const [saved, setSaved] = useState(false);

  const getAI = useAction(api.ai.getAIRecommendations);
  const saveTrip = useConvexMutation(api.tripsFunctions.saveTrip);

  const activeDisplayName = isInternational
    ? selectedIntlCity ? `${selectedIntlCity.name}, ${selectedIntlCity.country}` : ""
    : selectedCity ? `${selectedCity.city}, ${selectedCity.state}` : "";

  const { mutate: generateAI, isPending, isError } = useMutation({
    mutationFn: async () => {
      if (!startDate || !endDate) return null;
      const weatherSummary = weather
        ? weather.map((d) => `${d.date}: ${getWeatherDesc(d.weatherCode)}, ${d.maxTemp}C`).join("; ")
        : "Weather data unavailable";
      if (isInternational && selectedIntlCity) {
        return await getAI({
          city: selectedIntlCity.name,
          state: selectedIntlCity.country,
          startDate,
          endDate,
          weatherSummary,
          isInternational: true,
          currency: selectedIntlCity.currency,
        });
      } else if (!isInternational && selectedCity) {
        return await getAI({
          city: selectedCity.city,
          state: selectedCity.state || "",
          startDate,
          endDate,
          weatherSummary,
          isInternational: false,
        });
      }
      return null;
    },
    onSuccess: (data) => { if (data) setReco(data); },
  });

  useEffect(() => { setReco(null); }, [selectedCity, selectedIntlCity]);
  useEffect(() => {
    if (restoredReco) {
      setReco(restoredReco);
      clearRestored();
    }
  }, [restoredReco]);

 const handleSave = async () => {
  if (!user) return;
  const cityName = isInternational ? selectedIntlCity?.name : selectedCity?.city;
  const stateName = isInternational ? selectedIntlCity?.country : selectedCity?.state || "";
  if (!cityName) return;

await saveTrip({
  userId: user.userId,
  city: cityName,
  state: stateName,
  startDate,
  endDate,
  aiRecommendations: reco ? JSON.stringify(reco) : undefined,
  weatherData: weather ? JSON.stringify(weather) : undefined,
  travelMode: travelMode as string,  // ✅ fix
  countryOrState: stateName,
  lat: isInternational ? (selectedIntlCity?.lat ?? 0) : (selectedCity?.lat ?? 0),
  lon: isInternational ? (selectedIntlCity?.lon ?? 0) : (selectedCity?.lon ?? 0),
  timezone: isInternational ? (selectedIntlCity?.timezone ?? "UTC") : "Asia/Kolkata",
  currency: isInternational ? selectedIntlCity?.currency : undefined,
});

  setSaved(true);
  setTimeout(() => setSaved(false), 3000);
};

  const canGenerate = (isInternational ? selectedIntlCity : selectedCity) && startDate && endDate;

  const tabs = [
    { key: "places" as const, label: "Famous Places" },
    { key: "packing" as const, label: "Packing List" },
    { key: "food" as const, label: "Local Food" },
    { key: "budget" as const, label: "Budget" },
    ...(isInternational ? [{ key: "travel" as const, label: "✈️ Travel Info" }] : []),
  ];

  const packingCats = ["clothing", "electronics", "toiletries", "miscellaneous"] as const;
  const getPlaceName = (place: any) => typeof place === "string" ? place : place.name || "";
  const getPlaceDesc = (place: any) => typeof place === "string" ? "" : place.description || "";
  const getPlaceRating = (place: any) => typeof place === "string" ? null : place.rating || null;
  const getBudgetDetails = () => reco ? (reco.budgetINR || reco.budget || reco.estimatedBudget || {}) : {};

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          {activeDisplayName && reco ? (
            <>
              <p className="text-xs text-gray-500 mb-1">
                {activeTab === "packing" ? "Your Packing List for"
                  : activeTab === "places" ? "Must visit places in"
                  : activeTab === "food" ? "Local food in"
                  : activeTab === "travel" ? "Travel info for"
                  : "Budget for"}
              </p>
              <h2 className="text-2xl font-bold text-white">{activeDisplayName}</h2>
            </>
          ) : (
            <h2 className="text-lg font-semibold text-white">AI Travel Recommendations</h2>
          )}
        </div>
        {reco && (
          <button
            onClick={handleSave}
            className={`text-xs px-4 py-2 rounded-full border transition-colors ${
              saved
                ? "border-green-500 text-green-400 bg-green-500/10"
                : "border-white/20 text-gray-400 hover:border-white/40 hover:text-white"
            }`}
          >
            {saved ? "SAVED!" : "Save Trip"}
          </button>
        )}
      </div>

      {/* Empty state */}
      {!canGenerate && (
        <p className="text-sm text-gray-600 text-center py-8">
          Select a {isInternational ? "destination" : "city"} and travel dates to get AI recommendations
        </p>
      )}

      {/* Generate button */}
      {canGenerate && !reco && (
        <button
          onClick={() => generateAI()}
          disabled={isPending}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm disabled:opacity-60 transition-colors"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Generating recommendations...
            </span>
          ) : "Generate AI Recommendations"}
        </button>
      )}

      {isError && (
        <p className="text-sm text-red-400 text-center mt-2">Failed to generate. Please try again.</p>
      )}

      {reco && (
        <div>
          {/* Alerts */}
          {(reco.monsoonAlert || reco.travelAlert || reco.weatherAlert) &&
            (reco.monsoonAlert !== "null" && reco.travelAlert !== "null") && (
            <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm text-yellow-400">
              {reco.monsoonAlert || reco.travelAlert || reco.weatherAlert}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap px-2 ${
                  activeTab === t.key ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Famous Places */}
          {activeTab === "places" && reco.places && (
            <div className="space-y-4">
              {(reco.places as any[]).map((place: any, i: number) => {
                const name = getPlaceName(place);
                const desc = getPlaceDesc(place);
                const rating = getPlaceRating(place);
                return (
                  <div
                    key={i}
                    className="flex flex-col md:flex-row bg-[#111113] border border-white/5 rounded-xl overflow-hidden hover:bg-white/5 transition-all duration-200"
                  >
                    <div className="w-full md:w-72 h-48 md:h-auto shrink-0 relative overflow-hidden bg-[#161619]">
                      <PlaceImage placeName={name} />
                    </div>
                    <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-bold text-white text-base tracking-wide truncate">{name}</h3>
                          {rating && (
                            <div className="flex items-center gap-1 text-xs text-yellow-400 shrink-0 font-medium">
                              {"★".repeat(Math.floor(rating))}
                              <span className="text-gray-400 ml-1">({rating})</span>
                            </div>
                          )}
                        </div>
                        {desc && (
                          <p className="text-sm text-gray-400 mt-2 leading-relaxed line-clamp-3">{desc}</p>
                        )}
                      </div>
                      <div className="mt-5">
                        <a
                          href={`https://en.wikipedia.org/wiki/${encodeURIComponent(name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors"
                        >
                          Explore Place <span className="text-[10px]">➔</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Packing List */}
          {activeTab === "packing" && reco.packing && (
            <div>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {packingCats.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActivePackingCat(cat)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                      activePackingCat === cat
                        ? "bg-white/20 text-white"
                        : "bg-white/5 text-gray-500 hover:text-gray-300 border border-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="bg-white/5 rounded-xl overflow-hidden border border-white/5">
                <div className="grid grid-cols-2 px-4 py-2.5 border-b border-white/10 text-xs text-gray-500 font-medium uppercase tracking-wider">
                  <span>Item name</span>
                  <span className="text-right">Quantity</span>
                </div>
                {((reco.packing as any)[activePackingCat] || []).map((item: any, i: number) => (
                  <div
                    key={i}
                    className="grid grid-cols-2 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">
                        {typeof item === "string" ? item : item.name}
                      </div>
                      {item.reason && (
                        <div className="text-xs text-gray-500 mt-0.5">{item.reason}</div>
                      )}
                    </div>
                    <div className="text-right text-sm text-white font-medium">
                      {item.quantity || 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Local Food */}
          {activeTab === "food" && reco.food && (
            <div className="space-y-2">
              {reco.food.map((item: string, i: number) => (
                <div
                  key={i}
                  className="flex gap-3 items-start bg-white/5 rounded-xl px-4 py-3 text-sm text-gray-300 border border-white/5"
                >
                  <span className="text-white font-bold shrink-0 text-base">{i + 1}.</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}

          {/* Budget */}
          {activeTab === "budget" && (
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(getBudgetDetails()).map(([tier, amount]) => (
                <div
                  key={tier}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
                >
                  <div className="text-xs text-gray-500 capitalize mb-2 uppercase tracking-wider">{tier}</div>
                  <div className="text-sm font-semibold text-white">{amount as string}</div>
                </div>
              ))}
            </div>
          )}

          {/* Travel Info - International Only */}
          {activeTab === "travel" && isInternational && (
            <div className="space-y-3">
              {reco.visaInfo && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <h3 className="text-red-400 font-semibold text-sm mb-1">🛂 Visa Info</h3>
                  <p className="text-gray-300 text-sm">{reco.visaInfo}</p>
                </div>
              )}
              {reco.currency && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <h3 className="text-yellow-400 font-semibold text-sm mb-1">
                    💱 Currency · {reco.currency.code}
                  </h3>
                  <p className="text-gray-300 text-sm">{reco.currency.rate}</p>
                  <p className="text-gray-400 text-xs mt-1">{reco.currency.tip}</p>
                </div>
              )}
              {reco.flights && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <h3 className="text-blue-400 font-semibold text-sm mb-2">✈️ Flights from India</h3>
                  <p className="text-gray-300 text-sm font-medium">{reco.flights.avgPriceINR}</p>
                  <p className="text-gray-400 text-xs mt-1">{reco.flights.bestTime}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {reco.flights.airlines?.map((a: string) => (
                      <span key={a} className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {reco.hotels && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <h3 className="text-green-400 font-semibold text-sm mb-2">🏨 Hotels</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Budget</span>
                      <span className="text-gray-300">{reco.hotels.budget}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Mid-range</span>
                      <span className="text-gray-300">{reco.hotels.mid}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Luxury</span>
                      <span className="text-gray-300">{reco.hotels.luxury}</span>
                    </div>
                  </div>
                  {reco.hotels.areas?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Best areas to stay:</p>
                      <div className="flex gap-2 flex-wrap">
                        {reco.hotels.areas.map((a: string) => (
                          <span key={a} className="bg-green-500/20 text-green-300 text-xs px-3 py-1 rounded-full">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Regenerate */}
          <button
            onClick={() => { setReco(null); generateAI(); }}
            disabled={isPending}
            className="mt-4 w-full py-2 border border-white/10 text-gray-500 rounded-xl text-xs hover:bg-white/5 hover:text-gray-300 transition-colors"
          >
            Regenerate Recommendations
          </button>
        </div>
      )}
    </div>
  );
}