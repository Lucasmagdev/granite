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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const evolutionApiUrl = evolutionUrl();
    const evolutionApiKey = requiredEnv('EVOLUTION_API_KEY');
    const evolutionInstanceName = requiredEnv('EVOLUTION_INSTANCE_NAME');

    const response = await fetch(
      `${evolutionApiUrl}/instance/connect/${encodeURIComponent(evolutionInstanceName)}`,
      { headers: { apikey: evolutionApiKey } },
    );

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Evolution API failed with ${response.status}: ${detail}`);
    }

    const data = await response.json();
    const base64 = data.base64 || data.qrcode?.base64 || '';

    return new Response(JSON.stringify({
      base64: base64.startsWith('data:image') ? base64 : `data:image/png;base64,${base64}`,
      pairingCode: data.pairingCode || data.qrcode?.pairingCode || null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
