// Kuyu doğrulama botu: seviyeleri gerçek fizikle oynar.
//   node tools/bot.js            el yapımı bölümler + üretilen 7..80 + sonsuz mod
//   node tools/bot.js 3 --trace  tek bölüm, ayrıntılı
//   node tools/bot.js --gen 200  üretilen bölümleri 7..200 arası dene
//   IZ_TOHUM=8 IZ_TARZ=rahat node tools/bot.js --gen 7   sonsuz kuyuda bir tohumu adım adım yazdır
const E = require('../js/engine.js');
const LEVELS = require('../js/levels.js');
const G = require('../js/gen.js');
const NOT = require('../js/notlar.js');
const C = E.CFG;
const args = process.argv.slice(2);
const trace = args.includes('--trace');
const only = args[0] && /^\d+$/.test(args[0]) ? +args[0] : null;
const genMax = args.includes('--gen') ? +args[args.indexOf('--gen') + 1] : 80;

// Yay halkası fırlattıysa oyuncu tepe noktasında sıradakine dokunur.
const springApex = s => !s.rope && !s.hook && s.springs > 0 && s.p.y - s.p.py > -0.4;
// Rota sabit koordinat tutar; sarkaç halkaysa kanca onun o anki yerine atılır.
// Sarkaç menzil dışındaysa (uzak uçta) menzile girene kadar beklenir: gerçek oyuncu da bekler.
function liveTarget(s, x, y) {
  const r = s.rings.find(g => g.sw && g.sw.px === x && Math.abs(g.sw.py + C.SARKAC_L - y) < 1);
  return r ? { x: r.x, y: r.y, ring: r } : { x, y };
}
// Hedef (sarkaç ya da sarkaçta sallanırken uzak kalan halka) menzile girene kadar bekle; ip bırakılmaz.
function waitReach(s, x, y) {
  if (!s.rope || s.rope.kind !== 'anchor') return;
  if (!(s.rope.ref && s.rope.ref.sw) && !liveTarget(s, x, y).ring) return; // yalnızca sarkaçla ilgili adımlar
  for (let k = 0; k < 400 && s.status === 'play'; k++) {
    const t = liveTarget(s, x, y);
    const seen = !t.ring || E.reachable(s, { x: t.x, y: t.y, kind: 'ring', ref: t.ring }, E.currentIgnore(s));
    if (Math.hypot(t.x - s.p.x, t.y - s.p.y) < C.HOOK_MAX - 30 && seen) return;
    E.step(s);
  }
}
function pressAt(s, x, y) {
  let t = liveTarget(s, x, y);
  if (t.ring) {
    for (let k = 0; k < 400 && s.status === 'play'; k++) {
      t = liveTarget(s, x, y);
      if (Math.hypot(t.x - s.p.x, t.y - s.p.y) < C.HOOK_MAX - 30 && E.reachable(s, { x: t.x, y: t.y, kind: 'ring', ref: t.ring }, E.currentIgnore(s))) break;
      E.step(s);
    }
  }
  E.press(s, t.x, t.y);
}
function runFor(s, sec, until) {
  const n = Math.round(sec / C.DT);
  for (let i = 0; i < n; i++) {
    E.step(s);
    if (s.status !== 'play') return true;
    if (until && until()) return true;
  }
  return false;
}
const speed = p => Math.hypot(p.x - p.px, p.y - p.py) / C.DT;

// style: 'rahat' her noktada asılıp durulur; 'akis' ip tam sarılmadan sıradakine atılır
function play(def, style, route) {
  route = route || def.route;
  const s = E.createSim(def);
  const log = [];
  let prevKey = '';
  for (const [i, a] of route.entries()) {
    if (s.status !== 'play') break;
    const key = a.slice(1, 3).join(',');
    if (style === 'akis' && key === prevKey) continue;
    prevKey = key;
    const tag = `#${i} ${a.join(' ')}`;
    if (a[0] === 'wait') { runFor(s, a[1]); continue; }
    if (a[0] === 'box') {
      const b = s.boxes[a[1]];
      E.release(s); E.press(s, b.x, b.y);
      runFor(s, 0.6, () => s.rope || !s.hook);
      if (!s.rope || s.rope.kind !== 'box') return { ok: false, s, log, why: `${tag}: kutu tutulamadı` };
      runFor(s, 1.2); E.release(s); runFor(s, 1.0);
      log.push(`${tag} -> kutu (${b.x.toFixed(0)},${b.y.toFixed(0)}) kapı ${s.gatesOpen ? 'açık' : 'KAPALI'}`);
      continue;
    }
    const [kind, x, y, relLen] = a;
    const asFling = kind === 'fling' && style !== 'akis'; // akış koşusunda fırlama noktaları normal tutunma
    waitReach(s, x, y);
    if (style !== 'akis') E.release(s);
    pressAt(s, x, y);
    runFor(s, 0.6, () => s.rope || !s.hook);
    for (let k = 0; k < 3 && !s.rope && style === 'akis' && s.status === 'play'; k++) { // akış koptu: düşerken yeniden dene
      E.release(s); runFor(s, 0.3); pressAt(s, x, y); runFor(s, 0.6, () => s.rope || !s.hook);
      log.push(`${tag} -> akış koptu, yeniden denendi`);
    }
    if (s.status === 'won') { log.push(`${tag} -> KAZANDI t=${s.t.toFixed(2)}s`); break; }
    if (!s.rope) return { ok: false, s, log, why: `${tag}: tutunamadı (oyuncu ${s.p.x.toFixed(0)},${s.p.y.toFixed(0)}, mesafe ${Math.hypot(x - s.p.x, y - s.p.y).toFixed(0)})` };
    const okSw = s.rope.ref && s.rope.ref.sw && s.rope.ref.sw.px === x && Math.abs(s.rope.ref.sw.py + C.SARKAC_L - y) < 1;
    if (s.rope.kind === 'anchor' && !okSw && Math.hypot(s.rope.x - x, s.rope.y - y) > 20) return { ok: false, s, log, why: `${tag}: yanlış yere tutundu (${s.rope.x.toFixed(0)},${s.rope.y.toFixed(0)})` };
    if (asFling) {
      runFor(s, 1.0, () => s.rope.len <= relLen);
      E.release(s);
      const pts = [];
      runFor(s, 0.45, () => { pts.push([s.p.x, s.p.y]); return false; });
      const apex = pts.reduce((m, q) => (q[1] < m[1] ? q : m), pts[0] || [0, 0]);
      log.push(`${tag} -> fırladı, tepe (${apex[0].toFixed(0)},${apex[1].toFixed(0)})`);
      continue;
    }
    if (style === 'akis') {
      // tam sarılmadan, ip 70 birime inince sıradakine geç
      runFor(s, 1.2, () => s.rope && s.rope.len <= 70);
      log.push(`${tag} -> akış x${s.combo} (${s.p.x.toFixed(0)},${s.p.y.toFixed(0)})`);
    } else {
      runFor(s, 1.6, () => (s.rope && s.rope.len <= C.MIN_LEN + 0.01 && speed(s.p) < 120) || springApex(s));
      log.push(`${tag} -> asılı (${s.p.x.toFixed(0)},${s.p.y.toFixed(0)}) t=${s.t.toFixed(2)}`);
    }
  }
  if (s.status === 'dead') return { ok: false, s, log, why: 'öldü: ' + s.events.filter(e => e.type === 'dead').map(e => e.why).join() };
  return { ok: s.status === 'won', s, log, why: s.status === 'won' ? '' : 'kovaya ulaşmadı' };
}

let allOk = true;
function report(def, r, needFF) {
  const ff = E.fireflyCount(r.s);
  const ffOk = ff >= needFF;
  if (!r.ok || !ffOk) allOk = false;
  return { ff, ffOk };
}

