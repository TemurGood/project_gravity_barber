import React, { useEffect, useState } from 'react';
import { Scissors } from 'lucide-react';

export default function Preloader({ isLoaded, onFinish }) {
  const [progress, setProgress] = useState(15);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(timer);
          return 95;
        }
        return prev + Math.floor(Math.random() * 15 + 5);
      });
    }, 120);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      setProgress(100);
      const timeout = setTimeout(() => {
        setIsVisible(false);
        if (onFinish) onFinish();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isLoaded, onFinish]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0c] transition-opacity duration-700 ${
        progress === 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Barber Pole subtle glow backdrop */}
      <div className="absolute inset-0 bg-radial from-[#c5a880]/10 via-transparent to-transparent pointer-events-none" />

      {/* Brand Monogram & Scissors */}
      <div className="relative mb-8 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full border border-[#c5a880]/30 flex items-center justify-center relative shadow-[0_0_30px_rgba(197,168,128,0.2)]">
          <div className="absolute inset-1 rounded-full border border-dashed border-[#c5a880]/40 animate-spin" style={{ animationDuration: '12s' }}></div>
          <Scissors className="w-10 h-10 text-[#c5a880] animate-pulse" />
        </div>
      </div>

      <div className="text-center px-4">
        <span className="text-[#c5a880] text-xs uppercase tracking-[0.3em] font-semibold block mb-2">
          EST. 2018 • PREMIUM GROOMING
        </span>
        <h2 className="text-3xl md:text-4xl font-serif text-white tracking-widest uppercase mb-1">
          GRAVITY
        </h2>
        <p className="text-gray-400 text-xs tracking-[0.25em] uppercase font-light mb-8">
          BARBER LOUNGE & CLUB
        </p>

        {/* Progress bar */}
        <div className="w-64 md:w-80 h-1 bg-[#1c1c24] rounded-full overflow-hidden mx-auto border border-white/5 relative">
          <div
            className="h-full bg-gradient-to-r from-[#94753d] via-[#c5a880] to-[#ebd4a8] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 text-xs text-[#c5a880]/80 font-mono tracking-wider">
          {progress}% • Загрузка премиум атмосферы
        </div>
      </div>
    </div>
  );
}
