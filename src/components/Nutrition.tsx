import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Utensils, Search, Flame, Zap, Apple, Scale, ChevronRight, PieChart as PieIcon, Plus, Trash2 } from "lucide-react";
import { useFitness } from "../contexts/FitnessContext";
import { cn } from "../lib/utils";
import { db } from "../lib/firebase";
import { collection, query, where, orderBy, getDocs, addDoc, limit } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";

interface Meal {
    id: string;
    meal: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    timestamp: any;
}

export function Nutrition() {
  const { user, resetNutritionData } = useFitness();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    fetchMeals();
  }, [user?.uid]);

  // Handle global reset detection
  useEffect(() => {
    if (user && user.totalCalories === 0 && meals.length > 0) {
        setMeals([]);
    }
  }, [user?.totalCalories]);

  const fetchMeals = async () => {
    if (!user) return;
    setFetching(true);
    try {
      const q = query(
        collection(db, "nutrition"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const mealsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meal));
      setMeals(mealsData);
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const analyzeMeal = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/nutrition-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      
      const newMeal = {
        userId: user?.uid,
        meal: input,
        calories: data.calories || 0,
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fat: data.fat || 0,
        timestamp: new Date()
      };

      await addDoc(collection(db, "nutrition"), newMeal);
      setInput("");
      fetchMeals();
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "nutrition");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    await resetNutritionData();
    setShowResetConfirm(false);
    fetchMeals();
  };

  const totals = meals.reduce((acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto pb-24 md:pb-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Smart Nutrition</h1>
          <p className="text-gray-500 dark:text-gray-400">Log meals with AI and track your macros effortlessly.</p>
        </div>
        
        <div className="flex items-center gap-2">
            {!showResetConfirm ? (
                <button 
                    onClick={() => setShowResetConfirm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-500 hover:text-rose-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                    <Trash2 className="w-4 h-4" /> Reset Logs
                </button>
            ) : (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 px-3 py-2 rounded-lg">Confirm?</span>
                    <button 
                        onClick={handleReset}
                        className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-rose-700 transition-all"
                    >
                        Yes
                    </button>
                    <button 
                        onClick={() => setShowResetConfirm(false)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-all"
                    >
                        No
                    </button>
                </div>
            )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* AI Entry Box */}
          <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center">
                    <Search className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="font-bold text-gray-900 dark:text-white">AI Meal Logger</h3>
                   <p className="text-xs text-gray-400">Describe what you ate (e.g. 2 eggs and toast)</p>
                </div>
             </div>

             <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && analyzeMeal()}
                  placeholder="Tell me your meal..."
                  className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-lg font-medium outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white transition-all"
                />
                <button 
                  onClick={analyzeMeal}
                  disabled={loading || !input.trim()}
                  className="px-8 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Zap className="w-5 h-5 animate-spin" /> : "Log"}
                </button>
             </div>
          </section>

          {/* Meal History */}
          <section className="space-y-4">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Recent Logs</h3>
             <AnimatePresence>
                {fetching ? (
                    <div className="h-40 flex items-center justify-center">
                         <Zap className="w-8 h-8 text-orange-500 animate-pulse" />
                    </div>
                ) : meals.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-12 text-center text-gray-400 border border-gray-100 dark:border-gray-800">
                         <Apple className="w-12 h-12 mx-auto mb-4 opacity-10" />
                         <p>No meals logged today yet.</p>
                    </div>
                ) : meals.map((meal, idx) => (
                    <motion.div 
                        key={meal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white dark:bg-gray-900 p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl">
                                {meal.meal.toLowerCase().includes('apple') ? '🍎' : 
                                 meal.meal.toLowerCase().includes('egg') ? '🍳' : 
                                 meal.meal.toLowerCase().includes('chicken') ? '🍗' : '🍽️'}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white capitalize">{meal.meal}</h4>
                                <div className="flex gap-3 text-[10px] font-bold text-gray-400 uppercase mt-1">
                                    <span>P: {meal.protein}g</span>
                                    <span>C: {meal.carbs}g</span>
                                    <span>F: {meal.fat}g</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-xl font-black text-gray-900 dark:text-white">{meal.calories}</p>
                             <p className="text-[10px] font-bold text-gray-400 uppercase">kcal</p>
                        </div>
                    </motion.div>
                ))}
             </AnimatePresence>
          </section>
        </div>

        {/* Macro Summary Sidebar */}
        <div className="space-y-8">
            <section className="bg-orange-600 rounded-[32px] p-8 text-white shadow-xl shadow-orange-100 dark:shadow-none">
                <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Flame className="w-6 h-6 text-white" />
                    </div>
                    <PieIcon className="w-6 h-6 text-white/50" />
                </div>
                <h3 className="text-3xl font-black mb-2">{totals.calories}</h3>
                <p className="text-orange-100 text-sm font-medium mb-8">Total Calories Consumed</p>
                
                <div className="grid grid-cols-3 gap-4">
                    <MacroStat label="Protein" value={totals.protein} unit="g" />
                    <MacroStat label="Carbs" value={totals.carbs} unit="g" />
                    <MacroStat label="Fat" value={totals.fat} unit="g" />
                </div>
            </section>

            <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-6">Recommendations</h3>
                <div className="space-y-4">
                    <Recommendation 
                        title="Increase Protein" 
                        desc="You've reached 60% of your daily protein target."
                        color="text-indigo-600 bg-indigo-50"
                    />
                    <Recommendation 
                        title="Hydration Tip" 
                        desc="Try to drink 500ml of water before your next log."
                        color="text-blue-600 bg-blue-50"
                    />
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}

function MacroStat({ label, value, unit }: any) {
    return (
        <div className="bg-white/10 p-3 rounded-2xl text-center">
            <p className="text-lg font-bold">{value}<span className="text-[10px] opacity-70 ml-0.5">{unit}</span></p>
            <p className="text-[10px] font-bold text-orange-200 uppercase tracking-tighter">{label}</p>
        </div>
    )
}

function Recommendation({ title, desc, color }: any) {
    return (
        <div className={cn("p-4 rounded-2xl", color)}>
            <h5 className="font-bold text-sm mb-1">{title}</h5>
            <p className="text-xs opacity-70 leading-relaxed font-medium">{desc}</p>
        </div>
    )
}
