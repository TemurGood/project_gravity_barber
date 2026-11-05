import React, { useState } from 'react';
import { Sparkles, X, ZoomIn } from 'lucide-react';

const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'Low Skin Fade & Texture',
    category: 'haircuts',
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=900&auto=format&fit=crop&q=80',
    master: 'Александр «Blade» Громов'
  },
  {
    id: 2,
    title: 'Royal Shave Ritual',
    category: 'shave',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=900&auto=format&fit=crop&q=80',
    master: 'Дмитрий «Razor» Волков'
  },
  {
    id: 3,
    title: 'Gravity Interior & Belmont Chairs',
    category: 'interior',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&auto=format&fit=crop&q=80',
    master: 'Lounge Zone'
  },
  {
    id: 4,
    title: 'Textured French Crop',
    category: 'haircuts',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=900&auto=format&fit=crop&q=80',
    master: 'Марк «Fade» Соколов'
  },
  {
    id: 5,
    title: 'Beard Architecture & Contour',
    category: 'shave',
    image: 'https://images.unsplash.com/photo-1517832606589-7629c3ae81b9?w=900&auto=format&fit=crop&q=80',
    master: 'Артур «Craft» Баграмян'
  },
  {
    id: 6,
    title: 'Whiskey Bar & Reuzel Cosmetics',
    category: 'interior',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=900&auto=format&fit=crop&q=80',
    master: 'Amenities'
  }
];

export default function GalleryLookbook() {
  const [filter, setFilter] = useState('all');
  const [activePhoto, setActivePhoto] = useState(null);

  const filtered = filter === 'all' 
    ? GALLERY_ITEMS 
    : GALLERY_ITEMS.filter(item => item.category === filter);

  return (
    <section id="gallery" className="py-24 bg-[#0d0d12] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#c5a880]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#c5a880] font-semibold">
              ПОРТФОЛИО & АТМОСФЕРА
            </span>
            <span className="h-[1px] w-8 bg-[#c5a880]" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white uppercase tracking-wider mb-4">
            ЛУКБУК <span className="gold-text-gradient">И ИНТЕРЬЕР</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Оцените качество стрижек наших мастеров и винтажный индустриальный интерьер нашего барбершопа.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[
            { id: 'all', label: 'Все работы' },
            { id: 'haircuts', label: 'Стрижки & Фейд' },
            { id: 'shave', label: 'Бороды & Бритье' },
            { id: 'interior', label: 'Интерьер клуба' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all ${
                filter === tab.id
                  ? 'bg-[#c5a880] text-[#0a0a0c]'
                  : 'bg-[#15151c] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Masonry / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => setActivePhoto(item)}
              className="group relative h-80 rounded-lg overflow-hidden bg-[#181820] cursor-pointer border border-white/5 hover:border-[#c5a880]/50 transition-all duration-500 shadow-xl"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-90 group-hover:brightness-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

              {/* Zoom icon on hover */}
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#0a0a0c]/80 backdrop-blur-md border border-[#c5a880]/40 flex items-center justify-center text-[#c5a880] opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4" />
              </div>

              {/* Caption */}
              <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 transition-transform">
                <span className="text-[10px] text-[#c5a880] uppercase tracking-widest font-mono block">
                  {item.master}
                </span>
                <h4 className="text-white font-serif font-bold text-base uppercase">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setActivePhoto(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute -top-12 right-0 text-white hover:text-[#c5a880] p-2"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={activePhoto.image}
              alt={activePhoto.title}
              className="max-h-[75vh] w-auto rounded border border-[#c5a880]/30 shadow-2xl object-contain"
            />
            <div className="mt-4 text-center">
              <h3 className="text-xl font-serif font-bold text-white uppercase">{activePhoto.title}</h3>
              <p className="text-sm text-[#c5a880] font-mono">{activePhoto.master}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
