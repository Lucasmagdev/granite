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

    const response = await fetch(`${evolutionApiUrl}/instance/fetchInstances`, {
      headers: { apikey: evolutionApiKey },
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Evolution API failed with ${response.status}: ${detail}`);
    }

    const instances = await response.json();
    const instance = Array.isArray(instances)
      ? instances.find((item) => item.name === evolutionInstanceName)
      : null;

    return new Response(JSON.stringify({
      name: evolutionInstanceName,
      connectionStatus: instance?.connectionStatus || 'not_found',
      ownerJid: instance?.ownerJid || null,
      profileName: instance?.profileName || null,
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
