// Zorluk eğrisi ölçümü: hata yapan oyuncu modelleri bölümleri ve Sonsuz/Günlük/Haftalık Kuyu'yu oynar.
// Soru: zorluk bölüm numarasıyla ve yükseklikle artıyor mu, nerede düzleşiyor, nerede sıçrıyor?
//   node tools/denge.js            [deneme sayısı varsayılan 6]
//   node tools/denge.js 6 bolum    yalnız bölümler · sonsuz · haftalik
// Oyuncu modeli tools/hata.js ile aynı: iki işaretten yukarıdakini seçer; p olasılıkla hata yapar
// (yanlış tarafa basar ya da geç kalır). "temkinli" ipe sarılıp bekler, "akis" ipi erken bırakıp zincirler.
const E = require('../js/engine.js');
const G = require('../js/gen.js');
const LEVELS = require('../js/levels.js');
const C = E.CFG;
const N = +process.argv[2] || 6, NE = process.argv[3] || 'hepsi';
function rng(seed) { let x = seed >>> 0 || 1; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296); }
const step = (s, sec, u) => { for (let i = 0; i < Math.round(sec / C.DT) && s.status === 'play'; i++) { E.step(s); if (u && u()) return; } };
function bekle(s, f, a) { if (!a.bekle) return a; const son = s.t + C.BEKLE_SN; while (s.status === 'play') { E.step(s); a = E.aim(s, f); if (!a.bekle || s.t >= son || s.p.y - s.p.py >= 0) break; } return a; }
function iyiTaraf(s) {
  const L = E.aim(s, 0.25), R = E.aim(s, 0.75), y = a => (a.bekle || a).y, ok = a => (a.kind !== 'none' && !a.miss) || a.bekle;
  if (L.rescue || R.rescue) return L.rescue ? 0.25 : 0.75;
  return ok(L) && ok(R) ? (y(L) <= y(R) ? 0.25 : 0.75) : ok(L) ? 0.25 : ok(R) ? 0.75 : null;
}
function oyna(def, tarz, p, seed, maxT) {
  const s = E.createSim(def), r = rng(seed * 977 + Math.round(p * 1000) + 5); let hata = 0;
  let kutu = !(def.boxes && def.boxes.length);
  while (s.status === 'play' && s.t < maxT) {
    if (!kutu && s.rope && s.rope.kind === 'anchor') { // 4. bölümün bulmaca adımı
      const b = s.boxes[0]; E.release(s); E.press(s, b.x, b.y); step(s, 0.6, () => s.rope || !s.hook);
      step(s, 1.2); E.release(s); step(s, 1.0); kutu = true; continue;
    }
    let f = iyiTaraf(s);
    if (f == null) { step(s, 0.1); continue; }
    const havada = !s.rope;
    if (r() < p) { hata++; if (!havada || r() < 0.5) f = 1 - f; else step(s, 0.9); }
    const a = bekle(s, f, E.aim(s, f));
    if (tarz === 'temkinli' && !a.miss) E.release(s);
    E.press(s, a.x, a.y, { keep: !!a.miss, rescue: !!a.rescue });
    step(s, 0.8, () => (s.rope && !s.hook) || !s.hook);
    if (!s.rope || a.miss) { step(s, 0.3); continue; }
    if (tarz === 'temkinli') step(s, 1.6, () => (s.rope && s.rope.len <= C.MIN_LEN + 0.01 && Math.hypot(s.p.x - s.p.px, s.p.y - s.p.py) / C.DT < 120) || (!s.rope && !s.hook && s.springs > 0 && s.p.y - s.p.py > -0.4));
    else { step(s, 1.2, () => s.rope && s.rope.len <= 60); E.release(s); step(s, 0.08); }
    if (tarz === 'temkinli') step(s, 0.35); // insan tepki süresi
  }
  return { s, hata };
}
const orta = a => { const b = a.slice().sort((x, y) => x - y); return b[b.length >> 1]; };
const yuzde = (a, b) => (b ? Math.round(a / b * 100) : 0) + '%';

if (NE === 'hepsi' || NE === 'bolum') {
  console.log('== Bölümler: geçme oranı (ilk denemede, 90 sn içinde) ve süre ==');
  console.log('bölüm      düğüm  su   temkinli %10   temkinli %25   akış %10       süre (temkinli %10)');
  const bant = [[1, 6], [7, 16], [17, 26], [27, 36], [37, 46], [47, 56], [57, 66], [67, 76]];
  for (const [a, b] of bant) {
    let dug = 0, su = 0, g = [0, 0, 0], t = [], top = 0;
    for (let n = a; n <= b; n++) {
      const def = n <= LEVELS.length ? LEVELS[n - 1] : G.createLevel(n);
      dug += def.route ? def.route.length : 0; if (def.water || def.suTakip) su++;
      for (let k = 0; k < N; k++) {
        top++;
        const o1 = oyna(def, 'temkinli', 0.10, n * 100 + k, 90); if (o1.s.status === 'won') { g[0]++; t.push(o1.s.t); }
        if (oyna(def, 'temkinli', 0.25, n * 100 + k, 90).s.status === 'won') g[1]++;
        if (oyna(def, 'akis', 0.10, n * 100 + k, 90).s.status === 'won') g[2]++;
      }
    }
    const adet = b - a + 1;
    console.log(`${(a + '–' + b).padEnd(10)} ${(dug / adet).toFixed(0).padStart(4)}  ${String(su).padStart(2)}/${String(adet).padEnd(2)} ${yuzde(g[0], top).padStart(8)}       ${yuzde(g[1], top).padStart(8)}       ${yuzde(g[2], top).padStart(8)}       ${t.length ? orta(t).toFixed(1) : '–'} sn`);
  }
}

function sonsuzTablo(ad, kur, maxT) {
  console.log(`\n== ${ad}: hata oranına göre koşu (ortanca, ${N} tohum, en çok ${maxT / 60} dk) ==`);
  for (const [tarz, p] of [['temkinli', 0.05], ['temkinli', 0.10], ['temkinli', 0.20], ['akis', 0], ['akis', 0.05], ['akis', 0.10], ['akis', 0.20]]) {
    const sn = [], m = [], pu = []; let yandi = 0;
    for (let sd = 1; sd <= N; sd++) {
      const o = oyna(kur(sd), tarz, p, sd, maxT);
      sn.push(o.s.t); m.push(E.meters(o.s)); pu.push(E.finalScore(o.s)); if (o.s.status === 'dead') yandi++;
    }
    const dk = x => x >= maxT ? (maxT / 60) + '+ dk' : Math.floor(x / 60) + ':' + String(Math.round(x % 60)).padStart(2, '0');
    console.log(`${(tarz + ' %' + Math.round(p * 100)).padEnd(14)} yandı ${yandi}/${N}  süre ${dk(orta(sn)).padStart(6)}  metre ${String(orta(m)).padStart(6)}  puan ${String(orta(pu)).padStart(7)}`);
  }
}
if (NE === 'hepsi' || NE === 'sonsuz') sonsuzTablo('Sonsuz Kuyu', sd => G.createEndless(sd), 360);
if ((NE === 'hepsi' || NE === 'haftalik') && G.createHaftalik) sonsuzTablo('Haftalık Kuyu (yarış)', sd => G.createHaftalik(sd), 360);
