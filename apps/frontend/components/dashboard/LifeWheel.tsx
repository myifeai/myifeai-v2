'use client';

import { motion } from 'framer-motion';

const DOMAINS = [
  { key: 'health', label: 'Health', color: '#10b981', angle: 270 },
  { key: 'wealth', label: 'Wealth', color: '#f59e0b', angle: 342 },
  { key: 'career', label: 'Career', color: '#3b82f6', angle: 54 },
  { key: 'relationships', label: 'Love', color: '#ec4899', angle: 126 },
  { key: 'balance', label: 'Balance', color: '#8b5cf6', angle: 198 },
];

export function LifeWheel({ scores = [], size = 280 }: { scores: any[], size?: number }) {
  const radius = size / 2 - 40;
  const center = size / 2;
  const getScore = (k: string) => scores.find(s => s.domain.toLowerCase() === k)?.score || 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {[0.2, 0.4, 0.6, 0.8, 1].map(s => (
          <circle key={s} cx={center} cy={center} r={radius * s} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
        ))}
        {DOMAINS.map((d, i) => {
          const s1 = getScore(d.key), s2 = getScore(DOMAINS[(i+1)%5].key);
          const a1 = d.angle * Math.PI / 180, a2 = DOMAINS[(i+1)%5].angle * Math.PI / 180;
          const r1 = (s1/100) * radius, r2 = (s2/100) * radius;
          const x1 = center + r1 * Math.cos(a1), y1 = center + r1 * Math.sin(a1);
          const x2 = center + r2 * Math.cos(a2), y2 = center + r2 * Math.sin(a2);
          return (
            <motion.path key={d.key} d={`M ${center} ${center} L ${x1} ${y1} A ${r1} ${r1} 0 0 1 ${x2} ${y2} Z`}
              fill={d.color} fillOpacity={0.6} stroke={d.color} strokeWidth="2"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} />
          );
        })}
      </svg>
      {DOMAINS.map(d => {
        const a = d.angle * Math.PI / 180;
        const x = center + (radius + 25) * Math.cos(a);
        const y = center + (radius + 25) * Math.sin(a);
        return (
          <div key={d.key} className="absolute text-xs font-bold text-white/80 text-center" style={{ left: x, top: y, transform: 'translate(-50%,-50%)' }}>
            {d.label}<span className="block text-white/60">{getScore(d.key)}</span>
          </div>
        );
      })}
      <div className="absolute inset-0 flex items-center justify-center"><div className="text-center"><div className="text-2xl font-bold">Life</div><div className="text-xs text-white/60">Balance</div></div></div>
    </div>
  );
}