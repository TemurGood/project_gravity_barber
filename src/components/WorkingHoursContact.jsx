import React from 'react';
import { MapPin, Phone, Clock, Mail, Navigation, Car, Coffee, Shield } from 'lucide-react';

export default function WorkingHoursContact({ settings }) {
  const currentHour = new Date().getHours();
  const isOpenNow = currentHour >= 10 && currentHour < 22;

  return (
    <section id="contacts" className="py-24 bg-[#0d0d12] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#c5a880]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#c5a880] font-semibold">
              ЛОКАЦИЯ И РАСПИСАНИЕ
            </span>
            <span className="h-[1px] w-8 bg-[#c5a880]" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white uppercase tracking-wider mb-4">
            КАК НАС <span className="gold-text-gradient">НАЙТИ</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Центр Москвы, удобный подъезд, гостевой паркинг и шаговая доступность от трех станций метро.
          </p>
        </div>

        {/* 2-Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Contact Info & Hours (7 cols) */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            
            <div className="p-8 rounded-xl bg-[#121217] border border-white/5 shadow-xl space-y-6">
              
              {/* Live status badge */}
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                <div>
                  <h3 className="font-serif font-bold text-xl text-white uppercase">
                    {settings?.salonName || 'Gravity Barber Lounge'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Премиальный мужской салон & бар</p>
                </div>

                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border ${
                  isOpenNow 
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' 
                    : 'bg-red-950/60 text-red-300 border-red-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                  <span>{isOpenNow ? 'Открыто сейчас (до 22:00)' : 'Сейчас закрыто (откроемся в 10:00)'}</span>
                </div>
              </div>

              {/* Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded bg-[#1c1c24] border border-[#c5a880]/30 flex items-center justify-center text-[#c5a880] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Адрес:</div>
                    <div className="text-sm font-semibold text-white mt-0.5 leading-snug">
                      {settings?.salonAddress || 'ул. Большая Бронная, 14, Москва'}
                    </div>
                    <div className="text-xs text-[#c5a880] mt-1 font-mono">
                      м. Пушкинская / Тверская (3 мин)
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded bg-[#1c1c24] border border-[#c5a880]/30 flex items-center justify-center text-[#c5a880] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Телефон:</div>
                    <a
                      href={`tel:${settings?.salonPhone?.replace(/[^0-9+]/g, '') || '+79997773322'}`}
                      className="text-sm font-bold text-white hover:text-[#c5a880] transition-colors mt-0.5 block font-mono"
                    >
                      {settings?.salonPhone || '+7 (999) 777-33-22'}
                    </a>
                    <div className="text-[11px] text-gray-400 mt-1">
                      Звонки, WhatsApp, Telegram
                    </div>
                  </div>
                </div>

              </div>

              {/* Working Hours Schedule Table */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-3 text-xs uppercase font-semibold text-gray-300">
                  <Clock className="w-4 h-4 text-[#c5a880]" />
                  <span>График работы:</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-[#181822] border border-white/5 text-center">
                    <div className="text-gray-400 text-[11px]">Пн — Пт</div>
                    <div className="text-[#c5a880] font-mono font-bold mt-0.5">10:00 - 22:00</div>
                  </div>
                  <div className="p-2.5 rounded bg-[#181822] border border-white/5 text-center">
                    <div className="text-gray-400 text-[11px]">Суббота</div>
                    <div className="text-[#c5a880] font-mono font-bold mt-0.5">10:00 - 22:00</div>
                  </div>
                  <div className="p-2.5 rounded bg-[#181822] border border-white/5 text-center">
                    <div className="text-gray-400 text-[11px]">Воскресенье</div>
                    <div className="text-[#c5a880] font-mono font-bold mt-0.5">10:00 - 22:00</div>
                  </div>
                  <div className="p-2.5 rounded bg-[#181822] border border-white/5 text-center">
                    <div className="text-gray-400 text-[11px]">Парковка</div>
                    <div className="text-emerald-400 font-bold mt-0.5">Бесплатно</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Amenities Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-[#14141a] border border-white/5 flex items-center gap-3 text-xs text-gray-300">
                <Car className="w-4 h-4 text-[#c5a880]" />
                <span>Гостевой паркинг</span>
              </div>
              <div className="p-4 rounded-lg bg-[#14141a] border border-white/5 flex items-center gap-3 text-xs text-gray-300">
                <Coffee className="w-4 h-4 text-[#c5a880]" />
                <span>Бар & Кофемашина</span>
              </div>
              <div className="p-4 rounded-lg bg-[#14141a] border border-white/5 flex items-center gap-3 text-xs text-gray-300">
                <Shield className="w-4 h-4 text-[#c5a880]" />
                <span>Wi-Fi 500 Мбит/с</span>
              </div>
            </div>

          </div>

          {/* Right: Styled Map Card (5 cols) */}
          <div className="lg:col-span-5 rounded-xl overflow-hidden border border-[#c5a880]/30 bg-[#15151c] relative min-h-[360px] shadow-2xl flex flex-col justify-between p-6">
            <div className="absolute inset-0 bg-[radial-gradient(#c5a880_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
            
            {/* Visual map representation */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#0a0a0c]/80 border border-[#c5a880]/40 text-[#c5a880] text-xs font-mono mb-4">
                <Navigation className="w-3.5 h-3.5" />
                <span>55.7645° N, 37.6012° E</span>
              </div>

              <h4 className="text-2xl font-serif font-bold text-white uppercase mb-2">
                СЕРДЦЕ СТОЛИЦЫ
              </h4>
              <p className="text-gray-400 text-xs leading-relaxed max-w-sm mb-6">
                Расположены в историческом тихом дворе на Большой Бронной. Позвоните нам при подъезде — администратор откроет шлагбаум на закрытую парковку.
              </p>
            </div>

            {/* Map action button */}
            <div className="relative z-10 pt-6 border-t border-white/10">
              <a
                href="https://yandex.ru/maps"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-sm bg-[#1e1e28] hover:bg-[#c5a880] text-white hover:text-[#0a0a0c] text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-white/10 hover:border-[#c5a880]"
              >
                <Navigation className="w-4 h-4" />
                <span>Построить маршрут в Яндекс Картах</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