// Nişan yardımıyla akış kuran oyuncu (rota bilmez): ezbere akış rotası itişlerle (alev, TAM) kayarsa yedek ölçüt.
function akisNisanla(def) {
  let en = 0, won = false;
  for (const bek of [50, 70, 90]) {
    const s = E.createSim(def); let box = !(def.boxes && def.boxes.length);
    while (s.status === 'play' && s.t < 60) {
      if (!box && s.rope && s.rope.kind === 'anchor') { const b = s.boxes[0]; E.release(s); E.press(s, b.x, b.y); runFor(s, 0.6, () => s.rope || !s.hook); runFor(s, 1.2); E.release(s); runFor(s, 1.0); box = true; continue; }
      const L = E.aim(s, 0.25), R = E.aim(s, 0.75), ok = a => a.kind !== 'none';
      const p = (L.rescue || R.rescue) ? (L.rescue ? L : R) : ok(L) && ok(R) ? (L.y <= R.y ? L : R) : ok(L) ? L : ok(R) ? R : null;
      if (!p) { runFor(s, 0.2); continue; }
      E.release(s); E.press(s, p.x, p.y, { rescue: !!p.rescue, keep: !!p.miss });
      runFor(s, 0.8, () => (s.rope && !s.hook) || !s.hook); if (p.miss) { runFor(s, 0.3); continue; }
      runFor(s, 1.2, () => s.rope && s.rope.len <= bek);
    }
    if (s.status === 'won') { won = true; en = Math.max(en, s.maxCombo); }
  }
  return { won, max: en };
}

// 1) El yapımı bölümler
if (!args.includes('--gen') || only) {
  console.log('== El yapımı bölümler ==');
  for (const def of LEVELS) {
    if (only && def.id !== only) continue;
    const a = play(def, 'rahat');
    const c = play(def, 'rahat', def.ffRoute);
    const ffTotal = c.s.fireflies.length;
    const ff = E.fireflyCount(c.s);
    if (!a.ok || !c.ok || ff < ffTotal) allOk = false;
    const b = play(def, 'akis');
    let bYedek = '';
    if (!b.ok) { const y = akisNisanla(def); if (y.won && y.max >= def.flow) bYedek = ` (nişanla akış: GEÇTİ x${y.max})`; else allOk = false; }
    console.log(`${def.id}. ${def.name.padEnd(15)} rahat: ${a.ok ? 'GEÇTİ' : 'KALDI'} ${a.s.t.toFixed(1)}s atış ${a.s.shots} (es geçince ateşböceği ${E.fireflyCount(a.s)}) | ateşböceği rotası: ${c.ok ? 'GEÇTİ' : 'KALDI'} ${ff}/${ffTotal} ${c.why || a.why || ''}` +
      ` | akış: ${b.ok ? 'GEÇTİ' : 'KALDI'} ${b.s.t.toFixed(1)}s atış ${b.s.shots} en iyi akış x${b.s.maxCombo} ${b.why || ''}` +
      `${bYedek} | hedef: par ${def.par} akış x${def.flow}`);
    if (trace || !a.ok) a.log.forEach(l => console.log('   ' + l));
    if (trace || !b.ok) b.log.forEach(l => console.log('   ~ ' + l));
    if (b.ok && b.s.maxCombo < def.flow) { allOk = false; console.log(`   ! akış hedefi x${def.flow} bot ile ulaşılamıyor (x${b.s.maxCombo})`); }
  }
}

// 1b) Bekçinin notları: ateşböceği rotası notun iliştiği halkayı almalı
if (!only) {
  let notOk = 0;
  for (const n of NOT.NOTLAR) {
    const def = n.bolum <= LEVELS.length ? LEVELS[n.bolum - 1] : G.createLevel(n.bolum);
    const h = NOT.halka(def);
    const c = h ? play(def, 'rahat', def.ffRoute) : null;
    const rg = c && c.s.rings.find(r => r.ff && r.x === h[0] && r.y === h[1]);
    if (rg && rg.got && c.ok) notOk++;
    else { allOk = false; console.log(`! Not ${n.no} (${n.bolum}. bölüm): ${h ? 'ateşböceği rotası halkayı almıyor' : 'ateşböceği halkası yok'}`); }
  }
  console.log(`
== Bekçinin notları: ${notOk}/${NOT.NOTLAR.length} ateşböceği rotasıyla alınıyor ==
`);
}

