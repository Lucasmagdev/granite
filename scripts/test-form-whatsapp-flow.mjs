import { createClient } from '@supabase/supabase-js';
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

const env = readEnvFile('.env');
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL/key in .env.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const payload = {
  name: 'Teste Formulario VPS',
  phone: '(774) 433-2580',
  email: 'teste-formulario@example.com',
  address: 'Bellingham, MA',
  project_type: 'Kitchen Countertop',
  stone_type: 'Granite',
  measurements: 'Test flow',
  timeline: 'ASAP',
  comments: 'Teste automatico simulando envio do formulario para WhatsApp.',
  photo_names: [],
  created_at: new Date().toISOString(),
};

const { error: insertError } = await supabase.from('estimate_requests').insert(payload);
if (insertError) {
  console.log('Insert:', JSON.stringify({ ok: false, message: insertError.message }, null, 2));
  process.exit(1);
}
console.log('Insert:', JSON.stringify({ ok: true }, null, 2));

const { data, error } = await supabase.functions.invoke('send-whatsapp-notification', {
  body: { lead: payload },
});

console.log('WhatsApp:', JSON.stringify({
  ok: !error,
  data,
  error: error?.message,
}, null, 2));

if (error) process.exit(1);
