'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomeSplash = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setProgress((prev) => (prev >= 95 ? 95 : prev + 2));
      }, 150);
      return () => clearInterval(timer);
    } else {
      setProgress(100);
    }
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white p-6"
        >
          {/* Subtle Background Arabesque Pattern (Optional) */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] bg-center" />

          <div className="max-w-md w-full text-center space-y-12 relative z-10">
            
            {/* Spiritual Header */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-6xl font-serif text-[#15803d] leading-relaxed drop-shadow-sm">
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
              </h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.5 }}
                className="text-[10px] tracking-[0.3em] text-emerald-900 uppercase font-bold"
              >
                In the name of Allah, the Most Gracious, the Most Merciful
              </motion.p>
            </motion.div>

            {/* Custom Intuitive Loader: The Glowing Ring */}
            <div className="relative flex items-center justify-center py-10">
              {/* Outer Decorative Ring */}
              <div className="absolute w-24 h-24 border border-emerald-50 rounded-full" />
              
              {/* Spinning/Progress Ring */}
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  className="text-emerald-100"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray="283"
                  animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
                  transition={{ ease: "easeOut", duration: 0.5 }}
                  className="text-[#15803d]"
                />
              </svg>

              {/* Center Icon or Percentage */}
              <div className="absolute flex flex-col items-center">
                 <motion.span 
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-[10px] font-mono text-emerald-800 font-bold"
                >
                  {Math.round(progress)}%
                </motion.span>
              </div>
            </div>

            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
                30 Tuxedo Musallah
              </h2>
              <p className="text-slate-400 italic text-sm px-10 leading-relaxed">
                “Verily, in the remembrance of Allah do hearts find rest.”
              </p>
            </motion.div>

            {/* Status Footer */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1.2 }}
               className="flex items-center justify-center gap-2"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-[0.2em]">
                Synchronizing Prayer Times
              </p>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeSplash;