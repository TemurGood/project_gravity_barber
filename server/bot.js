import { readDb, writeDb } from './db.js';

let pollingActive = false;
let pollingOffset = 0;
let reminderInterval = null;
const userStates = new Map(); // chat_id -> booking step state

async function tgCall(method, body = {}) {
  const db = readDb();
  const token = db.settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('Telegram Bot Token не задан');

  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return await res.json();
}

export function initTelegramBot(token, adminChatId) {
  if (!token || token.trim() === '') {
    console.log('[Telegram Bot] No token provided. Bot will remain idle.');
    pollingActive = false;
    if (reminderInterval) clearInterval(reminderInterval);
    return null;
  }

  console.log('[Telegram Bot] Starting with token for @gravity_barber_bot...');
  pollingActive = true;

  // Set chat menu button for Telegram Mini App
  const webAppUrl = process.env.WEBAPP_URL || 'https://gravity-barber.vercel.app';
  tgCall('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: '💈 Запись онлайн',
      web_app: { url: webAppUrl }
    }
  }).catch(e => console.log('Menu button note:', e.message));

  // Start polling loop
  startLongPolling();

  // Start automated reminders scheduler (checks every 30 seconds)
  startReminderScheduler();

  return true;
}

async function startLongPolling() {
  while (pollingActive) {
    try {
      const data = await tgCall('getUpdates', {
        offset: pollingOffset,
        timeout: 20,
        allowed_updates: ['message', 'callback_query']
      });

      if (data && data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          pollingOffset = update.update_id + 1;
          handleUpdate(update).catch(err => console.error('Update processing error:', err.message));
        }
      }
    } catch (err) {
      // Avoid spamming logs if network drops
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

async function handleUpdate(update) {
  const webAppUrl = process.env.WEBAPP_URL || 'https://gravity-barber.vercel.app';

  // 1. Message received
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat.id;
    const text = (msg.text || '').trim();
    const firstName = msg.from?.first_name || 'Джентльмен';

    if (text === '/start') {
      const welcomeText = 
`💈 *Добро пожаловать в GRAVITY BARBERSHOP!* 💈\n\n` +
`Здравствуйте, *${firstName}*!\n` +
`Мы объединили классические традиции барберинга, безупречный стиль и современный премиум-комфорт.\n\n` +
`📍 *Адрес:* ул. Большая Бронная, 14 (м. Пушкинская)\n` +
`⏰ *Время работы:* Ежедневно 10:00 — 22:00\n` +
`🥃 Бесплатный бар, свежесваренный кофе и зона PS5 для каждого гостя.\n\n` +
`_Вы можете записаться через интерактивный Mini App прямо внутри Telegram или пошагово в чате:_`;

      await tgCall('sendMessage', {
        chat_id: chatId,
        text: welcomeText,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: "🚀 Запустить Mini App (Календарь)", web_app: { url: webAppUrl } }],
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
        }
      });
      return;
    }

    if (text === '/id') {
      const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
      const msgText = isGroup 
        ? `👥 *ID этой группы / чата:* \`${chatId}\`\n\nСкопируйте этот номер и вставьте в поле *Telegram Admin Chat ID* в панели управления барбершопа!`
        : `👤 *Ваш персональный Telegram ID:* \`${chatId}\`\n\nСкопируйте этот номер и вставьте в поле *Telegram Admin Chat ID* в панели управления!`;

      await tgCall('sendMessage', {
        chat_id: chatId,
        text: msgText,
        parse_mode: 'Markdown'
      });
      return;
    }

    if (text === '/book') {
      startBotBooking(chatId);
      return;
    }

    if (text === '/app') {
      await tgCall('sendMessage', {
        chat_id: chatId,
        text: "Нажмите кнопку ниже, чтобы открыть интерактивный календарь Mini App:",
        reply_markup: {
          inline_keyboard: [[{ text: "🚀 Открыть Gravity Mini App", web_app: { url: webAppUrl } }]]
        }
      });
      return;
    }

    // Phone input state
    const state = userStates.get(chatId);
    if (state && state.step === 'awaiting_phone') {
      const phone = msg.contact ? msg.contact.phone_number : text;
      finishBotBooking(chatId, phone, msg.from?.first_name || 'Гость');
    }
  }

  // 2. Callback query received
  if (update.callback_query) {
    const query = update.callback_query;
    const chatId = query.message.chat.id;
    const data = query.data;
    const messageId = query.message.message_id;

    await tgCall('answerCallbackQuery', { callback_query_id: query.id });

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
      await tgCall('sendMessage', {
        chat_id: chatId,
        text: `🆔 *Ваш Telegram Chat ID:* \`${chatId}\`\n\nСкопируйте его для настроек уведомлений.`,
        parse_mode: 'Markdown'
      });
    } else if (data.startsWith("sel_srv_")) {
      handleServiceSelect(chatId, data.replace("sel_srv_", ""));
    } else if (data.startsWith("sel_barber_")) {
      handleBarberSelect(chatId, data.replace("sel_barber_", ""));
    } else if (data.startsWith("sel_date_")) {
      handleDateSelect(chatId, data.replace("sel_date_", ""));
    } else if (data.startsWith("sel_time_")) {
      handleTimeSelect(chatId, data.replace("sel_time_", ""));
    } else if (data.startsWith("admin_confirm_")) {
      updateBookingStatus(data.replace("admin_confirm_", ""), "confirmed", chatId, messageId);
    } else if (data.startsWith("admin_cancel_")) {
      updateBookingStatus(data.replace("admin_cancel_", ""), "cancelled", chatId, messageId);
    }
  }
}

