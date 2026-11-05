import React, { useState, useEffect } from 'react';
import { Calendar, ArrowDown, Scissors, Star, ShieldCheck, Sparkles } from 'lucide-react';

const BARBER_VIDEOS = [
  {
    id: "h706eM55Gqg",
    title: "Master Barber Fade Craft"
  },
  {
    id: "j5z0g7pYdK4",
    title: "Vintage Barber Shave & Haircut"
  },
  {
    id: "fXk0t0pS92U",
    title: "Classic London Grooming"
  },
  {
    id: "y671MCerSQg",
    title: "Signature Scissor Cut & Beard"
  },
  {
    id: "W_v_kYJ3Jmg",
    title: "Modern Fade & Texture"
  }
];

export default function HeroSection({ onVideoLoaded }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Pick a random video on each mount/reload
    const randomIndex = Math.floor(Math.random() * BARBER_VIDEOS.length);
    setSelectedVideo(BARBER_VIDEOS[randomIndex]);

    // Track scroll for parallax effect
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleIframeLoad = () => {
    // Signal preloader that video has mounted
    if (onVideoLoaded) {
      setTimeout(() => {
        onVideoLoaded();
      }, 700);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative h-screen min-h-[720px] w-full flex items-center justify-center overflow-hidden bg-[#0a0a0c]">
      
      {/* Background YouTube Video with Mute, Loop and AutoPlay */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none scale-105"
        style={{ transform: `translateY(${scrollY * 0.3}px) scale(1.08)` }}
      >
        {selectedVideo ? (
          <iframe
            className="w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${selectedVideo.id}&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&modestbranding=1`}
            title="Barbershop Background Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            onLoad={handleIframeLoad}
          />
        ) : null}
      </div>

      {/* Darkened Vignette & Atmosphere Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/65 to-[#0a0a0c]/85 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#0a0a0c]/50 to-[#0a0a0c] pointer-events-none" />
      <div className="absolute inset-0 bg-vintage-grain pointer-events-none opacity-40" />

      {/* Hero Content with Smooth Parallax */}
      <div 
        className="relative z-10 max-w-5xl mx-auto px-4 text-center flex flex-col items-center justify-center"
        style={{ transform: `translateY(${scrollY * -0.15}px)` }}
      >
        {/* Top Vintage Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c5a880]/30 bg-[#121217]/80 backdrop-blur-md mb-6 animate-fade-in shadow-[0_0_20px_rgba(197,168,128,0.15)]">
          <Star className="w-3.5 h-3.5 text-[#c5a880] fill-[#c5a880]" />
          <span className="text-xs uppercase tracking-[0.25em] text-[#dfc285] font-semibold">
            EST. 2018 • КЛУБ МУЖСКОГО СТИЛЯ
          </span>
          <Star className="w-3.5 h-3.5 text-[#c5a880] fill-[#c5a880]" />
        </div>

        {/* Vintage Divider with crossed scissors */}
        <div className="flex items-center justify-center gap-4 w-full max-w-md mb-4 opacity-75">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#c5a880]" />
          <Scissors className="w-4 h-4 text-[#c5a880]" />
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#c5a880]" />
        </div>

        {/* Main Brand Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-black tracking-wider uppercase text-white mb-4 leading-none drop-shadow-2xl">
          GRAVITY <span className="gold-text-gradient block sm:inline">BARBER</span>
        </h1>

        {/* Subtitle / Philosophy */}
        <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl font-light tracking-wide mb-10 leading-relaxed text-balance">
          Культура классического мужского бритья и авторских стрижек в центре Москвы. Безупречное мастерство, правильные напитки и атмосфера закрытого джентльменского клуба.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => scrollToSection('booking')}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-sm bg-gradient-to-r from-[#b89758] via-[#c5a880] to-[#dfc285] hover:brightness-110 text-[#0a0a0c] font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_0_30px_rgba(197,168,128,0.4)] transform hover:-translate-y-1"
          >
            <Calendar className="w-4 h-4" />
            <span>Записаться онлайн</span>
          </button>

          <button
            onClick={() => scrollToSection('services')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-sm bg-[#15151a]/90 hover:bg-[#202028] text-white hover:text-[#c5a880] border border-[#c5a880]/30 hover:border-[#c5a880] text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 backdrop-blur-md"
          >
            <span>Услуги и цены</span>
          </button>
        </div>

        {/* Bottom Highlights Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl w-full text-left">
          <div className="glass-panel p-3.5 rounded border border-white/5 hover:border-[#c5a880]/30 transition-colors">
            <div className="text-xl font-serif font-bold text-[#c5a880]">4.98 ★</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Рейтинг Яндекс & Google</div>
          </div>

          <div className="glass-panel p-3.5 rounded border border-white/5 hover:border-[#c5a880]/30 transition-colors">
            <div className="text-xl font-serif font-bold text-white">100%</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Стерильный инструмент</div>
          </div>

          <div className="glass-panel p-3.5 rounded border border-white/5 hover:border-[#c5a880]/30 transition-colors">
            <div className="text-xl font-serif font-bold text-[#c5a880]">Free Bar</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Виски, кофе & PS5</div>
          </div>

          <div className="glass-panel p-3.5 rounded border border-white/5 hover:border-[#c5a880]/30 transition-colors">
            <div className="text-xl font-serif font-bold text-white">Reuzel & Uppercut</div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Премиум косметика</div>
          </div>
        </div>

      </div>

      {/* Down arrow scroll cue */}
      <button
        onClick={() => scrollToSection('about')}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-[#c5a880] hover:text-white transition-colors animate-bounce p-2"
        aria-label="Scroll down"
      >
        <ArrowDown className="w-5 h-5" />
      </button>

    </section>
  );
}
