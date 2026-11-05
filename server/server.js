import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { readDb, writeDb } from './db.js';
import { initTelegramBot, sendBookingNotification, sendTestNotification, sendManualBookingReminder } from './bot.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Telegram Bot on startup if credentials exist in DB or .env
const initialDb = readDb();
const token = process.env.TELEGRAM_BOT_TOKEN || initialDb.settings.telegramBotToken;
const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || initialDb.settings.telegramAdminChatId;

if (token) {
  initialDb.settings.telegramBotToken = token;
}
if (adminChatId) {
  initialDb.settings.telegramAdminChatId = adminChatId;
}
writeDb(initialDb);

if (token) {
  initTelegramBot(token, adminChatId);
}

// ================= API ROUTES =================

// Settings
app.get('/api/settings', (req, res) => {
  const db = readDb();
  res.json(db.settings);
});

app.post('/api/settings', (req, res) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);

  // Re-initialize bot if token or admin chat ID was updated
  if (req.body.telegramBotToken !== undefined) {
    initTelegramBot(db.settings.telegramBotToken, db.settings.telegramAdminChatId);
  }

  res.json({ success: true, settings: db.settings });
});

// Test Telegram Notification
app.post('/api/telegram/test', async (req, res) => {
  try {
    const db = readDb();
    const chatId = req.body.chatId || db.settings.telegramAdminChatId;

    if (!chatId) {
      return res.status(400).json({ error: 'Chat ID не указан. Заполните поле Chat ID в настройках.' });
    }

    await sendTestNotification(chatId);
    res.json({ success: true, message: 'Тестовое уведомление успешно отправлено в ваш Telegram чат!' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Ошибка отправки тестового сообщения' });
  }
});

// Services
app.get('/api/services', (req, res) => {
  const db = readDb();
  res.json(db.services);
});

app.post('/api/services', (req, res) => {
  const db = readDb();
  const newService = {
    id: `srv-${Date.now()}`,
    ...req.body
  };
  db.services.push(newService);
  writeDb(db);
  res.status(201).json(newService);
});

app.put('/api/services/:id', (req, res) => {
  const db = readDb();
  const idx = db.services.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Услуга не найдена' });

  db.services[idx] = { ...db.services[idx], ...req.body };
  writeDb(db);
  res.json(db.services[idx]);
});

app.delete('/api/services/:id', (req, res) => {
  const db = readDb();
  db.services = db.services.filter(s => s.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Barbers
app.get('/api/barbers', (req, res) => {
  const db = readDb();
  res.json(db.barbers);
});

app.post('/api/barbers', (req, res) => {
  const db = readDb();
  const newBarber = {
    id: `barber-${Date.now()}`,
    rating: 5.0,
    reviewsCount: 0,
    isActive: true,
    slotDuration: 50,
    startTime: "10:00",
    endTime: "21:00",
    workingDays: ["1", "2", "3", "4", "5"],
    ...req.body
  };
  db.barbers.push(newBarber);
  writeDb(db);
  res.status(201).json(newBarber);
});

app.put('/api/barbers/:id', (req, res) => {
  const db = readDb();
  const idx = db.barbers.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Барбер не найден' });

  db.barbers[idx] = { ...db.barbers[idx], ...req.body };
  writeDb(db);
  res.json(db.barbers[idx]);
});

app.delete('/api/barbers/:id', (req, res) => {
  const db = readDb();
  db.barbers = db.barbers.filter(b => b.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Availability generator
app.get('/api/availability', (req, res) => {
  const { barberId, date } = req.query;
  if (!barberId || !date) {
    return res.status(400).json({ error: 'barberId and date are required' });
  }

  const db = readDb();
  const barber = db.barbers.find(b => b.id === barberId);
  if (!barber) {
    return res.status(404).json({ error: 'Барбер не найден' });
  }

  // Check if barber works on this day of week
  const targetDate = new Date(date);
  const dayOfWeek = targetDate.getDay().toString(); // 0 is Sunday, 1 is Monday...

  const isWorkingDay = barber.workingDays.includes(dayOfWeek);
  if (!isWorkingDay) {
    return res.json({
      isWorkingDay: false,
      message: 'Мастер в этот день отдыхает',
      slots: []
    });
  }

  // Generate slots from startTime to endTime
  const [startH] = barber.startTime.split(':').map(Number);
  const [endH] = barber.endTime.split(':').map(Number);
  const slotStep = barber.slotDuration || 50;

  const baseSlots = [];
  let currentMinutes = startH * 60;
  const endMinutes = endH * 60;

  while (currentMinutes + slotStep <= endMinutes) {
    const h = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
    const m = (currentMinutes % 60).toString().padStart(2, '0');
    baseSlots.push(`${h}:${m}`);
    currentMinutes += slotStep;
  }

  // Filter out already booked slots
  const bookedSlots = db.bookings
    .filter(b => b.barberId === barberId && b.date === date && b.status !== 'cancelled')
    .map(b => b.time);

  const availableSlots = baseSlots.map(time => ({
    time,
    isAvailable: !bookedSlots.includes(time)
  }));

  res.json({
    isWorkingDay: true,
    slots: availableSlots
  });
});

// Bookings
app.get('/api/bookings', (req, res) => {
  const db = readDb();
  let bookings = [...db.bookings];

  if (req.query.date) {
    bookings = bookings.filter(b => b.date === req.query.date);
  }
  if (req.query.barberId) {
    bookings = bookings.filter(b => b.barberId === req.query.barberId);
  }
  if (req.query.status) {
    bookings = bookings.filter(b => b.status === req.query.status);
  }

  res.json(bookings);
});

app.post('/api/bookings', async (req, res) => {
  const { clientName, clientPhone, clientNote, serviceId, barberId, date, time } = req.body;

  if (!clientName || !clientPhone || !serviceId || !barberId || !date || !time) {
    return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
  }

  const db = readDb();
  const service = db.services.find(s => s.id === serviceId);
  const barber = db.barbers.find(b => b.id === barberId);

  // Check conflict
  const conflict = db.bookings.find(b => 
    b.barberId === barberId && 
    b.date === date && 
    b.time === time && 
    b.status !== 'cancelled'
  );

  if (conflict) {
    return res.status(409).json({ error: 'Это время уже занято другим клиентом. Пожалуйста, выберите другое свободное время.' });
  }

  const bookingId = `GRV-${Math.floor(1000 + Math.random() * 9000)}`;
  const newBooking = {
    id: bookingId,
    clientName,
    clientPhone,
    clientNote: clientNote || '',
    serviceId,
    serviceName: service ? service.name : 'Стрижка',
    servicePrice: service ? service.price : 2000,
    barberId,
    barberName: barber ? barber.name : 'Дежурный мастер',
    date,
    time,
    status: 'pending',
    source: req.body.source || 'website',
    createdAt: new Date().toISOString()
  };

  db.bookings.unshift(newBooking);
  writeDb(db);

  // Send real-time notification to Telegram group/admin chat
  try {
    await sendBookingNotification(newBooking);
  } catch (err) {
    console.error('Failed to dispatch TG notification:', err.message);
  }

  res.status(201).json({
    success: true,
    booking: newBooking,
    message: 'Запись успешно создана и отправлена администратору!'
  });
});

app.patch('/api/bookings/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Неверный статус записи' });
  }

  const db = readDb();
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Запись не найдена' });

  booking.status = status;
  writeDb(db);
  res.json({ success: true, booking });
});

// Manual reminder push to client
app.post('/api/bookings/:id/remind', async (req, res) => {
  try {
    await sendManualBookingReminder(req.params.id);
    res.json({ success: true, message: 'Напоминание успешно отправлено клиенту в Telegram!' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка отправки напоминания' });
  }
});

app.delete('/api/bookings/:id', (req, res) => {
  const db = readDb();
  db.bookings = db.bookings.filter(b => b.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Analytics & Dashboard Stats
app.get('/api/stats', (req, res) => {
  const db = readDb();
  const today = new Date().toISOString().split('T')[0];

  const todayBookings = db.bookings.filter(b => b.date === today && b.status !== 'cancelled');
  const todayRevenue = todayBookings.reduce((sum, b) => sum + (b.servicePrice || 0), 0);
  const pendingCount = db.bookings.filter(b => b.status === 'pending').length;

  // Workload per barber for today
  const barbersWorkload = db.barbers.map(barber => {
    const barberBookings = todayBookings.filter(b => b.barberId === barber.id);
    const [startH] = barber.startTime.split(':').map(Number);
    const [endH] = barber.endTime.split(':').map(Number);
    const totalWorkingHours = Math.max(1, endH - startH);
    const totalSlots = Math.round((totalWorkingHours * 60) / (barber.slotDuration || 50));
    const bookedCount = barberBookings.length;
    const percentage = Math.min(100, Math.round((bookedCount / Math.max(1, totalSlots)) * 100));

    return {
      barberId: barber.id,
      barberName: barber.name,
      barberTitle: barber.title,
      photo: barber.photo,
      bookedSlots: bookedCount,
      totalSlots,
      workloadPercentage: percentage,
      bookings: barberBookings
    };
  });

  res.json({
    todayDate: today,
    todayBookingsCount: todayBookings.length,
    todayRevenue,
    pendingCount,
    totalBarbers: db.barbers.length,
    totalServices: db.services.length,
    barbersWorkload
  });
});

// Reviews
app.get('/api/reviews', (req, res) => {
  const db = readDb();
  res.json(db.reviews);
});

// Serve static frontend build if it exists
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.send(`Backend API running on port ${PORT}. For frontend, run 'npm run dev' or 'npm run build'.`);
    }
  });
});

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`💈 [Gravity Barbershop Server] Running on http://localhost:${PORT}`);
    console.log(`💈 API endpoints available at http://localhost:${PORT}/api/`);
  });
}

export default app;
