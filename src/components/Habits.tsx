import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ListCheck, Plus, CheckCircle2, Circle, Star, Calendar, Sparkles, Bell } from "lucide-react";
import { cn } from "../lib/utils";
import { useFitness } from "../contexts/FitnessContext";
import { notificationService } from "../services/notificationService";

interface Habit {
  id: string;
  name: string;
  category: "Physical" | "Mental" | "Nutrition";
  completed: boolean;
  streak: number;
}

export function Habits() {
  const { habits, addHabit, toggleHabit, deleteHabit, requestNotifications, notificationPermission } = useFitness();
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitCategory, setNewHabitCategory] = useState<"Physical" | "Mental" | "Nutrition">("Physical");

  const suggestedHabits = [
    { name: "Cold Shower", category: "Physical" as const },
    { name: "Read 10 Pages", category: "Mental" as const },
    { name: "No Caffeine after 2 PM", category: "Nutrition" as const },
    { name: "Journaling", category: "Mental" as const },
    { name: "Stair Walk", category: "Physical" as const },
    { name: "Sugar Free Day", category: "Nutrition" as const },
  ];

  const handleAddHabit = async () => {
    if (!newHabitName) return;
    await addHabit(newHabitName, newHabitCategory);
    setNewHabitName("");
    setIsAdding(false);

    if (notificationPermission === 'granted') {
        notificationService.sendNotification('New Habit Added', {
          body: `You've started a new habit: ${newHabitName}. Good luck!`,
        });
    }
  };

  const handleToggle = (id: string, completed: boolean) => {
    toggleHabit(id, !completed);
  };

  const scheduleReminder = (habit: any) => {
    if (notificationPermission !== 'granted') {
        if (confirm("Notifications are not enabled. Would you like to enable them to receive reminders?")) {
            requestNotifications();
        }
        return;
    }
    
    const minutes = prompt("In how many minutes should we remind you?", "30");
    if (minutes) {
        notificationService.scheduleHabitReminder(habit.name, parseInt(minutes));
        alert(`Reminder scheduled for "${habit.name}" in ${minutes} minutes.`);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-24 md:pb-10">
      <motion.header 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-10 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Habit Stack</h1>
          <p className="text-gray-500 dark:text-gray-400">Consistency is the bridge between goals and accomplishment.</p>
        </div>
        <motion.button 
            whileHover={{ scale: 1.1, rotate: isAdding ? 45 : 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsAdding(!isAdding)}
            className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95",
                isAdding ? "bg-rose-500 text-white" : "bg-indigo-600 text-white shadow-indigo-100 dark:shadow-none"
            )}
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </motion.header>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-10 bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create New Habit</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Habit Name</label>
                <input 
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g. Morning Meditation"
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Category</label>
                <div className="flex gap-2">
                  {(["Physical", "Mental", "Nutrition"] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewHabitCategory(cat)}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all",
                        newHabitCategory === cat 
                          ? "bg-indigo-600 text-white" 
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleAddHabit}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" /> Start Habit
                </button>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Suggested Habits</p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedHabits.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setNewHabitName(h.name);
                        setNewHabitCategory(h.category);
                      }}
                      className="text-left p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-xs font-bold text-gray-600 dark:text-gray-400 transition-all flex items-center justify-between group"
                    >
                      {h.name}
                      <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.1
                }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
        >
             <motion.div 
               variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
               whileHover={{ y: -5 }}
               className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 transition-all"
             >
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-xs font-bold text-gray-400 uppercase">Avg Completion</p>
                   <p className="text-xl font-bold text-gray-900 dark:text-white">82%</p>
                </div>
             </motion.div>
             <motion.div 
               variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
               whileHover={{ y: -5 }}
               className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 transition-all"
             >
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-xs font-bold text-gray-400 uppercase">Best Streak</p>
                   <p className="text-xl font-bold text-gray-900 dark:text-white">{habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0} Days</p>
                </div>
             </motion.div>
             <motion.div 
               variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
               whileHover={{ y: -5 }}
               className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 transition-all"
             >
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-xs font-bold text-gray-400 uppercase">Consistency</p>
                   <p className="text-xl font-bold text-gray-900 dark:text-white">High</p>
                </div>
             </motion.div>
        </motion.section>

        <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-4">Today</h3>
            <AnimatePresence mode="popLayout">
                {habits.map((habit, i) => (
                    <motion.div 
                        key={habit.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "p-6 rounded-[32px] border transition-all flex items-center gap-6 group cursor-pointer",
                            habit.completed 
                                ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50" 
                                : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-900"
                        )}
                        onClick={() => handleToggle(habit.id, habit.completed)}
                    >
                    <div className="flex-shrink-0">
                        {habit.completed ? (
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        ) : (
                            <Circle className="w-10 h-10 text-gray-200 group-hover:text-indigo-200 dark:text-gray-800 dark:group-hover:text-indigo-900 transition-colors" />
                        )}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                                habit.category === "Physical" ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" :
                                habit.category === "Mental" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" :
                                "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                            )}>
                                {habit.category}
                            </span>
                        </div>
                        <h4 className={cn(
                            "text-xl font-bold transition-all",
                            habit.completed ? "text-emerald-800 dark:text-emerald-400 line-through opacity-50" : "text-gray-900 dark:text-white"
                        )}>
                            {habit.name}
                        </h4>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteHabit(habit.id);
                                }}
                                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Plus className="w-4 h-4 rotate-45" />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    scheduleReminder(habit);
                                }}
                                className={cn(
                                    "p-2 rounded-xl transition-all",
                                    notificationPermission === 'granted' ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20" : "bg-gray-50 text-gray-300 dark:bg-gray-800"
                                )}
                            >
                                <Bell className="w-4 h-4" />
                            </button>
                        </div>
                        <div>
                            <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">{habit.streak}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Streak</p>
                        </div>
                    </div>
                </motion.div>
            ))}
            </AnimatePresence>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mt-12 bg-indigo-600 text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden group"
      >
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-md">
                <h3 className="text-3xl font-bold mb-4 tracking-tight">The 1% Rule</h3>
                <p className="text-indigo-100 leading-relaxed font-medium">Small habits made every day are more powerful than grand gestures made occasionally. You've completed 2 habits today!</p>
            </div>
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-900/20"
            >
                Weekly Review
            </motion.button>
         </div>
         <motion.div 
           initial={{ scale: 1 }}
           whileHover={{ scale: 1.2 }}
           transition={{ duration: 1 }}
           className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform duration-1000" 
         />
      </motion.div>
    </div>
  );
}
