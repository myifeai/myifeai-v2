import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function completeTask(userId: string, domain: string, baseXp: number, taskText: string) {
  const { data: profile } = await supabase.from('profiles').select('xp_points, streak_days, last_active').eq('id', userId).single();
  
  const lastActive = profile?.last_active ? new Date(profile.last_active) : null;
  const daysSince = lastActive ? Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)) : 999;
  
  let newStreak = profile?.streak_days || 0;
  if (daysSince === 1) newStreak += 1;
  else if (daysSince > 1) newStreak = 1;

  const multiplier = newStreak >= 30 ? 2.0 : newStreak >= 7 ? 1.5 : 1.0;
  const finalXp = Math.floor(baseXp * multiplier);

  await Promise.all([
    supabase.from('task_logs').insert({ user_id: userId, domain, task_text: taskText, xp_earned: finalXp }),
    supabase.rpc('increment_xp', { user_id_input: userId, xp_to_add: finalXp, streak_input: newStreak, last_active_input: new Date().toISOString() }),
    supabase.rpc('increment_domain_score', { user_id_input: userId, domain_input: domain, score_to_add: 10 })
  ]);

  return { xpGained: finalXp, streak: newStreak, multiplier };
}

export async function getProfile(userId: string) {
  const [{ data: profile }, { data: scores }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('life_scores').select('*').eq('user_id', userId)
  ]);

  const xp = profile?.xp_points || 0;
  const rank = xp >= 10000 ? 'Life CEO' : xp >= 5000 ? 'Executive' : xp >= 2500 ? 'Strategist' : xp >= 1000 ? 'Specialist' : xp >= 500 ? 'Apprentice' : 'Novice';
  
  return { ...profile, scores: scores || [], rank };
}