import { useState } from "react";
import { motion } from "motion/react";
import { History as HistoryIcon, Calendar, TrendingUp, Filter, ArrowDown, ArrowUp } from "lucide-react";
import { useFitness } from "../contexts/FitnessContext";
import { cn } from "../lib/utils";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export function History() {
  const { dailyHistory, user, resetAllData } = useFitness();

  // Create chart data from real history
  const chartData = [...dailyHistory].reverse().slice(-7).map(day => ({
    day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    steps: day.steps,
    calories: day.calories
  }));

  const [localResetConfirm, setLocalResetConfirm] = useState(false);

  const handleReset = async () => {
    await resetAllData();
    setLocalResetConfirm(false);
  };

  // Fallback data if no history yet
  const displayChartData = chartData.length > 0 ? chartData : [
    { day: 'No Data', steps: 0, calories: 0 }
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24 md:pb-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Activity Pulse
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Your fitness journey across time.</p>
        </motion.div>
        
        <div className="flex gap-2">
            {!localResetConfirm ? (
                <button 
                    onClick={() => setLocalResetConfirm(true)}
                    className="px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-rose-100 transition-all border border-rose-100 dark:border-rose-900/40"
                >
                    Reset History
                </button>
            ) : (
                <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 p-1 rounded-xl border border-rose-100 dark:border-rose-900/40">
                    <button 
                        onClick={handleReset}
                        className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold transition-all hover:bg-rose-700"
                    >
                        Confirm Reset
                    </button>
                    <button 
                        onClick={() => setLocalResetConfirm(false)}
                        className="px-3 py-1.5 text-gray-500 hover:text-gray-700 text-xs font-bold"
                    >
                        Cancel
                    </button>
                </div>
            )}
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
                <Calendar className="w-4 h-4" /> Export Report
            </button>
        </div>
      </header>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Weekly Volume</p>
          <h4 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
            {dailyHistory.reduce((acc, curr) => acc + (curr.steps || 0), 0).toLocaleString()}
          </h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Steps</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Energy Log</p>
          <h4 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
            {Math.round(dailyHistory.reduce((acc, curr) => acc + (curr.calories || 0), 0)).toLocaleString()}
          </h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase">kcal burned</p>
        </div>
        <div className="bg-indigo-600 p-6 rounded-[2rem] text-white">
          <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mb-1">Consistency</p>
          <h4 className="text-3xl font-black tracking-tighter">
            {dailyHistory.filter(d => d.steps > 0).length}
          </h4>
          <p className="text-[10px] text-indigo-100 font-bold uppercase">Active Days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Step Trends */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Movement Trend</h3>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Steps / Session</p>
                </div>
            </div>
            
            <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayChartData}>
                <defs>
                    <linearGradient id="colorHistorySteps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }}
                    dy={10}
                />
                <YAxis hide />
                <Tooltip 
                    contentStyle={{ 
                        borderRadius: '20px', 
                        border: 'none', 
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                        padding: '12px 16px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}
                />
                <Area 
                    type="monotone" 
                    dataKey="steps" 
                    stroke="#4f46e5" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorHistorySteps)" 
                />
                </AreaChart>
            </ResponsiveContainer>
            </div>
        </motion.section>

        {/* List of sessions */}
        <section className="space-y-4">
            <div className="flex items-center justify-between px-4 mb-2">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">History Log</h3>
                <Filter className="w-4 h-4 text-gray-400 cursor-pointer" />
            </div>
            <div className="space-y-3">
                {dailyHistory.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <HistoryIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold">No logs yet</p>
                    </div>
                ) : (
                    dailyHistory.map((day, idx) => (
                        <HistoryRow key={day.date} day={day} index={idx} />
                    ))
                )}
            </div>
        </section>
      </div>
    </div>
  );
}

function HistoryRow({ day, index }: any) {
    const isToday = new Date(day.date).toDateString() === new Date().toDateString();
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white dark:bg-gray-900 p-5 rounded-[24px] border border-gray-100 dark:border-gray-800 flex items-center justify-between hover:border-indigo-100 dark:hover:border-indigo-900 transition-all cursor-pointer"
        >
            <div className="flex items-center gap-4">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg",
                    isToday ? "bg-indigo-600 text-white" : "bg-gray-50 dark:bg-gray-800 text-gray-400"
                )}>
                    {new Date(day.date).getDate()}
                </div>
                <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                        {isToday ? "Today's Summary" : new Date(day.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                            <ArrowUp className="w-3 h-3 text-emerald-500" /> {day.steps.toLocaleString()} Steps
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                            <ArrowDown className="w-3 h-3 text-orange-500" /> {Math.round(day.calories)} kcal
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{day.distance.toFixed(1)} km</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase">Tracked</p>
            </div>
        </motion.div>
    );
}
