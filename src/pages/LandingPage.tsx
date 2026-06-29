import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuthStore } from "../store/authStore";

const POPULAR_DESTINATIONS = [
  { city: "Mumbai", state: "MH", climate: "TROPICAL" },
  { city: "Jaipur", state: "RJ", climate: "DRY" },
  { city: "Goa", state: "GA", climate: "COASTAL" },
  { city: "Manali", state: "HP", climate: "ALPINE" },
];

const FEATURES = [
  {
    icon: "🌤️",
    title: "Climate-aware intelligence",
    desc: "Sophisticated packing suggestions tailored to real-time weather data and destination micro-climates across India.",
  },
  {
    icon: "📋",
    title: "Structured logistics",
    desc: "Clothing, electronics, toiletries, and essentials — perfectly sorted for frictionless travel.",
  },
  {
    icon: "✈️",
    title: "Dynamic itineraries",
    desc: "Generate comprehensive day-by-day plans based on your unique travel style and trip duration.",
  },
];

export function LandingPage() {
  const [mode, setMode] = useState<"landing" | "signin" | "signup">("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = useMutation(api.auth.signUp);
  const signIn = useMutation(api.auth.signIn);
  const { setUser } = useAuthStore();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        const result = await signUp({ email, password, name });
        setUser({ userId: result.userId, name: result.name, email: result.email });
      } else {
        const result = await signIn({ email, password });
        setUser({ userId: result.userId, name: result.name, email: result.email });
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const Nav = () => (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
          <span className="text-black font-bold text-sm">Y</span>
        </div>
        <span className="font-semibold text-lg">YatraAI</span>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => setMode("signin")} className="text-sm text-gray-300 hover:text-white">Sign In</button>
        <button onClick={() => setMode("signup")} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Get Started</button>
      </div>
    </nav>
  );

  if (mode === "signin" || mode === "signup") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-center mb-2">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-400 text-center text-sm mb-8">
              {mode === "signin" ? "Enter your credentials to continue your journey" : "Start planning your perfect India trip"}
            </p>
            <form onSubmit={handleAuth} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm" />
                </div>
              )}
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm" />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium text-sm disabled:opacity-60">
                {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-6">
              {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-blue-400 hover:text-blue-300">
                {mode === "signin" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
        <div className="text-center py-6 text-xs text-gray-600 border-t border-white/10">
          © 2026 YatraAI. Built for the modern Indian traveler.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Nav />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-28">
        <div className="inline-block border border-white/20 rounded-full px-4 py-1.5 text-xs text-gray-400 mb-8">
          AI-Powered Travel Intelligence
        </div>
        <h1 className="text-6xl font-bold leading-tight mb-6 max-w-3xl">
          The intelligence behind{" "}
          <span className="text-gray-500">every great journey.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-10">
          Predictive packing lists and smart itineraries generated for your specific destination, climate, and travel style.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setMode("signup")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl text-base font-medium">
            Start Planning
          </button>
          <button onClick={() => setMode("signin")}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 rounded-xl text-base font-medium border border-white/20">
            Sign In to Account
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-4 uppercase tracking-wider">
          No credit card required • Instant AI generation
        </p>
      </section>

      {/* Popular Destinations */}
      <section className="px-8 py-16 border-t border-white/10 max-w-6xl mx-auto w-full">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Popular Destinations</h2>
            <p className="text-gray-500 mt-1">Curated lists for trending Indian cities.</p>
          </div>
          <button onClick={() => setMode("signup")}
            className="text-sm border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/5">
            Explore →
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {POPULAR_DESTINATIONS.map((dest) => (
            <button key={dest.city} onClick={() => setMode("signup")}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/8 transition-colors">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-sm font-bold text-white">{dest.state}</span>
              </div>
              <h3 className="font-semibold text-white">{dest.city}</h3>
              <p className="text-xs text-blue-400 mt-1">{dest.climate}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-16 border-t border-white/10 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Engineered for travel.</h2>
          <p className="text-gray-500">Every feature is designed to reduce friction and help you focus on the experience, not the logistics.</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 text-xl">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-24 border-t border-white/10 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Elevate your travel experience.</h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          Join a new generation of explorers who value efficiency and precision. Create your account to start building your perfect India travel profile.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => setMode("signup")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium">
            Get Started for Free
          </button>
          <button onClick={() => setMode("signin")}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-medium border border-white/20">
            Sign In to Account
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-4 uppercase tracking-wider">
          No credit card required • Instant AI generation
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
            <span className="text-black font-bold text-xs">Y</span>
          </div>
          <span className="text-sm text-gray-500">YatraAI</span>
        </div>
        <p className="text-xs text-gray-600">© 2026 YatraAI. Built for the modern Indian traveler.</p>
      </footer>
    </div>
  );
}