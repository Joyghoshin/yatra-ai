import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const signUp = mutation({
  args: { email: v.string(), password: v.string(), name: v.string() },
  handler: async (ctx, { email, password, name }) => {
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();
    if (existing) throw new Error("Email already exists");
    const userId = await ctx.db.insert("users", {
      email,
      password,
      name,
      createdAt: Date.now(),
    });
    return { userId, name, email };
  },
});

export const signIn = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();
    if (!user || user.password !== password)
      throw new Error("Invalid credentials");
    return { userId: user._id, name: user.name, email: user.email };
  },
});