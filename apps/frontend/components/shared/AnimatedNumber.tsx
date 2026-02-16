'use client';

import { useEffect, useState } from 'react';
import { useSpring, useTransform, motion } from 'framer-motion';

export function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { duration: 2000 });
  const display = useTransform(spring, v => Math.floor(v));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => { spring.set(value); }, [value, spring]);
  useEffect(() => { display.on("change", v => setDisplayValue(v)); }, [display]);

  return <span>{displayValue.toLocaleString()}</span>;
}