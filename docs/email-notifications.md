# Email Notifications

The website can send email after a form submission using the Supabase Edge Function:

```text
send-email-notification
```

It sends:

- an internal notification to `EMAIL_NOTIFY_TO`
- a confirmation email to the customer, unless `EMAIL_SEND_CUSTOMER_CONFIRMATION=false`

## Required Secrets

This project currently uses Mailgun.

The sandbox domain can usually send only to authorized recipients. For that reason,
customer confirmation is disabled by default until a production Mailgun domain is configured.

```bash
supabase secrets set MAILGUN_API_KEY="your-mailgun-api-key" --project-ref tfxydehxpmzpmvqawgft
supabase secrets set MAILGUN_DOMAIN="sandbox79ed17ea838c492287c1d270266551f5.mailgun.org" --project-ref tfxydehxpmzpmvqawgft
supabase secrets set MAILGUN_BASE_URL="https://api.mailgun.net" --project-ref tfxydehxpmzpmvqawgft
supabase secrets set EMAIL_FROM="Mailgun Sandbox <postmaster@sandbox79ed17ea838c492287c1d270266551f5.mailgun.org>" --project-ref tfxydehxpmzpmvqawgft
supabase secrets set EMAIL_NOTIFY_TO="lucascodexy@gmail.com" --project-ref tfxydehxpmzpmvqawgft
supabase secrets set EMAIL_SEND_CUSTOMER_CONFIRMATION="false" --project-ref tfxydehxpmzpmvqawgft
```

## Deploy

```bash
supabase functions deploy send-email-notification --project-ref tfxydehxpmzpmvqawgft
```
