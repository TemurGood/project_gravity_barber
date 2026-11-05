import { createRequire } from 'module';
import { readDb, writeDb } from './db.js';

const require = createRequire(import.meta.url);
const TelegramBot = require('node-telegram-bot-api');

let botInstance = null;
let reminderInterval = null;
const userStates = new Map(); // chat_id -> booking step state

export function getBot() {
  return botInstance;
}

export function initTelegramBot(token, adminChatId) {
  if (!token || token.trim() === '') {
    console.log('[Telegram Bot] No token provided. Bot will remain idle until token is configured.');
    if (botInstance) {
      try { botInstance.stopPolling(); } catch (e) {}
      botInstance = null;
    }
    if (reminderInterval) {
      clearInterval(reminderInterval);
      reminderInterval = null;
    }
    return null;
  }

  try {
    if (botInstance) {
      try { botInstance.stopPolling(); } catch (e) {}
    }

    botInstance = new TelegramBot(token.trim(), { polling: true });
    console.log('[Telegram Bot] Successfully started with polling!');

    const webAppUrl = process.env.WEBAPP_URL || 'https://gravity-barber.vercel.app';

    // Set persistent Menu Button for Telegram Mini App
    try {
      botInstance.setChatMenuButton({
        menu_button: {
          type: 'web_app',
          text: '💈 Запись онлайн',
          web_app: { url: webAppUrl }
        }
      }).catch(e => console.log('Notice: Menu button set error (optional):', e.message));
    } catch (e) {}

    // Handle /start
    botInstance.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const firstName = msg.from?.first_name || 'Джентльмен';

      const welcomeText = 
`💈 *Добро пожаловать в GRAVITY BARBERSHOP!* 💈\n\n` +
`Здравствуйте, *${firstName}*!\n` +
`Мы объединили классические традиции барберинга, безупречный стиль и современный премиум-комфорт.\n\n` +
`📍 *Адрес:* ул. Большая Бронная, 14 (м. Пушкинская)\n` +
`⏰ *Время работы:* Ежедневно 10:00 — 22:00\n` +
`🥃 Бесплатный бар, свежесваренный кофе и зона PS5 для каждого гостя.\n\n` +
`_Вы можете записаться через интерактивный Mini App прямо внутри Telegram или пошагово в чате:_`;

      const keyboard = {
        inline_keyboard: [
          [{ text: "🚀 Открыть Mini App (Календарь)", web_app: { url: webAppUrl } }],
          [{ text: "📅 Записаться прямо в чате", callback_data: "start_booking" }],
          [
            { text: "✂️ Услуги и цены", callback_data: "view_services" },
            { text: "💈 Наши барберы", callback_data: "view_barbers" }
          ],
          [
            { text: "📍 Контакты & Локация", callback_data: "view_contacts" },
            { text: "📋 Мои записи", callback_data: "my_bookings" }
          ],
          [{ text: "🆔 Узнать мой Telegram ID", callback_data: "get_my_id" }]
        ]
      };

      botInstance.sendMessage(chatId, welcomeText, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    });

    // Handle /id command
    botInstance.onText(/\/id/, (msg) => {
      const chatId = msg.chat.id;
      const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
      const msgText = isGroup 
        ? `👥 *ID этой группы / чата:* \`${chatId}\`\n\nСкопируйте этот номер и вставьте в поле *Telegram Admin Chat ID* в панели управления барбершопа!`
        : `👤 *Ваш персональный Telegram ID:* \`${chatId}\`\n\nСкопируйте этот номер и вставьте в поле *Telegram Admin Chat ID* в панели управления!`;

      botInstance.sendMessage(chatId, msgText, { parse_mode: 'Markdown' });
    });

    // Handle /book command
    botInstance.onText(/\/book/, (msg) => {
      startBotBooking(msg.chat.id);
    });

    // Handle /app command
    botInstance.onText(/\/app/, (msg) => {
      botInstance.sendMessage(msg.chat.id, "Нажмите кнопку ниже, чтобы открыть интерактивный календарь Mini App:", {
        reply_markup: {
          inline_keyboard: [[{ text: "🚀 Запустить Gravity Mini App", web_app: { url: webAppUrl } }]]
        }
      });
    });

    // Handle callback queries
    botInstance.on('callback_query', async (query) => {
      const chatId = query.message.chat.id;
      const data = query.data;
      const messageId = query.message.message_id;

      try {
        await botInstance.answerCallbackQuery(query.id);

        if (data === "start_booking") {
          startBotBooking(chatId);
        } else if (data === "view_services") {
          showServicesList(chatId);
        } else if (data === "view_barbers") {
          showBarbersList(chatId);
        } else if (data === "view_contacts") {
          showContacts(chatId);
        } else if (data === "my_bookings") {
          showUserBookings(chatId, query.from?.id);
        } else if (data === "get_my_id") {
          botInstance.sendMessage(chatId, `🆔 *Ваш Telegram Chat ID:* \`${chatId}\`\n\nСкопируйте его для настроек уведомлений.`, { parse_mode: 'Markdown' });
        } else if (data.startsWith("sel_srv_")) {
          const serviceId = data.replace("sel_srv_", "");
          handleServiceSelect(chatId, serviceId);
        } else if (data.startsWith("sel_barber_")) {
          const barberId = data.replace("sel_barber_", "");
          handleBarberSelect(chatId, barberId);
        } else if (data.startsWith("sel_date_")) {
          const dateStr = data.replace("sel_date_", "");
          handleDateSelect(chatId, dateStr);
        } else if (data.startsWith("sel_time_")) {
          const timeStr = data.replace("sel_time_", "");
          handleTimeSelect(chatId, timeStr);
        } else if (data.startsWith("admin_confirm_")) {
          const bookingId = data.replace("admin_confirm_", "");
          updateBookingStatus(bookingId, "confirmed", chatId, messageId);
        } else if (data.startsWith("admin_cancel_")) {
          const bookingId = data.replace("admin_cancel_", "");
          updateBookingStatus(bookingId, "cancelled", chatId, messageId);
        }
      } catch (err) {
        console.error('Callback error:', err);
      }
    });

    // Handle user contact or phone message in booking state
    botInstance.on('message', (msg) => {
      if (msg.text && msg.text.startsWith('/')) return;
      const chatId = msg.chat.id;
      const state = userStates.get(chatId);

      if (state && state.step === 'awaiting_phone') {
        const phone = msg.contact ? msg.contact.phone_number : msg.text.trim();
        finishBotBooking(chatId, phone, msg.from?.first_name || 'Гость');
      }
    });

    // Start background automated reminders (every 40 seconds)
    startReminderScheduler();

    return botInstance;
  } catch (error) {
    console.error('[Telegram Bot] Initialization error:', error.message);
    return null;
  }
}

