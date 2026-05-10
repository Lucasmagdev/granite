import { Client } from 'ssh2';
import { readdirSync, statSync } from 'node:fs';
import { join, posix, relative } from 'node:path';

const host = process.env.DEPLOY_HOST || '177.7.38.137';
const username = process.env.DEPLOY_USER || 'root';
const password = process.env.DEPLOY_PASSWORD;
const domain = 'stjosephmarblegranite.com';
const aliases = ['www.stjosephmarblegranite.com'];
const domains = [domain, ...aliases];
const localDist = process.env.DEPLOY_DIST || 'dist';
const remoteRoot = `/var/www/${domain}`;
const nginxConfigPath = `/etc/nginx/sites-available/${domain}`;
const nginxEnabledPath = `/etc/nginx/sites-enabled/${domain}`;

if (!password) {
  console.error('Missing DEPLOY_PASSWORD.');
  process.exit(1);
}

const conn = new Client();

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

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
        const output = stdout + stderr;
        if (code === 0) resolve(output);
        else reject(new Error(`Command failed (${code}): ${command}\n${output}`));
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
  for (const entry of readdirSync(localDir)) {
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

const serverNames = domains.join(' ');
const certArgs = domains.map((name) => `-d ${shellQuote(name)}`).join(' ');

const httpConfig = `server {
    listen 80;
    listen [::]:80;
    server_name ${serverNames};

    root ${remoteRoot};
    index index.html;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
`;

const httpsConfig = `server {
    listen 80;
    listen [::]:80;
    server_name ${serverNames};

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
    server_name ${serverNames};

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

  await exec(`mkdir -p ${shellQuote(remoteRoot)} /var/www/html`);
  const client = await sftp();
  await uploadDirectory(client, localDist, remoteRoot);
  client.end();

  await exec(`[ ! -f ${shellQuote(nginxConfigPath)} ] || cp ${shellQuote(nginxConfigPath)} ${shellQuote(`${nginxConfigPath}.bak-$(date +%Y%m%d%H%M%S)`)}`);
  await exec(`cat > ${shellQuote(nginxConfigPath)} <<'EOF'\n${httpConfig}EOF\n`);
  await exec(`ln -sfn ${shellQuote(nginxConfigPath)} ${shellQuote(nginxEnabledPath)}`);
  await exec('nginx -t');
  await exec('systemctl reload nginx || service nginx reload');

  console.log('Issuing certificate...');
  await exec(`certbot certonly --webroot -w /var/www/html ${certArgs} --agree-tos --non-interactive --register-unsafely-without-email --cert-name ${shellQuote(domain)}`);

  await exec(`cat > ${shellQuote(nginxConfigPath)} <<'EOF'\n${httpsConfig}EOF\n`);
  await exec('nginx -t');
  await exec('systemctl reload nginx || service nginx reload');

  console.log(await exec(`echo | openssl s_client -connect 127.0.0.1:443 -servername ${domain} 2>/dev/null | openssl x509 -noout -subject -issuer -dates -ext subjectAltName`));
  console.log(`Configured https://${domain} and https://${aliases[0]}`);
} finally {
  conn.end();
}
