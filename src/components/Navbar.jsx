import React, { useState, useEffect } from 'react';
import { Scissors, Phone, Clock, MessageSquare, Shield, Menu, X, Calendar } from 'lucide-react';

export default function Navbar({ onOpenBooking, onOpenAdmin, onOpenBotModal, currentView }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Главная', href: '#hero' },
    { name: 'О клубе', href: '#about' },
    { name: 'Услуги и цены', href: '#services' },
    { name: 'Мастера', href: '#barbers' },
    { name: 'Онлайн-запись', href: '#booking' },
    { name: 'Галерея', href: '#gallery' },
    { name: 'Отзывы', href: '#reviews' },
    { name: 'Контакты', href: '#contacts' },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0a0c]/90 backdrop-blur-md border-b border-[#c5a880]/15 py-3 shadow-2xl'
          : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, '#hero')}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-full border border-[#c5a880]/40 flex items-center justify-center bg-[#15151a] group-hover:border-[#c5a880] transition-colors shadow-[0_0_15px_rgba(197,168,128,0.15)]">
              <Scissors className="w-5 h-5 text-[#c5a880] group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <span className="font-serif text-lg tracking-[0.2em] font-bold text-white block uppercase group-hover:text-[#c5a880] transition-colors">
                GRAVITY
              </span>
              <span className="text-[9px] tracking-[0.3em] uppercase text-gray-400 block -mt-1 font-mono">
                BARBER LOUNGE
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-xs uppercase tracking-[0.18em] font-medium text-gray-300 hover:text-[#c5a880] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#c5a880] hover:after:w-full after:transition-all after:duration-300"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Live working hours badge */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#15151a] border border-white/5 text-[11px] text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>10:00 — 22:00</span>
            </div>

            {/* Telegram Bot Button */}
            <button
              onClick={onOpenBotModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#1d2733] hover:bg-[#253242] border border-[#2AABEE]/30 text-white text-xs font-medium transition-all shadow-sm"
              title="Записаться через Telegram Бот"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#2AABEE]" />
              <span className="hidden md:inline">TG Бот</span>
            </button>

            {/* Admin Panel button */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#181820] hover:bg-[#22222e] border border-white/10 text-gray-300 hover:text-white text-xs transition-colors"
              title="Панель администратора"
            >
              <Shield className="w-3.5 h-3.5 text-[#c5a880]" />
              <span className="hidden md:inline">Админка</span>
            </button>

            {/* Book Now Primary Button */}
            <button
              onClick={() => {
                const bookingEl = document.getElementById('booking');
                if (bookingEl) bookingEl.scrollIntoView({ behavior: 'smooth' });
                else onOpenBooking();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-sm bg-gradient-to-r from-[#b89758] to-[#c5a880] hover:from-[#c5a880] hover:to-[#dfc285] text-[#0a0a0c] font-semibold text-xs tracking-wider uppercase transition-all duration-300 shadow-[0_0_20px_rgba(197,168,128,0.3)] hover:shadow-[0_0_30px_rgba(197,168,128,0.5)] transform hover:-translate-y-0.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Записаться</span>
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => {
                const bookingEl = document.getElementById('booking');
                if (bookingEl) bookingEl.scrollIntoView({ behavior: 'smooth' });
                else onOpenBooking();
              }}
              className="px-3 py-1.5 rounded-sm bg-[#c5a880] text-[#0a0a0c] text-xs font-bold uppercase"
            >
              Запись
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md bg-[#15151a] text-gray-300 hover:text-white border border-white/10"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#0c0c10] border-b border-[#c5a880]/20 px-6 py-6 mt-3 space-y-4 animate-fade-in shadow-2xl">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm uppercase tracking-wider text-gray-200 hover:text-[#c5a880] py-1 border-b border-white/5"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBotModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-[#1d2733] text-white text-xs font-medium border border-[#2AABEE]/30"
            >
              <MessageSquare className="w-4 h-4 text-[#2AABEE]" />
              Открыть Telegram Бот
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-[#181820] text-gray-300 text-xs font-medium border border-white/10"
            >
              <Shield className="w-4 h-4 text-[#c5a880]" />
              Панель управления (Админка)
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
