import http from 'node:http';
import nodemailer from 'nodemailer';

const port = Number(process.env.EMAIL_API_PORT || 3101);
const apiSecret = process.env.EMAIL_API_SECRET;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM || `St. Joseph Granite <${smtpUser}>`;
const emailNotifyTo = process.env.EMAIL_NOTIFY_TO;
const sendCustomerConfirmation = process.env.EMAIL_SEND_CUSTOMER_CONFIRMATION !== 'false';

if (!apiSecret || !smtpUser || !smtpPass || !emailNotifyTo) {
  console.error('Missing EMAIL_API_SECRET, SMTP_USER, SMTP_PASS, or EMAIL_NOTIFY_TO.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: smtpUser,
    pass: smtpPass.replace(/\s/g, ''),
  },
});

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function field(label, value) {
  const cleanValue = String(value || '').trim();
  if (!cleanValue) return '';
  return `
    <tr>
      <td style="padding:10px 0;color:#737373;font-size:13px;width:150px;">${label}</td>
      <td style="padding:10px 0;color:#171717;font-size:14px;font-weight:600;">${escapeHtml(cleanValue)}</td>
    </tr>
  `;
}

function adminHtml(lead) {
  const createdAt = lead.created_at ? new Date(lead.created_at).toLocaleString('en-US') : '';
  const photos = Array.isArray(lead.photo_names) && lead.photo_names.length ? lead.photo_names.join(', ') : '';

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

function customerHtml(lead) {
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

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error('Request body too large.'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function json(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(payload));
}

async function sendLeadEmail(lead) {
  const recipients = emailNotifyTo.split(',').map((item) => item.trim()).filter(Boolean);

  const results = [];
  results.push(await transporter.sendMail({
    from: emailFrom,
    to: recipients,
    replyTo: lead.email || undefined,
    subject: `New estimate request from ${lead.name || 'website lead'}`,
    html: adminHtml(lead),
    text: `New estimate request from ${lead.name || 'website lead'}`,
  }));

  if (sendCustomerConfirmation && lead.email) {
    results.push(await transporter.sendMail({
      from: emailFrom,
      to: lead.email,
      subject: 'We received your estimate request',
      html: customerHtml(lead),
      text: 'We received your estimate request. St. Joseph Granite will contact you soon.',
    }));
  }

  return results.map((result) => ({ messageId: result.messageId, accepted: result.accepted }));
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== '/api/send-email') {
    json(res, 404, { error: 'Not found' });
    return;
  }

  if (req.headers['x-email-api-secret'] !== apiSecret) {
    json(res, 401, { error: 'Unauthorized' });
    return;
  }

  try {
    const body = await readBody(req);
    const { lead } = JSON.parse(body || '{}');
    if (!lead) {
      json(res, 400, { error: 'Missing lead.' });
      return;
    }

    const results = await sendLeadEmail(lead);
    json(res, 200, { ok: true, results });
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Email API listening on 127.0.0.1:${port}`);
});
