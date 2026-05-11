import { readFileSync } from 'node:fs';

const emailApiSecret = process.env.EMAIL_API_SECRET;
if (!emailApiSecret) {
  console.error('Missing EMAIL_API_SECRET.');
  process.exit(1);
}

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

async function postJson(url, headers, payload) {
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
const lead = {
  name: 'Teste Custom Email',
  phone: '(774) 498-9863',
  email: 'lucascodexy@gmail.com',
  project_type: 'Countertops',
  stone_type: 'Quartz',
};
const payload = {
  lead,
  type: 'custom',
  subject: 'Teste de mensagem personalizada',
  message: 'Este e-mail confirma que o envio personalizado do dashboard esta funcionando.',
};

const apiResult = await postJson(
  'https://demo.codexy.com.br/api/send-email',
  { 'x-email-api-secret': emailApiSecret },
  payload,
);
console.log('Public Custom Email API:', JSON.stringify({
  status: apiResult.status,
  ok: apiResult.ok,
  resultCount: Array.isArray(apiResult.body?.results) ? apiResult.body.results.length : 0,
  error: apiResult.body?.error,
}, null, 2));

const supabaseUrl = env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const anonKey = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!supabaseUrl || !anonKey) {
  console.log('Supabase Custom Function: skipped, missing local Supabase URL/key.');
  process.exit(apiResult.ok ? 0 : 1);
}

const functionResult = await postJson(
  `${supabaseUrl}/functions/v1/send-email-notification`,
  {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
  },
  payload,
);
console.log('Supabase Custom Email Function:', JSON.stringify({
  status: functionResult.status,
  ok: functionResult.ok,
  provider: functionResult.body?.provider,
  resultCount: Array.isArray(functionResult.body?.results?.results) ? functionResult.body.results.results.length : 0,
  error: functionResult.body?.error,
}, null, 2));

if (!apiResult.ok || !functionResult.ok) {
  process.exit(1);
}
