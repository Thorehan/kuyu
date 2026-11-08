// Kuyu doğrulama botu: seviyeleri gerçek fizikle oynar.
//   node tools/bot.js            el yapımı bölümler + üretilen 7..80 + sonsuz mod
//   node tools/bot.js 3 --trace  tek bölüm, ayrıntılı
//   node tools/bot.js --gen 200  üretilen bölümleri 7..200 arası dene
const E = require('../js/engine.js');
const LEVELS = require('../js/levels.js');
const G = require('../js/gen.js');
const C = E.CFG;
const args = process.argv.slice(2);
const trace = args.includes('--trace');
const only = args[0] && /^\d+$/.test(args[0]) ? +args[0] : null;
const genMax = args.includes('--gen') ? +args[args.indexOf('--gen') + 1] : 80;

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
function play(def, style) {
  const s = E.createSim(def);
  const log = [];
  let prevKey = '';
  for (const [i, a] of def.route.entries()) {
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
    if (style !== 'akis') E.release(s);
    E.press(s, x, y);
    runFor(s, 0.6, () => s.rope || !s.hook);
    for (let k = 0; k < 3 && !s.rope && style === 'akis' && s.status === 'play'; k++) { // akış koptu: düşerken yeniden dene
      E.release(s); runFor(s, 0.3); E.press(s, x, y); runFor(s, 0.6, () => s.rope || !s.hook);
      log.push(`${tag} -> akış koptu, yeniden denendi`);
    }
    if (s.status === 'won') { log.push(`${tag} -> KAZANDI t=${s.t.toFixed(2)}s`); break; }
    if (!s.rope) return { ok: false, s, log, why: `${tag}: tutunamadı (oyuncu ${s.p.x.toFixed(0)},${s.p.y.toFixed(0)}, mesafe ${Math.hypot(x - s.p.x, y - s.p.y).toFixed(0)})` };
    if (s.rope.kind === 'anchor' && Math.hypot(s.rope.x - x, s.rope.y - y) > 20) return { ok: false, s, log, why: `${tag}: yanlış yere tutundu (${s.rope.x.toFixed(0)},${s.rope.y.toFixed(0)})` };
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
      runFor(s, 1.6, () => s.rope && s.rope.len <= C.MIN_LEN + 0.01 && speed(s.p) < 120);
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

// 1) El yapımı bölümler
if (!args.includes('--gen') || only) {
  console.log('== El yapımı bölümler ==');
  for (const def of LEVELS) {
    if (only && def.id !== only) continue;
    const a = play(def, 'rahat');
    const { ff } = report(def, a, def.fireflies.length);
    const b = play(def, 'akis');
    if (!b.ok) allOk = false;
    console.log(`${def.id}. ${def.name.padEnd(15)} rahat: ${a.ok ? 'GEÇTİ' : 'KALDI'} ${a.s.t.toFixed(1)}s atış ${a.s.shots} ateşböceği ${ff}/3 ${a.why || ''}` +
      ` | akış: ${b.ok ? 'GEÇTİ' : 'KALDI'} ${b.s.t.toFixed(1)}s atış ${b.s.shots} en iyi akış x${b.s.maxCombo} ${b.why || ''}` +
      ` | hedef: par ${def.par} akış x${def.flow}`);
    if (trace || !a.ok) a.log.forEach(l => console.log('   ' + l));
    if (trace || !b.ok) b.log.forEach(l => console.log('   ~ ' + l));
    if (b.ok && b.s.maxCombo < def.flow) { allOk = false; console.log(`   ! akış hedefi x${def.flow} bot ile ulaşılamıyor (x${b.s.maxCombo})`); }
  }
}

// 2) Üretilen bölümler
if (!only) {
  console.log(`\n== Üretilen bölümler 7..${genMax} ==`);
  let fail = 0, flowMiss = 0, ffLow = 0;
  for (let n = 7; n <= genMax; n++) {
    const def = G.createLevel(n);
    const a = play(def, 'rahat');
    const b = play(def, 'akis');
    const ff = E.fireflyCount(a.s);
    if (!a.ok) { fail++; allOk = false; console.log(`${n} ${def.name}: rahat KALDI ${a.why}`); if (trace) a.log.forEach(l => console.log('   ' + l)); }
    if (!b.ok) { console.log(`${n} ${def.name}: akış KALDI ${b.why}`); }
    if (b.ok && b.s.maxCombo < def.flow) flowMiss++;
    if (ff < 2) ffLow++;
    if (n <= 9 || n % 20 === 0) console.log(`${n} ${def.name.padEnd(18)} H=${def.H} su=${def.water ? def.water.toFixed(0) : 0} rahat ${a.ok ? 'GEÇTİ' : 'KALDI'} ${a.s.t.toFixed(1)}s ateşböceği ${ff}/3 | akış ${b.ok ? 'GEÇTİ' : 'KALDI'} x${b.s.maxCombo} (hedef x${def.flow}, par ${def.par})`);
  }
  console.log(`Sonuç: ${genMax - 6} bölüm, rahat koşuda kalan ${fail}, akış hedefi tutmayan ${flowMiss}, ateşböceği < 2 olan ${ffLow}`);
  if (flowMiss) allOk = false;
}

// 3) Sonsuz mod
if (!only) {
  console.log('\n== Sonsuz kuyu ==');
  for (const style of ['rahat', 'akis']) {
    const res = [];
    for (let seed = 1; seed <= 8; seed++) {
      const def = G.createEndless(seed);
      const s = E.createSim(def);
      let i = 0, why = '';
      while (s.status === 'play' && s.t < 240) {
        const n = def.path[i];
        if (!n) { runFor(s, 0.1); continue; }
        const t = G.target(n);
        if (style !== 'akis') E.release(s);
        E.press(s, t.x, t.y);
        runFor(s, 0.6, () => s.rope || !s.hook);
        if (!s.rope && s.status === 'play') { E.release(s); runFor(s, 0.35); E.press(s, t.x, t.y); runFor(s, 0.6, () => s.rope || !s.hook); }
        if (!s.rope) { why = `tutunamadı #${i}`; break; }
        if (style === 'akis') runFor(s, 1.2, () => s.rope && s.rope.len <= 70);
        else runFor(s, 1.6, () => s.rope && s.rope.len <= C.MIN_LEN + 0.01 && speed(s.p) < 120);
        i++;
        if (E.meters(s) > 1500) break;
      }
      if (s.status === 'dead') why = 'öldü: ' + s.events.filter(e => e.type === 'dead').map(e => e.why).join();
      res.push(`tohum ${seed}: ${E.meters(s)} m, puan ${E.score(s)}, en iyi akış x${s.maxCombo}, ${s.t.toFixed(0)} sn${why ? ' (' + why + ')' : ''}`);
    }
    console.log(`[${style}]`); res.forEach(l => console.log('  ' + l));
  }
}
process.exit(allOk ? 0 : 1);
