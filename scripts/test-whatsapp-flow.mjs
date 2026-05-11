import { readFileSync } from 'node:fs';

function readEnvFile(path) {
  const env = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    env[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }
  return env;
}

async function postJson(url, headers, payload = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: response.status, ok: response.ok, body };
}

const env = readEnvFile('.env');
const supabaseUrl = env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const anonKey = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('Missing Supabase URL/key in .env.');
  process.exit(1);
}

const headers = {
  apikey: anonKey,
  Authorization: `Bearer ${anonKey}`,
};

const statusResult = await postJson(`${supabaseUrl}/functions/v1/evolution-instance-status`, headers);
console.log('Evolution Status:', JSON.stringify(statusResult.body, null, 2));

const lead = {
  created_at: new Date().toISOString(),
  name: 'Teste Formulario WhatsApp',
  phone: '(774) 498-9863',
  email: 'teste@example.com',
  address: 'Bellingham, MA',
  project_type: 'Kitchen Countertop',
  stone_type: 'Granite',
  measurements: 'Test',
  timeline: 'ASAP',
  comments: 'Teste automatico para confirmar envio pelo formulario.',
  photo_names: [],
};

const sendResult = await postJson(`${supabaseUrl}/functions/v1/send-whatsapp-notification`, headers, { lead });
console.log('WhatsApp Function:', JSON.stringify({
  status: sendResult.status,
  ok: sendResult.ok,
  body: sendResult.body,
}, null, 2));

if (!statusResult.ok || !sendResult.ok) {
  process.exit(1);
}
