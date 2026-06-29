"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import Groq from "groq-sdk";

export const getAIRecommendations = action({
  args: {
    city: v.string(),
    state: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    weatherSummary: v.string(),
    isInternational: v.optional(v.boolean()),
    currency: v.optional(v.string()),
  },
  handler: async (_, args) => {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const indiaPrompt = [
      "You are an expert India travel advisor.",
      "Give recommendations for a trip to " + args.city + ", " + args.state,
      "from " + args.startDate + " to " + args.endDate + ".",
      "Weather: " + args.weatherSummary,
      "",
      "Respond ONLY with this exact JSON structure:",
      JSON.stringify({
        packing: {
          clothing: [{ name: "T-Shirt", quantity: 5, reason: "Hot weather" }],
          electronics: [{ name: "Portable Charger", quantity: 1, reason: "Long travel days" }],
          toiletries: [{ name: "Sunscreen", quantity: 1, reason: "Sun protection" }],
          miscellaneous: [{ name: "Umbrella", quantity: 1, reason: "Rain protection" }]
        },
        places: [
          { name: "Place Name", description: "Description", rating: 4.7 },
        ],
        food: ["Dish 1 - where to try it", "Dish 2 - where to try it"],
        budgetINR: {
          budget: "Rs.1500-2500 per day",
          mid: "Rs.3000-5000 per day",
          luxury: "Rs.8000+ per day"
        },
        monsoonAlert: "Warning if Jun-Sep else null"
      }),
      "",
      "Replace example data with real recommendations for " + args.city + ".",
      "Only return JSON. No markdown. No explanation.",
    ].join("\n");

    const internationalPrompt = [
      "You are an expert international travel advisor helping Indian travelers.",
      "Give recommendations for a trip to " + args.city + ", " + args.state,
      "from " + args.startDate + " to " + args.endDate + ".",
      "Local currency: " + (args.currency || "USD"),
      "Weather: " + args.weatherSummary,
      "",
      "Respond ONLY with this exact JSON structure:",
      JSON.stringify({
        packing: {
          clothing: [{ name: "Light Jacket", quantity: 2, reason: "Cool evenings" }],
          electronics: [{ name: "Universal Adapter", quantity: 1, reason: "Different plug types" }],
          toiletries: [{ name: "Sunscreen", quantity: 1, reason: "Sun protection" }],
          miscellaneous: [{ name: "Travel Pillow", quantity: 1, reason: "Long flights" }]
        },
        places: [
          { name: "Place Name", description: "Why visit and what to see", rating: 4.8 },
        ],
        food: ["Dish 1 - restaurant or area to try it", "Dish 2 - where to find it"],
        budgetINR: {
          budget: "Rs.5000-8000 per day",
          mid: "Rs.12000-20000 per day",
          luxury: "Rs.35000+ per day"
        },
        currency: {
          code: "EUR",
          rate: "1 EUR = approx Rs.90 (check live rates before travel)",
          tip: "Carry some cash for local markets, card accepted most places"
        },
        flights: {
          bestTime: "Book 6-8 weeks in advance for best prices",
          avgPriceINR: "Rs.35,000 - Rs.65,000 return from major Indian cities",
          airlines: ["Air India", "IndiGo", "Emirates", "Qatar Airways"]
        },
        hotels: {
          budget: "Rs.3,000 - Rs.6,000 per night",
          mid: "Rs.8,000 - Rs.18,000 per night",
          luxury: "Rs.30,000+ per night",
          areas: ["Best Area 1", "Best Area 2"]
        },
        visaInfo: "Indian passport holders: visa required / visa on arrival / e-visa available. Apply X weeks in advance.",
        travelAlert: "Any important safety or travel advisory for Indian tourists or null"
      }),
      "",
      "Replace ALL example data with accurate real recommendations for " + args.city + ", " + args.state + ".",
      "For flights, suggest airlines that actually fly this route from India.",
      "For currency rate, give approximate INR conversion rate.",
      "For visa info, be specific about Indian passport requirements.",
      "Only return JSON. No markdown. No explanation.",
    ].join("\n");

    const prompt = args.isInternational ? internationalPrompt : indiaPrompt;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const text = response.choices[0].message.content || "{}";
    const clean = text
  .replace(/```json|```/g, "")
  .replace(/'\s*,/g, ",")   // remove rogue single quotes before commas
  .replace(/,\s*'/g, ",")   // remove rogue single quotes after commas
  .replace(/]'\s*,/g, "],") // fix ]', → ],
  .replace(/}'\s*,/g, "},") // fix }', → },
  .trim();
    try {
      return JSON.parse(clean);
    } catch {
      throw new Error("AI returned invalid JSON: " + clean);
    }
  },
});