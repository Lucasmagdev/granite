import { Client } from 'ssh2';

const host = process.env.DEPLOY_HOST || '177.7.38.137';
const username = process.env.DEPLOY_USER || 'root';
const password = process.env.DEPLOY_PASSWORD;

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

try {
  await connect();
  const checks = [
    ['nginx site', 'sed -n "1,220p" /etc/nginx/sites-available/demo.codexy.com.br'],
    ['nginx enabled', 'ls -la /etc/nginx/sites-enabled && readlink -f /etc/nginx/sites-enabled/*'],
    ['certs', 'certbot certificates 2>/dev/null || true'],
    ['openssl local', 'echo | openssl s_client -connect 127.0.0.1:443 -servername demo.codexy.com.br 2>/dev/null | openssl x509 -noout -subject -issuer -dates -ext subjectAltName'],
    ['email service', 'systemctl status st-joseph-email-api --no-pager -l | head -n 25'],
    ['email env shape', `bash -lc 'pid=$(systemctl show -p MainPID --value st-joseph-email-api); tr "\\0" "\\n" < /proc/$pid/environ | awk -F= '"'"'/^(SMTP_USER|SMTP_PASS|EMAIL_NOTIFY_TO)=/ { if ($1 == "SMTP_PASS") { raw=length($2); compact=$2; gsub(/[[:space:]]/, "", compact); print "SMTP_PASS rawLength=" raw " compactLength=" length(compact) } else { print $1 "=set" } }'"'"''`],
    ['nginx test', 'nginx -t'],
  ];

  for (const [label, command] of checks) {
    console.log(`\n### ${label}\n`);
    console.log((await exec(command)).trim());
  }
} finally {
  conn.end();
}
