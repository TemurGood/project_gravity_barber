import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Scissors, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  ShieldCheck,
  Send
} from 'lucide-react';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const WEEKDAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function BookingCalendar({ 
  services, 
  barbers, 
  preselectedService, 
  preselectedBarber,
  onBookingSuccess
}) {
  // Wizard state
  const [selectedService, setSelectedService] = useState(preselectedService || (services[0] || null));
  const [selectedBarber, setSelectedBarber] = useState(preselectedBarber || (barbers[0] || null));

  // Calendar date state
  const today = new Date();
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);

  // Slots state
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isWorkingDay, setIsWorkingDay] = useState(true);
  const [selectedTime, setSelectedTime] = useState('');

  // Form input state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+7 ');
  const [clientNote, setClientNote] = useState('');
  const [tgUserId, setTgUserId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successBooking, setSuccessBooking] = useState(null);

  // Telegram Mini App Auto-detection
  useEffect(() => {
    try {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        const user = tg.initDataUnsafe?.user;
        if (user) {
          const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
          if (fullName) setClientName(fullName);
          setTgUserId(user.id);
        }
      }
    } catch (e) {}
  }, []);

  // Sync when props change
  useEffect(() => {
    if (preselectedService) setSelectedService(preselectedService);
  }, [preselectedService]);

  useEffect(() => {
    if (preselectedBarber) setSelectedBarber(preselectedBarber);
  }, [preselectedBarber]);

  // Fetch slots whenever selectedBarber or selectedDate changes
  useEffect(() => {
    if (!selectedBarber || !selectedDate) return;

    setSlotsLoading(true);
    setSelectedTime('');
    setErrorMsg('');

    fetch(`/api/availability?barberId=${selectedBarber.id}&date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        setIsWorkingDay(data.isWorkingDay !== false);
        setAvailableSlots(data.slots || []);
        // Auto-select first available slot if any
        const firstFree = (data.slots || []).find(s => s.isAvailable);
        if (firstFree) setSelectedTime(firstFree.time);
      })
      .catch(err => {
        console.error('Failed to load slots:', err);
        // Fallback default mock slots if backend is offline
        const mockFallback = [
          { time: "11:00", isAvailable: true },
          { time: "12:30", isAvailable: false },
          { time: "14:00", isAvailable: true },
          { time: "15:30", isAvailable: true },
          { time: "17:00", isAvailable: true },
          { time: "18:30", isAvailable: false },
          { time: "20:00", isAvailable: true }
        ];
        setIsWorkingDay(true);
        setAvailableSlots(mockFallback);
        setSelectedTime("11:00");
      })
      .finally(() => {
        setSlotsLoading(false);
      });
  }, [selectedBarber, selectedDate]);

  // Phone input formatting
  const handlePhoneChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith('+7')) {
      val = '+7 ';
    }
    setClientPhone(val);
  };

  // Calendar day calculation
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // 0 is Mon, 6 is Sun
  };

  const renderCalendarDays = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month);

    const cells = [];

    // Empty cells before month start
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(<div key={`empty-${i}`} className="h-10 w-full" />);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let day = 1; day <= totalDays; day++) {
      const dateObj = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPast = dateStr < todayStr;
      const isSelected = dateStr === selectedDate;

      // Check barber's working days
      const dayOfWeek = dateObj.getDay().toString();
      const isBarberWorking = selectedBarber?.workingDays?.includes(dayOfWeek);

      const isDisabled = isPast || !isBarberWorking;

      cells.push(
        <button
          key={dateStr}
          type="button"
          disabled={isDisabled}
          onClick={() => setSelectedDate(dateStr)}
          className={`h-11 w-full rounded-md flex flex-col items-center justify-center text-xs font-semibold transition-all relative ${
            isSelected
              ? 'bg-[#c5a880] text-[#0a0a0c] font-bold shadow-[0_0_15px_rgba(197,168,128,0.5)] scale-105 z-10'
              : isDisabled
              ? 'text-gray-600 bg-white/[0.02] cursor-not-allowed opacity-40 line-through'
              : 'text-gray-200 hover:bg-[#1f1f2a] hover:text-[#c5a880] border border-white/5'
          }`}
        >
          <span>{day}</span>
          {isSelected && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#0a0a0c] -mb-1" />
          )}
          {!isBarberWorking && !isPast && (
            <span className="text-[8px] text-gray-500 font-normal">вых</span>
          )}
        </button>
      );
    }

    return cells;
  };

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  // Submit booking
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedService) {
      setErrorMsg('Пожалуйста, выберите услугу');
      return;
    }
    if (!selectedBarber) {
      setErrorMsg('Пожалуйста, выберите барбера');
      return;
    }
    if (!selectedDate) {
      setErrorMsg('Пожалуйста, выберите дату');
      return;
    }
    if (!selectedTime) {
      setErrorMsg('Пожалуйста, выберите время визита');
      return;
    }
    if (!clientName.trim()) {
      setErrorMsg('Введите ваше имя');
      return;
    }
    if (clientPhone.trim().length < 11) {
      setErrorMsg('Введите корректный номер телефона');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          clientNote: clientNote.trim(),
          serviceId: selectedService.id,
          barberId: selectedBarber.id,
          date: selectedDate,
          time: selectedTime,
          source: tgUserId ? 'telegram' : 'website',
          telegramChatId: tgUserId || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при оформлении бронирования');
      }

      // Launch victory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#c5a880', '#dfc285', '#ffffff', '#94753d']
      });

      setSuccessBooking(data.booking);
      if (onBookingSuccess) onBookingSuccess(data.booking);

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="booking" className="py-24 bg-[#0a0a0e] relative overflow-hidden">
      {/* Background ambient gold glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[#c5a880]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#c5a880]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#c5a880] font-semibold">
              ОНЛАЙН БРОНИРОВАНИЕ 24/7
            </span>
            <span className="h-[1px] w-8 bg-[#c5a880]" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white uppercase tracking-wider mb-4">
            ИНТЕРАКТИВНЫЙ <span className="gold-text-gradient">КАЛЕНДАРЬ ЗАПИСИ</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Выберите желаемую услугу, любимого мастера, удобный день и время. Заявка моментально дублируется в наш рабочий Telegram-чат.
          </p>
        </div>

        {/* Success Modal / Card State */}
        {successBooking ? (
          <div className="max-w-2xl mx-auto p-8 rounded-xl bg-[#121218] border border-[#c5a880] shadow-[0_0_50px_rgba(197,168,128,0.25)] text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#c5a880]/20 border border-[#c5a880] flex items-center justify-center mx-auto mb-6 text-[#c5a880]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-[#c5a880] text-xs font-mono tracking-widest uppercase block mb-1">
              БРОНИРОВАНИЕ ПОДТВЕРЖДЕНО
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2 uppercase">
              Ждем вас, {successBooking.clientName}!
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              Ваша запись передана администратору и мастеру. Мы отправили уведомление в дежурный Telegram-чат.
            </p>

            {/* Receipt Summary */}
            <div className="p-5 rounded-lg bg-[#181822] border border-white/5 text-left space-y-3 mb-6 text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-gray-400">Код записи:</span>
                <span className="text-[#c5a880] font-mono font-bold">{successBooking.id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-gray-400">Услуга:</span>
                <span className="text-white font-semibold">{successBooking.serviceName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-gray-400">Мастер:</span>
                <span className="text-white">{successBooking.barberName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-gray-400">Дата и время:</span>
                <span className="text-[#c5a880] font-semibold">{successBooking.date} в {successBooking.time}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-gray-400">Телефон:</span>
                <span className="text-white font-mono">{successBooking.clientPhone}</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-base">
                <span className="text-gray-300 font-semibold">Итого к оплате:</span>
                <span className="text-xl font-serif font-bold text-[#c5a880]">{successBooking.servicePrice} ₽</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setSuccessBooking(null);
                  setClientNote('');
                }}
                className="px-6 py-3 rounded-sm bg-[#c5a880] hover:bg-[#dfc285] text-[#0a0a0c] font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Создать еще одну запись
              </button>
            </div>
          </div>
        ) : (
          /* Main Interactive Booking Layout */
          <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: 1. Service & 2. Barber Selector (lg: 5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Step 1: Select Service */}
              <div className="p-6 rounded-xl bg-[#121217] border border-white/5 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-[#c5a880]/20 text-[#c5a880] flex items-center justify-center text-xs font-bold font-mono">
                    1
                  </div>
                  <h3 className="font-serif font-bold text-white text-base uppercase tracking-wide">
                    Выберите услугу
                  </h3>
                </div>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {services.map(srv => {
                    const isSelected = selectedService?.id === srv.id;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedService(srv)}
                        className={`p-3 rounded-md cursor-pointer transition-all flex items-center justify-between border ${
                          isSelected
                            ? 'bg-[#1e1e28] border-[#c5a880] shadow-[0_0_15px_rgba(197,168,128,0.2)]'
                            : 'bg-[#15151c] border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Scissors className={`w-4 h-4 ${isSelected ? 'text-[#c5a880]' : 'text-gray-400'}`} />
                          <div>
                            <div className="text-xs font-semibold text-white">{srv.name}</div>
                            <div className="text-[11px] text-gray-400">{srv.duration} мин</div>
                          </div>
                        </div>
                        <div className="text-xs font-serif font-bold text-[#c5a880]">
                          {srv.price} ₽
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Select Barber */}
              <div className="p-6 rounded-xl bg-[#121217] border border-white/5 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-[#c5a880]/20 text-[#c5a880] flex items-center justify-center text-xs font-bold font-mono">
                    2
                  </div>
                  <h3 className="font-serif font-bold text-white text-base uppercase tracking-wide">
                    Выберите мастера
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {barbers.map(barber => {
                    const isSelected = selectedBarber?.id === barber.id;
                    return (
                      <div
                        key={barber.id}
                        onClick={() => setSelectedBarber(barber)}
                        className={`p-3 rounded-md cursor-pointer transition-all border flex flex-col items-center text-center ${
                          isSelected
                            ? 'bg-[#1e1e28] border-[#c5a880] shadow-[0_0_15px_rgba(197,168,128,0.25)]'
                            : 'bg-[#15151c] border-white/5 hover:border-white/20'
                        }`}
                      >
                        <img
                          src={barber.photo}
                          alt={barber.name}
                          className="w-14 h-14 rounded-full object-cover mb-2 border-2 border-[#c5a880]/40"
                        />
                        <div className="text-xs font-bold text-white line-clamp-1">{barber.name}</div>
                        <div className="text-[10px] text-[#c5a880] uppercase tracking-wider">{barber.title}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">★ {barber.rating}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column: 3. Calendar + 4. Time Slots + 5. Client Contacts (lg: 7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Step 3 & 4: Date & Time Picker */}
              <div className="p-6 rounded-xl bg-[#121217] border border-white/5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#c5a880]/20 text-[#c5a880] flex items-center justify-center text-xs font-bold font-mono">
                      3
                    </div>
                    <h3 className="font-serif font-bold text-white text-base uppercase tracking-wide">
                      Дата и время визита
                    </h3>
                  </div>

                  {/* Month navigation */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-serif font-bold text-[#c5a880] uppercase tracking-wider">
                      {MONTH_NAMES[currentMonthDate.getMonth()]} {currentMonthDate.getFullYear()}
                    </span>
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded bg-[#1c1c24] hover:bg-[#252530] text-gray-300"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1.5 rounded bg-[#1c1c24] hover:bg-[#252530] text-gray-300"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {WEEKDAY_NAMES.map((wd, i) => (
                    <div key={wd} className={`text-[11px] font-semibold uppercase ${i >= 5 ? 'text-[#c5a880]' : 'text-gray-400'}`}>
                      {wd}
                    </div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1.5 mb-6">
                  {renderCalendarDays()}
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-white/5 my-4" />

                {/* Step 4: Available Time Slots */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase font-semibold text-gray-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#c5a880]" />
                      Доступное время на {selectedDate}:
                    </span>
                    {slotsLoading && (
                      <span className="text-[11px] text-[#c5a880] animate-pulse">Проверка графика мастера...</span>
                    )}
                  </div>

                  {!isWorkingDay ? (
                    <div className="p-4 rounded-md bg-amber-950/20 border border-amber-600/30 text-amber-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Мастер <b>{selectedBarber?.name}</b> в этот день отдыхает. Пожалуйста, выберите другой день или другого мастера.</span>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-4 text-xs text-gray-400">
                      На выбранный день все свободные окна заняты.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {availableSlots.map(slot => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`py-2 px-1 rounded text-xs font-mono font-medium transition-all ${
                            selectedTime === slot.time
                              ? 'bg-[#c5a880] text-[#0a0a0c] font-bold shadow-[0_0_12px_rgba(197,168,128,0.4)]'
                              : slot.isAvailable
                              ? 'bg-[#181822] text-gray-200 hover:bg-[#222230] hover:text-[#c5a880] border border-white/5'
                              : 'bg-white/[0.02] text-gray-600 border border-transparent cursor-not-allowed line-through'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Step 5: Client Contact Form & Submit */}
              <div className="p-6 rounded-xl bg-[#121217] border border-white/5 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-[#c5a880]/20 text-[#c5a880] flex items-center justify-center text-xs font-bold font-mono">
                    4
                  </div>
                  <h3 className="font-serif font-bold text-white text-base uppercase tracking-wide">
                    Ваши контактные данные
                  </h3>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 rounded bg-red-950/30 border border-red-600/40 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                      Ваше Имя *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Константин"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-[#16161e] border border-white/10 rounded px-9 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                      Номер Телефона *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="+7 999 123-45-67"
                        value={clientPhone}
                        onChange={handlePhoneChange}
                        className="w-full bg-[#16161e] border border-white/10 rounded px-9 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                    Пожелания к стрижке / напитки в баре (опционально)
                  </label>
                  <input
                    type="text"
                    placeholder="Например: низкий фейд, американо без сахара"
                    value={clientNote}
                    onChange={(e) => setClientNote(e.target.value)}
                    className="w-full bg-[#16161e] border border-white/10 rounded px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                {/* Final Booking Summary Strip */}
                <div className="p-4 rounded-lg bg-[#181822] border border-[#c5a880]/30 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <div className="text-xs text-gray-400">Итог бронирования:</div>
                    <div className="text-sm font-serif font-bold text-white">
                      {selectedService ? selectedService.name : 'Услуга не выбрана'}
                    </div>
                    <div className="text-xs text-[#c5a880] mt-0.5">
                      Мастер: {selectedBarber ? selectedBarber.name : '—'} • {selectedDate} в {selectedTime || 'не выбрано'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-400 uppercase">К оплате в клубе:</div>
                    <div className="text-2xl font-serif font-bold text-[#c5a880]">
                      {selectedService ? selectedService.price.toLocaleString('ru-RU') : 0} ₽
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting || !selectedTime || !isWorkingDay}
                  className="w-full py-4 rounded-sm bg-gradient-to-r from-[#b89758] via-[#c5a880] to-[#dfc285] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0a0c] font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_0_25px_rgba(197,168,128,0.4)] flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Оформление записи...' : 'Подтвердить запись онлайн'}</span>
                </button>

                <div className="mt-3 text-center text-[11px] text-gray-500">
                  🔒 Бронирование защищено. Заявка мгновенно дублируется в Telegram-чат администратора.
                </div>

              </div>

            </div>

          </form>
        )}

      </div>
    </section>
  );
}
