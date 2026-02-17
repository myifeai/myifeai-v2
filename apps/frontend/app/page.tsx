'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useUser } from '@clerk/nextjs';
import { LifeWheel } from '@/components/dashboard/LifeWheel';
import { TaskCard } from '@/components/tasks/TaskCard';
import { AnimatedNumber } from '@/components/shared/AnimatedNumber';
import { Confetti } from '@/components/shared/Confetti';
import { Loader2, RefreshCw, Flame, Zap, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [isLoaded, isSignedIn]);

  const fetchData = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const [profileRes, planRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/profile`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${BACKEND_URL}/api/daily-actions`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (profileRes.ok && planRes.ok) {
        const profileData = await profileRes.json();
        const planData = await planRes.json();
        setProfile(profileData);
        setPlan(planData);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (task: any) => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${BACKEND_URL}/api/complete-task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          domain: task.domain,
          xpPoints: task.xp,
          taskText: task.task
        })
      });

      if (res.ok) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        fetchData();
      }
    } catch (error) {
      console.error('Completion error:', error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 max-w-md w-full"
        >
          <h1 className="text-4xl font-bold mb-4 text-gradient">MyLife OS</h1>
          <p className="text-white/60 mb-8 text-lg">Your AI-powered life operating system</p>
          <button 
            onClick={() => window.location.href = '/sign-in'}
            className="btn-primary w-full text-lg"
          >
            Get Started
          </button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {showConfetti && <Confetti />}
      
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gradient">MyLife OS</h1>
          <p className="text-white/50 text-sm mt-1">v2.0 • AI-Powered Life Optimization</p>
        </div>
        
        <div className="flex items-center gap-4 glass-card px-4 py-2">
          <div className="flex items-center gap-2 text-amber-400">
            <Flame className="w-5 h-5" />
            <span className="font-bold">{profile?.streak_days || 0} day streak</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <span className="text-white/60 text-sm truncate max-w-[200px]">
            {user?.emailAddresses[0]?.emailAddress}
          </span>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* XP Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-violet-500/20">
                <Zap className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <div className="text-sm text-white/50 uppercase tracking-wider">Total XP</div>
                <div className="text-4xl font-black text-white">
                  <AnimatedNumber value={profile?.xp_points || 0} />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-violet-400 font-bold text-lg">{profile?.rank || 'Novice'}</span>
              <span className="text-white/40 text-sm">{Math.round(profile?.nextRankProgress || 0)}% to next rank</span>
            </div>
            
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                initial={{ width: 0 }}
                animate={{ width: `${profile?.nextRankProgress || 0}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Life Wheel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 flex flex-col items-center"
          >
            <h3 className="text-lg font-semibold mb-4 text-white/80">Life Balance</h3>
            <LifeWheel scores={profile?.scores || []} size={260} />
          </motion.div>
        </div>

        {/* Center - Tasks */}
        <div className="lg:col-span-5">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold mb-2">Today&apos;s Objectives</h2>
            <p className="text-white/50">Complete tasks to earn XP and maintain your streak</p>
          </motion.div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {plan?.tasks?.map((task: any, index: number) => (
                <TaskCard 
                  key={`${task.domain}-${index}`}
                  task={task}
                  index={index}
                  onComplete={() => handleComplete(task)}
                />
              ))}
            </AnimatePresence>
            
            {!plan?.tasks?.length && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-8 text-center text-white/50"
              >
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tasks available. Try regenerating your plan!</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right - AI Coach */}
        <div className="lg:col-span-3">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 sticky top-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🤖</span>
              <span className="text-violet-400 font-bold">AI COACH</span>
            </div>
            
            <p className="text-white/80 leading-relaxed mb-6 min-h-[100px]">
              {plan?.briefing || 'Generating your personalized plan...'}
            </p>
            
            <button 
              onClick={fetchData}
              disabled={loading}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Regenerate Plan
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}