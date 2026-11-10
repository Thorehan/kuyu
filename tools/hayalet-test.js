// Hayalet kaydı: kaydet → kodla → çöz → aynı zamanlarda aynı yer.
//   node tools/hayalet-test.js
const E = require('../js/engine.js');
const L = require('../js/levels.js');
const H = require('../js/hayalet.js');
const C = E.CFG;
let hata = 0;
const ok = (c, m) => { if (!c) { hata++; console.log('HATA: ' + m); } };

const def = L[2];
const s = E.createSim(def), k = H.yeni(s.startY);
const izi = [];
for (let i = 0; i < 2400 && s.status === 'play'; i++) {
  if (i === 30) E.press(s, 180, 1150);
  if (i === 140) { E.release(s); E.press(s, 90, 960); }
  E.step(s); H.ornekle(k, s);
  if (i % 37 === 0) izi.push({ t: s.t, x: s.p.x, y: s.p.y - s.startY });
}
const h = H.coz(H.kodla(k));
ok(h.pts.length === k.pts.length, 'nokta sayısı');
ok(h.pts.every((v, i) => v === k.pts[i]), 'kodla/çöz aynı değil');
let enFark = 0;
izi.forEach(z => { const p = H.yer(h, z.t); if (p) enFark = Math.max(enFark, Math.hypot(p.x - z.x, p.y - z.y)); });
ok(enFark < 40, 'ara değer çok uzak: ' + enFark.toFixed(1));
ok(H.yer(h, H.sure(k) + 1) === null, 'kayıt bitince yer null olmalı');
const bayt = H.kodla(k).length, sn = H.sure(k);
console.log(`süre ${sn.toFixed(1)} sn, ${k.pts.length / 2} nokta, ${bayt} bayt (${(bayt / sn).toFixed(0)} bayt/sn), en büyük ara değer farkı ${enFark.toFixed(1)} birim`);
console.log(hata ? hata + ' hata' : 'Tamam: hayalet kaydı');
process.exit(hata ? 1 : 0);
