import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500); // Small delay for fade out
          return 100;
        }
        // Smooth random increment to feel like real loading
        const increment = Math.floor(Math.random() * 12) + 4;
        return Math.min(prev + increment, 100);
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060608] select-none">
      {/* Abstract Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon/5 rounded-full filter blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon/5 rounded-full filter blur-[120px] animate-pulse delay-700"></div>

      <div className="relative flex flex-col items-center">
        {/* Animated Outer Ring */}
        <motion.div 
          className="relative w-32 h-32 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Neon spinning outer ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-9xl" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#13131a"
              strokeWidth="4"
              fill="transparent"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              stroke="#00ff66"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray="276"
              animate={{ strokeDashoffset: [276, 276 * (1 - progress / 100)] }}
              transition={{ ease: "easeInOut", duration: 0.1 }}
            />
          </svg>

          {/* Logo Emblem inside */}
          <div className="z-10 flex flex-col items-center justify-center bg-[#0d0d12] border border-white/5 rounded-full w-24 h-24 shadow-2xl">
            <span className="text-3xl font-black text-neon text-neon-glow tracking-tighter">R8</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Store</span>
          </div>
        </motion.div>

        {/* Loading Text */}
        <div className="mt-8 text-center space-y-2">
          <motion.div 
            className="flex items-center justify-center gap-2 text-white/90 font-medium tracking-wide text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-neon animate-pulse" />
            <span>Memuat Pengalaman Premium</span>
          </motion.div>
          
          {/* Progress Percentage */}
          <div className="font-mono text-xs text-neon/80 font-bold">
            {progress}%
          </div>
        </div>

        {/* Console loading detail bar */}
        <div className="mt-6 w-64 h-1.5 bg-[#13131c] rounded-full overflow-hidden border border-white/5 p-[1px]">
          <div 
            className="h-full bg-neon rounded-full transition-all duration-100 shadow-[0_0_10px_rgba(0,255,102,0.5)]"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Footer Branding inside Loading Screen */}
      <div className="absolute bottom-8 text-center">
        <span className="text-xs text-white/20 font-mono tracking-widest uppercase">
          ALIGHT MOTION OFFICIAL RESELLER • 2026
        </span>
      </div>
    </div>
  );
}