// Background scheduler for automated reminders (60 min & 5 min before appointment)
function startReminderScheduler() {
  if (reminderInterval) clearInterval(reminderInterval);

  reminderInterval = setInterval(() => {
    try {
      if (!botInstance) return;
      const db = readDb();
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentMinutesNow = now.getHours() * 60 + now.getMinutes();

      let dbModified = false;

      db.bookings.forEach(booking => {
        if (booking.status === 'cancelled') return;
        if (booking.date !== todayStr) return;

        // Parse booking time e.g. "14:30"
        const [h, m] = (booking.time || "00:00").split(':').map(Number);
        const bookingMinutes = h * 60 + m;
        const diffMinutes = bookingMinutes - currentMinutesNow;

        const targetChatId = booking.telegramChatId || db.settings.telegramAdminChatId;
        if (!targetChatId) return;

        // 1. Reminder 60 minutes before
        if (diffMinutes <= 60 && diffMinutes > 20 && !booking.reminder60Sent) {
          booking.reminder60Sent = true;
          dbModified = true;

          const msg60 = 
`⏰ *НАПОМИНАНИЕ О ЗАПИСИ (ЧЕРЕЗ 1 ЧАС)* ⏰\n\n` +
`Здравствуйте, *${booking.clientName}*!\n` +
`Напоминаем, что ваш визит в *Gravity Barber Lounge* состоится сегодня в *${booking.time}*.\n\n` +
`✂️ *Услуга:* ${booking.serviceName}\n` +
`🧔 *Мастер:* ${booking.barberName}\n` +
`📍 *Адрес:* ул. Большая Бронная, 14 (м. Пушкинская)\n\n` +
`Свежесваренный авторский кофе и бар уже ждут вас!`;

          botInstance.sendMessage(targetChatId, msg60, { parse_mode: 'Markdown' })
            .catch(e => console.log('Error sending 60m reminder:', e.message));
        }

        // 2. Reminder 5 minutes before
        if (diffMinutes <= 7 && diffMinutes >= 0 && !booking.reminder5Sent) {
          booking.reminder5Sent = true;
          dbModified = true;

          const msg5 = 
`💈 *МАСТЕР ГОТОВ ВАС ВСТРЕТИТЬ ЧЕРЕЗ 5 МИНУТ!* 💈\n\n` +
`*${booking.clientName}*, мастер *${booking.barberName}* уже подготовил кресло и стерильные инструменты к вашему визиту в *${booking.time}*.\n\n` +
`Добро пожаловать в Gravity Barber Lounge!`;

          botInstance.sendMessage(targetChatId, msg5, { parse_mode: 'Markdown' })
            .catch(e => console.log('Error sending 5m reminder:', e.message));
        }
      });

      if (dbModified) {
        writeDb(db);
      }
    } catch (e) {
      console.error('[Reminder Scheduler] error:', e.message);
    }
  }, 40000);
}

