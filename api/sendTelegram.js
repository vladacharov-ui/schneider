const https = require('https');

module.exports = (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Метод не разрешен' });
  }

  const { name, phone, guests, date, time, comment, agreePromo } = req.body;

  if (!name || !phone || !guests || !date || !time) {
    return res.status(400).json({ success: false, error: 'Все обязательные поля должны быть заполнены' });
  }

  // Get keys from environment variables (configured in Vercel dashboard)
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8831904054:AAHl8PZQrMi1asqbZdw2AFU5g4PsZMQiqRo';
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '471562535';

  // Format date nicely (YYYY-MM-DD -> DD.MM.YYYY)
  let formattedDate = date;
  if (date && date.includes('-')) {
    const parts = date.split('-');
    if (parts.length === 3) {
      formattedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
  }

  const messageText = `🔔 Новая бронь

👤 Имя: ${name}
📞 Телефон: ${phone}
👥 Гостей: ${guests}
📅 Дата: ${formattedDate}
⏰ Время: ${time}
💬 Комментарий: ${comment || '—'}
📢 Рассылка акций/новостей: ${agreePromo ? 'Да' : 'Нет'}`;

  const postData = JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text: messageText
  });

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const telegramReq = https.request(options, (telegramRes) => {
    let responseBody = '';

    telegramRes.on('data', (chunk) => {
      responseBody += chunk;
    });

    telegramRes.on('end', () => {
      try {
        const data = JSON.parse(responseBody);
        if (data.ok) {
          res.json({ success: true });
        } else {
          console.error('Telegram API error response:', JSON.stringify(data, null, 2));
          res.status(500).json({ 
            success: false, 
            error: `Ошибка Telegram API: [${data.error_code || '500'}] ${data.description || 'Неизвестная ошибка'}`
          });
        }
      } catch (err) {
        console.error('JSON Parse error of Telegram response:', err, 'Body:', responseBody);
        res.status(500).json({ 
          success: false, 
          error: `Некорректный ответ от Telegram API: ${responseBody || 'пустое тело'}` 
        });
      }
    });
  });

  telegramReq.on('error', (err) => {
    console.error('Network request to Telegram failed:', err);
    res.status(500).json({ 
      success: false, 
      error: `Ошибка сети при обращении к Telegram: ${err.message}` 
    });
  });

  telegramReq.write(postData);
  telegramReq.end();
};
