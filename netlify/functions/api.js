exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, message: 'Metode tidak diizinkan.' })
    };
  }

  // URL Web App Google Apps Script yang sudah dideploy.
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwrIGhax2ZxnYqAyXQdwW6SPGZTXo6GClFTIYk00X1TmJYURH7Nk6z3srvmZNPXTz19/exec';

  try {
    const upstream = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: event.body || '{}',
      redirect: 'follow'
    });

    const responseText = await upstream.text();
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      throw new Error('Respons Apps Script bukan JSON. Periksa akses deployment Web App.');
    }

    return {
      statusCode: upstream.ok ? 200 : 502,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify(parsed)
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, message: err.message || 'Gagal menghubungi Google Apps Script.' })
    };
  }
};
