// Karar ölçümü: hiç düşünmeden sağ-sol basan oyuncular, düşünerek oynayanla karşılaştırılır.
// Dokunuşlar gerçek zamanlı: bas, bir süre tut, bırak, bekle. Taraf seçimi oyuncunun tek kararıdır.
//   node tools/spam.js
const E = require('../js/engine.js');
const LEVELS = require('../js/levels.js');
const G = require('../js/gen.js');
const C = E.CFG;

function rng(seed) { let x = seed >>> 0 || 1; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296); }
function step(s, sec) { const n = Math.round(sec / C.DT); for (let i = 0; i < n && s.status === 'play'; i++) E.step(s); }
function tap(s, f) {
  const a = E.aim(s, f);
  E.press(s, a.x, a.y, { rescue: !!a.rescue, keep: !!a.miss });
  return a;
}
// Tarzlar: her biri (s, r, k) → { f: dokunulan yer 0..1, tut: sn, ara: sn }
const TARZ = {
  // ezbere: sırayla sol-sağ, kısa dokunuş
  sirali: (s, r, k) => ({ f: k % 2 ? 0.75 : 0.25, tut: 0.15, ara: 0.1 }),
  // ezbere: rastgele taraf, rastgele süre
  rastgele: (s, r) => ({ f: r() < 0.5 ? 0.25 : 0.75, tut: 0.08 + r() * 0.3, ara: 0.05 + r() * 0.2 }),
  // ezbere: sırayla sol-sağ, uzun tut (ipe sarılıp sonra bırak)
  siraliUzun: (s, r, k) => ({ f: k % 2 ? 0.75 : 0.25, tut: 0.5, ara: 0.05 }),
  // düşünerek: iki işarete bakar, daha yukarıdakini seçer; hedef yoksa beklemez, öbür tarafa basar
  dusunerek: (s) => { const L = E.aim(s, 0.25), R = E.aim(s, 0.75); const ok = a => a.kind !== 'none';
    const pick = ok(L) && ok(R) ? (L.y <= R.y ? 0.25 : 0.75) : ok(L) ? 0.25 : 0.75; return { f: pick, tut: 0.35, ara: 0.05 }; },
};

function oyna(def, tarz, seed, maxT) {
  const s = E.createSim(def), r = rng(seed); let k = 0, bos = 0, dok = 0;
  while (s.status === 'play' && s.t < maxT) {
    const p = TARZ[tarz](s, r, k++);
    const a = tap(s, p.f); dok++; if (a.miss) bos++;
    step(s, p.tut); E.release(s); step(s, p.ara);
  }
  return { s, dok, bos };
}

const ad = Object.keys(TARZ);
console.log('== Bölümler 1–76 (90 sn içinde) ==');
for (const t of ad) {
  let gecti = 0, sure = 0, ff = 0, ffT = 0, bos = 0, dok = 0;
  for (let n = 1; n <= 76; n++) {
    const def = n <= LEVELS.length ? LEVELS[n - 1] : G.createLevel(n);
    const o = oyna(def, t, n * 31, 90);
    if (o.s.status === 'won') { gecti++; sure += o.s.t; }
    ff += E.fireflyCount(o.s); ffT += o.s.fireflies.length; bos += o.bos; dok += o.dok;
  }
  console.log(`${t.padEnd(11)} geçti ${String(gecti).padStart(2)}/76  ort. süre ${(sure / Math.max(1, gecti)).toFixed(1)} sn  ateşböceği ${ff}/${ffT}  boş atış %${(bos / dok * 100).toFixed(0)}`);
}
console.log('\n== Sonsuz Kuyu (8 tohum) ==');
for (const t of ad) {
  let m = 0, sn = 0, ff = 0;
  for (let sd = 1; sd <= 8; sd++) { const o = oyna(G.createEndless(sd), t, sd * 7, 600); m += E.meters(o.s); sn += o.s.t; ff += E.fireflyCount(o.s); }
  console.log(`${t.padEnd(11)} ort. ${Math.round(m / 8)} m, yakalanma ${Math.round(sn / 8)} sn, ateşböceği ${(ff / 8).toFixed(1)}`);
}
