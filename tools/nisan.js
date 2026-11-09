// Nişan yardımı denetimi: rotadaki her adımda, ekranın soldan sağa 9 noktasından (f = 0.1 … 0.9)
// hangilerine dokunmak kancayı istenen hedefe götürür? Hiçbiri götürmüyorsa o hedef tek elle seçilemez.
//   node tools/nisan.js [--trace]
const E = require('../js/engine.js');
const LEVELS = require('../js/levels.js');
const G = require('../js/gen.js');
const C = E.CFG;
const trace = process.argv.includes('--trace');
const FS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

function runFor(s, sec, until) {
  const n = Math.round(sec / C.DT);
  for (let i = 0; i < n; i++) { E.step(s); if (s.status !== 'play') return; if (until && until()) return; }
}
const speed = p => Math.hypot(p.x - p.px, p.y - p.py) / C.DT;
function matches(a, x, y) {
  if (a.kind === 'none') return false;
  if (a.kind === 'wood') return Math.abs(a.x - x) < 6 && Math.abs(a.y - y) < 70;
  return Math.hypot(a.x - x, a.y - y) < 22;
}

// Rotayı tam koordinatla oyna; her adımdan önce hangi f'lerin işe yaradığını say.
function audit(def) {
  const s = E.createSim(def), gaps = [];
  let steps = 0, prevKey = '', markerOk = 0;
  for (const a of def.route) {
    if (s.status !== 'play') break;
    if (a[0] === 'wait') { runFor(s, a[1]); continue; }
    const x = a[0] === 'box' ? s.boxes[a[1]].x : a[1], y = a[0] === 'box' ? s.boxes[a[1]].y : a[2];
    const key = x + ',' + y; if (key === prevKey) continue; prevKey = key;
    E.release(s);
    const ok = FS.filter(f => matches(E.aim(s, f), x, y));
    steps++;
    if (matches(E.aim(s, 0.2), x, y) || matches(E.aim(s, 0.8), x, y)) markerOk++;
    if (!ok.length) {
      const alts = [0.2, 0.5, 0.8].map(f => { const m = E.aim(s, f); return `${f}:${m.kind}(${m.x.toFixed(0)},${m.y.toFixed(0)})`; }).join(' ');
      gaps.push(`hedef ${a[0]} (${x},${y}) oyuncu (${s.p.x.toFixed(0)},${s.p.y.toFixed(0)}) → ${alts}`);
    }
    E.press(s, x, y);
    runFor(s, 0.6, () => s.rope || !s.hook);
    if (s.status === 'won') break;
    if (a[0] === 'box') { runFor(s, 1.2); E.release(s); runFor(s, 1.0); continue; }
    runFor(s, 1.6, () => s.rope && s.rope.len <= C.MIN_LEN + 0.01 && speed(s.p) < 120);
  }
  return { gaps, steps, markerOk, won: s.status === 'won' };
}

let total = 0, gapTotal = 0, markerTotal = 0;
function report(name, r) {
  total += r.steps; gapTotal += r.gaps.length; markerTotal += r.markerOk;
  if (r.gaps.length || trace) { console.log(`${name}: ${r.gaps.length} açık / ${r.steps} adım`); r.gaps.forEach(g => console.log('   ' + g)); }
}
for (const def of LEVELS) report(`${def.id}. ${def.name}`, audit(def));
for (let n = 7; n <= 60; n++) report(`${n}. ${G.createLevel(n).name}`, audit(G.createLevel(n)));
console.log(`\nToplam ${total} adım: ${total - gapTotal} adımda hedef bir dokunuşla seçilebiliyor, ${gapTotal} açık.`);
console.log(`Sol (0.2) ya da sağ (0.8) işaret doğru hedefi gösteriyor: ${markerTotal}/${total}`);
process.exit(gapTotal ? 1 : 0);
