import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const DailyPlanSchema = z.object({
  briefing: z.string().min(10).max(200),
  tasks: z.array(z.object({
    domain: z.enum(['Health', 'Wealth', 'Career', 'Relationships', 'Balance']),
    task: z.string().min(5).max(150),
    xp: z.number().min(10).max(50)
  })).length(3)
});

export async function generateDailyPlan(userId: string) {
  const [{ data: scores }, { data: history }] = await Promise.all([
    supabase.from('life_scores').select('domain, score').eq('user_id', userId),
    supabase.from('task_logs').select('task_text, domain').eq('user_id', userId).order('completed_at', { ascending: false }).limit(10)
  ]);

  const scoreSummary = scores?.map(s => `${s.domain}: ${s.score}`).join(', ') || 'No data';
  const historySummary = history?.map(h => `[${h.domain}] ${h.task_text}`).join('; ') || 'No history';

  const completion = await groq.chat.completions.create({
    messages: [
      { 
        role: 'system', 
        content: `You are MYFE AI. User data: ${scoreSummary}. History: ${historySummary}. Rules: 3 different domains, prioritize lowest scores, 15-45 min tasks. Output JSON with briefing and tasks array.` 
      },
      { role: 'user', content: 'Generate plan' }
    ],
    model: 'llama-3.3-70b-versatile',
    response_format: { type: 'json_object' },
    temperature: 0.7
  });

  const parsed = JSON.parse(completion.choices[0].message.content || '{}');
  const validated = DailyPlanSchema.parse(parsed);
  
  const domains = validated.tasks.map(t => t.domain);
  if (new Set(domains).size !== 3) throw new Error('Domain diversity violated');
  
  return validated;
}