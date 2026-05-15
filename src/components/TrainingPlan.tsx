import { useState, Fragment } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Sparkles, Send, Calendar, CheckCircle2, Info, Dumbbell, Bike, Footprints, Flame } from "lucide-react";
import { useFitness } from "../contexts/FitnessContext";
import { cn } from "../lib/utils";
import { notificationService } from "../services/notificationService";

interface PlanDay {
  day: number;
  focus: string;
  activityType: string;
  targetSteps: number;
  targetDistance: number;
  targetCalories: number;
  tips: string;
}

interface Plan {
  planName: string;
  description: string;
  days: PlanDay[];
}

const getActivityIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "running":
      return <Flame className="w-6 h-6 text-orange-500" />;
    case "cycling":
      return <Bike className="w-6 h-6 text-blue-500" />;
    case "strength training":
      return <Dumbbell className="w-6 h-6 text-indigo-500" />;
    case "walking":
      return <Footprints className="w-6 h-6 text-emerald-500" />;
    default:
      return <Calendar className="w-6 h-6 text-gray-500" />;
  }
};

export function TrainingPlan() {
  const { user, updateUserStats, notificationPermission } = useFitness();
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  const toggleDay = async (dayNumber: number) => {
    if (completedDays.includes(dayNumber)) {
        setCompletedDays(prev => prev.filter(d => d !== dayNumber));
    } else {
        setCompletedDays(prev => [...prev, dayNumber]);
        // Award some bonus XP for completing a day in the plan
        await updateUserStats(500, 0.5, 50); 
    }
  };

  const generatePlan = async () => {
    if (!goal || !user) return;
    setLoading(true);
    try {
      const response = await fetch("/api/training-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userGoal: goal,
          currentStats: {
            level: user.level,
            totalSteps: user.totalSteps,
            dailyGoal: user.dailyGoal
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      setPlan(data);

      if (notificationPermission === 'granted') {
        notificationService.sendNotification('Training Plan Ready!', {
          body: `Your custom plan "${data.planName}" has been generated. Ready to start?`,
        });
      }
    } catch (error) {
      console.error("Failed to fetch plan:", error);
      alert("I'm having trouble creating your plan right now. Please check your API key in Settings > Secrets or try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-24 md:pb-10">
      <header className="mb-10 text-center">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Brain className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Personal Coach</h1>
        <p className="text-gray-500 dark:text-gray-400">Tell me your fitness goals and I'll build a custom plan for you.</p>
      </header>

      {!plan ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100 dark:shadow-none"
        >
          <div className="space-y-4">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">Your Fitness Goal</label>
            <textarea 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Lose 5kg in a month by walking more, or prepare for my first 5k run..."
              className="w-full h-40 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-950 transition-all resize-none text-lg outline-none text-gray-900 dark:text-white"
            />
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generatePlan}
              disabled={loading || !goal}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
            >
              {loading ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" 
                  />
                  Generating your plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Create My Plan
                </>
              )}
            </motion.button>
          </div>

          <div className="mt-8 flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-2xl text-sm">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p>Our AI analyzes your current level and goal to create a safe, progressive 7-day challenge tailored just for you.</p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="bg-indigo-600 text-white p-10 rounded-3xl shadow-xl">
            <h2 className="text-4xl font-bold mb-4">{plan.planName}</h2>
            <p className="text-indigo-100 text-lg leading-relaxed">{plan.description}</p>
            <button 
              onClick={() => setPlan(null)}
              className="mt-6 text-sm font-medium text-white/70 hover:text-white underline underline-offset-4"
            >
              Wait, I want a different plan
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {plan.days.map((day, idx) => (
              <Fragment key={day.day}>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center gap-6"
                >
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase leading-none mb-1">Day</span>
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 leading-none">{day.day}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    {getActivityIcon(day.activityType)}
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">{day.focus}</h4>
                  </div>
                  <div className="flex gap-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1">{day.activityType}</span>
                    <span className="flex items-center gap-1">{day.targetSteps.toLocaleString()} steps</span>
                    {day.targetDistance > 0 && <span className="flex items-center gap-1">{day.targetDistance} km</span>}
                    <span className="flex items-center gap-1">{day.targetCalories} kcal</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-l-4 border-indigo-200 dark:border-indigo-800">
                    {day.tips}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <button 
                    onClick={() => toggleDay(day.day)}
                    className={cn(
                        "w-full md:w-16 h-16 rounded-3xl transition-all flex items-center justify-center relative overflow-hidden group",
                        completedDays.includes(day.day)
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 hover:text-emerald-500 hover:bg-emerald-50"
                    )}
                  >
                    <CheckCircle2 className={cn("transition-transform duration-500", completedDays.includes(day.day) ? "w-10 h-10 scale-110" : "w-8 h-8 group-hover:scale-110")} />
                  </button>
                </div>
              </motion.div>
              
              <AnimatePresence>
                {completedDays.includes(day.day) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: -16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border-x border-b border-emerald-100 dark:border-emerald-900 mx-6 rounded-b-[2rem] p-6 pt-10">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Achieved Today</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-900/50 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Steps</p>
                          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">+{day.targetSteps.toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-900/50 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Distance</p>
                          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{day.targetDistance > 0 ? `${day.targetDistance} km` : "N/A"}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-900/50 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Calories</p>
                          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">+{day.targetCalories} kcal</p>
                        </div>
                      </div>
                      <p className="mt-4 text-xs font-medium text-emerald-600/70 dark:text-emerald-400/70 text-center italic">
                        Great work! These metrics have been added to your journey.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Fragment>
          ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
