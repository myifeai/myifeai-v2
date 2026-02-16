import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware, getAuth } from '@clerk/express';
import { generateDailyPlan } from '../lib/ai-engine.js';
import { handleClerkWebhook } from './webhook.js';
import { z } from 'zod';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.post('/api/webhook', express.raw({ type: 'application/json' }), handleClerkWebhook);
app.use(express.json());
app.use(clerkMiddleware());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', timestamp: new Date().toISOString() });
});

app.get('/api/daily-actions', async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const plan = await generateDailyPlan(userId);
    res.json({ ...plan, generatedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: 'AI_GENERATION_FAILED' });
  }
});

const CompleteTaskSchema = z.object({
  domain: z.enum(['Health', 'Wealth', 'Career', 'Relationships', 'Balance']),
  xpPoints: z.number().min(5).max(100),
  taskText: z.string().min(1).max(500)
});

app.post('/api/complete-task', async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const parseResult = CompleteTaskSchema.safeParse(req.body);
  if (!parseResult.success) return res.status(400).json({ error: 'VALIDATION_ERROR' });

  const { completeTask } = await import('../lib/gamification.js');
  const result = await completeTask(userId, parseResult.data.domain, parseResult.data.xpPoints, parseResult.data.taskText);
  
  res.json({ success: true, ...result });
});

app.get('/api/profile', async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { getProfile } = await import('../lib/gamification.js');
  const profile = await getProfile(userId);
  res.json(profile);
});

export default app;