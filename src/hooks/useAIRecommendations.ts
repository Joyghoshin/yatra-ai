import { useMutation } from "@tanstack/react-query";
import { WeatherDay } from "./useWeather";
import { getWeatherDesc } from "../lib/utils";

function buildWeatherSummary(weather: WeatherDay[]): string {
  return weather
    .map((d) => `${d.date}: ${getWeatherDesc(d.weatherCode)}, ${d.maxTemp}°C max, ${d.minTemp}°C min, ${d.precipitation}mm rain`)
    .join("; ");
}

export function useAIRecommendations() {
  return useMutation({
    mutationFn: async ({
      city, state, startDate, endDate, weather, isInternational, currency,
    }: {
      city: string;
      state: string;
      startDate: string;
      endDate: string;
      weather: WeatherDay[];
      isInternational?: boolean;
      currency?: string;
    }) => {
      const weatherSummary = buildWeatherSummary(weather);
      const res = await fetch("https://fearless-seahorse-225.convex.cloud/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: "ai:getAIRecommendations",
          args: { city, state, startDate, endDate, weatherSummary, isInternational, currency },
        }),
      });
      return res.json();
    },
  });
}