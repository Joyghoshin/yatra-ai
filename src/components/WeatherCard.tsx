import { useTripStore } from "../store/useTripStore";
import { useWeather } from "../hooks/useWeather";
import { getWeatherEmoji, getWeatherDesc, formatDate } from "../lib/utils";

export function WeatherCard() {
  const { selectedCity, selectedIntlCity, travelMode, startDate, endDate } = useTripStore();
  const isInternational = travelMode === "international";

  const activeCity = isInternational ? selectedIntlCity : selectedCity;
  const displayName = isInternational ? selectedIntlCity?.name : selectedCity?.city;
  const lat = isInternational ? selectedIntlCity?.lat : selectedCity?.lat;
  const lon = isInternational ? selectedIntlCity?.lon : selectedCity?.lon;
  const timezone = isInternational ? selectedIntlCity?.timezone : "Asia/Kolkata";

  const { data: weather, isLoading, isError } = useWeather(
    lat, lon, timezone, startDate || undefined, endDate || undefined
  );

  if (!activeCity) return null;

  if (isLoading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="grid grid-cols-7 gap-2">
            {Array(7).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !weather) return null;

  const isClimate = weather[0]?.isClimate;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-400">
          Weather Information — <span className="text-white">{displayName}</span>
        </h2>
        {isClimate && (
          <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/20 px-2 py-1 rounded-full">
            📅 Climate Forecast
          </span>
        )}
      </div>

      {isClimate && (
        <div className="mb-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2 text-xs text-blue-300">
          Showing historical climate averages for this period — actual weather may vary
        </div>
      )}

      <div className="grid grid-cols-7 gap-2">
        {weather.map((day) => (
          <div
            key={day.date}
            className="flex flex-col items-center bg-white/5 rounded-xl p-2 text-center border border-white/5"
          >
           <span className="text-xs text-gray-500">{formatDate(day.date).split(",")[0]}</span>
<span className="text-xs text-gray-600">{day.date.slice(8)}/{day.date.slice(5,7)}</span>
            <span className="text-2xl my-1">{getWeatherEmoji(day.weatherCode)}</span>
            <span className="text-xs font-bold text-white">{day.maxTemp}°</span>
            <span className="text-xs text-gray-600">{day.minTemp}°</span>
            {day.precipitation > 0 && (
              <span className="text-xs text-blue-400 mt-1">💧{day.precipitation}mm</span>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-600 mt-3 text-center">
        {isClimate
          ? `Historical avg for this period · ${weather[0].maxTemp}°C typical high`
          : `${getWeatherDesc(weather[0].weatherCode)} · ${weather[0].maxTemp}°C max today`}
      </p>
    </div>
  );
}