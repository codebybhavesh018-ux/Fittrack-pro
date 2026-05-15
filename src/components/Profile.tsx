import { motion } from "motion/react";
import { User, Settings, Shield, Bell, HelpCircle, ChevronRight, LogOut, Heart, CheckCircle2 } from "lucide-react";
import { useFitness } from "../contexts/FitnessContext";
import { cn } from "../lib/utils";

export function Profile() {
  const { user, logout, requestNotifications, notificationPermission } = useFitness();

  if (!user) return null;

  const getPermissionLabel = () => {
    switch (notificationPermission) {
      case 'granted': return 'Notifications Active';
      case 'denied': return 'Notifications Blocked';
      default: return 'Tap to Enable Reminders';
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto pb-24 md:pb-10">
      <div className="text-center mb-10">
        <div className="relative inline-block">
          <img 
            src={user.photoURL} 
            alt={user.displayName} 
            className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl mx-auto mb-6 object-cover" 
          />
          <div className="absolute bottom-6 right-0 w-10 h-10 bg-indigo-600 border-4 border-white dark:border-gray-800 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
            {user.level}
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{user.displayName}</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">{user.email}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl text-center">
          <p className="text-indigo-600 dark:text-indigo-400 font-bold text-2xl">{(user.totalSteps || 0).toLocaleString()}</p>
          <p className="text-indigo-400 dark:text-indigo-500 text-xs font-bold uppercase tracking-wider">Total Steps</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl text-center">
          <p className="text-emerald-600 dark:text-emerald-400 font-bold text-2xl">{user.xp.toLocaleString()}</p>
          <p className="text-emerald-400 dark:text-emerald-500 text-xs font-bold uppercase tracking-wider">Total XP</p>
        </div>
      </div>

      <div className="space-y-6 mb-10">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-4">Milestones</h3>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-6 space-y-6">
            <Milestone icon="🚀" label="Early Adopter" date="May 2026" />
            <Milestone icon="⛰️" label="10k Master" date="June 2026" />
            <Milestone icon="🔥" label="30 Day Streak" locked />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-4">Account Settings</h3>
        <ProfileItem icon={User} label="Edit Profile" onClick={() => alert("Profile editing coming soon!")} />
        <ProfileItem icon={Heart} label="Health Data Sync" sub="Connected to Apple Health" onClick={() => alert("Apple Health sync is active.")} />
        <ProfileItem 
          icon={Bell} 
          label="Notifications" 
          sub={getPermissionLabel()}
          onClick={requestNotifications} 
          status={notificationPermission === 'granted' ? 'active' : 'inactive'}
        />
        <ProfileItem icon={Shield} label="Privacy & Security" onClick={() => alert("Privacy settings coming soon!")} />
        <ProfileItem icon={HelpCircle} label="Help & Feedback" onClick={() => alert("Support chat coming soon!")} />
        
        <button 
          onClick={logout}
          className="w-full flex items-center justify-between p-5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-3xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors mt-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-bold">Logout</span>
          </div>
          <ChevronRight className="w-5 h-5 opacity-30" />
        </button>
      </div>

      <p className="text-center text-xs text-gray-300 mt-12 font-medium">FitTrack Pro v1.0.4 • Build 885f</p>
    </div>
  );
}

function Milestone({ icon, label, date, locked }: any) {
    return (
        <div className={cn("flex items-center justify-between", locked && "opacity-40 whitespace-nowrap overflow-hidden")}>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl">
                    {icon}
                </div>
                <div>
                    <p className="font-bold text-gray-900 dark:text-white truncate">{label}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{locked ? "Not achieved" : date}</p>
                </div>
            </div>
            {locked ? (
                 <div className="w-8 h-8 rounded-full border-2 border-gray-100 dark:border-gray-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-gray-300">LOCKED</span>
                 </div>
            ) : (
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
            )}
        </div>
    )
}

function ProfileItem({ icon: Icon, label, sub, onClick, status }: any) {
  return (
    <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:bg-indigo-50/10 dark:hover:bg-indigo-900/10 transition-all group"
    >
      <div className="flex items-center gap-4 text-left">
        <div className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
            status === 'active' 
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" 
                : "bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className={cn("font-bold", status === 'active' ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white")}>
            {label}
          </p>
          {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{sub}</p>}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-300 transition-colors" />
    </button>
  );
}