// Manual reminder trigger from Admin Dashboard
export async function sendManualBookingReminder(bookingId) {
  if (!botInstance) {
    throw new Error('Telegram бот не инициализирован.');
  }

  const db = readDb();
  const booking = db.bookings.find(b => b.id === bookingId);
  if (!booking) {
    throw new Error('Запись не найдена.');
  }

  const targetChatId = booking.telegramChatId || db.settings.telegramAdminChatId;
  if (!targetChatId) {
    throw new Error('У этой записи не указан Telegram Chat ID и не настроен Admin Chat ID.');
  }

  const text = 
`🔔 *ПЕРСОНАЛЬНОЕ НАПОМИНАНИЕ О ЗАПИСИ* 🔔\n\n` +
`Здравствуйте, *${booking.clientName}*!\n` +
`Администратор *Gravity Barber Lounge* напоминает вам о предстоящем визите:\n\n` +
`🔖 *Бронь:* \`${booking.id}\`\n` +
`📅 *Дата:* ${booking.date} в *${booking.time}*\n` +
`✂️ *Услуга:* ${booking.serviceName}\n` +
`🧔 *Мастер:* ${booking.barberName}\n` +
`📍 *Адрес:* ул. Большая Бронная, 14 (м. Пушкинская)\n\n` +
`Если ваши планы изменились, пожалуйста, сообщите нам по телефону: ${db.settings.salonPhone}`;

  await botInstance.sendMessage(targetChatId, text, { parse_mode: 'Markdown' });
  return true;
}

function startBotBooking(chatId) {
  const db = readDb();
  userStates.set(chatId, { step: 'select_service' });

  const buttons = db.services.slice(0, 6).map(s => ([{
    text: `${s.name} — ${s.price} ₽ (${s.duration} мин)`,
    callback_data: `sel_srv_${s.id}`
  }]));

  botInstance.sendMessage(chatId, "💈 *Шаг 1 из 4:* Выберите услугу:", {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: buttons }
  });
}

function handleServiceSelect(chatId, serviceId) {
  const db = readDb();
  const service = db.services.find(s => s.id === serviceId);
  if (!service) return;

  const state = userStates.get(chatId) || {};
  state.step = 'select_barber';
  state.serviceId = service.id;
  state.serviceName = service.name;
  state.servicePrice = service.price;
  userStates.set(chatId, state);

  const buttons = db.barbers.map(b => ([{
    text: `🧔 ${b.name} (${b.title})`,
    callback_data: `sel_barber_${b.id}`
  }]));

  buttons.push([{ text: "⚡ Любой свободный мастер", callback_data: "sel_barber_any" }]);

  botInstance.sendMessage(chatId, `Вы выбрали: *${service.name}*\n\n✂️ *Шаг 2 из 4:* Выберите мастера:`, {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: buttons }
  });
}

