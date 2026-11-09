// Tek el (telefon) kontrolüyle doğrulama: bot hedefin koordinatını bilmez, yalnızca ekranın
// solunu, ortasını ya da sağını seçer; kancanın nereye gideceğine oyunun nişan yardımı karar verir.
//   node tools/tekel.js            el yapımı + üretilen 7..60 + sonsuz
const E = require('../js/engine.js');
const LEVELS = require('../js/levels.js');
const G = require('../js/gen.js');
const C = E.CFG;
const trace = process.argv.includes('--trace');

function runFor(s, sec, until) {
  const n = Math.round(sec / C.DT);
  for (let i = 0; i < n; i++) { E.step(s); if (s.status !== 'play') return true; if (until && until()) return true; }
  return false;
}
const speed = p => Math.hypot(p.x - p.px, p.y - p.py) / C.DT;
// Oyuncunun gözüyle: hedef solumda mı, sağımda mı, tam üstümde mi?
function side(s, x) { const dx = x - s.p.x; return dx < -15 ? 0.2 : dx > 15 ? 0.8 : 0.5; }

// Oyuncu ekrandaki işaretlere bakar: hedefi turkuaz (sol) ya da sarı (sağ) işaret gösteriyorsa o yana dokunur.
function matches(a, x, y) {
  if (a.kind === 'none') return false;
  if (a.kind === 'wood') return Math.abs(a.x - x) < 6 && Math.abs(a.y - y) < 70;
  return Math.hypot(a.x - x, a.y - y) < 22;
}
function thumb(s, x, y) {
  const f = [0.2, 0.8].find(ff => matches(E.aim(s, ff), x, y));
  const a = E.aim(s, f != null ? f : side(s, x));
  E.press(s, a.x, a.y);
  runFor(s, 0.6, () => s.rope || !s.hook);
  if (!s.rope) return false;
  if (s.rope.kind === 'box') return Math.hypot(s.rope.box.x - x, s.rope.box.y - y) < 22;
  if (s.rope.target === 'wood') return Math.abs(s.rope.x - x) < 6 && Math.abs(s.rope.y - y) < 70; // aynı panel, başka yükseklik
  return Math.hypot(s.rope.x - x, s.rope.y - y) < 22;
}

function play(def, chain) {
  const s = E.createSim(def), log = [];
  let miss = 0, prevKey = '';
  for (const a of def.route) {
    if (s.status !== 'play') break;
    if (a[0] === 'wait') { runFor(s, a[1]); continue; }
    let x, y;
    if (a[0] === 'box') { x = s.boxes[a[1]].x; y = s.boxes[a[1]].y; }
    else { x = a[1]; y = a[2]; }
    const key = x + ',' + y;
    if (key === prevKey) continue; // fırlamadan sonra aynı noktaya geri dönülmez, sıradakine gidilir
    prevKey = key;
    if (!chain) E.release(s);
    let ok = thumb(s, x, y);
    for (let k = 0; k < 3 && !ok && s.status === 'play'; k++) { // yanlış yere gittiyse ya da tutunamadıysa: bırak, bir daha dene
      miss++;
      log.push(`  hedef (${x},${y}) için ${k + 1}. tekrar, oyuncu (${s.p.x.toFixed(0)},${s.p.y.toFixed(0)}) ip ${s.rope ? (s.rope.x || 0).toFixed(0) + ',' + (s.rope.y || 0).toFixed(0) : 'yok'}`);
      E.release(s); runFor(s, 0.25); ok = thumb(s, x, y);
    }
    if (s.status === 'won') break;
    if (!ok) return { ok: false, s, miss, log, why: `(${x},${y}) hedefine tek elle ulaşılamadı` };
    if (a[0] === 'box') { runFor(s, 1.2); E.release(s); runFor(s, 1.0); continue; }
    if (a[0] === 'fling' && !chain) { runFor(s, 1.0, () => s.rope.len <= a[3]); E.release(s); runFor(s, 0.45); continue; }
    if (chain) runFor(s, 1.2, () => s.rope && s.rope.len <= 70);
    else runFor(s, 1.6, () => s.rope && s.rope.len <= C.MIN_LEN + 0.01 && speed(s.p) < 120);
  }
  const why = s.status === 'dead' ? 'öldü: ' + s.events.filter(e => e.type === 'dead').map(e => e.why).join() : s.status === 'won' ? '' : 'kovaya ulaşmadı';
  return { ok: s.status === 'won', s, miss, log, why };
}

let bad = 0;
console.log('== El yapımı bölümler, tek el ==');
for (const def of LEVELS) {
  const a = play(def, false), b = play(def, true);
  if (!a.ok) bad++;
  console.log(`${def.id}. ${def.name.padEnd(15)} rahat: ${a.ok ? 'GEÇTİ' : 'KALDI'} tekrar ${a.miss} ateşböceği ${E.fireflyCount(a.s)}/3 ${a.why} | akış: ${b.ok ? 'GEÇTİ' : 'KALDI'} x${b.s.maxCombo} tekrar ${b.miss} ${b.why}`);
  if (trace || !a.ok) a.log.forEach(l => console.log(l));
}
console.log('\n== Üretilen 7..60, tek el ==');
let gFail = 0, gMiss = 0, gFlow = 0;
for (let n = 7; n <= 60; n++) {
  const def = G.createLevel(n);
  const a = play(def, false), b = play(def, true);
  gMiss += a.miss;
  if (!a.ok) { gFail++; bad++; console.log(`${n}: rahat KALDI ${a.why}`); if (trace) a.log.forEach(l => console.log(l)); }
  if (b.ok) gFlow++;
}
console.log(`Sonuç: 54 bölüm, rahat koşuda kalan ${gFail}, toplam tekrar ${gMiss}, akışla geçilen ${gFlow}/54`);

console.log('\n== Sonsuz kuyu, tek el ==');
for (const chain of [false, true]) {
  const res = [];
  for (let seed = 1; seed <= 6; seed++) {
    const def = G.createEndless(seed), s = E.createSim(def);
    let i = 0, miss = 0, why = '';
    while (s.status === 'play' && s.t < 200 && E.meters(s) < 1500) {
      const n = def.path[i]; if (!n) { runFor(s, 0.1); continue; }
      const t = G.target(n);
      if (!chain) E.release(s);
      let ok = thumb(s, t.x, t.y);
      for (let k = 0; k < 3 && !ok && s.status === 'play'; k++) { miss++; E.release(s); runFor(s, 0.25); ok = thumb(s, t.x, t.y); }
      if (!ok) { why = 'ulaşılamadı #' + i; break; }
      if (chain) runFor(s, 1.2, () => s.rope && s.rope.len <= 70);
      else runFor(s, 1.6, () => s.rope && s.rope.len <= C.MIN_LEN + 0.01 && speed(s.p) < 120);
      i++;
    }
    if (s.status === 'dead') why = 'öldü: ' + s.events.filter(e => e.type === 'dead').map(e => e.why).join();
    res.push(`tohum ${seed}: ${E.meters(s)} m, puan ${E.score(s)}, akış x${s.maxCombo}, tekrar ${miss}${why ? ' (' + why + ')' : ''}`);
  }
  console.log(chain ? '[akış]' : '[rahat]'); res.forEach(l => console.log('  ' + l));
}
process.exit(bad ? 1 : 0);
