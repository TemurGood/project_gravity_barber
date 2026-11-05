import React from 'react';
import { Scissors, Shield, MessageSquare, Phone, MapPin } from 'lucide-react';

export default function Footer({ onOpenAdmin, onOpenBotModal }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#070709] border-t border-white/5 pt-16 pb-8 text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border border-[#c5a880]/40 flex items-center justify-center bg-[#15151a] text-[#c5a880]">
                <Scissors className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif text-base tracking-[0.2em] font-bold text-white block uppercase">
                  GRAVITY
                </span>
                <span className="text-[8px] tracking-[0.3em] uppercase text-gray-500 block -mt-1 font-mono">
                  BARBER LOUNGE
                </span>
              </div>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed">
              Премиальный мужской клуб и барбершоп в центре Москвы. Авторские стрижки, королевское бритье и атмосфера комфорта.
            </p>

            <div className="text-[11px] text-[#c5a880] font-mono">
              ★ EST. 2018 • CRAFT & PRECISION
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="font-serif text-white font-bold uppercase tracking-wider text-xs mb-4">
              Навигация
            </h4>
            <ul className="space-y-2">
              <li><a href="#hero" className="hover:text-[#c5a880] transition-colors">Главная</a></li>
              <li><a href="#about" className="hover:text-[#c5a880] transition-colors">О клубе</a></li>
              <li><a href="#services" className="hover:text-[#c5a880] transition-colors">Услуги и цены</a></li>
              <li><a href="#barbers" className="hover:text-[#c5a880] transition-colors">Наши барберы</a></li>
              <li><a href="#booking" className="hover:text-[#c5a880] transition-colors">Онлайн-календарь</a></li>
              <li><a href="#gallery" className="hover:text-[#c5a880] transition-colors">Лукбук</a></li>
              <li><a href="#reviews" className="hover:text-[#c5a880] transition-colors">Отзывы гостей</a></li>
            </ul>
          </div>

          {/* Col 3: Services Highlights */}
          <div>
            <h4 className="font-serif text-white font-bold uppercase tracking-wider text-xs mb-4">
              Популярные услуги
            </h4>
            <ul className="space-y-2">
              <li><span className="text-gray-300">Gravity Signature Fade</span></li>
              <li><span className="text-gray-300">Королевское бритье клинком</span></li>
              <li><span className="text-gray-300">Моделирование бороды и усов</span></li>
              <li><span className="text-gray-300">VIP Тотал Care Комплекс</span></li>
              <li><span className="text-gray-300">Детская джентльменская стрижка</span></li>
              <li><span className="text-gray-300">SPA Черная маска & пилинг</span></li>
            </ul>
          </div>

          {/* Col 4: Quick Actions & Automation */}
          <div className="space-y-4">
            <h4 className="font-serif text-white font-bold uppercase tracking-wider text-xs mb-4">
              Автоматизация бизнеса
            </h4>
            <p className="text-gray-400 text-xs">
              Запись доступна через интерактивный календарь на сайте и через Telegram-бота.
            </p>

            <button
              onClick={onOpenBotModal}
              className="w-full py-2.5 px-3 rounded bg-[#1d2733] hover:bg-[#253242] text-white text-xs font-semibold flex items-center justify-center gap-2 border border-[#2AABEE]/40 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#2AABEE]" />
              <span>Телеграм-бот записи</span>
            </button>

            <button
              onClick={onOpenAdmin}
              className="w-full py-2.5 px-3 rounded bg-[#16161f] hover:bg-[#20202d] text-gray-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>Панель управления (Admin)</span>
            </button>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <div>
            © {currentYear} Gravity Barber Lounge. Все права защищены.
          </div>
          <div className="flex items-center gap-4">
            <span>Политика конфиденциальности</span>
            <span>•</span>
            <button onClick={onOpenAdmin} className="hover:text-[#c5a880] underline">
              Вход для персонала
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
