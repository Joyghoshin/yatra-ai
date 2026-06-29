import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getTrips = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("trips")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const saveTrip = mutation({
  args: {
    userId: v.string(),
    city: v.string(),
    state: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    aiRecommendations: v.optional(v.string()), // stored as JSON string
    weatherData: v.optional(v.string()),        // stored as JSON string
    travelMode: v.optional(v.string()),
    countryOrState: v.optional(v.string()),
    lat: v.optional(v.number()),
    lon: v.optional(v.number()),
    timezone: v.optional(v.string()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("trips", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const deleteTrip = mutation({
  args: { tripId: v.id("trips"), userId: v.string() },
  handler: async (ctx, { tripId, userId }) => {
    const trip = await ctx.db.get(tripId);
    if (!trip || trip.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(tripId);
  },
});