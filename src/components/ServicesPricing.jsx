import React, { useState } from 'react';
import { Scissors, Clock, Sparkles, Check } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'Все услуги' },
  { id: 'haircuts', label: 'Стрижки' },
  { id: 'beard', label: 'Борода и бритье' },
  { id: 'combos', label: 'Комплексы (Комбо)' },
  { id: 'spa', label: 'VIP Уход & SPA' },
];

export default function ServicesPricing({ services, onSelectService }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredServices = activeCategory === 'all'
    ? services
    : services.filter(s => s.category === activeCategory);

  const handleBookService = (service) => {
    onSelectService(service);
    const bookingEl = document.getElementById('booking');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-24 bg-[#0a0a0c] relative">
      {/* Background subtleties */}
      <div className="absolute inset-0 bg-vintage-grain pointer-events-none opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#c5a880]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#c5a880] font-semibold">
              ПРАЙС-ЛИСТ & МЕНЮ
            </span>
            <span className="h-[1px] w-8 bg-[#c5a880]" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white uppercase tracking-wider mb-4">
            УСЛУГИ И <span className="gold-text-gradient">СТОИМОСТЬ</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Фиксированные прозрачные цены без скрытых доплат. В каждую услугу включены мытье головы премиальным шампунем, массаж и напитки из бара.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-16">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-[#c5a880] text-[#0a0a0c] shadow-[0_0_15px_rgba(197,168,128,0.35)] scale-105'
                  : 'bg-[#15151c] text-gray-400 hover:text-white hover:bg-[#1f1f28] border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services List / Vintage Menu Style Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
          {filteredServices.map(service => (
            <div
              key={service.id}
              className="p-5 rounded-lg bg-[#111116] border border-white/5 hover:border-[#c5a880]/40 transition-all duration-300 group relative flex flex-col justify-between hover:shadow-[0_4px_25px_rgba(0,0,0,0.5)]"
            >
              <div>
                {/* Header line: Title + Dot Leader + Price */}
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-white group-hover:text-[#c5a880] transition-colors uppercase tracking-wide">
                      {service.name}
                    </h3>
                    {service.popular && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[#c5a880]/20 text-[#dfc285] border border-[#c5a880]/30">
                        <Sparkles className="w-2.5 h-2.5" /> ХИТ
                      </span>
                    )}
                  </div>
                  <div className="dot-leader hidden sm:block" />
                  <div className="text-lg sm:text-xl font-serif font-bold text-[#c5a880] whitespace-nowrap">
                    {service.price.toLocaleString('ru-RU')} ₽
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4">
                  {service.description}
                </p>
              </div>

              {/* Bottom footer: Duration + Quick Book Button */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>{service.duration} минут</span>
                </div>

                <button
                  onClick={() => handleBookService(service)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-sm bg-[#1c1c24] group-hover:bg-[#c5a880] text-gray-300 group-hover:text-[#0a0a0c] text-xs font-semibold uppercase tracking-wider transition-all duration-300 border border-white/10 group-hover:border-[#c5a880]"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Записаться</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Special Offer Banner below */}
        <div className="mt-16 p-8 rounded-lg bg-gradient-to-r from-[#171720] via-[#1a1a24] to-[#171720] border border-[#c5a880]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="text-center md:text-left">
            <span className="text-[#c5a880] text-xs uppercase tracking-[0.2em] font-semibold block mb-1">
              ПЕРВЫЙ ВИЗИТ В GRAVITY
            </span>
            <h4 className="text-xl sm:text-2xl font-serif font-bold text-white uppercase mb-1">
              Скидка 15% на первое посещение любого мастера
            </h4>
            <p className="text-gray-400 text-xs sm:text-sm">
              Используйте промокод <span className="text-white font-mono font-bold bg-white/10 px-2 py-0.5 rounded">GRAVITY15</span> при подтверждении записи
            </p>
          </div>

          <button
            onClick={() => {
              const el = document.getElementById('booking');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3 rounded-sm bg-[#c5a880] hover:bg-[#dfc285] text-[#0a0a0c] text-xs uppercase font-bold tracking-widest whitespace-nowrap transition-colors shadow-lg"
          >
            Получить скидку
          </button>
        </div>

      </div>
    </section>
  );
}