function handleBarberSelect(chatId, barberId) {
  const db = readDb();
  const state = userStates.get(chatId);
  if (!state) return;

  if (barberId === "any") {
    state.barberId = "barber-1";
    state.barberName = "Александр «Blade» Громов (Дежурный мастер)";
  } else {
    const barber = db.barbers.find(b => b.id === barberId);
    if (!barber) return;
    state.barberId = barber.id;
    state.barberName = barber.name;
  }

  state.step = 'select_date';
  userStates.set(chatId, state);

  // Today, tomorrow, day after
  const today = new Date();
  const dates = [];
  for (let i = 0; i < 4; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const label = i === 0 ? "Сегодня" : i === 1 ? "Завтра" : d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'numeric' });
    dates.push([{ text: `📅 ${label} (${dateStr})`, callback_data: `sel_date_${dateStr}` }]);
  }

  botInstance.sendMessage(chatId, `Мастер: *${state.barberName}*\n\n📅 *Шаг 3 из 4:* Выберите дату визита:`, {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: dates }
  });
}

function handleDateSelect(chatId, dateStr) {
  const state = userStates.get(chatId);
  if (!state) return;

  state.step = 'select_time';
  state.date = dateStr;
  userStates.set(chatId, state);

  // Available slots
  const slots = ["11:00", "12:30", "14:00", "15:30", "17:00", "18:30", "20:00"];
  const db = readDb();
  const bookedTimes = db.bookings
    .filter(b => b.barberId === state.barberId && b.date === dateStr && b.status !== 'cancelled')
    .map(b => b.time);

  const availableSlots = slots.filter(t => !bookedTimes.includes(t));

  const rows = [];
  for (let i = 0; i < availableSlots.length; i += 2) {
    const row = [];
    row.push({ text: `⏰ ${availableSlots[i]}`, callback_data: `sel_time_${availableSlots[i]}` });
    if (availableSlots[i + 1]) {
      row.push({ text: `⏰ ${availableSlots[i + 1]}`, callback_data: `sel_time_${availableSlots[i + 1]}` });
    }
    rows.push(row);
  }

  if (rows.length === 0) {
    rows.push([{ text: "Записаться на 19:30", callback_data: "sel_time_19:30" }]);
  }

  botInstance.sendMessage(chatId, `Дата: *${dateStr}*\n\n⏰ *Шаг 4 из 4:* Выберите удобное время:`, {
    parse_mode: 'Markdown',
    reply_markup: { inline_keyboard: rows }
  });
}

function handleTimeSelect(chatId, timeStr) {
  const state = userStates.get(chatId);
  if (!state) return;

  state.step = 'awaiting_phone';
  state.time = timeStr;
  userStates.set(chatId, state);

  botInstance.sendMessage(chatId, 
    `Почти готово! Оставьте ваш контактный номер телефона для подтверждения записи.\n\n` +
    `_Отправьте номер в ответном сообщении (например: +79991234567):_`, {
      parse_mode: 'Markdown'
    }
  );
}

function finishBotBooking(chatId, phone, clientName) {
  const state = userStates.get(chatId);
  if (!state) return;

  const db = readDb();
  const bookingId = `GRV-${Math.floor(1000 + Math.random() * 9000)}`;

  const newBooking = {
    id: bookingId,
    clientName: clientName,
    clientPhone: phone,
    clientNote: "Запись оформлена через Telegram Bot",
    serviceId: state.serviceId,
    serviceName: state.serviceName,
    servicePrice: state.servicePrice,
    barberId: state.barberId,
    barberName: state.barberName,
    date: state.date,
    time: state.time,
    status: "pending",
    source: "telegram",
    telegramChatId: chatId,
    createdAt: new Date().toISOString()
  };

  db.bookings.unshift(newBooking);
  writeDb(db);
  userStates.delete(chatId);

  // Notify client
  botInstance.sendMessage(chatId, 
`✅ *Поздравляем! Ваша запись успешно создана!*

🔖 *Номер брони:* \`${bookingId}\`
✂️ *Услуга:* ${state.serviceName}
💰 *Стоимость:* ${state.servicePrice} ₽
🧔 *Барбер:* ${state.barberName}
📅 *Дата:* ${state.date}
⏰ *Время:* ${state.time}
📞 *Телефон:* ${phone}

Ждем вас в *GRAVITY BARBERSHOP*! Мы приготовим для вас отличный кофе или виски.`, {
    parse_mode: 'Markdown'
  });

  // Notify admin
  sendBookingNotification(newBooking);
}

