import { Client } from 'ssh2';
import { readFileSync } from 'node:fs';

const host = process.env.DEPLOY_HOST || '177.7.38.137';
const username = process.env.DEPLOY_USER || 'root';
const password = process.env.DEPLOY_PASSWORD;
const smtpPass = process.env.SMTP_PASS;

if (!password || !smtpPass) {
  console.error('Missing DEPLOY_PASSWORD or SMTP_PASS.');
  process.exit(1);
}

const conn = new Client();
const emailApi = readFileSync('server/email-api.mjs');

function connect() {
  return new Promise((resolve, reject) => {
    conn
      .on('ready', resolve)
      .on('error', reject)
      .connect({ host, username, password, readyTimeout: 20000 });
  });
}

function exec(command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (error, stream) => {
      if (error) {
        reject(error);
        return;
      }

      let stdout = '';
      let stderr = '';
      stream.on('data', (data) => {
        stdout += data.toString();
      });
      stream.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      stream.on('close', (code) => {
        if (code === 0) resolve(stdout + stderr);
        else reject(new Error(`Command failed (${code}): ${command}\n${stderr || stdout}`));
      });
    });
  });
}

function sftp() {
  return new Promise((resolve, reject) => {
    conn.sftp((error, client) => {
      if (error) reject(error);
      else resolve(client);
    });
  });
}

function writeRemoteFile(client, remotePath, content) {
  return new Promise((resolve, reject) => {
    client.writeFile(remotePath, content, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function envValue(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\$/g, '\\$')}"`;
}

const envFile = `EMAIL_API_PORT=3101
EMAIL_API_SECRET=${envValue('sjg-email-api-2026-0b83c837')}
SMTP_USER=${envValue('lucasemb999@gmail.com')}
SMTP_PASS=${envValue(smtpPass)}
EMAIL_FROM=${envValue('St. Joseph Granite <lucasemb999@gmail.com>')}
EMAIL_NOTIFY_TO=${envValue('lucasemb999@gmail.com')}
EMAIL_SEND_CUSTOMER_CONFIRMATION=true
`;

const serviceFile = `[Unit]
Description=St Joseph Granite Email API
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/st-joseph-granite
EnvironmentFile=/opt/st-joseph-granite/.env
ExecStart=/usr/bin/node /opt/st-joseph-granite/email-api.mjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
`;

const nginxApiLocation = `location = /api/send-email {
        proxy_pass http://127.0.0.1:3101/api/send-email;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
`;

try {
  await connect();
  await exec('mkdir -p /opt/st-joseph-granite');
  const client = await sftp();
  await writeRemoteFile(client, '/opt/st-joseph-granite/email-api.mjs', emailApi);
  await writeRemoteFile(client, '/opt/st-joseph-granite/.env', envFile);
  await writeRemoteFile(client, '/etc/systemd/system/st-joseph-email-api.service', serviceFile);
  client.end();

  await exec('chmod 600 /opt/st-joseph-granite/.env');
  await exec('cd /opt/st-joseph-granite && npm init -y >/dev/null 2>&1 || true && npm install nodemailer --omit=dev');
  await exec('systemctl daemon-reload && systemctl enable --now st-joseph-email-api && systemctl restart st-joseph-email-api');

  const escapedLocation = nginxApiLocation.replace(/\$/g, '\\$');
  await exec(`python3 - <<'PY'
from pathlib import Path
path = Path('/etc/nginx/sites-available/demo.codexy.com.br')
text = path.read_text()
location = ${JSON.stringify(escapedLocation)}
if 'location = /api/send-email' not in text:
    marker = '    location / {\\n'
    text = text.replace(marker, location + '\\n' + marker)
    path.write_text(text)
PY`);

  await exec('nginx -t && systemctl reload nginx');
  const status = await exec('systemctl status st-joseph-email-api --no-pager -l | head -n 18');
  console.log(status.trim());
  console.log('Email API deployed.');
} finally {
  conn.end();
}
