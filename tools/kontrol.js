// Duman testi: sözdizimi, sayfanın yüklediği dosyalar, servis çalışanı listesi, sürüm etiketi.
//   node tools/kontrol.js
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
let bad = 0;
const fail = m => { bad++; console.log('  HATA: ' + m); };

// 1) her js dosyası sözdizimi
for (const dir of ['js', 'tools']) for (const f of fs.readdirSync(path.join(root, dir))) {
  if (!f.endsWith('.js')) continue;
  try { execFileSync(process.execPath, ['--check', path.join(root, dir, f)], { stdio: 'pipe' }); } catch (e) { fail(`${dir}/${f} sözdizimi: ${String(e.stderr).split('\n')[0]}`); }
}
if (fs.existsSync(path.join(root, 'sw.js'))) { try { execFileSync(process.execPath, ['--check', path.join(root, 'sw.js')], { stdio: 'pipe' }); } catch (e) { fail('sw.js sözdizimi'); } }

// 2) index.html'in yüklediği yerel dosyalar diskte mi, servis çalışanı listesinde mi, sürüm etiketi aynı mı
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="([^"#:]+?)(\?v=([\d.]+))?"/g)].map(m => ({ file: m[1], v: m[3] }));
const versions = new Set(refs.filter(r => /\.(js|css)$/.test(r.file)).map(r => r.v));
if (versions.size !== 1 || versions.has(undefined)) fail('CSS/JS sürüm etiketleri aynı değil ya da eksik: ' + [...versions].join(', '));
for (const r of refs) {
  if (!fs.existsSync(path.join(root, r.file))) fail(`index.html'deki ${r.file} diskte yok`);
  if (!sw.includes(`'${r.file}'`)) fail(`${r.file} sw.js listesinde yok (internetsiz açılmaz)`);
}
// 3) servis çalışanı listesindeki her dosya diskte mi
for (const m of sw.matchAll(/'([^'\s]+\.(?:js|css|html|webmanifest|png|webp))'/g)) {
  if (!fs.existsSync(path.join(root, m[1]))) fail(`sw.js listesindeki ${m[1]} diskte yok`);
}
// 4) manifest simgeleri
const man = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
for (const ic of man.icons) if (!fs.existsSync(path.join(root, ic.src))) fail(`manifest simgesi ${ic.src} yok`);

console.log(bad ? `${bad} hata` : `Tamam: sözdizimi, ${refs.length} sayfa bağlantısı, servis çalışanı listesi, manifest simgeleri, sürüm etiketi ${[...versions][0]}`);
process.exit(bad ? 1 : 0);