// Background scheduler for automated reminders
function startReminderScheduler() {
  if (reminderInterval) clearInterval(reminderInterval);

  reminderInterval = setInterval(() => {
    try {
      const db = readDb();
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentMinutesNow = now.getHours() * 60 + now.getMinutes();

      let dbModified = false;

      db.bookings.forEach(booking => {
        if (booking.status === 'cancelled') return;
        if (booking.date !== todayStr) return;

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

          tgCall('sendMessage', { chat_id: targetChatId, text: msg60, parse_mode: 'Markdown' })
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

          tgCall('sendMessage', { chat_id: targetChatId, text: msg5, parse_mode: 'Markdown' })
            .catch(e => console.log('Error sending 5m reminder:', e.message));
        }
      });

      if (dbModified) {
        writeDb(db);
      }
    } catch (e) {
      console.error('[Reminder Scheduler] error:', e.message);
    }
  }, 35000);
}

// Manual reminder from admin
export async function sendManualBookingReminder(bookingId) {
  const db = readDb();
  const booking = db.bookings.find(b => b.id === bookingId);
  if (!booking) throw new Error('Запись не найдена.');

  const targetChatId = booking.telegramChatId || db.settings.telegramAdminChatId;
  if (!targetChatId) throw new Error('У этой записи не указан Telegram Chat ID.');

  const text = 
`🔔 *ПЕРСОНАЛЬНОЕ НАПОМИНАНИЕ О ЗАПИСИ* 🔔\n\n` +
`Здравствуйте, *${booking.clientName}*!\n` +
`Администратор *Gravity Barber Lounge* напоминает вам о предстоящем визите:\n\n` +
`🔖 *Бронь:* \`${booking.id}\`\n` +
`📅 *Дата:* ${booking.date} в *${booking.time}*\n` +
`✂️ *Услуга:* ${booking.serviceName}\n` +
`🧔 *Мастер:* ${booking.barberName}\n` +
`📍 *Адрес:* ул. Большая Бронная, 14 (м. Пушкинская)\n\n` +
`Если ваши планы изменились, пожалуйста, свяжитесь с нами: ${db.settings.salonPhone}`;

  const res = await tgCall('sendMessage', { chat_id: targetChatId, text, parse_mode: 'Markdown' });
  if (!res.ok) throw new Error(res.description || 'Ошибка отправки в Telegram');
  return true;
}

