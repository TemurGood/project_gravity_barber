import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export default function TestimonialsSection({ reviews }) {
  return (
    <section id="reviews" className="py-24 bg-[#0a0a0c] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#c5a880]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#c5a880] font-semibold">
              ОТЗЫВЫ ГОСТЕЙ
            </span>
            <span className="h-[1px] w-8 bg-[#c5a880]" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white uppercase tracking-wider mb-4">
            ЧТО ГОВОРЯТ <span className="gold-text-gradient">КЛИЕНТЫ</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Более 98% гостей возвращаются к нам снова и рекомендуют друзьям и коллегам.
          </p>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map(rev => (
            <div
              key={rev.id}
              className="p-7 rounded-lg bg-[#121217] border border-white/5 hover:border-[#c5a880]/40 transition-all duration-300 relative flex flex-col justify-between shadow-xl"
            >
              <Quote className="w-8 h-8 text-[#c5a880]/20 absolute top-6 right-6 pointer-events-none" />

              <div>
                {/* 5-star rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#c5a880] fill-[#c5a880]" />
                  ))}
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">
                  "{rev.text}"
                </p>
              </div>

              {/* Author info */}
              <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                <img
                  src={rev.avatar}
                  alt={rev.author}
                  className="w-11 h-11 rounded-full object-cover border border-[#c5a880]/40"
                />
                <div>
                  <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <span>{rev.author}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-[#c5a880] font-mono">
                    Барбер: {rev.barber}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
