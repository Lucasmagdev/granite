type EstimateLead = {
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

function optionalEnv(name: string, fallback = '') {
  return Deno.env.get(name) || fallback;
}

function escapeHtml(value?: string | null) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function field(label: string, value?: string | null) {
  const cleanValue = String(value || '').trim();
  if (!cleanValue) return '';
  return `
    <tr>
      <td style="padding:10px 0;color:#737373;font-size:13px;width:150px;">${label}</td>
      <td style="padding:10px 0;color:#171717;font-size:14px;font-weight:600;">${escapeHtml(cleanValue)}</td>
    </tr>
  `;
}

function adminHtml(lead: EstimateLead) {
  const createdAt = lead.created_at ? new Date(lead.created_at).toLocaleString('en-US') : '';
  const photos = Array.isArray(lead.photo_names) && lead.photo_names.length
    ? lead.photo_names.join(', ')
    : '';

  return `
    <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:28px;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:#b91c1c;color:#ffffff;padding:24px;">
          <p style="margin:0 0 6px;font-size:12px;letter-spacing:3px;text-transform:uppercase;">New Estimate Request</p>
          <h1 style="margin:0;font-size:28px;font-family:Georgia,serif;">St. Joseph Granite</h1>
        </div>
        <div style="padding:24px;">
          <table style="width:100%;border-collapse:collapse;">
            ${field('Name', lead.name)}
            ${field('Phone', lead.phone)}
            ${field('Email', lead.email)}
            ${field('Address/City', lead.address)}
            ${field('Project Type', lead.project_type)}
            ${field('Stone Type', lead.stone_type)}
            ${field('Measurements', lead.measurements)}
            ${field('Timeline', lead.timeline)}
            ${field('Comments', lead.comments)}
            ${field('Photos', photos)}
            ${field('Submitted', createdAt)}
          </table>
        </div>
      </div>
    </div>
  `;
}

function customerHtml(lead: EstimateLead) {
  return `
    <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:28px;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:#b91c1c;color:#ffffff;padding:24px;">
          <h1 style="margin:0;font-size:28px;font-family:Georgia,serif;">We received your request</h1>
        </div>
        <div style="padding:24px;color:#171717;">
          <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Hi ${escapeHtml(lead.name || 'there')},</p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">
            Thank you for contacting St. Joseph Granite. We received your estimate request and our team will review your project details soon.
          </p>
          <p style="font-size:15px;line-height:1.7;margin:0 0 20px;">
            If you need faster assistance, call us at <strong>(774) 433-2580</strong>.
          </p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
            <p style="margin:0 0 8px;color:#737373;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Your Request</p>
            <p style="margin:0;font-size:14px;"><strong>Project:</strong> ${escapeHtml(lead.project_type)}</p>
            <p style="margin:6px 0 0;font-size:14px;"><strong>Stone:</strong> ${escapeHtml(lead.stone_type)}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function sendEmail(input: {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}) {
  const mailgunApiKey = requiredEnv('MAILGUN_API_KEY');
  const mailgunDomain = requiredEnv('MAILGUN_DOMAIN');
  const mailgunBaseUrl = optionalEnv('MAILGUN_BASE_URL', 'https://api.mailgun.net').replace(/\/$/, '');
  const formData = new FormData();
  const recipients = Array.isArray(input.to) ? input.to : [input.to];

  formData.append('from', input.from);
  for (const recipient of recipients) {
    formData.append('to', recipient);
  }
  formData.append('subject', input.subject);
  formData.append('html', input.html);
  formData.append('text', input.text || input.subject);
  if (input.replyTo) {
    formData.append('h:Reply-To', input.replyTo);
  }

  const auth = btoa(`api:${mailgunApiKey}`);
  const response = await fetch(`${mailgunBaseUrl}/v3/${mailgunDomain}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Mailgun failed with ${response.status}: ${detail}`);
  }

  return response.json();
}

async function sendViaEmailApi(lead: EstimateLead) {
  const emailApiUrl = Deno.env.get('EMAIL_API_URL');
  const emailApiSecret = Deno.env.get('EMAIL_API_SECRET');

  if (!emailApiUrl || !emailApiSecret) return null;

  const response = await fetch(emailApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-email-api-secret': emailApiSecret,
    },
    body: JSON.stringify({ lead }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Email API failed with ${response.status}: ${detail}`);
  }

  return response.json();
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
    const { lead } = await req.json() as { lead: EstimateLead };
    const apiResult = await sendViaEmailApi(lead);
    if (apiResult) {
      return new Response(JSON.stringify({ ok: true, provider: 'email-api', results: apiResult }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const from = requiredEnv('EMAIL_FROM');
    const notifyTo = requiredEnv('EMAIL_NOTIFY_TO');
    const sendCustomerEmail = optionalEnv('EMAIL_SEND_CUSTOMER_CONFIRMATION', 'true') !== 'false';

    const results = [];
    results.push(await sendEmail({
      from,
      to: notifyTo.split(',').map((email) => email.trim()).filter(Boolean),
      subject: `New estimate request from ${lead.name || 'website lead'}`,
      html: adminHtml(lead),
      text: `New estimate request from ${lead.name || 'website lead'}`,
      replyTo: lead.email,
    }));

    if (sendCustomerEmail && lead.email) {
      results.push(await sendEmail({
        from,
        to: lead.email,
        subject: 'We received your estimate request',
        html: customerHtml(lead),
        text: 'We received your estimate request. St. Joseph Granite will contact you soon.',
      }));
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
