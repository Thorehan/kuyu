// Sonsuz Kuyu, takip eden su (İstişare 2): yanmak zamandan değil yanlış karardan gelmeli.
// Oyuncu modelleri hata olasılığıyla oynar; ne kadar dayandıkları ve neden yandıkları ölçülür.
//   node tools/hata.js            [tohum sayısı varsayılan 8, en çok 6 dk]
const E = require('../js/engine.js');
const G = require('../js/gen.js');
const C = E.CFG;
const TOHUM = +process.argv[2] || 8, MAXT = 360;
function rng(seed) { let x = seed >>> 0 || 1; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296); }
const step = (s, sec, u) => { for (let i = 0; i < Math.round(sec / C.DT) && s.status === 'play'; i++) { E.step(s); if (u && u()) return; } };
// oyundaki gibi: işaret "bekle" diyorsa kanca kısa süre bekler
function bekle(s, f, a) { if (!a.bekle) return a; const son = s.t + C.BEKLE_SN; while (s.status === 'play') { E.step(s); a = E.aim(s, f); if (!a.bekle || s.t >= son || s.p.y - s.p.py >= 0) break; } return a; }
// iki işaretten yukarıdakinin tarafı (oyuncunun gördüğü)
function iyiTaraf(s) { const L = E.aim(s, 0.25), R = E.aim(s, 0.75), y = a => (a.bekle || a).y, ok = a => (a.kind !== 'none' && !a.miss) || a.bekle; return ok(L) && ok(R) ? (y(L) <= y(R) ? 0.25 : 0.75) : ok(L) ? 0.25 : ok(R) ? 0.75 : null; }
function oyna(seed, tarz, p) {
  const s = E.createSim(G.createEndless(seed)), r = rng(seed * 977 + Math.round(p * 1000)); let hata = 0, k = 0;
  while (s.status === 'play' && s.t < MAXT) {
    if (tarz === 'spam') {
      const f = k++ % 2 ? 0.75 : 0.25, a = bekle(s, f, E.aim(s, f));
      E.press(s, a.x, a.y, { keep: !!a.miss }); step(s, 0.15 + (r() * 2 - 1) * 0.05); E.release(s); step(s, Math.max(0.02, 0.1 + (r() * 2 - 1) * 0.05)); continue;
    }
    let f = iyiTaraf(s);
    if (f == null) { step(s, 0.1); continue; }
    const havada = !s.rope;
    // hata: havadayken yanlış taraf ya da geç kalma; asılıyken yanlış taraf (× gösteren yana basmak)
    if (r() < p) { hata++; if (!havada || r() < 0.5) f = 1 - f; else step(s, 0.9); } // geç kalma: tepe geçip düşerken
    const a = bekle(s, f, E.aim(s, f));
    if (tarz === 'temkinli') E.release(s);
    E.press(s, a.x, a.y, { keep: !!a.miss });
    step(s, 0.8, () => (s.rope && !s.hook) || !s.hook);
    if (!s.rope) { step(s, 0.3); continue; } // tutunamadı (boş atış, düşüş): gerçek oyuncu ~0,3 sn içinde yeniden dener
    if (tarz === 'temkinli') step(s, 1.6, () => s.rope && s.rope.len <= C.MIN_LEN + 0.01 && Math.hypot(s.p.x - s.p.px, s.p.y - s.p.py) / C.DT < 120);
    else { step(s, 1.2, () => s.rope && s.rope.len <= 60); E.release(s); step(s, 0.08); }
  }
  return { s, hata };
}
const sat = (ad, tarz, p) => {
  let sn = [], m = [], olu = 0, hata = 0;
  for (let sd = 1; sd <= TOHUM; sd++) { const o = oyna(sd, tarz, p); sn.push(o.s.t); m.push(E.meters(o.s)); if (o.s.status === 'dead') olu++; hata += o.hata; }
  sn.sort((a, b) => a - b); m.sort((a, b) => a - b);
  const orta = a => a[a.length >> 1];
  const dk = x => x >= MAXT ? MAXT / 60 + '+ dk' : Math.floor(x / 60) + ':' + String(Math.round(x % 60)).padStart(2, '0');
  console.log(`${ad.padEnd(26)} yandı ${olu}/${TOHUM}, süre (ortanca) ${dk(orta(sn))}, metre (ortanca) ${orta(m)}, koşu başına hata ${(hata / TOHUM).toFixed(1)}`);
};
const ayar = process.env.SU ? JSON.parse(process.env.SU) : null;
if (ayar) { const eski = G.createEndless; G.createEndless = (sd, k) => { const d = eski(sd, k); Object.assign(d.suTakip, ayar); return d; }; }
console.log('Su: ' + JSON.stringify(G.createEndless(1).suTakip));
for (const p of [0, 0.05, 0.1]) sat('temkinli, hata %' + Math.round(p * 100), 'temkinli', p);
for (const p of [0, 0.05, 0.1, 0.2]) sat('akış, hata %' + Math.round(p * 100), 'akis', p);
sat('spam (sıralı sol-sağ)', 'spam', 0);
