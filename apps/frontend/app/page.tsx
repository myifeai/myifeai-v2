'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useUser } from '@clerk/nextjs';
import { LifeWheel } from '@/components/dashboard/LifeWheel';
import { TaskCard } from '@/components/tasks/TaskCard';
import { AnimatedNumber } from '@/components/shared/AnimatedNumber';
import { Confetti } from '@/components/shared/Confetti';

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
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${BACKEND_URL}/api/daily-actions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (profileRes.ok && planRes.ok) {
        setProfile(await profileRes.json());
        setPlan(await planRes.json());
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

  if (!isLoaded || loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'white' }}>Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MyLife OS</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>Your AI-powered life operating system</p>
        <button onClick={() => window.location.href = '/sign-in'} className="btn-primary">Get Started</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {showConfetti && <Confetti />}
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>MyLife OS</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>v2.0 • AI-Powered Life Optimization</p>
        </div>
        
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.5rem' }}>
          <span style={{ color: '#fbbf24', fontWeight: '600' }}>🔥 {profile?.streak_days || 0} day streak</span>
          <span style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>{user?.emailAddresses[0]?.emailAddress}</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* XP Card */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(139, 92, 246, 0.2)' }}>
                <span style={{ fontSize: '1.5rem' }}>⚡</span>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total XP</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white' }}>
                  <AnimatedNumber value={profile?.xp_points || 0} />
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ color: '#8b5cf6', fontWeight: '700' }}>{profile?.rank || 'Novice'}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>{Math.round(profile?.nextRankProgress || 0)}%</span>
            </div>
            
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
              <motion.div 
                style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' }}
                initial={{ width: 0 }}
                animate={{ width: `${profile?.nextRankProgress || 0}%` }}
              />
            </div>
          </div>

          {/* Life Wheel */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: 'rgba(255,255,255,0.8)' }}>Life Balance</h3>
            <LifeWheel scores={profile?.scores || []} size={260} />
          </div>
        </div>

        {/* Center - Tasks */}
        <div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>Today&apos;s Objectives</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>Complete tasks to earn XP and maintain your streak</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AnimatePresence mode="popLayout">
              {plan?.tasks?.map((task: any, index: number) => (
                <TaskCard 
                  key={index}
                  task={task}
                  index={index}
                  onComplete={() => handleComplete(task)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right - AI Coach */}
        <div>
          <div className="glass-card" style={{ padding: '1.5rem', position: 'sticky', top: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🤖</span>
              <span style={{ color: '#8b5cf6', fontWeight: '700' }}>AI COACH</span>
            </div>
            
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', marginBottom: '1.5rem', minHeight: '80px' }}>
              {plan?.briefing || 'Generating your personalized plan...'}
            </p>
            
            <button onClick={fetchData} className="btn-secondary" style={{ width: '100%' }}>
              🔄 Regenerate Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}