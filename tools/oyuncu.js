// Gerçek oyuncu gibi tek elle oynayan bot: rota bilmez, yalnızca ekrandaki iki işarete bakar.
// Her adımda hangi işaret (sol turkuaz / sağ sarı) daha yukarıdaysa o yana dokunur, asılınca bir sonrakine geçer.
// "ateş" tarzı: işaretlerden biri ateşböceği halkasını gösteriyorsa o yana dokunur.
//   node tools/oyuncu.js
const E = require('../js/engine.js');
const LEVELS = require('../js/levels.js');
const G = require('../js/gen.js');
const C = E.CFG;

function runFor(s, sec, until) { for (let i = 0; i < Math.round(sec / C.DT); i++) { E.step(s); if (s.status !== 'play') return; if (until && until()) return; } }
const speed = p => Math.hypot(p.x - p.px, p.y - p.py) / C.DT;
function isFF(s, a) { return s.rings.some(r => r.ff && !r.got && Math.hypot(r.x - a.x, r.y - a.y) < 3); }

function play(def, style, maxT) {
  const s = E.createSim(def);
  let taps = 0, rescues = 0, boxDone = !(def.boxes && def.boxes.length);
  while (s.status === 'play' && s.t < (maxT || 60)) {
    // kutu bölümü: kutuyu düğmeye indirmek bir bulmaca adımı (bot route'tan alır)
    if (!boxDone && s.rope && s.rope.kind === 'anchor') {
      const b = s.boxes[0]; E.release(s); E.press(s, b.x, b.y); runFor(s, 0.6, () => s.rope || !s.hook);
      runFor(s, 1.2); E.release(s); runFor(s, 1.0); boxDone = true; continue;
    }
    const L = E.aim(s, 0.2), R = E.aim(s, 0.8);
    let pick;
    if (L.rescue || R.rescue) pick = L.rescue ? L : R;
    else if (style === 'ates' && L.kind !== 'none' && isFF(s, L)) pick = L;
    else if (style === 'ates' && R.kind !== 'none' && isFF(s, R)) pick = R;
    else if (L.kind === 'none') pick = R;
    else if (R.kind === 'none') pick = L;
    else pick = L.y <= R.y ? L : R;
    if (pick.kind === 'none') { runFor(s, 0.3); continue; }
    if (style !== 'akis') E.release(s);
    E.press(s, pick.x, pick.y, { rescue: !!pick.rescue });
    taps++; if (pick.rescue) rescues++;
    runFor(s, 0.8, () => s.rope || !s.hook);
    if (s.status !== 'play') break;
    if (style === 'akis') runFor(s, 1.2, () => s.rope && s.rope.len <= 70);
    else runFor(s, 1.6, () => s.rope && s.rope.len <= C.MIN_LEN + 0.01 && speed(s.p) < 120);
  }
  return { s, taps, rescues };
}

let bad = 0;
function line(name, r) {
  const s = r.s;
  return `${name.padEnd(22)} ${s.status === 'won' ? 'GEÇTİ' : s.status === 'dead' ? 'ÖLDÜ ' : 'TAKILDI'} ${s.t.toFixed(1)}s dokunuş ${r.taps} kurtarma ${r.rescues} ateşböceği ${E.fireflyCount(s)}/${s.fireflies.length} hız ${E.speedMs(s.maxSpeed).toFixed(0)} m/sn x${E.speedMult(s).toFixed(2)}`;
}
console.log('== El yapımı bölümler ==');
for (const def of LEVELS) {
  for (const st of ['yukari', 'ates', 'akis']) {
    const r = play(def, st);
    if (r.s.status !== 'won') bad++;
    console.log(line(`${def.id}. ${def.name} [${st}]`, r));
  }
}
console.log('\n== Üretilen 7..80 ==');
const sum = { yukari: [0, 0, 0], ates: [0, 0, 0], akis: [0, 0, 0] };
for (let n = 7; n <= 80; n++) {
  const def = G.createLevel(n);
  for (const st of ['yukari', 'ates', 'akis']) {
    const r = play(def, st);
    if (r.s.status === 'won') sum[st][0]++; else { bad++; console.log('  ' + line(`${n}. ${def.name} [${st}]`, r)); }
    sum[st][1] += E.fireflyCount(r.s); sum[st][2] += r.s.fireflies.length;
  }
}
for (const st of Object.keys(sum)) console.log(`[${st}] geçilen ${sum[st][0]}/74, ateşböceği ${sum[st][1]}/${sum[st][2]}`);
console.log('\n== Sonsuz kuyu ==');
for (const st of ['yukari', 'akis']) {
  const res = [];
  for (let seed = 1; seed <= 6; seed++) {
    const r = play(G.createEndless(seed), st, 150);
    res.push(`tohum ${seed}: ${E.meters(r.s)} m, puan ${E.finalScore(r.s)} (ham ${E.score(r.s)} x${E.speedMult(r.s).toFixed(2)}), kurtarma ${r.rescues}, ${r.s.status}`);
  }
  console.log(`[${st}]`); res.forEach(l => console.log('  ' + l));
}
process.exit(bad ? 1 : 0);
