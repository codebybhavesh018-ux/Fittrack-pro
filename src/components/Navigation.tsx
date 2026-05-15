import { LayoutDashboard, Utensils, Brain, User, LogOut, Sun, Moon, ListCheck, History as HistoryIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { useTheme } from "../contexts/ThemeContext";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export function Navigation({ activeTab, setActiveTab, onLogout }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "history", label: "History", icon: HistoryIcon },
    { id: "nutrition", label: "Nutrition", icon: Utensils },
    { id: "training", label: "Plan", icon: Brain },
    { id: "habits", label: "Habits", icon: ListCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-6 py-3 md:relative md:bottom-auto md:w-64 md:h-screen md:border-t-0 md:border-r md:flex md:flex-col md:py-8 z-50">
      <div className="hidden md:flex items-center gap-3 mb-10 px-2 text-indigo-600 font-bold text-xl">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
          <ActivityIcon className="w-6 h-6" />
        </div>
        <span>FitTrack Pro</span>
      </div>

      <div className="flex justify-between md:flex-col md:gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col md:flex-row items-center gap-2 p-2 md:px-4 md:py-3 rounded-xl transition-all",
                isActive 
                  ? "text-indigo-600 md:bg-indigo-50 dark:md:bg-indigo-900/20" 
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 md:hover:bg-gray-50 dark:md:hover:bg-gray-800"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="hidden md:mt-auto md:block space-y-2">
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 w-full transition-colors rounded-xl md:hover:bg-gray-50 dark:md:hover:bg-gray-800"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          <span className="font-medium text-sm">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-red-500 w-full transition-colors rounded-xl md:hover:bg-gray-50 dark:md:hover:bg-gray-800"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </nav>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