function showServicesList(chatId) {
  const db = readDb();
  let text = "💈 *ПРАЙС-ЛИСТ GRAVITY BARBER LOUNGE:*\n\n";

  db.services.forEach((s) => {
    text += `• *${s.name}* — ${s.price} ₽ (${s.duration} мин)\n_${s.description}_\n\n`;
  });

  botInstance.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: "📅 Записаться прямо сейчас", callback_data: "start_booking" }]]
    }
  });
}

function showBarbersList(chatId) {
  const db = readDb();
  let text = "🧔 *КОМАНДА МАСТЕРОВ GRAVITY:*\n\n";

  db.barbers.forEach((b) => {
    text += `✂️ *${b.name}* (${b.title})\n` +
            `⭐ Рейтинг: ${b.rating} (${b.reviewsCount} отзывов) | Опыт: ${b.experience}\n` +
            `Специализация: ${b.specialties.join(', ')}\n` +
            `Часы работы: ${b.startTime} - ${b.endTime}\n\n`;
  });

  botInstance.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: "📅 Записаться к мастеру", callback_data: "start_booking" }]]
    }
  });
}

function showContacts(chatId) {
  const db = readDb();
  const text = 
`📍 *GRAVITY BARBER LOUNGE*

🏠 *Адрес:* ${db.settings.salonAddress}
📞 *Телефон:* ${db.settings.salonPhone}
⏰ *Время работы:* ${db.settings.salonHours}

🚇 Ближайшие станции метро: Тверская, Пушкинская, Маяковская (3 мин пешком).
🚗 Бесплатная гостевая парковка по предварительному звонку.`;

  botInstance.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: "📅 Записаться", callback_data: "start_booking" }]]
    }
  });
}

function showUserBookings(chatId, userId) {
  const db = readDb();
  const userBookings = db.bookings.filter(b => b.telegramChatId === chatId || b.telegramChatId === userId);

  if (userBookings.length === 0) {
    botInstance.sendMessage(chatId, "У вас пока нет активных записей через Telegram. Нажмите кнопку ниже, чтобы записаться!", {
      reply_markup: {
        inline_keyboard: [[{ text: "📅 Записаться онлайн", callback_data: "start_booking" }]]
      }
    });
    return;
  }

  let text = "📋 *ВАШИ ЗАПИСИ В GRAVITY BARBERSHOP:*\n\n";
  userBookings.forEach(b => {
    const statusEmoji = b.status === 'confirmed' ? '✅ Подтверждена' : b.status === 'pending' ? '⏳ Ожидает подтверждения' : b.status === 'completed' ? '✨ Завершена' : '❌ Отменена';
    text += `🔖 *${b.id}* — ${statusEmoji}\n` +
            `✂️ ${b.serviceName} (${b.servicePrice} ₽)\n` +
            `🧔 Мастер: ${b.barberName}\n` +
            `📅 ${b.date} в ${b.time}\n\n`;
  });

  botInstance.sendMessage(chatId, text, { parse_mode: 'Markdown' });
}

