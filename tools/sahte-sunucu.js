// Yerel sahte skor sunucusu: Supabase (PostgREST) çağrılarının oyunun kullandığı iki tanesini taklit eder.
// Hesap açmadan skor tablosunu uçtan uca denemek için. Veriler bellekte durur, kapatınca silinir.
//   node tools/sahte-sunucu.js [port varsayılan 8767] [--dolu: tabloya örnek oyuncular ekler]
// Sonra oyunu http://localhost:8766/?online=yerel ile aç; Haftalık ya da Günlük Kuyu'yu oyna.
// Kurallar docs/online-supabase.sql ile aynı: oyuncu başına tahtada tek satır, yalnız daha iyi puan yazılır.
const http = require('http');
const PORT = +process.argv[2] || 8767;
const skor = new Map(); // tahta → Map(oyuncu → { ad, puan, metre })
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'apikey, authorization, content-type, prefer', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
const yanit = (res, kod, veri) => { res.writeHead(kod, Object.assign({ 'Content-Type': 'application/json' }, CORS)); res.end(JSON.stringify(veri)); };

function gonder(b) {
  const tahta = String(b.p_tahta || ''), oyuncu = String(b.p_oyuncu || ''), ad = String(b.p_ad || '').slice(0, 16);
  const puan = Math.floor(+b.p_puan), metre = Math.floor(+b.p_metre || 0);
  if (!/^[hg]-\d{4}-\d{2}-\d{2}$/.test(tahta) || !/^[0-9a-f-]{36}$/.test(oyuncu) || !ad || !(puan >= 0 && puan <= 5e6) || !(metre >= 0 && metre <= 2e5)) return false;
  if (!skor.has(tahta)) skor.set(tahta, new Map());
  const t = skor.get(tahta), eski = t.get(oyuncu);
  if (!eski || puan > eski.puan) t.set(oyuncu, { ad, puan, metre }); else eski.ad = ad;
  return true;
}
function liste(q) {
  const tahta = (q.get('tahta') || '').replace(/^eq\./, ''), n = Math.min(200, +q.get('limit') || 100);
  const t = skor.get(tahta) || new Map();
  return [...t.entries()].map(([oyuncu, r]) => ({ ad: r.ad, puan: r.puan, metre: r.metre, oyuncu })).sort((a, b) => b.puan - a.puan).slice(0, n);
}

const sunucu = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  if (!req.headers.apikey) return yanit(res, 401, { message: 'apikey yok' });
  if (req.method === 'GET' && u.pathname === '/rest/v1/skorlar') return yanit(res, 200, liste(u.searchParams));
  if (req.method === 'POST' && u.pathname === '/rest/v1/rpc/skor_gonder') {
    let govde = '';
    req.on('data', c => { govde += c; if (govde.length > 4096) req.destroy(); });
    req.on('end', () => { try { yanit(res, 200, gonder(JSON.parse(govde))); } catch (e) { yanit(res, 400, { message: 'geçersiz gövde' }); } });
    return;
  }
  yanit(res, 404, { message: 'yok' });
});

function ornekDoldur(tahta) {
  const adlar = ['Kıvılcım', 'Fitil', 'Bekçi', 'Yosun', 'Kova', 'Sarkaç', 'Halka', 'Rüzgâr'];
  adlar.forEach((ad, i) => gonder({ p_tahta: tahta, p_oyuncu: '00000000-0000-4000-8000-' + String(i).padStart(12, '0'), p_ad: ad + ' (örnek)', p_puan: 800 + i * i * 900, p_metre: 400 + i * 350 }));
}

if (require.main === module) {
  sunucu.listen(PORT, () => {
    console.log('Sahte skor sunucusu: http://localhost:' + PORT + '  (oyunu ?online=yerel ile aç)');
    if (process.argv.includes('--dolu')) {
      const d = new Date(Date.now() + 3 * 3600e3), gun = d.toISOString().slice(0, 10);
      d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7);
      ornekDoldur('h-' + d.toISOString().slice(0, 10)); ornekDoldur('g-' + gun);
      console.log('Örnek oyuncular eklendi (adlarında "örnek" yazar).');
    }
  });
}
module.exports = { sunucu, gonder, liste };
