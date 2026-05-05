type EstimateLead = {
  id?: string;
  created_at?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  project_type?: string;
  stone_type?: string;
  measurements?: string;
  timeline?: string;
  comments?: string;
  photo_names?: string[];
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function evolutionUrl() {
  const value =
    Deno.env.get('EVOLUTION_API_URL') ||
    Deno.env.get('EVOLUTION_URL') ||
    Deno.env.get('EVOLUTION_SERVER_URL') ||
    Deno.env.get('API_EVOLUTION');

  if (!value) throw new Error('Missing Evolution URL environment variable.');
  return value.replace(/\/$/, '');
}

function line(label: string, value?: string | null) {
  const cleanValue = String(value || '').trim();
  return cleanValue ? `*${label}:* ${cleanValue}` : '';
}

function buildMessage(lead: EstimateLead) {
  const createdAt = lead.created_at ? new Date(lead.created_at).toLocaleString('en-US') : '';
  const photos = Array.isArray(lead.photo_names) && lead.photo_names.length
    ? lead.photo_names.join(', ')
    : '';

  return [
    '*New estimate request - St. Joseph Granite*',
    '',
    line('Name', lead.name),
    line('Phone', lead.phone),
    line('Email', lead.email),
    line('Address/City', lead.address),
    line('Project Type', lead.project_type),
    line('Stone Type', lead.stone_type),
    line('Measurements', lead.measurements),
    line('Timeline', lead.timeline),
    line('Comments', lead.comments),
    line('Photos', photos),
    line('Submitted', createdAt),
  ].filter(Boolean).join('\n');
}

function ownerNumberFromJid(ownerJid?: string | null) {
  return String(ownerJid || '').split('@')[0].replace(/\D/g, '');
}

async function connectedInstanceOwnerNumber(
  evolutionApiUrl: string,
  evolutionApiKey: string,
  evolutionInstanceName: string,
) {
  const response = await fetch(`${evolutionApiUrl}/instance/fetchInstances`, {
    headers: { apikey: evolutionApiKey },
  });

  if (!response.ok) return '';

  const instances = await response.json();
  const instance = Array.isArray(instances)
    ? instances.find((item) => item.name === evolutionInstanceName)
    : null;

  return ownerNumberFromJid(instance?.ownerJid);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const evolutionApiUrl = evolutionUrl();
    const evolutionApiKey = requiredEnv('EVOLUTION_API_KEY');
    const evolutionInstanceName = requiredEnv('EVOLUTION_INSTANCE_NAME');
    const configuredNotifyTo = Deno.env.get('WHATSAPP_NOTIFY_TO') || '';

    const body = await req.json();
    const lead = body.lead as EstimateLead;
    const connectedOwnerNumber = await connectedInstanceOwnerNumber(
      evolutionApiUrl,
      evolutionApiKey,
      evolutionInstanceName,
    );
    const sendTo = String(body.to || connectedOwnerNumber || configuredNotifyTo).replace(/\D/g, '');
    const text = body.message || buildMessage(lead);

    if (!sendTo) {
      throw new Error('No WhatsApp recipient available.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
      response = await fetch(
        `${evolutionApiUrl}/message/sendText/${encodeURIComponent(evolutionInstanceName)}`,
        {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            apikey: evolutionApiKey,
          },
          body: JSON.stringify({
            number: sendTo,
            text,
          }),
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Evolution API failed with ${response.status}: ${detail}`);
    }

    return new Response(JSON.stringify({ ok: true, to: sendTo, target: body.to ? 'custom' : connectedOwnerNumber ? 'connected_instance_owner' : 'configured_notify_to' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