function startBotBooking(chatId) {
  const db = readDb();
  userStates.set(chatId, { step: 'select_service' });

  const buttons = db.services.slice(0, 6).map(s => ([{
    text: `${s.name} — ${s.price} ₽ (${s.duration} мин)`,
    callback_data: `sel_srv_${s.id}`
  }]));

  tgCall('sendMessage', {
    chat_id: chatId,
    text: "💈 *Шаг 1 из 4:* Выберите услугу:",
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

  tgCall('sendMessage', {
    chat_id: chatId,
    text: `Вы выбрали: *${service.name}*\n\n✂️ *Шаг 2 из 4:* Выберите мастера:`,
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

  const today = new Date();
  const dates = [];
  for (let i = 0; i < 4; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const label = i === 0 ? "Сегодня" : i === 1 ? "Завтра" : d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'numeric' });
    dates.push([{ text: `📅 ${label} (${dateStr})`, callback_data: `sel_date_${dateStr}` }]);
  }

  tgCall('sendMessage', {
    chat_id: chatId,
    text: `Мастер: *${state.barberName}*\n\n📅 *Шаг 3 из 4:* Выберите дату визита:`,
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

  tgCall('sendMessage', {
    chat_id: chatId,
    text: `Дата: *${dateStr}*\n\n⏰ *Шаг 4 из 4:* Выберите удобное время:`,
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

  tgCall('sendMessage', {
    chat_id: chatId,
    text: `Почти готово! Оставьте ваш контактный номер телефона для подтверждения записи.\n\n` +
          `_Отправьте номер в ответном сообщении (например: +79991234567):_`,
    parse_mode: 'Markdown'
  });
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
  tgCall('sendMessage', {
    chat_id: chatId,
    text: 
`✅ *Поздравляем! Ваша запись успешно создана!*

🔖 *Номер брони:* \`${bookingId}\`
✂️ *Услуга:* ${state.serviceName}
💰 *Стоимость:* ${state.servicePrice} ₽
🧔 *Барбер:* ${state.barberName}
📅 *Дата:* ${state.date}
⏰ *Время:* ${state.time}
📞 *Телефон:* ${phone}

Ждем вас в *GRAVITY BARBERSHOP*! Мы приготовим для вас отличный кофе или виски.`,
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

  tgCall('sendMessage', {
    chat_id: chatId,
    text,
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

  tgCall('sendMessage', {
    chat_id: chatId,
    text,
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

  tgCall('sendMessage', {
    chat_id: chatId,
    text,
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
    tgCall('sendMessage', {
      chat_id: chatId,
      text: "У вас пока нет активных записей через Telegram. Нажмите кнопку ниже, чтобы записаться!",
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

  tgCall('sendMessage', { chat_id: chatId, text, parse_mode: 'Markdown' });
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
`🌐 Источник: ${booking.source === 'website' ? 'Сайт' : 'Telegram Bot / Mini App'}`;

  tgCall('editMessageText', {
    chat_id: adminChatId,
    message_id: messageId,
    text: updatedMsg,
    parse_mode: 'Markdown'
  });

  if (booking.telegramChatId) {
    const clientNote = newStatus === 'confirmed'
      ? `🎉 Ваша запись *#${booking.id}* подтверждена администратором! Ждем вас ${booking.date} в ${booking.time}.`
      : `⚠️ Ваша запись *#${booking.id}* была отменена. Пожалуйста, выберите другое время или свяжитесь с нами.`;

    tgCall('sendMessage', {
      chat_id: booking.telegramChatId,
      text: clientNote,
      parse_mode: 'Markdown'
    }).catch(e => console.log('Could not notify client on TG:', e.message));
  }
}

export async function sendBookingNotification(booking) {
  const db = readDb();
  const chatId = db.settings.telegramAdminChatId;

  if (!chatId || chatId.trim() === '') {
    console.log('[Telegram Bot] Cannot send booking notification: adminChatId missing.');
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
    const res = await tgCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
    console.log(`[Telegram Bot] Notification sent for booking ${booking.id} to chat ${chatId}:`, res.ok);
    return res.ok;
  } catch (err) {
    console.error('[Telegram Bot] Error sending notification:', err.message);
    return false;
  }
}

export async function sendTestNotification(chatId) {
  const text = 
`⚡ *ТЕСТОВОЕ УВЕДОМЛЕНИЕ УСПЕШНО ДОСТАВЛЕНО!* ⚡\n\n` +
`Барбершоп: *Gravity Barber Lounge*\n` +
`Бот: *@gravity_barber_bot*\n` +
`Связь сайта, админ-панели и Telegram чата (ID: \`${chatId}\`) настроена корректно!\n\n` +
`Теперь все заявки клиентов с интерактивного календаря на сайте и из Telegram Mini App будут моментально приходить в этот чат с кнопками подтверждения.`;

  const res = await tgCall('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown'
  });

  if (!res.ok) {
    throw new Error(res.description || 'Не удалось отправить сообщение в Telegram');
  }
  return res;
}
