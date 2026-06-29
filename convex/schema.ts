import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  trips: defineTable({
    userId: v.string(),
    city: v.string(),
    state: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    createdAt: v.number(),
    // ✅ NEW fields
    aiRecommendations: v.optional(v.string()),
    weatherData: v.optional(v.string()),
    travelMode: v.optional(v.string()),
    countryOrState: v.optional(v.string()),
    lat: v.optional(v.number()),
    lon: v.optional(v.number()),
    timezone: v.optional(v.string()),
    currency: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});