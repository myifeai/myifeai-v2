import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function completeTask(
  userId: string, 
  domain: string, 
  baseXp: number,
  taskText: string
) {
  try {
    const now = new Date().toISOString();
    
    // Get current state
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('xp_points, streak_days, last_active')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new Error(`Profile fetch failed: ${profileError.message}`);
    }

    if (!profile) {
      throw new Error('Profile not found');
    }

    // Calculate streak
    const lastActive = profile.last_active ? new Date(profile.last_active) : null;
    const today = new Date();
    const daysSince = lastActive 
      ? Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    let newStreak = profile.streak_days || 0;
    if (daysSince === 1) newStreak += 1;
    else if (daysSince > 1) newStreak = 1;

    // Calculate multiplier
    const multiplier = getStreakMultiplier(newStreak);
    const finalXp = Math.floor(baseXp * multiplier);

    // Execute all database operations
    const [logResult, xpResult, domainResult] = await Promise.all([
      supabase.from('task_logs').insert({
        user_id: userId,
        domain,
        task_text: taskText,
        xp_earned: finalXp,
        completed_at: now
      }),
      supabase.rpc('increment_xp', {
        user_id_input: userId,
        xp_to_add: finalXp,
        streak_input: newStreak,
        last_active_input: now
      }),
      supabase.rpc('increment_domain_score', {
        user_id_input: userId,
        domain_input: domain,
        score_to_add: 10
      })
    ]);

    if (logResult.error) console.error('Log insert error:', logResult.error);
    if (xpResult.error) throw new Error(`XP update failed: ${xpResult.error?.message}`);
    if (domainResult.error) throw new Error(`Domain update failed: ${domainResult.error?.message}`);

    // Check achievements
    const achievements = await checkAchievements(userId, newStreak, finalXp);

    return {
      xpGained: finalXp,
      totalXp: (profile.xp_points || 0) + finalXp,
      streak: newStreak,
      multiplier,
      achievements
    };

  } catch (error: any) {
    console.error('CompleteTask Error:', {
      message: error?.message || 'Unknown error',
      userId,
      domain
    });
    throw error;
  }
}

function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.75;
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.25;
  return 1.0;
}

async function checkAchievements(userId: string, streak: number, xp: number) {
  const achievements = [];
  
  if (streak === 7) achievements.push('week_warrior');
  if (streak === 30) achievements.push('month_master');
  if (xp >= 1000) achievements.push('xp_milestone');
  
  return achievements;
}

export async function getProfile(userId: string) {
  try {
    const [{ data: profile, error: profileError }, { data: scores, error: scoresError }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('life_scores').select('*').eq('user_id', userId)
    ]);

    if (profileError) {
      throw new Error(`Profile fetch failed: ${profileError.message}`);
    }

    if (!profile) {
      throw new Error('Profile not found');
    }

    const xp = profile.xp_points || 0;
    
    return {
      ...profile,
      scores: scores || [],
      rank: calculateRank(xp),
      nextRankProgress: calculateProgress(xp)
    };

  } catch (error: any) {
    console.error('GetProfile Error:', {
      message: error?.message || 'Unknown error',
      userId
    });
    throw error;
  }
}

function calculateRank(xp: number): string {
  if (xp >= 10000) return 'Life CEO';
  if (xp >= 5000) return 'Executive';
  if (xp >= 2500) return 'Strategist';
  if (xp >= 1000) return 'Specialist';
  if (xp >= 500) return 'Apprentice';
  return 'Novice';
}

function calculateProgress(xp: number): number {
  const thresholds = [0, 500, 1000, 2500, 5000, 10000];
  const current = thresholds.findIndex(t => xp < t) - 1;
  if (current < 0) return 0;
  const next = thresholds[current + 1];
  const prev = thresholds[current];
  if (!next || !prev) return 0;
  return ((xp - prev) / (next - prev)) * 100;
}