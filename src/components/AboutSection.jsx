import React from 'react';
import { Scissors, Wine, ShieldCheck, Sparkles, Award, Clock } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-[#0d0d11] relative overflow-hidden">
      {/* Decorative background grid and glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c5a880]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#c5a880]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#c5a880]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#c5a880] font-semibold">
              НАША ФИЛОСОФИЯ & СТИЛЬ
            </span>
            <span className="h-[1px] w-8 bg-[#c5a880]" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white uppercase tracking-wider mb-4">
            БОЛЬШЕ, ЧЕМ ПРОСТО <span className="gold-text-gradient">СТРИЖКА</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Мы создали Gravity Barber Lounge как оазис мужского комфорта и бескомпромиссного качества. Здесь уважают ваше время, ценят традиции классического ремесла и знают, как подчеркнуть характер каждого джентльмена.
          </p>
        </div>

        {/* 2-Column Split: Visuals & Story */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          
          {/* Left Column: Visual Composition with Parallax Feel */}
          <div className="lg:col-span-6 relative">
            <div className="relative z-10 rounded-lg overflow-hidden border border-[#c5a880]/30 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&auto=format&fit=crop&q=80"
                alt="Интерьер Gravity Barber Lounge"
                className="w-full h-[450px] object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-90 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              
              {/* Badge overlay */}
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#121217]/90 backdrop-blur-md rounded border border-[#c5a880]/20 flex items-center justify-between">
                <div>
                  <div className="text-[#c5a880] font-serif font-bold text-lg">GRAVITY LOUNGE</div>
                  <div className="text-gray-300 text-xs">Премиальные кожаные кресла Belmont & крафтовый бар</div>
                </div>
                <div className="w-10 h-10 rounded-full border border-[#c5a880]/40 flex items-center justify-center bg-[#1c1c24] text-[#c5a880]">
                  <Scissors className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Overlapping secondary image card */}
            <div className="hidden sm:block absolute -bottom-8 -right-8 w-60 h-60 rounded-lg overflow-hidden border-2 border-[#c5a880] shadow-2xl z-20">
              <img
                src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&auto=format&fit=crop&q=80"
                alt="Опасное бритье"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute bottom-2 left-2 right-2 text-center bg-[#0a0a0c]/80 py-1 text-[11px] font-mono text-[#c5a880] uppercase tracking-wider">
                Royal Hot Towel Shave
              </div>
            </div>
          </div>

          {/* Right Column: Values & Highlights */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
              <p>
                В Gravity Barber каждый визит — это продуманный ритуал. От распаривания горячим полотенцем с эвкалиптовым маслом до финального штриха авторской помадой на основе натурального пчелиного воска.
              </p>
              <p>
                Мы не ставим работу «на поток». На каждого клиента отводится от 45 до 90 минут неспешной, ювелирной работы мастера без спешки и компромиссов.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              
              <div className="p-4 rounded-md bg-[#14141a] border border-white/5 hover:border-[#c5a880]/40 transition-colors">
                <div className="w-9 h-9 rounded bg-[#1f1f28] flex items-center justify-center text-[#c5a880] mb-3">
                  <Scissors className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-white font-semibold text-sm mb-1 uppercase tracking-wide">
                  Японская сталь
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Работаем ножницами ручной заточки Kasho & Mizutani для филигранного среза без сечения волос.
                </p>
              </div>

              <div className="p-4 rounded-md bg-[#14141a] border border-white/5 hover:border-[#c5a880]/40 transition-colors">
                <div className="w-9 h-9 rounded bg-[#1f1f28] flex items-center justify-center text-[#c5a880] mb-3">
                  <Wine className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-white font-semibold text-sm mb-1 uppercase tracking-wide">
                  Free Lounge Bar
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Шотландский односолодовый виски, свежесваренный авторский кофе, холодные крафтовые напитки.
                </p>
              </div>

              <div className="p-4 rounded-md bg-[#14141a] border border-white/5 hover:border-[#c5a880]/40 transition-colors">
                <div className="w-9 h-9 rounded bg-[#1f1f28] flex items-center justify-center text-[#c5a880] mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-white font-semibold text-sm mb-1 uppercase tracking-wide">
                  100% Стерильность
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Трехэтапная дезинфекция: ультразвук, медицинский сухожар и индивидуальные крафт-пакеты.
                </p>
              </div>

              <div className="p-4 rounded-md bg-[#14141a] border border-white/5 hover:border-[#c5a880]/40 transition-colors">
                <div className="w-9 h-9 rounded bg-[#1f1f28] flex items-center justify-center text-[#c5a880] mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-serif text-white font-semibold text-sm mb-1 uppercase tracking-wide">
                  Топ-Барберы
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Опыт каждого мастера от 4 до 11 лет. Призеры международных и всероссийских чемпионатов.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
