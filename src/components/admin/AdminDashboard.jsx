import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Scissors, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowLeft, 
  RefreshCw, 
  DollarSign, 
  TrendingUp, 
  HelpCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Check,
  Bell
} from 'lucide-react';

const WEEKDAYS = [
  { id: '1', label: 'Пн' },
  { id: '2', label: 'Вт' },
  { id: '3', label: 'Ср' },
  { id: '4', label: 'Чт' },
  { id: '5', label: 'Пт' },
  { id: '6', label: 'Сб' },
  { id: '0', label: 'Вс' },
];

export default function AdminDashboard({ onBackToSite }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, bookings, barbers, services, telegram
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState({
    telegramBotToken: '',
    telegramAdminChatId: '',
    salonName: 'Gravity Barber Lounge',
    salonPhone: '+7 (999) 777-33-22',
    salonAddress: 'ул. Большая Бронная, 14, Москва'
  });

  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBarber, setFilterBarber] = useState('all');
  const [copiedId, setCopiedId] = useState(false);

  // Modal states
  const [isAddBarberOpen, setIsAddBarberOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState(null);
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);

  // Telegram test status
  const [testStatus, setTestStatus] = useState({ state: 'idle', message: '' });

  // Load all initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes, barbersRes, servicesRes, settingsRes] = await Promise.all([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/bookings').then(r => r.json()),
        fetch('/api/barbers').then(r => r.json()),
        fetch('/api/services').then(r => r.json()),
        fetch('/api/settings').then(r => r.json())
      ]);

      setStats(statsRes);
      setBookings(bookingsRes);
      setBarbers(barbersRes);
      setServices(servicesRes);
      setSettings(settingsRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update booking status
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
        loadData();
      }
    } catch (err) {
      alert('Ошибка обновления статуса: ' + err.message);
    }
  };

  // Delete booking
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Удалить эту запись?')) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
      if (res.ok) {
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        loadData();
      }
    } catch (err) {
      alert('Ошибка удаления: ' + err.message);
    }
  };

  // Send manual reminder to client in Telegram
  const handleSendReminder = async (bookingId) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/remind`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Напоминание успешно отправлено клиенту в Telegram!');
      } else {
        alert('Не удалось отправить: ' + (data.error || 'Ошибка'));
      }
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  // Save Telegram Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Настройки успешно сохранены!');
      } else {
        alert('Ошибка сохранения: ' + data.error);
      }
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  // Send Test Telegram Notification
  const handleSendTestNotification = async () => {
    setTestStatus({ state: 'loading', message: 'Отправка тестового сообщения...' });
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: settings.telegramAdminChatId })
      });
      const data = await res.json();
      if (res.ok) {
        setTestStatus({ state: 'success', message: data.message });
      } else {
        setTestStatus({ state: 'error', message: data.error || 'Ошибка отправки' });
      }
    } catch (err) {
      setTestStatus({ state: 'error', message: err.message });
    }
  };

  // Save Barber (New or Edited)
  const handleSaveBarber = async (barberData) => {
    try {
      const isEdit = Boolean(barberData.id);
      const url = isEdit ? `/api/barbers/${barberData.id}` : '/api/barbers';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(barberData)
      });

      if (res.ok) {
        setIsAddBarberOpen(false);
        setEditingBarber(null);
        loadData();
      }
    } catch (err) {
      alert('Ошибка при сохранении барбера: ' + err.message);
    }
  };

  // Delete Barber
  const handleDeleteBarber = async (barberId) => {
    if (!window.confirm('Вы действительно хотите удалить этого мастера?')) return;
    try {
      const res = await fetch(`/api/barbers/${barberId}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;
    if (filterBarber !== 'all' && b.barberId !== filterBarber) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#09090c] text-gray-200">
      
      {/* Admin Top Navigation */}
      <header className="bg-[#101015] border-b border-white/10 px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToSite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#181822] hover:bg-[#222230] text-gray-300 hover:text-white text-xs border border-white/5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>На сайт</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#c5a880]/20 border border-[#c5a880] flex items-center justify-center text-[#c5a880]">
                <Scissors className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-sm sm:text-base text-white uppercase tracking-wider">
                  GRAVITY BARBER • ПАНЕЛЬ УПРАВЛЕНИЯ
                </h1>
                <p className="text-[10px] text-[#c5a880] font-mono">
                  Автоматизация записей, контроль нагрузки и Telegram
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2 rounded bg-[#181822] hover:bg-[#222230] text-gray-300 hover:text-[#c5a880] transition-colors"
              title="Обновить данные"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-[#14141c] border border-emerald-500/30 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Система онлайн</span>
            </div>
          </div>

        </div>

        {/* Tab Navigation Strip */}
        <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#c5a880] text-[#0a0a0c] font-bold shadow'
                : 'bg-[#15151e] text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Обзор и Нагрузка</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'bg-[#c5a880] text-[#0a0a0c] font-bold shadow'
                : 'bg-[#15151e] text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Записи ({bookings.length})</span>
            {stats?.pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-bold">
                {stats.pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('barbers')}
            className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'barbers'
                ? 'bg-[#c5a880] text-[#0a0a0c] font-bold shadow'
                : 'bg-[#15151e] text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Барберы и График ({barbers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'services'
                ? 'bg-[#c5a880] text-[#0a0a0c] font-bold shadow'
                : 'bg-[#15151e] text-gray-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Услуги и Прайс ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'telegram'
                ? 'bg-[#2AABEE] text-white font-bold shadow'
                : 'bg-[#15151e] text-gray-400 hover:text-white border border-[#2AABEE]/20'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-[#2AABEE]" />
            <span>Telegram & ID чата</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        
        {/* ================= TAB 1: OVERVIEW & WORKLOAD ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-[#121217] border border-white/5 shadow-lg">
                <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                  <span className="uppercase tracking-wider">Записей на сегодня</span>
                  <Calendar className="w-4 h-4 text-[#c5a880]" />
                </div>
                <div className="text-3xl font-serif font-bold text-white">
                  {stats?.todayBookingsCount || 0}
                </div>
                <div className="text-[11px] text-[#c5a880] mt-1 font-mono">
                  Дата: {stats?.todayDate}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#121217] border border-white/5 shadow-lg">
                <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                  <span className="uppercase tracking-wider">Выручка сегодня</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-serif font-bold text-emerald-400">
                  {(stats?.todayRevenue || 0).toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  По подтвержденным визитам
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#121217] border border-white/5 shadow-lg">
                <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                  <span className="uppercase tracking-wider">Требуют подтверждения</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-serif font-bold text-amber-400">
                  {stats?.pendingCount || 0}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  Новые заявки с сайта и бота
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#121217] border border-white/5 shadow-lg">
                <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                  <span className="uppercase tracking-wider">Мастеров в штате</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-serif font-bold text-white">
                  {barbers.length}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  Активных рабочих мест
                </div>
              </div>
            </div>

            {/* KEY FEATURE: Barbers Workload Monitor */}
            <div className="p-6 rounded-xl bg-[#121217] border border-white/5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
                <div>
                  <h2 className="font-serif font-bold text-lg text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#c5a880]" />
                    Мониторинг текущей нагрузки барберов
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Отслеживайте процент занятости смены каждого мастера и распределяйте входящие заявки
                  </p>
                </div>
                <button
                  onClick={() => setIsAddBarberOpen(true)}
                  className="px-4 py-2 rounded-sm bg-[#c5a880] hover:bg-[#dfc285] text-[#0a0a0c] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить барбера</span>
                </button>
              </div>

              {/* Workload Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(stats?.barbersWorkload || []).map((bw) => {
                  const percent = bw.workloadPercentage || 0;
                  const isHigh = percent >= 80;
                  const isMedium = percent >= 40 && percent < 80;

                  return (
                    <div
                      key={bw.barberId}
                      className="p-5 rounded-lg bg-[#171720] border border-white/5 hover:border-[#c5a880]/30 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <img
                          src={bw.photo}
                          alt={bw.barberName}
                          className="w-14 h-14 rounded-full object-cover border-2 border-[#c5a880]/40 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif font-bold text-sm text-white truncate uppercase">
                              {bw.barberName}
                            </h3>
                            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                              isHigh 
                                ? 'bg-red-950/70 text-red-300 border border-red-500/30' 
                                : isMedium 
                                ? 'bg-amber-950/70 text-amber-300 border border-amber-500/30' 
                                : 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {percent}% Занято
                            </span>
                          </div>
                          <div className="text-xs text-[#c5a880]">{bw.barberTitle}</div>
                          <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                            <span>Занято окон: <b className="text-white">{bw.bookedSlots}</b> из {bw.totalSlots}</span>
                            <span>Осталось мест: <b className="text-emerald-400">{Math.max(0, bw.totalSlots - bw.bookedSlots)}</b></span>
                          </div>
                        </div>
                      </div>

                      {/* Workload Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-[#20202c] overflow-hidden mb-4">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            isHigh 
                              ? 'bg-gradient-to-r from-amber-500 to-red-500' 
                              : isMedium 
                              ? 'bg-gradient-to-r from-[#c5a880] to-amber-500' 
                              : 'bg-gradient-to-r from-emerald-500 to-[#c5a880]'
                          }`}
                          style={{ width: `${Math.max(5, percent)}%` }}
                        />
                      </div>

                      {/* Scheduled clients today */}
                      <div className="pt-3 border-t border-white/5">
                        <div className="text-[11px] uppercase font-semibold text-gray-400 mb-2">
                          Ближайшие клиенты мастера на сегодня:
                        </div>
                        {bw.bookings && bw.bookings.length > 0 ? (
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {bw.bookings.map(b => (
                              <div key={b.id} className="p-2 rounded bg-[#1c1c28] flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[#c5a880] font-bold">{b.time}</span>
                                  <span className="text-white font-medium">{b.clientName}</span>
                                </div>
                                <span className="text-gray-400 text-[11px]">{b.servicePrice} ₽</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 italic py-1">
                            На сегодня записей нет, мастер полностью свободен.
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        )}

        {/* ================= TAB 2: BOOKINGS LIST ================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Filter toolbar */}
            <div className="p-4 rounded-xl bg-[#121217] border border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-gray-400 uppercase font-semibold">Статус:</span>
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded text-xs uppercase font-medium transition-colors ${
                      filterStatus === st
                        ? 'bg-[#c5a880] text-[#0a0a0c] font-bold'
                        : 'bg-[#1a1a24] text-gray-300 hover:bg-[#252535]'
                    }`}
                  >
                    {st === 'all' ? 'Все' : st === 'pending' ? 'Ожидают' : st === 'confirmed' ? 'Подтверждены' : st === 'completed' ? 'Завершены' : 'Отменены'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={filterBarber}
                  onChange={(e) => setFilterBarber(e.target.value)}
                  className="bg-[#181824] border border-white/10 rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none"
                >
                  <option value="all">Все мастера</option>
                  {barbers.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>

                <button
                  onClick={() => setIsAddBookingOpen(true)}
                  className="px-3.5 py-1.5 rounded bg-[#c5a880] text-[#0a0a0c] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#dfc285]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Новая запись</span>
                </button>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="rounded-xl bg-[#121217] border border-white/5 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181822] text-gray-400 uppercase tracking-wider border-b border-white/5 text-[11px]">
                    <tr>
                      <th className="p-4">Код / Источник</th>
                      <th className="p-4">Клиент</th>
                      <th className="p-4">Услуга</th>
                      <th className="p-4">Мастер</th>
                      <th className="p-4">Дата & Время</th>
                      <th className="p-4">Статус</th>
                      <th className="p-4 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-gray-500">
                          Записей с выбранными фильтрами не найдено
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map(b => (
                        <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="font-mono font-bold text-[#c5a880]">{b.id}</div>
                            <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-gray-400">
                              {b.source === 'telegram' ? '📱 Telegram' : '💻 Сайт'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-white">{b.clientName}</div>
                            <a href={`tel:${b.clientPhone}`} className="text-gray-400 hover:text-[#c5a880] font-mono text-[11px]">
                              {b.clientPhone}
                            </a>
                            {b.clientNote && (
                              <div className="text-[10px] text-gray-500 italic mt-0.5">
                                "{b.clientNote}"
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-gray-200">{b.serviceName}</div>
                            <div className="text-xs font-serif font-bold text-[#c5a880] mt-0.5">
                              {b.servicePrice} ₽
                            </div>
                          </td>
                          <td className="p-4 text-gray-300 font-medium">
                            {b.barberName}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-white">{b.date}</div>
                            <div className="text-xs font-mono text-[#c5a880]">{b.time}</div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                : b.status === 'pending'
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                                : b.status === 'completed'
                                ? 'bg-purple-950 text-purple-300 border border-purple-500/30'
                                : 'bg-zinc-800 text-gray-400 border border-white/10'
                            }`}>
                              {b.status === 'confirmed' ? 'Подтверждена' : b.status === 'pending' ? 'Ожидает' : b.status === 'completed' ? 'Завершена' : 'Отменена'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {b.status === 'pending' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                                  className="p-1.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/30"
                                  title="Подтвердить"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              {b.status === 'confirmed' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                                  className="p-1.5 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-500/30"
                                  title="Завершить визит"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {b.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                                  className="p-1.5 rounded bg-amber-950 hover:bg-amber-900 text-amber-400 border border-amber-500/30"
                                  title="Отменить запись"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleSendReminder(b.id)}
                                className="p-1.5 rounded bg-sky-950 hover:bg-sky-900 text-sky-400 border border-sky-500/30"
                                title="Отправить напоминание клиенту в Telegram"
                              >
                                <Bell className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBooking(b.id)}
                                className="p-1.5 rounded bg-red-950 hover:bg-red-900 text-red-400 border border-red-500/30"
                                title="Удалить"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 3: BARBERS & SCHEDULE MANAGEMENT ================= */}
        {activeTab === 'barbers' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="font-serif font-bold text-xl text-white uppercase">
                  Управление персоналом и графиком
                </h2>
                <p className="text-xs text-gray-400">
                  Добавляйте новых барберов, назначайте рабочие дни недели и часы смены
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingBarber(null);
                  setIsAddBarberOpen(true);
                }}
                className="px-4 py-2 rounded-sm bg-[#c5a880] hover:bg-[#dfc285] text-[#0a0a0c] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить барбера</span>
              </button>
            </div>

            {/* Barbers list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {barbers.map(barber => (
                <div
                  key={barber.id}
                  className="p-6 rounded-xl bg-[#121217] border border-white/5 hover:border-[#c5a880]/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={barber.photo}
                        alt={barber.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#c5a880] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-serif font-bold text-base text-white uppercase truncate">
                            {barber.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingBarber(barber);
                                setIsAddBarberOpen(true);
                              }}
                              className="p-1 rounded text-gray-400 hover:text-white"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBarber(barber.id)}
                              className="p-1 rounded text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-[#c5a880] uppercase tracking-wide">{barber.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">Опыт: {barber.experience} • Рейтинг: ★ {barber.rating}</div>
                      </div>
                    </div>

                    <p className="text-gray-400 text-xs mb-4">
                      {barber.bio}
                    </p>

                    {/* Working Schedule details */}
                    <div className="p-4 rounded-lg bg-[#181822] border border-white/5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Часы смены:</span>
                        <span className="font-mono text-white font-bold">{barber.startTime} — {barber.endTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Длительность стрижки:</span>
                        <span className="text-gray-200">{barber.slotDuration || 50} минут</span>
                      </div>
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-gray-400 text-[11px] block mb-1">Рабочие дни недели:</span>
                        <div className="flex gap-1.5">
                          {WEEKDAYS.map(wd => {
                            const isWorking = barber.workingDays.includes(wd.id);
                            return (
                              <span
                                key={wd.id}
                                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                                  isWorking
                                    ? 'bg-[#c5a880] text-[#0a0a0c]'
                                    : 'bg-white/5 text-gray-600'
                                }`}
                              >
                                {wd.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= TAB 4: SERVICES MANAGEMENT ================= */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="font-serif font-bold text-xl text-white uppercase">
                  Каталог услуг и цен
                </h2>
                <p className="text-xs text-gray-400">
                  Редактируйте прайс-лист, длительность процедур и категории
                </p>
              </div>

              <button
                onClick={() => setIsAddServiceOpen(true)}
                className="px-4 py-2 rounded-sm bg-[#c5a880] hover:bg-[#dfc285] text-[#0a0a0c] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить услугу</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(srv => (
                <div
                  key={srv.id}
                  className="p-5 rounded-xl bg-[#121217] border border-white/5 hover:border-[#c5a880]/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-serif font-bold text-sm text-white uppercase">
                        {srv.name}
                      </h3>
                      <span className="text-base font-serif font-bold text-[#c5a880] whitespace-nowrap">
                        {srv.price} ₽
                      </span>
                    </div>

                    <p className="text-gray-400 text-xs mb-4 line-clamp-2">
                      {srv.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                    <span>{srv.duration} мин</span>
                    <button
                      onClick={async () => {
                        if (!confirm('Удалить эту услугу?')) return;
                        await fetch(`/api/services/${srv.id}`, { method: 'DELETE' });
                        loadData();
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: TELEGRAM & HOW TO GET CHAT ID ================= */}
        {activeTab === 'telegram' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Settings Card */}
            <div className="p-6 sm:p-8 rounded-xl bg-[#121218] border border-[#2AABEE]/30 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#2AABEE]/20 border border-[#2AABEE]/50 flex items-center justify-center text-[#2AABEE]">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl text-white uppercase">
                    Интеграция с Telegram
                  </h2>
                  <p className="text-xs text-gray-400">
                    Моментальное дублирование всех заявок с интерактивного календаря и бота в рабочий чат администратора
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5">
                    Telegram Bot Token (от @BotFather)
                  </label>
                  <input
                    type="text"
                    placeholder="Пример: 1234567890:ABCdefGhIJKlmNoPQRstuVWXyz"
                    value={settings.telegramBotToken || ''}
                    onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                    className="w-full bg-[#181824] border border-white/10 rounded px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#2AABEE]"
                  />
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    Токен вашего бота, созданного через официального бота @BotFather
                  </span>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-300 mb-1.5">
                    Telegram Admin Chat ID (куда отправлять заявки)
                  </label>
                  <input
                    type="text"
                    placeholder="Пример: 123456789 (ваш личный) или -1001234567890 (группа)"
                    value={settings.telegramAdminChatId || ''}
                    onChange={(e) => setSettings({ ...settings, telegramAdminChatId: e.target.value })}
                    className="w-full bg-[#181824] border border-white/10 rounded px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#2AABEE]"
                  />
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    ID вашего личного аккаунта или ID общей рабочей группы/канала барберов
                  </span>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded bg-[#c5a880] hover:bg-[#dfc285] text-[#0a0a0c] text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Сохранить настройки
                  </button>

                  <button
                    type="button"
                    onClick={handleSendTestNotification}
                    className="px-6 py-2.5 rounded bg-[#1f2c3d] hover:bg-[#27384e] text-[#2AABEE] border border-[#2AABEE]/40 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Проверить связь (Тест)</span>
                  </button>
                </div>

                {/* Test status banner */}
                {testStatus.state !== 'idle' && (
                  <div className={`mt-4 p-4 rounded text-xs flex items-center gap-2.5 ${
                    testStatus.state === 'success'
                      ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                      : testStatus.state === 'error'
                      ? 'bg-red-950/60 border border-red-500/40 text-red-200'
                      : 'bg-[#181824] text-gray-300'
                  }`}>
                    {testStatus.state === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : testStatus.state === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    ) : (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#2AABEE] shrink-0" />
                    )}
                    <span>{testStatus.message}</span>
                  </div>
                )}
              </form>
            </div>

            {/* DETAILED USER GUIDE: HOW TO GET TELEGRAM CHAT ID */}
            <div className="p-6 sm:p-8 rounded-xl bg-[#121217] border border-white/5 shadow-xl space-y-6">
              <div className="flex items-center gap-2 text-[#c5a880]">
                <HelpCircle className="w-6 h-6" />
                <h3 className="font-serif font-bold text-lg text-white uppercase">
                  КАК ПОЛУЧИТЬ ID ЧАТА В TELEGRAM (ПОШАГОВАЯ ИНСТРУКЦИЯ)
                </h3>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Вы можете настроить получение уведомлений либо в свой личный диалог с ботом, либо в общую группу администраторов и мастеров барбершопа. Выберите нужный вариант ниже:
              </p>

              {/* Steps comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Method 1: Personal Chat ID */}
                <div className="p-5 rounded-lg bg-[#181822] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="font-serif font-bold text-sm text-white uppercase">
                      Вариант 1: Ваш личный Chat ID
                    </span>
                    <span className="text-[10px] text-emerald-400 uppercase font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      Самый быстрый (1 мин)
                    </span>
                  </div>

                  <ol className="space-y-2.5 text-xs text-gray-300 list-decimal list-inside leading-relaxed">
                    <li>
                      Откройте бота <b className="text-[#2AABEE]">@userinfobot</b> или <b className="text-[#2AABEE]">@getmyid_bot</b> в Telegram.
                    </li>
                    <li>
                      Нажмите кнопку <b className="text-white">Start</b> (или отправьте любое сообщение).
                    </li>
                    <li>
                      Бот моментально ответит сообщением с вашим уникальным цифровым идентификатором, например: <code className="bg-black/60 px-2 py-0.5 rounded text-[#c5a880] font-mono">123456789</code>.
                    </li>
                    <li>
                      Скопируйте это число и вставьте в поле <b>Telegram Admin Chat ID</b> выше!
                    </li>
                  </ol>

                  <div className="p-3 rounded bg-black/40 border border-white/5 text-[11px] text-gray-400">
                    💡 <i>Также можно запустить вашего собственного бота командой <b className="text-white">/id</b>, и он сам напишет ваш Chat ID!</i>
                  </div>
                </div>

                {/* Method 2: Group / Channel Chat ID */}
                <div className="p-5 rounded-lg bg-[#181822] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="font-serif font-bold text-sm text-white uppercase">
                      Вариант 2: ID группы мастеров
                    </span>
                    <span className="text-[10px] text-[#2AABEE] uppercase font-mono bg-[#2AABEE]/20 px-2 py-0.5 rounded border border-[#2AABEE]/30">
                      Для команды барберов
                    </span>
                  </div>

                  <ol className="space-y-2.5 text-xs text-gray-300 list-decimal list-inside leading-relaxed">
                    <li>
                      Создайте в Telegram группу (например: <i>«Gravity Барбершоп — Заявки»</i>).
                    </li>
                    <li>
                      Добавьте созданного бота в эту группу как <b>Администратора</b> (с правом отправки сообщений).
                    </li>
                    <li>
                      Добавьте в группу вспомогательного бота <b className="text-[#2AABEE]">@RawDataBot</b> (он пришлет JSON с данными чата) или перешлите любое сообщение из группы боту <b className="text-[#2AABEE]">@getmyid_bot</b>.
                    </li>
                    <li>
                      Найдите строчку <b>chat id</b> — для групп она всегда начинается со знака минус (обычно <code className="bg-black/60 px-2 py-0.5 rounded text-[#c5a880] font-mono">-100XXXXXXXXXX</code>).
                    </li>
                    <li>
                      Вставьте полученный отрицательный ID (вместе с минусом!) в поле настроек выше.
                    </li>
                  </ol>

                  <div className="p-3 rounded bg-black/40 border border-white/5 text-[11px] text-gray-400">
                    ⚡ <i>Каждый барбер в группе сразу увидит заявку с деталями и кнопками [Подтвердить] / [Отклонить]!</i>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* ================= MODAL: ADD / EDIT BARBER ================= */}
      {isAddBarberOpen && (
        <BarberModal
          barber={editingBarber}
          onClose={() => {
            setIsAddBarberOpen(false);
            setEditingBarber(null);
          }}
          onSave={handleSaveBarber}
        />
      )}

      {/* ================= MODAL: MANUAL BOOKING ================= */}
      {isAddBookingOpen && (
        <ManualBookingModal
          services={services}
          barbers={barbers}
          onClose={() => setIsAddBookingOpen(false)}
          onSuccess={() => {
            setIsAddBookingOpen(false);
            loadData();
          }}
        />
      )}

      {/* ================= MODAL: ADD SERVICE ================= */}
      {isAddServiceOpen && (
        <ServiceModal
          onClose={() => setIsAddServiceOpen(false)}
          onSuccess={() => {
            setIsAddServiceOpen(false);
            loadData();
          }}
        />
      )}

    </div>
  );
}

// Subcomponent: Add/Edit Barber Modal
function BarberModal({ barber, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: barber?.id || undefined,
    name: barber?.name || '',
    title: barber?.title || 'Барбер-стилист',
    experience: barber?.experience || '4 года в профессии',
    photo: barber?.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    bio: barber?.bio || 'Мастер идеальных переходов и оформления бороды.',
    startTime: barber?.startTime || '10:00',
    endTime: barber?.endTime || '21:00',
    slotDuration: barber?.slotDuration || 50,
    workingDays: barber?.workingDays || ['1', '2', '3', '4', '5'],
  });

  const toggleDay = (dayId) => {
    setFormData(prev => {
      const exists = prev.workingDays.includes(dayId);
      const updated = exists 
        ? prev.workingDays.filter(d => d !== dayId)
        : [...prev.workingDays, dayId];
      return { ...prev, workingDays: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Введите имя мастера');
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121218] border border-[#c5a880]/30 rounded-xl max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <h3 className="font-serif font-bold text-lg text-white uppercase mb-4">
          {barber ? 'Редактировать мастера' : 'Добавить нового барбера'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Имя и прозвище мастера *</label>
            <input
              type="text"
              required
              placeholder="Тимур «Sharp» Алиев"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#181822] border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Должность / Ранг</label>
              <input
                type="text"
                placeholder="Топ-барбер"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#181822] border border-white/10 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Опыт работы</label>
              <input
                type="text"
                placeholder="6 лет опыта"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full bg-[#181822] border border-white/10 rounded px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Ссылка на фото (URL)</label>
            <input
              type="url"
              value={formData.photo}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              className="w-full bg-[#181822] border border-white/10 rounded px-3 py-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">О мастере (био)</label>
            <textarea
              rows="2"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-[#181822] border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>

          {/* Working Schedule config */}
          <div className="p-4 rounded bg-[#181822] border border-white/5 space-y-3">
            <span className="font-semibold text-white block uppercase tracking-wide">
              Настройка графика смены
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-400 mb-1">Начало смены</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full bg-[#101016] border border-white/10 rounded px-2 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Конец смены</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full bg-[#101016] border border-white/10 rounded px-2 py-1.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Слот (мин)</label>
                <select
                  value={formData.slotDuration}
                  onChange={(e) => setFormData({ ...formData, slotDuration: Number(e.target.value) })}
                  className="w-full bg-[#101016] border border-white/10 rounded px-2 py-1.5 text-white"
                >
                  <option value={30}>30 мин</option>
                  <option value={45}>45 мин</option>
                  <option value={50}>50 мин</option>
                  <option value={60}>60 мин</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5">Рабочие дни недели:</label>
              <div className="flex gap-2">
                {WEEKDAYS.map(wd => {
                  const isChecked = formData.workingDays.includes(wd.id);
                  return (
                    <button
                      type="button"
                      key={wd.id}
                      onClick={() => toggleDay(wd.id)}
                      className={`flex-1 py-1.5 rounded text-xs font-bold uppercase transition-colors ${
                        isChecked
                          ? 'bg-[#c5a880] text-[#0a0a0c]'
                          : 'bg-white/5 text-gray-500 hover:text-white'
                      }`}
                    >
                      {wd.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-white/5 text-gray-300 hover:text-white"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-[#c5a880] text-[#0a0a0c] font-bold uppercase"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Subcomponent: Manual Booking Modal
function ManualBookingModal({ services, barbers, onClose, onSuccess }) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+7 ');
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [barberId, setBarberId] = useState(barbers[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('12:00');
  const [clientNote, setClientNote] = useState('Запись по телефону');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientPhone,
          serviceId,
          barberId,
          date,
          time,
          clientNote,
          source: 'admin'
        })
      });
      if (res.ok) {
        onSuccess();
      } else {
        const d = await res.json();
        alert(d.error || 'Ошибка');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121218] border border-[#c5a880]/30 rounded-xl max-w-lg w-full p-6 relative">
        <h3 className="font-serif font-bold text-lg text-white uppercase mb-4">
          Ручная запись клиента администратором
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Имя клиента *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                className="w-full bg-[#181822] border border-white/10 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Телефон *</label>
              <input
                type="tel"
                required
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                className="w-full bg-[#181822] border border-white/10 rounded px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Услуга</label>
              <select
                value={serviceId}
                onChange={e => setServiceId(e.target.value)}
                className="w-full bg-[#181822] border border-white/10 rounded px-3 py-2 text-white"
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.price} ₽)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Мастер</label>
              <select
                value={barberId}
                onChange={e => setBarberId(e.target.value)}
                className="w-full bg-[#181822] border border-white/10 rounded px-3 py-2 text-white"
              >
                {barbers.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Дата</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-[#181822] border border-white/10 rounded px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Время</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-[#181822] border border-white/10 rounded px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Комментарий</label>
            <input
              type="text"
              value={clientNote}
              onChange={e => setClientNote(e.target.value)}
              className="w-full bg-[#181822] border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-white/5 text-gray-300"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-[#c5a880] text-[#0a0a0c] font-bold uppercase"
            >
              Создать запись
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Subcomponent: Add Service Modal
function ServiceModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(2000);
  const [duration, setDuration] = useState(50);
  const [category, setCategory] = useState('haircuts');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price: Number(price),
          duration: Number(duration),
          category,
          description
        })
      });
      if (res.ok) {
        onSuccess();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121218] border border-[#c5a880]/30 rounded-xl max-w-lg w-full p-6 relative">
        <h3 className="font-serif font-bold text-lg text-white uppercase mb-4">
          Добавить новую услугу в прайс
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Название услуги *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#181822] border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-400 mb-1">Категория</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#181822] border border-white/10 rounded px-3 py-2 text-white"
              >
                <option value="haircuts">Стрижки</option>
                <option value="beard">Борода</option>
                <option value="combos">Комплекс</option>
                <option value="spa">SPA</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Цена (₽)</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full bg-[#181822] border border-white/10 rounded px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Длительность (мин)</label>
              <input
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full bg-[#181822] border border-white/10 rounded px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Описание услуги</label>
            <textarea
              rows="2"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#181822] border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-white/5 text-gray-300"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-[#c5a880] text-[#0a0a0c] font-bold uppercase"
            >
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
