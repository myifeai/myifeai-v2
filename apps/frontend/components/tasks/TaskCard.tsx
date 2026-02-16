'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const colors: Record<string, string> = {
  health: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
  wealth: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
  career: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
  relationships: 'from-pink-500/20 to-pink-600/5 border-pink-500/30',
  balance: 'from-violet-500/20 to-violet-600/5 border-violet-500/30',
};

export function TaskCard({ task, index, onComplete }: any) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }} className={`rounded-2xl p-6 bg-gradient-to-br ${colors[task.domain.toLowerCase()]} border backdrop-blur-xl`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-1 rounded-full text-xs font-bold uppercase bg-white/10">{task.domain}</span>
      </div>
      <h3 className="text-lg font-bold mb-4">{task.task}</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black">+{task.xp}</span>
          <span className="text-xs text-white/50 uppercase">XP</span>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onComplete}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white text-black hover:bg-violet-400 hover:text-white transition-colors">
          <Check className="w-5 h-5" />Complete
        </motion.button>
      </div>
    </motion.div>
  );
}