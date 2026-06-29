import { useAuthStore } from "./store/authStore";
import { LandingPage } from "./pages/LandingPage";
import { CitySearch } from "./components/CitySearch";
import { WeatherCard } from "./components/WeatherCard";
import { AIRecommendations } from "./components/AIRecommendations";
import { MyTrips } from "./components/MyTrips";
import { useTripStore } from "./store/useTripStore";

export default function App() {
  const { user, logout } = useAuthStore();
  const { activeTab, setActiveTab } = useTripStore();

  if (!user) return <LandingPage />;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 sticky top-0 z-50 bg-black/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-xs">Y</span>
            </div>
            <span className="font-semibold">YatraAI</span>
          </div>
          <nav className="flex items-center gap-6">
            {(["plan", "trips"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium transition-colors ${activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"}`}>
                {tab === "plan" ? "✈️ Planner" : "🗂️ My Trips"}
              </button>
            ))}
            <span className="text-sm text-gray-400">{user.name}</span>
            <button onClick={logout} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">
        {activeTab === "plan" ? (
          <div className="space-y-6">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Plan your <span className="text-gray-500">journey.</span></h1>
              <p className="text-gray-400">Enter your destination to generate a tailored packing list and itinerary.</p>
            </div>
            <CitySearch />
            <WeatherCard />
            <AIRecommendations />
          </div>
        ) : (
          <MyTrips />
        )}
      </main>
    </div>
  );
}