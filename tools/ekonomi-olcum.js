// Ekonomi ölçümü: sanal oyuncular saatte ve tipik bir günde kaç ateşböceği kazanır? Fiyatlar buna göre.
//   node tools/ekonomi-olcum.js
// Bölümler: yalnızca ilk kez alınan ateşböceği ödenir (bölüm başına en çok 3). Sonsuz: toplanan her ateşböceği.
// İnsan temposu: bölüm başına bot süresinin 3 katı + 10 sn menü/sonuç kartı; Sonsuz'da tempo.js'teki tepki süreleri.
const E = require('../js/engine.js');
const G = require('../js/gen.js');
const LEVELS = require('../js/levels.js');
const EKO = require('../js/ekonomi.js');
const C = E.CFG;
function runFor(s, sec, until) { for (let i = 0; i < Math.round(sec / C.DT); i++) { E.step(s); if (s.status !== 'play') return; if (until && until()) return; } }
const speed = p => Math.hypot(p.x - p.px, p.y - p.py) / C.DT;
const springApex = s => !s.rope && !s.hook && s.springs > 0 && s.p.y - s.p.py > -0.4;
const ok = x => x.kind !== 'none';
const ringAt = (s, a) => s.rings.find(r => Math.hypot(r.x - a.x, r.y - a.y) < 3);

// tarz: 'rahat' (yukarıdakini seçer, ateşböceğine bakmaz) ya da 'ates' (ateşböceği gösteren işareti seçer)
function play(def, tarz, react, maxT) {
  const s = E.createSim(def);
  let boxDone = !(def.boxes && def.boxes.length);
  while (s.status === 'play' && s.t < maxT) {
    if (!boxDone && s.rope && s.rope.kind === 'anchor') {
      const b = s.boxes[0]; E.release(s); E.press(s, b.x, b.y); runFor(s, 0.6, () => s.rope || !s.hook);
      runFor(s, 1.2); E.release(s); runFor(s, 1.0); boxDone = true; continue;
    }
    const L = E.aim(s, 0.25), R = E.aim(s, 0.75);
    const ff = a => ok(a) && ringAt(s, a) && ringAt(s, a).ff && !ringAt(s, a).got;
    let pick = (L.rescue || R.rescue) ? (L.rescue ? L : R)
      : tarz === 'ates' && ff(L) ? L : tarz === 'ates' && ff(R) ? R
      : ok(L) && ok(R) ? (L.y <= R.y ? L : R) : ok(L) ? L : ok(R) ? R : null;
    if (!pick) { runFor(s, 0.3); continue; }
    E.release(s);
    E.press(s, pick.x, pick.y, { rescue: !!pick.rescue });
    runFor(s, 0.8, () => s.rope || !s.hook);
    if (s.status !== 'play') break;
    runFor(s, 1.6, () => (s.rope && s.rope.len <= C.MIN_LEN + 0.01 && speed(s.p) < 120) || springApex(s));
    runFor(s, react);
  }
  return s;
}

const lines = [];
for (const [ad, tarz, react] of [['ortalama', 'rahat', 0.9], ['ateşböceği avcısı', 'ates', 0.5]]) {
  // bölümler: 1..40 sırayla, ilk geçiş
  let ff = 0, sure = 0, gecilen = 0;
  for (let n = 1; n <= 40; n++) {
    const def = n <= LEVELS.length ? LEVELS[n - 1] : G.createLevel(n);
    const s = play(def, tarz, react, 120);
    if (s.status === 'won') gecilen++;
    ff += E.fireflyCount(s);
    sure += s.t * 1.0 + 10; // tepki zaten süreye dahil; +10 sn menü ve sonuç kartı
  }
  const bolumSaat = ff / (sure / 3600);
  // sonsuz: 5 koşu
  let sff = 0, ssure = 0, sm = 0;
  for (let seed = 1; seed <= 5; seed++) {
    const s = play(G.createEndless(seed), tarz, react, 600);
    sff += E.fireflyCount(s); ssure += s.t + 8; sm += E.meters(s);
  }
  const sonsuzSaat = sff / (ssure / 3600);
  lines.push({ ad, bolum: `${gecilen}/40 bölüm, ${ff} ateşböceği, ${(sure / 60).toFixed(0)} dk → saatte ${bolumSaat.toFixed(0)}`,
    sonsuz: `koşu başına ${(sff / 5).toFixed(1)} ateşböceği (${(sm / 5).toFixed(0)} m, ${(ssure / 5).toFixed(0)} sn) → saatte ${sonsuzSaat.toFixed(0)}`,
    gun: Math.round(bolumSaat / 6 + sonsuzSaat / 6) });
}
const gorev = EKO.GOREV_ATES.reduce((a, b) => a + b, 0), giris = EKO.GIRIS.reduce((a, b) => a + b, 0) / EKO.GIRIS.length;
lines.forEach(l => {
  console.log(`[${l.ad}]`);
  console.log('  bölümler: ' + l.bolum);
  console.log('  sonsuz:   ' + l.sonsuz);
  const gunluk = l.gun + gorev + Math.round(giris);
  console.log(`  tipik gün (10 dk bölüm + 10 dk sonsuz, 3 görev ${gorev}, giriş ort. ${giris.toFixed(0)}): ~${gunluk} ateşböceği, videolarla ~${gunluk + gorev + Math.round(giris)}`);
});
const fiyatlar = EKO.KATALOG.filter(i => i.fiyat > 0).map(i => i.fiyat).sort((a, b) => a - b);
const toplam = fiyatlar.reduce((a, b) => a + b, 0);
console.log(`Dolap: ${fiyatlar.length} ürün, en ucuz ${fiyatlar[0]}, en pahalı ${fiyatlar[fiyatlar.length - 1]}, hepsi ${toplam} ateşböceği`);
