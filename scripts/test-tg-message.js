import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

console.log('Sending message to chatId:', chatId);

async function testMsg() {
  try {
    const text = 
`💈 *GRAVITY BARBERSHOP • СВЯЗЬ УСТАНОВЛЕНА!* 💈\n\n` +
`Здравствуйте! Вы успешно запустили бота.\n\n` +
`⚡ *Статус системы:*\n` +
`• База данных: *Neon PostgreSQL (Cloud)* — подключена ✅\n` +
`• Telegram Бот: *@gravity_barber_bot* — активен ✅\n` +
`• Автоматические напоминания: включены (за 1 час и за 5 минут) ⏰\n` +
`• Telegram Mini App: настроен 🚀\n\n` +
`Теперь все новые записи с сайта и из бота будут моментально приходить вам сюда с кнопками подтверждения!`;

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });

    const data = await res.json();
    console.log('Telegram API response:', data);
  } catch (e) {
    console.error('Error:', e);
  }
}

testMsg();
