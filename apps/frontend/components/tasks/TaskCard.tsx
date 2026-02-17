'use client';

import { motion } from 'framer-motion';

const domainConfig: Record<string, { icon: string; color: string; bg: string }> = {
  health: { icon: '💪', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' },
  wealth: { icon: '💰', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' },
  career: { icon: '💼', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)' },
  relationships: { icon: '❤️', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.2)' },
  balance: { icon: '⚖️', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.2)' },
};

export function TaskCard({ task, index, onComplete }: any) {
  const config = domainConfig[task.domain.toLowerCase()] || domainConfig.balance;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.1 }}
      style={{
        background: `linear-gradient(135deg, ${config.bg}, rgba(255,255,255,0.05))`,
        border: `1px solid ${config.color}30`,
        borderRadius: '1rem',
        padding: '1.5rem',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '1.25rem' }}>{config.icon}</span>
        <span style={{ 
          padding: '0.25rem 0.75rem', 
          borderRadius: '9999px', 
          background: 'rgba(255,255,255,0.1)',
          color: config.color,
          fontSize: '0.75rem',
          fontWeight: '700',
          textTransform: 'uppercase'
        }}>
          {task.domain}
        </span>
      </div>

      <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>
        {task.task}
      </h3>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
        <span>⏱️ 15-45 min</span>
        <span>•</span>
        <span style={{ color: '#fbbf24', fontWeight: '700' }}>+{task.xp} XP</span>
      </div>

      <button 
        onClick={onComplete}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '0.75rem',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.1)',
          color: 'white',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        ✓ Complete Task
      </button>
    </motion.div>
  );
}