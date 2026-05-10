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
    console.log('=== WEB ROOT ===');
    console.log(await exec('ls -la /var/www/demo.codexy.com.br/ 2>/dev/null'));

    console.log('=== INDEX.HTML DATE ===');
    console.log(await exec('stat /var/www/demo.codexy.com.br/index.html 2>/dev/null'));

    console.log('=== JS FILES (newest first) ===');
    console.log(await exec('ls -lt /var/www/demo.codexy.com.br/assets/*.js 2>/dev/null | head -5'));

    console.log('=== MODAL STRINGS IN JS ===');
    const modalCheck = await exec('grep -l "BulkMessage\\|TemplateWizard\\|bulk.*message\\|modal" /var/www/demo.codexy.com.br/assets/*.js 2>/dev/null');
    console.log(modalCheck || 'NOT FOUND');

    console.log('=== ANALYTICS/ADMIN STRINGS ===');
    const adminCheck = await exec('grep -l "AdminDashboard\\|analytics\\|interest_level" /var/www/demo.codexy.com.br/assets/*.js 2>/dev/null');
    console.log(adminCheck || 'NOT FOUND');
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
