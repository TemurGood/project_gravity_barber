import React from 'react';
import { Star, Scissors, Calendar, CheckCircle2 } from 'lucide-react';

const DAY_NAMES = {
  "0": "Вс",
  "1": "Пн",
  "2": "Вт",
  "3": "Ср",
  "4": "Чт",
  "5": "Пт",
  "6": "Сб"
};

export default function BarbersSection({ barbers, onSelectBarber }) {
  const handleSelectBarber = (barber) => {
    onSelectBarber(barber);
    const el = document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentDayOfWeek = new Date().getDay().toString();

  return (
    <section id="barbers" className="py-24 bg-[#0d0d12] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#c5a880]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#c5a880] font-semibold">
              КОМАНДА ПРОФЕССИОНАЛОВ
            </span>
            <span className="h-[1px] w-8 bg-[#c5a880]" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white uppercase tracking-wider mb-4">
            НАШИ <span className="gold-text-gradient">МАСТЕРА</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Каждый мастер Gravity — эксперт в геометрии стрижек и бритья. Мы регулярно проходим международную аттестацию и следим за мировыми тенденциями барберинга.
          </p>
        </div>

        {/* Barbers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {barbers.map(barber => {
            const isWorkingToday = barber.workingDays.includes(currentDayOfWeek);
            const workingDaysLabel = barber.workingDays.map(d => DAY_NAMES[d] || d).join(', ');

            return (
              <div
                key={barber.id}
                className="rounded-lg bg-[#121217] border border-white/5 hover:border-[#c5a880]/50 transition-all duration-300 flex flex-col overflow-hidden group shadow-xl hover:-translate-y-1.5"
              >
                {/* Master Photo with overlay */}
                <div className="relative h-72 w-full overflow-hidden bg-[#181820]">
                  <img
                    src={barber.photo}
                    alt={barber.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 filter brightness-95 group-hover:brightness-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-transparent to-black/30 pointer-events-none" />

                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-[#0a0a0c]/80 backdrop-blur-md border border-[#c5a880]/30 flex items-center gap-1.5 text-xs text-white">
                    <Star className="w-3.5 h-3.5 text-[#c5a880] fill-[#c5a880]" />
                    <span className="font-bold">{barber.rating}</span>
                    <span className="text-gray-400 text-[10px]">({barber.reviewsCount || 120})</span>
                  </div>

                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    {isWorkingToday ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] text-emerald-300 font-medium backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Работает сегодня
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-900/80 border border-white/10 text-[10px] text-gray-400 font-medium backdrop-blur-md">
                        Выходной
                      </span>
                    )}
                  </div>
                </div>

                {/* Barber Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white group-hover:text-[#c5a880] transition-colors uppercase tracking-wide mb-1">
                      {barber.name}
                    </h3>
                    <div className="text-xs text-[#c5a880] font-medium tracking-wider uppercase mb-1">
                      {barber.title}
                    </div>
                    <div className="text-[11px] text-gray-400 mb-3">
                      Опыт: <span className="text-gray-300">{barber.experience}</span>
                    </div>

                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4">
                      {barber.bio}
                    </p>

                    {/* Specialties Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {barber.specialties && barber.specialties.map((spec, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] bg-[#1a1a24] text-gray-300 border border-white/5"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    {/* Schedule info */}
                    <div className="text-[11px] text-gray-400 pt-2 border-t border-white/5 mb-4">
                      <div className="flex items-center justify-between">
                        <span>Дни: {workingDaysLabel}</span>
                        <span className="text-gray-300 font-mono">{barber.startTime} - {barber.endTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Select button */}
                  <button
                    onClick={() => handleSelectBarber(barber)}
                    className="w-full py-2.5 rounded-sm bg-[#1a1a24] group-hover:bg-[#c5a880] text-gray-200 group-hover:text-[#0a0a0c] text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 border border-[#c5a880]/30 group-hover:border-[#c5a880]"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Записаться к мастеру</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
