import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { Dashboard } from "./components/Dashboard";
import { TrainingPlan } from "./components/TrainingPlan";
import { Profile } from "./components/Profile";
import { Nutrition } from "./components/Nutrition";
import { Habits } from "./components/Habits";
import { History } from "./components/History";
import { useFitness } from "./contexts/FitnessContext";
import { useTheme } from "./contexts/ThemeContext";
import { LogIn, Activity, User, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "./lib/utils";

export default function App() {
  const { user, login, logout, loading, authError, activeTab, setActiveTab } = useFitness();
  const { theme, toggleTheme } = useTheme();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-indigo-600">
        <Activity className="w-12 h-12 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-indigo-600 p-6 overflow-hidden relative">
        {/* Background blobs for depth */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-[120px]" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[40px] p-12 text-center shadow-2xl relative z-10"
        >
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Activity className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">FitTrack Pro</h1>
          <p className="text-gray-500 mb-10 text-lg leading-relaxed">
            Your ultimate companion for a healthier, more active life. Track, plan, and evolve.
          </p>

          {authError && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
              <p className="mb-2">{authError}</p>
              {authError.includes("Popup blocked") && (
                <a 
                  href={window.location.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline font-bold"
                >
                  Open in a new tab
                </a>
              )}
            </div>
          )}

          <button 
            onClick={login}
            className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
          >
            <LogIn className="w-6 h-6" />
            Continue with Google
          </button>
          <p className="mt-8 text-xs text-gray-400 font-medium">
            By continuing, you agree to our Terms of Service.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />
      
      <main className="flex-1 overflow-y-auto no-scrollbar md:pb-0 relative flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">FitTrack</span>
          </div>
          <div className="hidden md:block" />

          <div className="flex items-center gap-4 ml-auto">
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-xl"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setActiveTab("profile")}
              className={cn(
                "flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border transition-all",
                activeTab === "profile" 
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none" 
                  : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-200"
              )}
            >
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <span className="font-bold text-sm hidden sm:block">
                {user.displayName?.split(' ')[0] || "Profile"}
              </span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "nutrition" && <Nutrition />}
          {activeTab === "training" && <TrainingPlan />}
          {activeTab === "habits" && <Habits />}
          {activeTab === "profile" && <Profile />}
          {activeTab === "history" && <History />}
        </div>
      </main>
    </div>
  );
}
