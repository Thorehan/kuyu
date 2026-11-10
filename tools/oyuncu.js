// Gerçek oyuncu gibi tek elle oynayan bot: rota bilmez, yalnızca ekrandaki iki işarete bakar.
// Tarzlar:
//   isaret    işaretlerden daha yukarıdakine dokunur (bir tarafta hedef yoksa diğerine)
//   ates      işaret ateşböceği halkasını gösteriyorsa oraya, yoksa isaret gibi
//   hiz       işaret hız halkasını gösteriyorsa oraya, yoksa isaret gibi
//   akis      isaret gibi ama ip tam sarılmadan sıradakine atılır
//   sadeceSag hep ekranın sağ yarısına basar (kontrolün sol/sağ kararı istediğini sınar: geçmemeli)
//   sadeceSol hep sol yarısına basar
//   node tools/oyuncu.js
const E = require('../js/engine.js');
const LEVELS = require('../js/levels.js');
const G = require('../js/gen.js');
const C = E.CFG;

function runFor(s, sec, until) { for (let i = 0; i < Math.round(sec / C.DT); i++) { E.step(s); if (s.status !== 'play') return; if (until && until()) return; } }
const speed = p => Math.hypot(p.x - p.px, p.y - p.py) / C.DT;
const ok = a => a.kind !== 'none';
const ringAt = (s, a) => s.rings.find(r => Math.hypot(r.x - a.x, r.y - a.y) < 3);

function play(def, style, maxT) {
  const s = E.createSim(def);
  let taps = 0, boxDone = !(def.boxes && def.boxes.length);
  while (s.status === 'play' && s.t < (maxT || 60)) {
    // kutu bölümü: kutuyu düğmeye indirmek bulmaca adımı
    if (!boxDone && s.rope && s.rope.kind === 'anchor') {
      const b = s.boxes[0]; E.release(s); E.press(s, b.x, b.y); runFor(s, 0.6, () => s.rope || !s.hook);
      runFor(s, 1.2); E.release(s); runFor(s, 1.0); boxDone = true; continue;
    }
    const L = E.aim(s, 0.25), R = E.aim(s, 0.75);
    let pick = null;
    if (style === 'sadeceSag') pick = R;
    else if (style === 'sadeceSol') pick = L;
    else if (L.rescue || R.rescue) pick = L.rescue ? L : R;
    else {
      const want = style === 'ates' ? (a => ok(a) && ringAt(s, a) && ringAt(s, a).ff && !ringAt(s, a).got)
        : style === 'hiz' ? (a => ok(a) && ringAt(s, a) && ringAt(s, a).hiz) : null;
      if (want && want(L)) pick = L;
      else if (want && want(R)) pick = R;
      else if (ok(L) && ok(R)) pick = L.y <= R.y ? L : R;
      else if (ok(L)) pick = L;
      else if (ok(R)) pick = R;
    }
    if (!pick) { runFor(s, 0.3); continue; } // iki tarafta da hedef yok: tutunmaya devam
    if (style !== 'akis' && !pick.miss) E.release(s);
    E.press(s, pick.x, pick.y, { rescue: !!pick.rescue, keep: !!pick.miss });
    taps++;
    runFor(s, 0.8, () => (s.rope && !s.hook) || !s.hook);
    if (s.status !== 'play') break;
    if (pick.miss) { runFor(s, 0.3); continue; }
    if (style === 'akis') runFor(s, 1.2, () => s.rope && s.rope.len <= 70);
    else runFor(s, 1.6, () => s.rope && s.rope.len <= C.MIN_LEN + 0.01 && speed(s.p) < 120);
  }
  return { s, taps };
}

function line(name, r) {
  const s = r.s;
  return `${name.padEnd(24)} ${s.status === 'won' ? 'GEÇTİ ' : s.status === 'dead' ? 'ÖLDÜ  ' : 'GEÇEMEDİ'} ${s.t.toFixed(1)}s dokunuş ${r.taps} boş ${s.misses} kurtarma ${s.rescues} ateşböceği ${E.fireflyCount(s)}/${s.fireflies.length} hız halkası ${s.boosts} hız x${E.speedMult(s).toFixed(2)}`;
}
let bad = 0;
const STYLES = ['isaret', 'ates', 'hiz', 'akis', 'sadeceSag', 'sadeceSol'];
console.log('== El yapımı bölümler ==');
for (const def of LEVELS) for (const st of STYLES) {
  const r = play(def, st, st.startsWith('sadece') ? 40 : 60);
  if (!st.startsWith('sadece') && r.s.status !== 'won') bad++;
  console.log(line(`${def.id}. ${def.name} [${st}]`, r));
}
console.log('\n== Üretilen 7..80 ==');
const sum = {};
STYLES.forEach(st => { sum[st] = { won: 0, ff: 0, ffT: 0, mult: 0, boosts: 0, gates: 0, gatesT: 0, combo: 0 }; });
for (let n = 7; n <= 80; n++) {
  const def = G.createLevel(n);
  for (const st of STYLES) {
    const r = play(def, st, st.startsWith('sadece') ? 40 : 60);
    const m = sum[st];
    if (r.s.status === 'won') m.won++; else if (!st.startsWith('sadece')) { bad++; console.log('  ' + line(`${n}. ${def.name} [${st}]`, r)); }
    m.ff += E.fireflyCount(r.s); m.ffT += r.s.fireflies.length; m.mult += E.speedMult(r.s); m.boosts += r.s.boosts;
    m.gates += r.s.gates; m.gatesT += r.s.rings.filter(g => g.kapi).length; m.combo += r.s.maxCombo;
  }
}
for (const st of STYLES) { const m = sum[st]; console.log(`[${st.padEnd(9)}] geçilen ${m.won}/74, ateşböceği ${m.ff}/${m.ffT}, hız halkası kullanımı ${m.boosts}, ortalama hız çarpanı x${(m.mult / 74).toFixed(2)}, rüzgâr şeridi ${m.gates}/${m.gatesT}, ort. en uzun akış x${(m.combo / 74).toFixed(1)}`); }
console.log('\n== Sonsuz kuyu ==');
for (const st of ['isaret', 'hiz', 'akis', 'sadeceSag']) {
  const res = [];
  for (let seed = 1; seed <= 5; seed++) {
    const r = play(G.createEndless(seed), st, 120);
    res.push(`tohum ${seed}: ${E.meters(r.s)} m, puan ${E.finalScore(r.s)} (x${E.speedMult(r.s).toFixed(2)}), hız halkası ${r.s.boosts}, şerit ${r.s.gates}, boş ${r.s.misses}, ${r.s.status}`);
  }
  console.log(`[${st}]`); res.forEach(l => console.log('  ' + l));
}
process.exit(bad ? 1 : 0);
