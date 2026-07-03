const ALLOWED_TYPES = new Set(['siteError', 'contentFix', 'accessibility', 'other']);
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

function json(data, status, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders
    }
  });
}

function getAllowedOrigins(env) {
  return String(env.ALLOWED_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getCorsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigins = getAllowedOrigins(env);
  if (!origin || !allowedOrigins.includes(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
}

function base64UrlEncode(input) {
  const bytes = input instanceof ArrayBuffer
    ? new Uint8Array(input)
    : new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function pemToArrayBuffer(pem) {
  if (!pem || typeof pem !== 'string') {
    throw new Error('Invalid private key: KEY is missing or not a string.');
  }
  const normalized = pem.replace(/\\n/g, '\n');
  const base64 = normalized
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function createJwt(env) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: env.GOOGLE_CLIENT_EMAIL,
    scope: SHEETS_SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now
  };
  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(claim))}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(env.GOOGLE_PRIVATE_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsignedToken)
  );
  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

async function getAccessToken(env) {
  const assertion = await createJwt(env);
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion
  });
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google token request failed: ${response.status} - ${errorText}`);
  }
  const data = await response.json();
  return data.access_token;
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') return 'Invalid payload.';
  if (!('type' in payload) || !('message' in payload)) {
    return 'Missing required fields: type and message.';
  }
  const type = String(payload.type || '');
  const message = String(payload.message || '').trim();
  if (!ALLOWED_TYPES.has(type)) return 'Invalid feedback type.';
  if (message.length < 5) return 'Message is too short.';
  if (message.length > 2000) return 'Message is too long.';
  return '';
}

function sanitizeFormula(value) {
  const str = String(value || '').trim();
  // Google Sheets formula injection 방어: =, +, -, @, \t, \r로 시작하는 경우 작은따옴표(') 추가
  if (/^[=\+\-\@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

async function appendFeedback(env, payload) {
  const accessToken = await getAccessToken(env);
  const spreadsheetId = env.SPREADSHEET_ID;
  const sheetName = env.SHEET_NAME || 'Feedback';
  const range = encodeURIComponent(`${sheetName}!A:C`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  
  const sanitizedType = sanitizeFormula(payload.type);
  const sanitizedMessage = sanitizeFormula(payload.message);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [[new Date().toISOString(), sanitizedType, sanitizedMessage]]
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Sheets append failed: ${response.status} - ${errorText}`);
  }
}

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return corsHeaders
        ? new Response(null, { status: 204, headers: corsHeaders })
        : json({ ok: false, error: 'Forbidden origin.' }, 403);
    }

    if (!corsHeaders) {
      return json({ ok: false, error: 'Forbidden origin.' }, 403);
    }

    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/feedback') {
      return json({ ok: false, error: 'Not found.' }, 404, corsHeaders);
    }

    // Body size 검증 (최대 10KB 제한)
    const contentLength = request.headers.get('Content-Length');
    if (contentLength) {
      const length = parseInt(contentLength, 10);
      if (isNaN(length) || length > 10240) {
        return json({ ok: false, error: 'Payload too large.' }, 413, corsHeaders);
      }
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ ok: false, error: 'Invalid JSON.' }, 400, corsHeaders);
    }

    const validationError = validatePayload(payload);
    if (validationError) {
      return json({ ok: false, error: validationError }, 400, corsHeaders);
    }

    try {
      await appendFeedback(env, payload);
      return json({ ok: true }, 200, corsHeaders);
    } catch (err) {
      console.error('Feedback save error:', err);
      return json({ ok: false, error: 'Failed to save feedback.' }, 502, corsHeaders);
    }
  }
};