function updateBookingStatus(bookingId, newStatus, adminChatId, messageId) {
  const db = readDb();
  const booking = db.bookings.find(b => b.id === bookingId);
  if (!booking) return;

  booking.status = newStatus;
  writeDb(db);

  const statusLabel = newStatus === 'confirmed' ? '✅ ПОДТВЕРЖДЕНА АДМИНИСТРАТОРОМ' : '❌ ОТМЕНЕНА АДМИНИСТРАТОРОМ';

  const updatedMsg = 
`💈 *ЗАПИСЬ ${booking.id}* 💈\n\n` +
`*Статус:* ${statusLabel}\n` +
`👤 Клиент: *${booking.clientName}* (${booking.clientPhone})\n` +
`✂️ Услуга: *${booking.serviceName}* (${booking.servicePrice} ₽)\n` +
`🧔 Мастер: *${booking.barberName}*\n` +
`📅 Дата и время: *${booking.date} в ${booking.time}*\n` +
`🌐 Источник: ${booking.source === 'website' ? 'Сайт' : 'Telegram Bot'}`;

  botInstance.editMessageText(updatedMsg, {
    chat_id: adminChatId,
    message_id: messageId,
    parse_mode: 'Markdown'
  });

  // Notify client if they booked via telegram
  if (booking.telegramChatId) {
    const clientNote = newStatus === 'confirmed'
      ? `🎉 Ваша запись *#${booking.id}* подтверждена администратором! Ждем вас ${booking.date} в ${booking.time}.`
      : `⚠️ Ваша запись *#${booking.id}* была отменена. Пожалуйста, выберите другое время или свяжитесь с нами.`;

    try {
      botInstance.sendMessage(booking.telegramChatId, clientNote, { parse_mode: 'Markdown' });
    } catch (e) {
      console.log('Could not notify client on TG:', e.message);
    }
  }
}

// Send real-time notification to the Admin Telegram Chat
export async function sendBookingNotification(booking) {
  const db = readDb();
  const chatId = db.settings.telegramAdminChatId;

  if (!botInstance || !chatId || chatId.trim() === '') {
    console.log('[Telegram Bot] Cannot send booking notification: bot not initialized or adminChatId missing.');
    return false;
  }

  const text = 
`🔥 *НОВАЯ ЗАЯВКА НА СТРИЖКУ!* 🔥\n\n` +
`🔖 *Код брони:* \`${booking.id}\`\n` +
`👤 *Клиент:* ${booking.clientName}\n` +
`📞 *Телефон:* ${booking.clientPhone}\n` +
`✂️ *Услуга:* ${booking.serviceName}\n` +
`💰 *Стоимость:* ${booking.servicePrice} ₽\n` +
`🧔 *Мастер:* ${booking.barberName}\n` +
`📅 *Дата:* ${booking.date}\n` +
`⏰ *Время:* ${booking.time}\n` +
(booking.clientNote ? `💬 *Комментарий:* _${booking.clientNote}_\n` : '') +
`🌐 *Источник заявки:* ${booking.source === 'telegram' ? '📱 Telegram Bot / Mini App' : '💻 Сайт'}\n\n` +
`_Действие администратора:_`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ Подтвердить запись", callback_data: `admin_confirm_${booking.id}` },
        { text: "❌ Отклонить", callback_data: `admin_cancel_${booking.id}` }
      ]
    ]
  };

  try {
    await botInstance.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
    console.log(`[Telegram Bot] Notification sent for booking ${booking.id} to chat ${chatId}`);
    return true;
  } catch (err) {
    console.error('[Telegram Bot] Error sending notification:', err.message);
    return false;
  }
}

// Send test message from Admin Panel
export async function sendTestNotification(chatId) {
  if (!botInstance) {
    throw new Error('Телеграм бот не запущен. Сначала сохраните корректный Bot Token.');
  }

  const text = 
`⚡ *ТЕСТОВОЕ УВЕДОМЛЕНИЕ УСПЕШНО ДОСТАВЛЕНО!* ⚡\n\n` +
`Барбершоп: *Gravity Barber Lounge*\n` +
`Связь сайта, админ-панели и Telegram чата (ID: \`${chatId}\`) настроена корректно!\n\n` +
`Теперь все заявки клиентов с интерактивного календаря на сайте и из Telegram Mini App будут моментально приходить в этот чат с кнопками подтверждения.`;

  return await botInstance.sendMessage(chatId, text, { parse_mode: 'Markdown' });
}
