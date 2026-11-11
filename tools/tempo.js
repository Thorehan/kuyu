// NOT (v0.48): Sonsuz Kuyu artık takip eden su kullanıyor (zamanla yükselmez); bu araç eski zamanlı su modelini ölçer.
// Sonsuz için: node tools/hata.js (hata yapan oyuncu modelleri, ne kadar dayandıkları ve neden yandıkları).
// Sonsuz Kuyu temposu: üç sanal oyuncu suya ne zaman yakalanıyor?
//   ortalama: her halkada tam asılır, sonra 0,9 sn düşünür (gerçek bir oyuncunun tepkisi)
//   iyi:      tam asılır, 0,35 sn sonra atar
//   usta:     ipi tam sarılmadan bırakıp zincirler (akış)
// Hepsi yalnızca ekrandaki sol/sağ işarete bakar; hız halkası gösteren işareti tercih eder.
//   node tools/tempo.js                     şu anki su ayarıyla
//   node tools/tempo.js 30 0.2 0.35 420     taban perM perS cap ile dene
const E = require('../js/engine.js');
const G = require('../js/gen.js');
const C = E.CFG;
const a = process.argv.slice(2).map(Number);
if (a.length === 4) G.ENDLESS_WATER = { base: a[0], perM: a[1], perS: a[2], cap: a[3] };
const W = G.ENDLESS_WATER;
const LIMIT = 1200; // 20 dk

// Yay halkası fırlattıysa oyuncu tepe noktasında sıradakine dokunur.
const springApex = s => !s.rope && !s.hook && s.springs > 0 && s.p.y - s.p.py > -0.4;
function runFor(s, sec, until) { for (let i = 0; i < Math.round(sec / C.DT); i++) { E.step(s); if (s.status !== 'play') return; if (until && until()) return; } }
const speed = p => Math.hypot(p.x - p.px, p.y - p.py) / C.DT;
const ok = x => x.kind !== 'none';

function run(seed, profile) {
  const s = E.createSim(G.createEndless(seed, process.env.KURAL ? G.KURALLAR.find(k => k.id === process.env.KURAL) : undefined));
  const react = profile === 'ortalama' ? 0.9 : profile === 'iyi' ? 0.35 : 0;
  while (s.status === 'play' && s.t < LIMIT) {
    const L = E.aim(s, 0.25), R = E.aim(s, 0.75);
    const hiz = x => ok(x) && s.rings.some(r => r.hiz && Math.hypot(r.x - x.x, r.y - x.y) < 3);
    let pick = (L.rescue || R.rescue) ? (L.rescue ? L : R) : hiz(L) ? L : hiz(R) ? R : (ok(L) && ok(R) ? (L.y <= R.y ? L : R) : ok(L) ? L : ok(R) ? R : null);
    if (!pick) { runFor(s, 0.3); continue; }
    if (profile !== 'usta') E.release(s);
    E.press(s, pick.x, pick.y, { rescue: !!pick.rescue });
    runFor(s, 0.8, () => s.rope || !s.hook);
    if (s.status !== 'play') break;
    if (profile === 'usta') runFor(s, 1.2, () => s.rope && s.rope.len <= 70);
    else { runFor(s, 1.6, () => (s.rope && s.rope.len <= C.MIN_LEN + 0.01 && speed(s.p) < 120) || springApex(s)); runFor(s, react); }
  }
  return { t: s.t, m: E.meters(s), score: E.finalScore(s), dead: s.status === 'dead' };
}
const med = arr => arr.slice().sort((x, y) => x - y)[Math.floor(arr.length / 2)];
const fmtT = t => t >= LIMIT ? '20 dk+' : `${Math.floor(t / 60)} dk ${String(Math.round(t % 60)).padStart(2, '0')} sn`;
console.log(`Su: taban ${W.base}, metre × ${W.perM}, saniye × ${W.perS}, en çok ${W.cap}`);
for (const prof of ['ortalama', 'iyi', 'usta']) {
  const rs = [1, 2, 3, 4, 5].map(seed => run(seed, prof));
  console.log(`  ${prof.padEnd(9)} yakalanma (ortanca) ${fmtT(med(rs.map(r => r.t)))}  [${rs.map(r => fmtT(r.t)).join(', ')}]  metre ${med(rs.map(r => r.m))}  puan ${med(rs.map(r => r.score))}`);
}
