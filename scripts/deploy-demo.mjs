import { Client } from 'ssh2';
import { createReadStream, readdirSync, statSync } from 'node:fs';
import { join, posix, relative } from 'node:path';

const host = process.env.DEPLOY_HOST || '177.7.38.137';
const username = process.env.DEPLOY_USER || 'root';
const password = process.env.DEPLOY_PASSWORD;
const domain = process.env.DEPLOY_DOMAIN || 'demo.codexy.com.br';
const localDist = process.env.DEPLOY_DIST || 'dist';
const remoteRoot = process.env.DEPLOY_ROOT || `/var/www/${domain}`;
const nginxConfigPath = `/etc/nginx/sites-available/${domain}`;
const nginxEnabledPath = `/etc/nginx/sites-enabled/${domain}`;

if (!password) {
  console.error('Missing DEPLOY_PASSWORD.');
  process.exit(1);
}

const conn = new Client();

function connect() {
  return new Promise((resolve, reject) => {
    conn
      .on('ready', resolve)
      .on('error', reject)
      .connect({
        host,
        username,
        password,
        readyTimeout: 20000,
      });
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

      stream
        .on('close', (code) => {
          if (code === 0) resolve({ stdout, stderr });
          else reject(new Error(`Command failed (${code}): ${command}\n${stderr || stdout}`));
        })
        .on('data', (data) => {
          stdout += data.toString();
        });

      stream.stderr.on('data', (data) => {
        stderr += data.toString();
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

function mkdir(client, dir) {
  return new Promise((resolve, reject) => {
    client.mkdir(dir, (error) => {
      if (!error || error.code === 4) resolve();
      else reject(error);
    });
  });
}

async function ensureRemoteDir(client, dir) {
  const parts = dir.split('/').filter(Boolean);
  let current = '';
  for (const part of parts) {
    current += `/${part}`;
    await mkdir(client, current);
  }
}

function uploadFile(client, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    client.fastPut(localPath, remotePath, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function uploadDirectory(client, localDir, remoteDir) {
  await ensureRemoteDir(client, remoteDir);
  const entries = readdirSync(localDir);

  for (const entry of entries) {
    const localPath = join(localDir, entry);
    const remotePath = posix.join(remoteDir, entry);
    const stats = statSync(localPath);

    if (stats.isDirectory()) {
      await uploadDirectory(client, localPath, remotePath);
    } else if (stats.isFile()) {
      await uploadFile(client, localPath, remotePath);
      console.log(`Uploaded ${relative(localDist, localPath)}`);
    }
  }
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

const nginxConfig = `server {
    listen 80;
    listen [::]:80;
    server_name ${domain};

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${domain};

    root ${remoteRoot};
    index index.html;

    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location = /api/send-email {
        proxy_pass http://127.0.0.1:3101/api/send-email;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \\.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
`;

try {
  console.log(`Connecting to ${username}@${host}...`);
  await connect();

  const info = await exec('hostname && nginx -v 2>&1 || true');
  console.log(info.stdout.trim());

  await exec(`mkdir -p ${shellQuote(remoteRoot)}`);
  const client = await sftp();
  await uploadDirectory(client, localDist, remoteRoot);
  client.end();

  await exec(`cat > ${shellQuote(nginxConfigPath)} <<'EOF'\n${nginxConfig}EOF\n`);
  await exec(`ln -sfn ${shellQuote(nginxConfigPath)} ${shellQuote(nginxEnabledPath)}`);
  await exec('nginx -t');
  await exec('systemctl reload nginx || service nginx reload');

  const result = await exec(`curl -I --max-time 10 https://${domain} | head -n 1`);
  console.log(result.stdout.trim());
  console.log(`Deployed https://${domain}`);
} finally {
  conn.end();
}
