// Vercel Serverless Function: POST /api/notify
// Accepts JSON: { name, type, chosenCity, orderCode, product, amount }
// Sends a nicely formatted message to Telegram. Reads header 'x-vercel-ip-city' for IP city.

const TOKEN = process.env.TELEGRAM_TOKEN || "8406292961:AAH0Y1gJjK2WKpkakhwX29CNefM9ro29RII";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "8375918523";

module.exports = async (req, res) => {
  try {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = (req.body && typeof req.body === 'object') ? req.body : (req.body ? JSON.parse(req.body) : {});

  const name = String(body.name || '').trim() || '—';
  const type = String(body.type || '').trim() || '—';
  const chosenCity = String(body.chosenCity || '').trim() || '—';
  const orderCode = body.orderCode ? String(body.orderCode) : '';
  const product = body.product ? String(body.product) : '';
  const amount = (body.amount !== undefined && body.amount !== null) ? String(body.amount) : '';

  const ipCity = String(req.headers['x-vercel-ip-city'] || '').trim() || '—';
  const time = new Date().toLocaleString('ru-RU');

  let text = '';

  if (/оплат/i.test(type) || type === 'Оплата' || body.event === 'payment') {
  // payment message
  text = [
  '💳 <b>Платёж / Проверка оплаты</b>',
  `<b>Пользователь:</b> ${escapeHtml(name)}`,
  orderCode ? `<b>Номер заявки:</b> ${escapeHtml(String(orderCode))}` : '',
  product ? `<b>Товар:</b> ${escapeHtml(product)}` : '',
  amount ? `<b>Сумма:</b> ${escapeHtml(amount)} ₽` : '',
  `<b>Город (выбранный):</b> ${escapeHtml(chosenCity)}`,
  `<b>Город (по IP):</b> ${escapeHtml(ipCity)}`,
  `<b>Время:</b> ${escapeHtml(time)}`
  ].filter(Boolean).join('\n');
  } else {
  // auth / generic message
  text = [
  '👤 <b>Событие авторизации</b>',
  `<b>Имя:</b> ${escapeHtml(name)}`,
  `<b>Тип:</b> ${escapeHtml(type)}`,
  `<b>Город (выбранный):</b> ${escapeHtml(chosenCity)}`,
  `<b>Город (по IP):</b> ${escapeHtml(ipCity)}`,
  `<b>Время:</b> ${escapeHtml(time)}`
  ].join('\n');
  }

  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const resp = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true })
  });

  if (!resp.ok) {
  const errText = await resp.text().catch(() => '');
  return res.status(502).json({ ok: false, error: 'Telegram API error', details: errText });
  }

  return res.status(200).json({ ok: true });
  } catch (err) {
  console.error('notify error', err);
  return res.status(500).json({ ok: false, error: 'internal' });
  }
};

function escapeHtml(s) {
  return String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');
}
// Vercel Serverless Function: POST /api/notify
// Accepts JSON { name, type, chosenCity }
// Sends a message to Telegram bot. Uses header 'x-vercel-ip-city' to determine city by IP.

const TELEGRAM_TOKEN = "8406292961:AAH0Y1gJjK2WKpkakhwX29CNefM9ro29RII";
const TELEGRAM_CHAT_ID = "8375918523";

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const body = (req.body && typeof req.body === 'object') ? req.body : (req.body ? JSON.parse(req.body) : {});

    const name = String(body.name || '').trim() || '—';
    const type = String(body.type || '').trim() || '—';
    const chosenCity = String(body.chosenCity || '').trim() || '—';

    // City from Vercel header (determined by IP)
    const ipCity = String(req.headers['x-vercel-ip-city'] || '').trim() || '—';

    const time = new Date().toLocaleString('ru-RU');

    const text = [
      `<b>Событие авторизации</b>`,
      `Имя: ${escapeHtml(name)}`,
      `Тип: ${escapeHtml(type)}`,
      `Город (выбранный): ${escapeHtml(chosenCity)}`,
      `Город (по IP): ${escapeHtml(ipCity)}`,
      `Время: ${escapeHtml(time)}`
    ].join('\n');

    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true })
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      res.status(502).json({ ok: false, error: 'Telegram API error', details: errText });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('notify error', e);
    res.status(500).json({ ok: false, error: 'internal' });
  }
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
export default async function handler(req, res) {
  // 1. Получаем имя от твоего сайта
  const { name } = JSON.parse(req.body);

  // 2. Vercel сам знает город пользователя, берем его из заголовков
  const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : 'Не определен';
  
  // 3. Получаем текущее время (МСК)
  const time = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

  // 4. Данные твоего бота (лучше спрятать их в настройки Vercel, но пока для теста так)
  const BOT_TOKEN = '8406292961:AAH0Y1gJjK2WKpkakhwX29CNefM9ro29RII';
  const CHAT_ID = '8375918523';

  const text = `
👤 **Новый вход/регистрация!**
Name: ${name}
🏙 City: ${city}
🕒 Time: ${time}
  `;

  // 5. Отправляем в Телеграм
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'Markdown'
      })
    });
    res.status(200).json({ status: 'Ok' });
  } catch (error) {
    res.status(500).json({ status: 'Error', error });
  }
}