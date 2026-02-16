'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';
import { LifeWheel } from '@/components/dashboard/LifeWheel';
import { TaskCard } from '@/components/tasks/TaskCard';
import { AnimatedNumber } from '@/components/shared/AnimatedNumber';
import { Confetti } from '@/components/shared/Confetti';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const { getToken } = useAuth();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = await getToken();
    const [profileRes, planRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${BACKEND_URL}/api/daily-actions`, { headers: { Authorization: `Bearer ${token}` } })
    ]);
    setProfile(await profileRes.json());
    setPlan(await planRes.json());
    setLoading(false);
  };

  const handleComplete = async (task: any) => {
    const token = await getToken();
    await fetch(`${BACKEND_URL}/api/complete-task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ domain: task.domain, xpPoints: task.xp, taskText: task.task })
    });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {showConfetti && <Confetti />}
      
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">MyLife OS v2</h1>
        <span className="text-amber-400">🔥 {profile?.streak_days || 0} day streak</span>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <div className="text-sm text-white/60 uppercase mb-2">Total XP</div>
            <div className="text-5xl font-black mb-4"><AnimatedNumber value={profile?.xp_points || 0} /></div>
            <div className="text-violet-400 font-bold mb-2">{profile?.rank || 'Novice'}</div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500" initial={{ width: 0 }} animate={{ width: '50%' }} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 flex justify-center">
            <LifeWheel scores={profile?.scores || []} size={280} />
          </motion.div>
        </div>

        <div className="lg:col-span-5">
          <h2 className="text-2xl font-bold mb-6">Today's Objectives</h2>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {plan?.tasks?.map((task: any, index: number) => (
                <TaskCard key={index} task={task} index={index} onComplete={() => handleComplete(task)} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:col-span-3">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 sticky top-6">
            <div className="text-sm text-violet-400 font-bold mb-2">🤖 AI COACH</div>
            <p className="text-white/80 mb-4">{plan?.briefing || 'Loading...'}</p>
            <button onClick={fetchData} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-violet-400 hover:text-white transition-colors">
              🔄 Regenerate
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}