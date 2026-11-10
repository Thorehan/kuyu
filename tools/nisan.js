// Nişan yardımı denetimi: oyuncu bir tarafa bastığında işaret "yandaki" (neredeyse aynı hizadaki) hedefi mi
// gösteriyor, oysa aynı tarafta belirgin şekilde daha yukarıda ulaşılabilir bir hedef var mı?
//   node tools/nisan.js
// Her dokunuşta iki tarafa da bakılır. "Yan seçim" sayılır: seçilen hedef, aynı taraftaki en yüksek ulaşılabilir
// hedeften en az 100 birim (5 m) aşağıda ve kendisi 100 birimden (5 m) az yükseltiyor.
const E = require('../js/engine.js');
const LEVELS = require('../js/levels.js');
const G = require('../js/gen.js');
const C = E.CFG;

// Yay halkası fırlattıysa oyuncu tepe noktasında sıradakine dokunur.
const springApex = s => !s.rope && !s.hook && s.springs > 0 && s.p.y - s.p.py > -0.4;
function runFor(s, sec, until) { for (let i = 0; i < Math.round(sec / C.DT); i++) { E.step(s); if (s.status !== 'play') return; if (until && until()) return; } }
const speed = p => Math.hypot(p.x - p.px, p.y - p.py) / C.DT;

const found = [];
let checks = 0;
function audit(s, f, a, where) {
  if (a.miss || a.rescue) return;
  checks++;
  const side = f < 0.5 ? -1 : 1, ignore = E.currentIgnore(s);
  const holding = s.rope && s.rope.kind === 'anchor';
  const refY = holding ? s.rope.y : s.p.y, refX = holding ? s.rope.x : s.p.x;
  const same = E.candidates(s).filter(c => c.ref !== ignore && (side < 0 ? c.x - s.p.x <= C.NEAR_V : c.x - s.p.x >= -C.NEAR_V) && E.reachable(s, c, ignore));
  if (!same.length) return;
  const top = same.reduce((u, v) => (v.y < u.y ? v : u));
  const rise = refY - a.y, horiz = Math.abs(a.x - refX);
  const angle = Math.atan2(rise, Math.max(1, horiz)) * 180 / Math.PI;
  if (top.y < a.y - 100 && rise < 100) {
    found.push(`${where} t=${s.t.toFixed(1)} ${holding ? 'tutunurken' : 'havada'} ${side < 0 ? 'sol' : 'sağ'}: seçilen (${a.x | 0},${a.y | 0}) ${a.kind} yükselme ${rise | 0} açı ${angle | 0}° | en yüksek (${top.x | 0},${top.y | 0}) ${top.kind} yükselme ${(refY - top.y) | 0}`);
  }
}

// işaret oyuncusu: iki işarete bakar, yukarıdakini seçer
function play(def, where, maxT, style) {
  const s = E.createSim(def);
  let boxDone = !(def.boxes && def.boxes.length);
  while (s.status === 'play' && s.t < maxT) {
    if (!boxDone && s.rope && s.rope.kind === 'anchor') {
      const b = s.boxes[0]; E.release(s); E.press(s, b.x, b.y); runFor(s, 0.6, () => s.rope || !s.hook);
      runFor(s, 1.2); E.release(s); runFor(s, 1.0); boxDone = true; continue;
    }
    const L = E.aim(s, 0.25), R = E.aim(s, 0.75);
    audit(s, 0.25, L, where); audit(s, 0.75, R, where);
    let pick = null;
    if (L.rescue || R.rescue) pick = L.rescue ? L : R;
    else if (!L.miss && !R.miss) pick = L.y <= R.y ? L : R;
    else if (!L.miss) pick = L; else if (!R.miss) pick = R;
    if (!pick) { runFor(s, 0.3); continue; }
    E.release(s);
    E.press(s, pick.x, pick.y, { rescue: !!pick.rescue });
    runFor(s, 0.8, () => (s.rope && !s.hook) || !s.hook);
    if (s.status !== 'play') break;
    if (style === 'akis') runFor(s, 1.2, () => s.rope && s.rope.len <= 70);
    else if (style === 'hava') { runFor(s, 1.2, () => s.rope && s.rope.len <= 70); E.release(s); runFor(s, 0.12); }
    else runFor(s, 1.6, () => (s.rope && s.rope.len <= C.MIN_LEN + 0.01 && speed(s.p) < 120) || springApex(s));
  }
  return s;
}

for (const style of ['isaret', 'akis', 'hava']) {
  found.length = 0; checks = 0;
  let won = 0, total = 0;
  for (const def of LEVELS) { total++; if (play(def, `B${def.id}`, 60, style).status === 'won') won++; }
  for (let n = 7; n <= 80; n++) { total++; if (play(G.createLevel(n), `B${n}`, 60, style).status === 'won') won++; }
  let meters = 0;
  for (let seed = 1; seed <= 5; seed++) meters += E.meters(play(G.createEndless(seed), `S${seed}`, 60, style));
  if (process.argv.includes('-v')) found.slice(0, 8).forEach(l => console.log('  ' + l));
  console.log(`${style.padEnd(7)} ${checks} işaret, yan seçim ${found.length} (%${(found.length / checks * 100).toFixed(1)}); bölüm ${won}/${total}; sonsuz ort. ${Math.round(meters / 5)} m (60 sn)`);
}
