# Evolution WhatsApp Notification

This project sends a WhatsApp notification after a new estimate request is saved in Supabase.

The frontend does not store or expose the Evolution API key. It calls the Supabase Edge Function:

```text
send-whatsapp-notification
```

## Required Supabase Edge Function Secrets

Set these in Supabase before deploying the function:

```bash
supabase secrets set EVOLUTION_API_URL="https://your-evolution-api-url"
supabase secrets set EVOLUTION_URL="https://your-evolution-api-url"
supabase secrets set EVOLUTION_API_KEY="your-evolution-api-key"
supabase secrets set EVOLUTION_INSTANCE_NAME="st-joseph-granite"
supabase secrets set WHATSAPP_NOTIFY_TO="5531991666106"
```

For this project, the Evolution base URL is:

```text
https://evolution.botcruzeiro.space
```

The current backend usually reads `EVOLUTION_URL`, but this function accepts `EVOLUTION_API_URL`,
`EVOLUTION_URL`, `EVOLUTION_SERVER_URL`, or `API_EVOLUTION`.

## Create a Separate Evolution Instance

Use a separate instance name so this project does not affect the WhatsApp instance used by another system.

Example instance name:

```text
st-joseph-granite
```

If you want to create it from this repo, set local environment variables and run:

```bash
EVOLUTION_API_URL="https://your-evolution-api-url" \
EVOLUTION_URL="https://your-evolution-api-url" \
EVOLUTION_API_KEY="your-evolution-api-key" \
EVOLUTION_INSTANCE_NAME="st-joseph-granite" \
node scripts/create-evolution-instance.mjs
```

Then scan/connect the returned QR code in Evolution.

## Deploy Function

```bash
supabase functions deploy send-whatsapp-notification --project-ref tfxydehxpmzpmvqawgft
supabase functions deploy evolution-instance-status --project-ref tfxydehxpmzpmvqawgft
supabase functions deploy evolution-connect-qr --project-ref tfxydehxpmzpmvqawgft
supabase functions deploy send-email-notification --project-ref tfxydehxpmzpmvqawgft
```

## Message Destination

Current destination:

```text
5531991666106
```
