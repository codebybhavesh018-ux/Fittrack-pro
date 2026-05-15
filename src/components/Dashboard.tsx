import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, Zap, ZapOff, Activity, RefreshCw, Droplet, Flame, MapPin, Gauge, Plus } from "lucide-react";
import { useFitness } from "../contexts/FitnessContext";
import { cn } from "../lib/utils";

export function Dashboard() {
  const { user, updateUserStats, resetAllData, updateWater } = useFitness();
  const [isTracking, setIsTracking] = useState(false);
  const [sessionSteps, setSessionSteps] = useState(0);
  const lastStepTime = useRef(0);

  if (!user) return null;

  const dailyGoal = user.dailyGoal || 10000;
  const totalSteps = Math.max(0, user.totalSteps || 0);
  const stepProgress = Math.min(100, (totalSteps / dailyGoal) * 100);
  const calories = Math.max(0, user.totalCalories || 0);
  const distance = Math.max(0, user.totalDistance || 0);
  const currentWater = user.currentWater || 0;
  const waterGoal = user.waterGoal || 8;
  const waterProgress = (currentWater / waterGoal) * 100;

  // Calculate a "Health Index" score (0-100)
  const healthIndex = Math.min(100, Math.round(
    (stepProgress * 0.5) + 
    (Math.min(100, waterProgress) * 0.3) + 
    (Math.min(100, (user.xp % 100)) * 0.2)
  ));

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = async () => {
    await resetAllData();
    setSessionSteps(0);
    setShowResetConfirm(false);
  };

  const addWater = () => updateWater(1);

  const toggleTracking = async () => {
    if (isTracking) {
      setIsTracking(false);
      return;
    }

    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setIsTracking(true);
        } else {
          alert("Motion sensor permission is required for step counting.");
        }
      } catch (e) {
        setIsTracking(true); 
      }
    } else {
      setIsTracking(true);
    }
  };

  useEffect(() => {
    if (!isTracking) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity;
      if (!accel || accel.x === null || accel.y === null || accel.z === null) return;

      const totalAccel = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
      const now = Date.now();

      if (totalAccel > 13.5 && now - lastStepTime.current > 350) {
        updateUserStats(1, 0.0008, 0.04); 
        setSessionSteps(prev => prev + 1);
        lastStepTime.current = now;
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isTracking, updateUserStats]);

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Activity Summary
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Your daily fitness statistics</p>
          
          <div className="flex items-center gap-2 mt-4">
            {!showResetConfirm ? (
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-500 hover:text-rose-600 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                <RefreshCw className="w-3 h-3" /> Reset App Data
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Are you sure?</span>
                <button 
                  onClick={handleReset}
                  className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider"
                >
                  Yes, Reset
                </button>
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Steps Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-2 md:row-span-2 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Today's Steps</span>
            </div>
            
            <h2 className="text-7xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">
              {totalSteps.toLocaleString()}
            </h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-10">Footsteps Recorded</p>

            <div className="flex items-end justify-between mb-2">
              <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                {stepProgress.toFixed(0)}% of Goal
              </p>
              <p className="text-xs text-gray-400 font-medium">Goal: {dailyGoal.toLocaleString()}</p>
            </div>
            <div className="h-3 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stepProgress}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              />
            </div>
          </div>
          
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
             <Activity className="w-64 h-64 -mr-16 -mt-16" />
          </div>
        </motion.div>

        {/* Health Index Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-indigo-600 dark:bg-indigo-500 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100 dark:shadow-none flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-100 uppercase tracking-widest text-[10px]">Health Index</span>
            <Gauge className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <p className="text-5xl font-black mb-1">{healthIndex}%</p>
            <p className="text-[10px] text-indigo-100 font-bold uppercase opacity-80 tracking-wider">Overall Vitality</p>
          </div>
        </motion.div>

        {/* Tracking Controls */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 flex flex-col justify-between"
        >
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleTracking}
            className={cn(
              "w-full py-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all border-2 shadow-sm",
              isTracking 
                ? "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400" 
                : "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400"
            )}
          >
            {isTracking ? <ZapOff className="w-6 h-6 animate-pulse" /> : <Zap className="w-6 h-6" />}
            <span className="font-bold text-[10px] uppercase tracking-wider">
              {isTracking ? "Live Tracking Active" : "Start Live Tracking"}
            </span>
          </motion.button>
          
          <AnimatePresence>
            {isTracking && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-[10px] text-center text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mt-2"
              >
                Session: {sessionSteps} steps
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Water Tracker */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="md:row-span-2 bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden relative"
        >
          <div className="z-10">
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Hydration</span>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{currentWater}/{waterGoal}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Glasses Today</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-4 z-10">
             <button 
              onClick={addWater}
              className="w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-90"
             >
                <Plus className="w-8 h-8" />
             </button>
          </div>

          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${Math.min(100, waterProgress)}%` }}
            className="absolute bottom-0 left-0 right-0 bg-blue-50/50 dark:bg-blue-900/20"
            transition={{ type: "spring", stiffness: 40 }}
          />
        </motion.div>

        {/* Calories Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Energy</span>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{Math.round(calories)}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">kcal burned</p>
        </motion.div>

        {/* Distance Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Exploration</span>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{distance.toFixed(2)}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Kilometers</p>
        </motion.div>
      </div>
    </div>
  );
}
