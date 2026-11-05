import React from 'react';
import { X, MessageSquare, Send, CheckCircle2, QrCode, Smartphone, ExternalLink } from 'lucide-react';

export default function TelegramBotModal({ isOpen, onClose, botUsername }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#121218] border border-[#c5a880]/40 rounded-xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#2AABEE]/20 border border-[#2AABEE]/50 flex items-center justify-center text-[#2AABEE]">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-white uppercase tracking-wide">
              Telegram-бот Gravity
            </h3>
            <p className="text-xs text-gray-400">Быстрая запись на стрижку прямо в мессенджере</p>
          </div>
        </div>

        {/* Features list */}
        <div className="space-y-3 mb-6 text-xs text-gray-300">
          <div className="flex items-start gap-2.5 p-3 rounded bg-[#181822] border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <b className="text-white">Запись в 4 клика:</b> Выбирайте услугу, мастера, дату и свободный тайм-слот без звонков.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded bg-[#181822] border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <b className="text-white">Напоминания о визите:</b> Бот заботливо напомнит за 2 часа и за день до назначенного времени.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded bg-[#181822] border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <b className="text-white">Управление бронью:</b> Просматривайте историю посещений, переносите или отменяйте визиты в один тап.
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 rounded-lg bg-[#1a1a24] border border-[#c5a880]/20 mb-6 text-center">
          <span className="text-[10px] text-[#c5a880] uppercase tracking-widest font-mono block mb-1">
            КАК ЗАПУСТИТЬ БОТА
          </span>
          <p className="text-xs text-gray-300 mb-3">
            Откройте Telegram и отправьте команду <span className="font-mono text-[#c5a880] font-bold">/start</span> боту:
          </p>
          <div className="inline-block px-4 py-1.5 rounded bg-black/60 border border-white/10 font-mono text-sm text-[#2AABEE]">
            @{botUsername || 'GravityBarber_bot'}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <a
            href={`https://t.me/${botUsername || 'GravityBarber_bot'}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 rounded-sm bg-gradient-to-r from-[#2AABEE] to-[#229ED9] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <Send className="w-4 h-4" />
            <span>Открыть бота в Telegram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-sm bg-[#16161f] text-gray-400 hover:text-white text-xs uppercase transition-colors"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
}