// 1c) Fırlatma yolları: B1'de asılıyken B2 hiç menzilde olmamalı; akışla bırakınca uçarken menzile girip tutunulmalı
function dalDene(def) {
  const R = def.dalRoute, i = R.findIndex((st, k) => st !== def.route[k]); // B1'in rotadaki yeri
  const b1 = R[i], b2 = R[i + 1];
  const ring = (s, st) => s.rings.find(g => g.x === st[1] && g.y === st[2]);
  // a) asılı: rotayı B1'e kadar rahat izle, B1'e tutun, 2 sn salın; B2 menzilde mi?
  let s = E.createSim(def);
  for (let k = 0; k < i && s.status === 'play'; k++) { const st = R[k]; waitReach(s, st[1], st[2]); E.release(s); pressAt(s, st[1], st[2]); runFor(s, 0.6, () => s.rope || !s.hook); runFor(s, 1.6, () => (s.rope && s.rope.len <= C.MIN_LEN + 0.01 && speed(s.p) < 120) || springApex(s)); }
  E.release(s); pressAt(s, b1[1], b1[2]); runFor(s, 0.6, () => s.rope || !s.hook);
  const r2 = ring(s, b2), tutB1 = s.rope && s.rope.ref === ring(s, b1);
  let asiliGorur = false;
  const menzil = (s, g) => Math.hypot(g.x - s.p.x, g.y - s.p.y) <= C.HOOK_MAX - 6 && E.reachable(s, { x: g.x, y: g.y, kind: 'ring', ref: g }, E.currentIgnore(s));
  if (tutB1) for (let t = 0; t < 240 && s.status === 'play'; t++) { E.step(s); if (s.rope && s.rope.len <= C.MIN_LEN + 0.5 && menzil(s, r2)) { asiliGorur = true; break; } }
  // b) akış: aynı yerden B1'e tutun, halkaya varmak üzereyken bırak (akış penceresindeki birkaç an denenir), uçarken B2 menzile girince bas
  let akisTutar = false;
  for (const kala of [50, 30, 70, 100]) {
    s = E.createSim(def);
    for (let k = 0; k < i && s.status === 'play'; k++) { const st = R[k]; waitReach(s, st[1], st[2]); E.release(s); pressAt(s, st[1], st[2]); runFor(s, 0.6, () => s.rope || !s.hook); runFor(s, 1.6, () => (s.rope && s.rope.len <= C.MIN_LEN + 0.01 && speed(s.p) < 120) || springApex(s)); }
    E.release(s); pressAt(s, b1[1], b1[2]); runFor(s, 0.6, () => s.rope || !s.hook);
    runFor(s, 1.2, () => s.rope && s.rope.len <= C.MIN_LEN + kala); E.release(s);
    const r2b = ring(s, b2);
    for (let t = 0; t < 150 && s.status === 'play'; t++) {
      E.step(s);
      if (!s.hook && menzil(s, r2b)) { E.press(s, r2b.x, r2b.y); runFor(s, 0.5, () => s.rope || !s.hook); akisTutar = !!(s.rope && s.rope.ref === r2b); break; }
    }
    if (akisTutar) break;
  }
  return { tutB1, asiliGorur, akisTutar };
}
if (!only) {
  let akisOk = 0, asiliYok = 0, toplam = 0; const sorun = [];
  for (let n = 8; n <= genMax; n++) {
    const def = G.createLevel(n);
    if (!def.dalRoute) continue;
    toplam++;
    const d = dalDene(def);
    if (!d.tutB1) { sorun.push(`${n}: B1'e tutunulamadı`); continue; }
    if (d.akisTutar) akisOk++; else sorun.push(`${n}: akışla B2'ye ulaşılamadı`);
    if (!d.asiliGorur) asiliYok++; else sorun.push(`${n}: asılıyken B2 menzilde`);
  }
  console.log(`== Fırlatma yolları: ${toplam} bölümde; akışla B2'ye ulaşılan ${akisOk}, asılıyken ulaşılamayan ${asiliYok} ==`);
  sorun.forEach(l => console.log('  ' + l));
  if (akisOk < toplam || asiliYok < toplam) allOk = false;
}

