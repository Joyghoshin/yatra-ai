import { useState } from "react";
import { INDIAN_CITIES } from "../lib/indianCities";
import { INTERNATIONAL_CITIES } from "../lib/internationalCities";
import { useTripStore } from "../store/useTripStore";

export function CitySearch() {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const {
    travelMode, setTravelMode,
    selectedCity, setSelectedCity,
    selectedIntlCity, setSelectedIntlCity,
    startDate, endDate, setDates,
  } = useTripStore();

  const today = new Date().toISOString().split("T")[0];
  const isInternational = travelMode === "international";

  // Filtered results based on mode
  const filteredIndia = INDIAN_CITIES.filter(
    (c) =>
      c.city.toLowerCase().includes(query.toLowerCase()) ||
      c.state.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  const filteredIntl = INTERNATIONAL_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.country.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  const activeCity = isInternational ? selectedIntlCity : selectedCity;
  const activeCityLabel = isInternational
    ? selectedIntlCity ? `${selectedIntlCity.name}, ${selectedIntlCity.country}` : ""
    : selectedCity ? `${selectedCity.city}, ${selectedCity.state}` : "";

  const handleClearCity = () => {
    setSelectedCity(null);
    setSelectedIntlCity(null);
    setQuery("");
  };

  const handleModeSwitch = (mode: "india" | "international") => {
    setTravelMode(mode);
    setQuery("");
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => handleModeSwitch("india")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            !isInternational
              ? "bg-blue-600 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
          }`}
        >
          🇮🇳 India
        </button>
        <button
          onClick={() => handleModeSwitch("international")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            isInternational
              ? "bg-blue-600 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
          }`}
        >
          ✈️ International
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Destination Input */}
        <div className="relative sm:col-span-1">
          <label className="text-xs font-medium text-gray-400 mb-1.5 block">Destination</label>
          <input
            type="text"
            placeholder={
              isInternational
                ? "Search city or country (e.g. Paris, Dubai)"
                : "Where are you going? (e.g. Mumbai, Goa)"
            }
            value={activeCity ? activeCityLabel : query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedCity(null);
              setSelectedIntlCity(null);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />

          {/* Dropdown */}
          {showDropdown && query && !activeCity && (
            <div className="absolute z-10 w-full mt-1 bg-zinc-900 border border-white/10 rounded-xl shadow-xl max-h-56 overflow-y-auto">
              {/* India mode */}
              {!isInternational && (
                filteredIndia.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No cities found</div>
                ) : (
                  filteredIndia.map((c) => (
                    <button
                      key={c.city}
                      onClick={() => {
                        setSelectedCity(c);
                        setQuery("");
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 flex justify-between items-center text-white"
                    >
                      <span className="font-medium">{c.city}</span>
                      <span className="text-xs text-gray-500">{c.state}</span>
                    </button>
                  ))
                )
              )}

              {/* International mode */}
              {isInternational && (
                filteredIntl.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No cities found</div>
                ) : (
                  filteredIntl.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setSelectedIntlCity(c);
                        setQuery("");
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 flex justify-between items-center text-white"
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-gray-500">{c.country}</span>
                    </button>
                  ))
                )
              )}
            </div>
          )}
        </div>

        {/* From Date */}
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1.5 block">From</label>
          <input
            type="date"
            min={today}
            value={startDate}
            onChange={(e) => setDates(e.target.value, endDate)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
          />
        </div>

        {/* To Date */}
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1.5 block">To</label>
          <input
            type="date"
            min={startDate || today}
            value={endDate}
            onChange={(e) => setDates(startDate, e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Selected City Badge */}
      {activeCity && (
        <div className="mt-4 flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 rounded-xl px-4 py-2 border border-blue-500/20">
          <span>📍</span>
          <span className="font-medium">{activeCityLabel}</span>
          {isInternational && selectedIntlCity && (
            <span className="text-xs text-gray-500 ml-1">· {selectedIntlCity.currency}</span>
          )}
          <button
            onClick={handleClearCity}
            className="ml-auto text-gray-500 hover:text-red-400 text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}