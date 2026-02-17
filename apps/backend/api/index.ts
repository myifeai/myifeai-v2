import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware, getAuth } from '@clerk/express';
import { generateDailyPlan } from '../lib/ai-engine.js';
import { handleClerkWebhook } from './webhook.js';
import { z } from 'zod';

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://myifeai-v2-frontend.vercel.app',
    'https://myifeai-v2.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Webhook route (needs raw body)
app.post('/api/webhook', express.raw({ type: 'application/json' }), handleClerkWebhook);

// JSON parsing for other routes
app.use(express.json());
app.use(clerkMiddleware());

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Express Error:', err?.message || err);
  res.status(500).json({ error: 'Internal server error' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Get daily plan
app.get('/api/daily-actions', async (req, res) => {
  const { userId } = getAuth(req);
  
  if (!userId) {
    console.log('Unauthorized request to /api/daily-actions');
    return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
  }

  try {
    console.log('Generating plan for user:', userId);
    const plan = await generateDailyPlan(userId);
    res.json({
      ...plan,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Daily actions error:', error?.message || error);
    res.status(500).json({ 
      error: 'AI_GENERATION_FAILED',
      message: error?.message || 'Unknown error'
    });
  }
});

// Complete task
const CompleteTaskSchema = z.object({
  domain: z.enum(['Health', 'Wealth', 'Career', 'Relationships', 'Balance']),
  xpPoints: z.number().min(5).max(100),
  taskText: z.string().min(1).max(500)
});

app.post('/api/complete-task', async (req, res) => {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const parseResult = CompleteTaskSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ 
      error: 'VALIDATION_ERROR',
      details: parseResult.error.errors 
    });
  }

  try {
    const { completeTask } = await import('../lib/gamification.js');
    const result = await completeTask(
      userId, 
      parseResult.data.domain, 
      parseResult.data.xpPoints, 
      parseResult.data.taskText
    );
    
    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Complete task error:', error?.message || error);
    res.status(500).json({ 
      error: 'COMPLETION_FAILED',
      message: error?.message || 'Unknown error'
    });
  }
});

// Get profile
app.get('/api/profile', async (req, res) => {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { getProfile } = await import('../lib/gamification.js');
    const profile = await getProfile(userId);
    res.json(profile);
  } catch (error: any) {
    console.error('Get profile error:', error?.message || error);
    res.status(500).json({ 
      error: 'PROFILE_FETCH_FAILED',
      message: error?.message || 'Unknown error'
    });
  }
});

export default app;