// 1d) Sonsuz Kuyu fırlatma yolları: ana yol asılarak izlenir; ayrımda B1'de asılıyken B2 menzil dışı, akışla ulaşılır
function sonsuzDalDene(seed, kural) {
  const sonuc = [];
  const def0 = G.createEndless(seed, kural); const s0 = E.createSim(def0); s0.p.y = -1500 * 20; def0.extend(s0);
  for (const d of def0.dallar.filter(x => x.i <= 60)) {
    const menzil = (s, g) => Math.hypot(g.x - s.p.x, g.y - s.p.y) <= C.HOOK_MAX - 6 && E.reachable(s, { x: g.x, y: g.y, kind: 'ring', ref: g }, E.currentIgnore(s));
    const karara = () => {
      const def = G.createEndless(seed, kural), s = E.createSim(def);
      for (let k = 0; k < d.i && s.status === 'play'; k++) {
        if (!def.path[k]) runFor(s, 0.2);
        const t = G.target(def.path[k]); waitReach(s, t.x, t.y); E.release(s); pressAt(s, t.x, t.y);
        runFor(s, 0.6, () => s.rope || !s.hook); runFor(s, 1.6, () => (s.rope && s.rope.len <= C.MIN_LEN + 0.01 && speed(s.p) < 120) || springApex(s));
      }
      if (s.status !== 'play') return null;
      E.release(s); pressAt(s, d.b1[0], d.b1[1]); runFor(s, 0.6, () => s.rope || !s.hook);
      const g1 = s.rings.find(g => g.firlat && g.x === d.b1[0] && g.y === d.b1[1]);
      return s.rope && s.rope.ref === g1 ? s : null;
    };
    let s = karara();
    if (!s) { sonuc.push({ d, sorun: "B1'e tutunulamadı" }); continue; }
    let g2 = s.rings.find(g => g.dal && g.x === d.b2[0] && g.y === d.b2[1]), asili = false;
    for (let t = 0; t < 240 && s.status === 'play'; t++) { E.step(s); if (s.rope && s.rope.len <= C.MIN_LEN + 0.5 && menzil(s, g2)) { asili = true; break; } }
    let akis = false;
    for (const kala of [50, 30, 70, 100]) {
      s = karara(); if (!s) break;
      runFor(s, 1.2, () => s.rope && s.rope.len <= C.MIN_LEN + kala); E.release(s);
      g2 = s.rings.find(g => g.dal && g.x === d.b2[0] && g.y === d.b2[1]);
      for (let t = 0; t < 150 && s.status === 'play'; t++) { E.step(s); if (!s.hook && menzil(s, g2)) { E.press(s, g2.x, g2.y); runFor(s, 0.5, () => s.rope || !s.hook); akis = !!(s.rope && s.rope.ref === g2); break; } }
      if (akis) break;
    }
    sonuc.push({ d, asili, akis });
  }
  return sonuc;
}
if (!only) {
  let top = 0, akisOk = 0, asiliYok = 0; const sorun = [];
  for (const [seed, kural] of [[1], [2], [3], [4], [5, G.KURALLAR[0]], [6, G.KURALLAR[3]]]) {
    for (const r of sonsuzDalDene(seed, kural)) {
      top++;
      if (r.sorun) { sorun.push(`tohum ${seed} düğüm ${r.d.i}: ${r.sorun}`); continue; }
      if (r.akis) akisOk++; else sorun.push(`tohum ${seed} düğüm ${r.d.i}: akışla B2'ye ulaşılamadı`);
      if (!r.asili) asiliYok++; else sorun.push(`tohum ${seed} düğüm ${r.d.i}: asılıyken B2 menzilde`);
    }
  }
  console.log(`== Sonsuz fırlatma yolları (1500 m'ye kadar): ${top}; akışla ulaşılan ${akisOk}, asılıyken ulaşılamayan ${asiliYok} ==`);
  sorun.forEach(l => console.log('  ' + l));
  if (akisOk < top || asiliYok < top) allOk = false;
}

