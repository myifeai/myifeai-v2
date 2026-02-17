import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DailyPlanSchema = z.object({
  briefing: z.string().min(10).max(200),
  tasks: z.array(z.object({
    domain: z.enum(['Health', 'Wealth', 'Career', 'Relationships', 'Balance']),
    task: z.string().min(5).max(150),
    xp: z.number().min(10).max(50)
  })).length(3)
});

export async function generateDailyPlan(userId: string) {
  try {
    // Fetch user data with error handling
    const [scoresResult, historyResult, profileResult] = await Promise.all([
      supabase.from('life_scores').select('domain, score').eq('user_id', userId),
      supabase.from('task_logs')
        .select('task_text, domain')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(10),
      supabase.from('profiles').select('xp_points, streak_days').eq('id', userId).single()
    ]);

    // Check for errors
    if (scoresResult.error) {
      console.error('Scores fetch error:', scoresResult.error.message);
      throw new Error(`Failed to fetch scores: ${scoresResult.error.message}`);
    }
    if (historyResult.error) {
      console.error('History fetch error:', historyResult.error.message);
    }
    if (profileResult.error) {
      console.error('Profile fetch error:', profileResult.error.message);
      throw new Error(`Failed to fetch profile: ${profileResult.error.message}`);
    }

    const scores = scoresResult.data || [];
    const history = historyResult.data || [];
    const profile = profileResult.data;

    if (!profile) {
      throw new Error('User profile not found');
    }

    const scoreSummary = scores.map(s => `${s.domain}: ${s.score}`).join(', ') || 'No data';
    const historySummary = history.map(h => `[${h.domain}] ${h.task_text}`).join('; ') || 'No history';
    const level = Math.floor((profile.xp_points || 0) / 500) + 1;

    const systemPrompt = `You are MYFE AI, an elite Life OS coach. User is Level ${level}.

CURRENT STATE:
- Scores: ${scoreSummary}
- Streak: ${profile.streak_days || 0} days
- Recent: ${historySummary}

RULES:
1. MUST pick 3 DIFFERENT domains (diversity enforced)
2. Prioritize lowest scores for balance
3. Tasks must be 15-45 min, actionable
4. Consider streak maintenance (slightly easier if at risk)
5. Include brief rationale for each task

OUTPUT JSON: { briefing, tasks: [{domain, task, xp, difficulty, rationale}] }`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate today\'s 3-domain tactical plan.' }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 800
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from AI');
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('JSON parse error:', content);
      throw new Error('Invalid JSON from AI');
    }

    // Validate with Zod
    const validated = DailyPlanSchema.safeParse(parsed);
    if (!validated.success) {
      console.error('Validation error:', validated.error);
      throw new Error('AI output validation failed');
    }

    const result = validated.data;
    
    // Verify domain diversity
    const domains = result.tasks.map(t => t.domain);
    const uniqueDomains = new Set(domains);
    
    if (uniqueDomains.size !== 3) {
      throw new Error(`AI violated domain diversity: ${domains.join(', ')}`);
    }

    return result;

  } catch (error: any) {
    // Safe error logging
    console.error('AI Engine Error:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      userId
    });
    throw error;
  }
}