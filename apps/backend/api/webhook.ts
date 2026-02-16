import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function handleClerkWebhook(req: any, res: any) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) return res.status(500).json({ error: 'Missing secret' });

  const payload = req.body.toString();
  const wh = new Webhook(secret);

  try {
    const evt = wh.verify(payload, {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature']
    });

    if (evt.type === 'user.created') {
      const { id, first_name, last_name } = evt.data;
      
      await supabase.from('profiles').upsert({
        id,
        full_name: `${first_name || ''} ${last_name || ''}`.trim() || 'New User',
        xp_points: 0,
        streak_days: 0
      });

      const domains = ['Health', 'Wealth', 'Career', 'Relationships', 'Balance'];
      await supabase.from('life_scores').upsert(
        domains.map(domain => ({ user_id: id, domain, score: 0 }))
      );
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).json({ error: 'Invalid signature' });
  }
}