// 2) Üretilen bölümler
if (!only) {
  console.log(`\n== Üretilen bölümler 7..${genMax} ==`);
  let fail = 0, flowMiss = 0, ffLow = 0;
  for (let n = 7; n <= genMax; n++) {
    const def = G.createLevel(n);
    const a = play(def, 'rahat');
    const b = play(def, 'akis');
    const c = play(def, 'rahat', def.ffRoute);
    const ff = E.fireflyCount(c.s);
    if (!c.ok) { fail++; allOk = false; console.log(`${n} ${def.name}: ateşböceği rotası KALDI ${c.why}`); }
    if (!a.ok) { fail++; allOk = false; console.log(`${n} ${def.name}: rahat KALDI ${a.why}`); if (trace) a.log.forEach(l => console.log('   ' + l)); }
    if (!b.ok) { console.log(`${n} ${def.name}: akış KALDI ${b.why}`); }
    if (b.ok && b.s.maxCombo < def.flow) flowMiss++;
    if (ff < c.s.fireflies.length - (def.dalB2 ? 1 : 0)) ffLow++; // fırlatma yolunun ateşböceği akış ister, asılarak alınmaz
    if (n <= 9 || n % 20 === 0) console.log(`${n} ${def.name.padEnd(18)} H=${def.H} su=${def.water ? def.water.toFixed(0) : 0} rahat ${a.ok ? 'GEÇTİ' : 'KALDI'} ${a.s.t.toFixed(1)}s ateşböceği ${ff}/${c.s.fireflies.length}${def.dalB2 ? ' (+1 fırlatma yolunda)' : ''} | akış ${b.ok ? 'GEÇTİ' : 'KALDI'} x${b.s.maxCombo} (hedef x${def.flow}, par ${def.par})`);
  }
  console.log(`Sonuç: ${genMax - 6} bölüm, rahat koşuda kalan ${fail}, akış hedefi tutmayan ${flowMiss}, ateşböceği rotasında hepsini alamayan ${ffLow}`);
  if (ffLow) allOk = false;
  if (flowMiss) allOk = false;
}

// 3) Sonsuz mod
if (!only) {
  console.log('\n== Sonsuz kuyu ==');
  // Günlük Kuyu'nun kuralları da: her kural 4 tohumla, rahat tarzda 1500 m'ye çıkılabilmeli
  const turlar = [['rahat', null, 8], ['akis', null, 8]].concat(G.KURALLAR.map(k => ['rahat', k, 4]));
  for (const [style, kural, tohum] of turlar) {
    const res = [];
    for (let seed = 1; seed <= tohum; seed++) {
      const def = G.createEndless(seed, kural || undefined);
      const s = E.createSim(def);
      let i = 0, why = '';
      while (s.status === 'play' && s.t < 240) {
        const n = def.path[i];
        if (!n) { runFor(s, 0.1); continue; }
        const t = G.target(n);
        waitReach(s, t.x, t.y);
        if (style !== 'akis') E.release(s);
        pressAt(s, t.x, t.y);
        runFor(s, 0.6, () => s.rope || !s.hook);
        if (!s.rope && s.status === 'play') { E.release(s); runFor(s, 0.35); pressAt(s, t.x, t.y); runFor(s, 0.6, () => s.rope || !s.hook); }
        if (!s.rope) { why = `tutunamadı #${i}`; break; }
        if (+process.env.IZ_TOHUM === seed && process.env.IZ_TARZ === style) console.log(`  #${i} t=${s.t.toFixed(2)} hedef (${t.x.toFixed(0)},${t.y.toFixed(0)}) ip (${s.rope.x.toFixed(0)},${s.rope.y.toFixed(0)})${s.rope.ref && s.rope.ref.sw ? ' SARKAÇ' : ''} oyuncu (${s.p.x.toFixed(0)},${s.p.y.toFixed(0)}) su ${s.water != null ? (s.water - s.p.y).toFixed(0) : '-'}`);
        if (style === 'akis') runFor(s, 1.2, () => s.rope && s.rope.len <= 70);
        else runFor(s, 1.6, () => (s.rope && s.rope.len <= C.MIN_LEN + 0.01 && speed(s.p) < 120) || springApex(s));
        i++;
        if (E.meters(s) > 1500) break;
      }
      if (s.status === 'dead') why = 'öldü: ' + s.events.filter(e => e.type === 'dead').map(e => e.why).join();
      if (kural && E.meters(s) < 1500) allOk = false;
      res.push(`tohum ${seed}: ${E.meters(s)} m, puan ${E.score(s)}, en iyi akış x${s.maxCombo}, ${s.t.toFixed(0)} sn${why ? ' (' + why + ')' : ''}`);
    }
    console.log(`[${style}${kural ? ' · ' + kural.ad : ''}]`); res.forEach(l => console.log('  ' + l));
  }
}
process.exit(allOk ? 0 : 1);
