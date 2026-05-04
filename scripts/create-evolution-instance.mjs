const evolutionApiUrl = (
  process.env.EVOLUTION_API_URL ||
  process.env.EVOLUTION_URL ||
  process.env.EVOLUTION_SERVER_URL ||
  process.env.API_EVOLUTION
)?.replace(/\/$/, '');
const evolutionApiKey = process.env.EVOLUTION_API_KEY;
const evolutionInstanceName = process.env.EVOLUTION_INSTANCE_NAME || 'st-joseph-granite';

if (!evolutionApiUrl || !evolutionApiKey) {
  console.error('Missing Evolution URL or EVOLUTION_API_KEY.');
  process.exit(1);
}

const response = await fetch(`${evolutionApiUrl}/instance/create`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    apikey: evolutionApiKey,
  },
  body: JSON.stringify({
    instanceName: evolutionInstanceName,
    qrcode: true,
    integration: 'WHATSAPP-BAILEYS',
  }),
});

const body = await response.text();

if (!response.ok) {
  console.error(`Evolution API failed with ${response.status}:`);
  console.error(body);
  process.exit(1);
}

console.log(body);
