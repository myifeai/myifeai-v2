'use client';

import { motion } from 'framer-motion';
import { Check, Clock, Target } from 'lucide-react';

interface Task {
  domain: string;
  task: string;
  xp: number;
  difficulty?: string;
}

interface TaskCardProps {
  task: Task;
  index: number;
  onComplete: () => void;
}

const domainConfig: Record<string, { color: string; icon: string; bg: string }> = {
  health: { 
    color: 'text-emerald-400', 
    icon: '💪',
    bg: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30'
  },
  wealth: { 
    color: 'text-amber-400', 
    icon: '💰',
    bg: 'from-amber-500/20 to-amber-600/5 border-amber-500/30'
  },
  career: { 
    color: 'text-blue-400', 
    icon: '💼',
    bg: 'from-blue-500/20 to-blue-600/5 border-blue-500/30'
  },
  relationships: { 
    color: 'text-pink-400', 
    icon: '❤️',
    bg: 'from-pink-500/20 to-pink-600/5 border-pink-500/30'
  },
  balance: { 
    color: 'text-violet-400', 
    icon: '⚖️',
    bg: 'from-violet-500/20 to-violet-600/5 border-violet-500/30'
  },
};

export function TaskCard({ task, index, onComplete }: TaskCardProps) {
  const config = domainConfig[task.domain.toLowerCase()] || domainConfig.balance;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-gradient-to-br ${config.bg}
        border backdrop-blur-xl
        transition-shadow duration-300
        hover:shadow-xl hover:shadow-${task.domain.toLowerCase()}-500/10
      `}
    >
      {/* Domain Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.icon}</span>
          <span className={`
            px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
            bg-white/10 ${config.color}
          `}>
            {task.domain}
          </span>
        </div>
        {task.difficulty && (
          <span className="text-xs text-white/40 flex items-center gap-1">
            <Target className="w-3 h-3" />
            {task.difficulty}
          </span>
        )}
      </div>

      {/* Task Content */}
      <h3 className="text-lg font-bold text-white mb-3 leading-snug">
        {task.task}
      </h3>
      
      {/* XP Reward */}
      <div className="flex items-center gap-2 mb-4 text-white/70">
        <Clock className="w-4 h-4" />
        <span className="text-sm">15-45 min</span>
        <span className="mx-2 text-white/20">•</span>
        <span className="text-amber-400 font-bold text-lg">+{task.xp} XP</span>
      </div>

      {/* Complete Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onComplete}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
      >
        <Check className="w-5 h-5" />
        Complete Task
      </motion.button>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
    </motion.div>
  );
}