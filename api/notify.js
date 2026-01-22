// Vercel Serverless Function: POST /api/notify
// Accepts JSON { name, type, chosenCity }
// Sends a message to Telegram bot.

const BOT_TOKEN = '8406292961:AAH0Y1gJjK2WKpkakhwX29CNefM9ro29RII';
const CHAT_ID = '8375918523';

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  let body = {};
  try { body = (req.body && typeof req.body === 'object') ? req.body : JSON.parse(req.body || '{}'); } catch(e) { body = {}; }

  const name = String(body.name || '').trim() || '—';
  const type = String(body.type || '').trim() || '—';
  const chosenCity = String(body.chosenCity || '').trim() || '—';

  const ipCity = String(req.headers['x-vercel-ip-city'] || '').trim() || '—';
  const time = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

  const text = [
    `<b>Событие авторизации</b>`,
    `Имя: ${escapeHtml(name)}`,
    `Тип: ${escapeHtml(type)}`,
    `Город (выбранный): ${escapeHtml(chosenCity)}`,
    `Город (по IP): ${escapeHtml(ipCity)}`,
    `Время: ${escapeHtml(time)}`
  ].join('\n');

  try {
    const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true })
    });

    if (!resp.ok) {
      const details = await resp.text().catch(()=>'');
      return res.status(502).json({ ok: false, error: 'Telegram API error', details });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('notify error', e);
    return res.status(500).json({ ok: false, error: 'internal' });
  }
}