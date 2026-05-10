import { Client } from 'ssh2';

const conn = new Client();

function exec(command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) { reject(err); return; }
      let out = '';
      stream.on('data', d => out += d.toString());
      stream.stderr.on('data', d => out += d.toString());
      stream.on('close', () => resolve(out));
    });
  });
}

conn.on('ready', async () => {
  try {
    const newestJs = '/var/www/demo.codexy.com.br/assets/index-C0oYQSUY.js';

    // Check for string literals from the modal that survive minification
    const checks = [
      ['template wizard', `grep -o "template\\|Template wizard\\|wizard\\|compose\\|preview" ${newestJs} | head -5`],
      ['bulk string', `grep -c "bulk\\|Bulk" ${newestJs}`],
      ['St Joseph string', `grep -o "St\\. Joseph" ${newestJs} | wc -l`],
      ['select template', `grep -c "template" ${newestJs}`],
      ['file size', `wc -c ${newestJs}`],
    ];

    for (const [label, cmd] of checks) {
      const result = await exec(cmd);
      console.log(`[${label}]: ${result.trim()}`);
    }
  } catch(e) {
    console.error('ERROR:', e.message);
  } finally {
    conn.end();
  }
}).on('error', (e) => {
  console.error('SSH error:', e.message);
}).connect({
  host: '177.7.38.137',
  username: 'root',
  password: 'Picole@2222@',
  readyTimeout: 15000,
});
