import { vi } from 'vitest';

process.env.GROQ_API_KEY = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test';

vi.mock('groq-sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                briefing: 'Test',
                tasks: [
                  { domain: 'Health', task: 'Run', xp: 25 },
                  { domain: 'Wealth', task: 'Save', xp: 30 },
                  { domain: 'Career', task: 'Work', xp: 35 }
                ]
              })
            }
          }]
        })
      }
    }
  }))
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockImplementation(() => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({ data: { xp_points: 0 }, error: null })
    })
  }))
}));