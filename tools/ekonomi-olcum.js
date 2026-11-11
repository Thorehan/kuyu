// Ekonomi ölçümü: sanal oyuncular saatte ve tipik bir günde kaç ateşböceği kazanır, Dolap ve ışık yolu kaç günde biter?
//   node tools/ekonomi-olcum.js
// v0.53'ten beri oyuncular HATA YAPAR (tools/hata.js ve tools/denge.js ile aynı model): eski ölçüm hatasız ve yavaş bir
// botla Sonsuz'u saatte 121 ateşböceği sayıyordu; gerçekte koşular suya yakalanarak biter ve kazanç bunun iki katıdır.
// Bölümler: yalnızca ilk kez alınan ateşböceği ödenir; yanınca bölüm yeniden denenir. Sonsuz: toplanan her ateşböceği.
// Tipik gün: 10 dk Sonsuz + 10 dk bölüm + 3 görev + günlük giriş (+ varsa Haftalık Kuyu ödülünün günlük payı).
const E = require('../js/engine.js');
const G = require('../js/gen.js');
const EKO = require('../js/ekonomi.js');
const GOREV = require('../js/gorevler.js');
const C = E.CFG;
function rng(seed) { let x = seed >>> 0 || 1; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296); }
const step = (s, sec, u) => { for (let i = 0; i < Math.round(sec / C.DT) && s.status === 'play'; i++) { E.step(s); if (u && u()) return; } };
function bekle(s, f, a) { if (!a.bekle) return a; const son = s.t + C.BEKLE_SN; while (s.status === 'play') { E.step(s); a = E.aim(s, f); if (!a.bekle || s.t >= son || s.p.y - s.p.py >= 0) break; } return a; }
const ringAt = (s, a) => s.rings.find(r => Math.hypot(r.x - a.x, r.y - a.y) < 3);
function taraf(s, ates) {
  const L = E.aim(s, 0.25), R = E.aim(s, 0.75), y = a => (a.bekle || a).y, ok = a => (a.kind !== 'none' && !a.miss) || a.bekle;
  if (L.rescue || R.rescue) return L.rescue ? 0.25 : 0.75;
  const ff = a => ok(a) && !a.bekle && ringAt(s, a) && ringAt(s, a).ff && !ringAt(s, a).got;
  if (ates && ff(L)) return 0.25; if (ates && ff(R)) return 0.75;
  return ok(L) && ok(R) ? (y(L) <= y(R) ? 0.25 : 0.75) : ok(L) ? 0.25 : ok(R) ? 0.75 : null;
}
// tarz: 'temkinli' (ipe sarılıp bekler) ya da 'akis' (ipi erken bırakıp zincirler); p: dokunuş başına hata olasılığı;
// ates: ateşböceği gösteren işareti seçer
function oyna(def, tarz, p, seed, maxT, ates) {
  const s = E.createSim(def), r = rng(seed * 977 + Math.round(p * 1000) + 5);
  while (s.status === 'play' && s.t < maxT) {
    let f = taraf(s, ates);
    if (f == null) { step(s, 0.1); continue; }
    const havada = !s.rope;
    if (r() < p) { if (!havada || r() < 0.5) f = 1 - f; else step(s, 0.9); }
    const a = bekle(s, f, E.aim(s, f));
    if (tarz === 'temkinli' && !a.miss) E.release(s);
    E.press(s, a.x, a.y, { keep: !!a.miss, rescue: !!a.rescue });
    step(s, 0.8, () => (s.rope && !s.hook) || !s.hook);
    if (!s.rope || a.miss) { step(s, 0.3); continue; }
    if (tarz === 'temkinli') { step(s, 1.6, () => (s.rope && s.rope.len <= C.MIN_LEN + 0.01 && Math.hypot(s.p.x - s.p.px, s.p.y - s.p.py) / C.DT < 120) || (!s.rope && !s.hook && s.springs > 0 && s.p.y - s.p.py > -0.4)); step(s, 0.35); }
    else { step(s, 1.2, () => s.rope && s.rope.len <= 60); E.release(s); step(s, 0.08); }
  }
  return s;
}

const PROFIL = [
  ['yeni', 'temkinli', 0.20, false],
  ['ortalama', 'temkinli', 0.10, false],
  ['ateşböceği avcısı', 'temkinli', 0.10, true],
  ['akışla oynayan', 'akis', 0.10, false]
];
const gorev = EKO.GOREV_ATES.reduce((a, b) => a + b, 0), giris = EKO.GIRIS.reduce((a, b) => a + b, 0) / EKO.GIRIS.length;
// Haftalık Kuyu (v0.54) varsa: profilin vardığı lig kademesinin ödülü 7 güne bölünür
const haftalikPay = puan => { if (!EKO.ligOdul) return 0; return EKO.ligOdul(puan) / 7; };
const fiyatlar = EKO.KATALOG.filter(i => i.fiyat > 0).map(i => i.fiyat).sort((a, b) => a - b);
const dolapToplam = fiyatlar.reduce((a, b) => a + b, 0);
const basarimToplam = GOREV.ACH.length * EKO.BASARIM_ATES.reduce((a, b) => a + b, 0);
const N = 10, gunler = [];
for (const [ad, tarz, p, ates] of PROFIL) {
  // Sonsuz: N koşu; koşu arası 10 sn (sonuç kartı)
  let sff = 0, ssn = 0, sm = 0, puan = [];
  for (let sd = 1; sd <= N; sd++) { const s = oyna(G.createEndless(sd * 13), tarz, p, sd, 900, ates); sff += E.fireflyCount(s); ssn += s.t + 10; sm += E.meters(s); }
  if (G.createHaftalik) for (let sd = 1; sd <= N; sd++) puan.push(E.finalScore(oyna(G.createHaftalik(sd * 7), tarz, p, sd, 900, false)));
  puan.sort((a, b) => a - b);
  // Bölümler 17–56: ilk geçişe kadar yeniden dene (en çok 6); deneme arası 6 sn, sonuç kartı 6 sn
  let lff = 0, lsn = 0, den = 0, gecilen = 0;
  for (let k = 17; k <= 56; k++) {
    let best = 0;
    for (let d = 0; d < 6; d++) {
      const s = oyna(G.createLevel(k), tarz, p, k * 10 + d, 90, ates); den++; lsn += s.t + 6; best = Math.max(best, E.fireflyCount(s));
      if (s.status === 'won') { lff += best; lsn += 6; gecilen++; break; }
    }
  }
  const sonsuzSaat = sff / (ssn / 3600), bolumSaat = lff / (lsn / 3600);
  const haftalik = puan.length ? haftalikPay(puan[puan.length >> 1]) : 0;
  const gun = Math.round(sonsuzSaat / 6 + bolumSaat / 6 + gorev + giris + haftalik);
  gunler.push(gun);
  console.log(`[${ad}]`);
  console.log(`  sonsuz:   koşu başına ${(sff / N).toFixed(1)} ateşböceği (${Math.round(sm / N)} m, ${Math.round(ssn / N - 10)} sn) → saatte ${Math.round(sonsuzSaat)}`);
  console.log(`  bölümler: 17–56 arası ${gecilen}/40 bölüm, ${lff} ateşböceği, ${den} deneme, ${Math.round(lsn / 60)} dk → saatte ${Math.round(bolumSaat)}`);
  console.log(`  tipik gün (10 dk sonsuz + 10 dk bölüm, 3 görev ${gorev}, giriş ort. ${giris.toFixed(0)}${haftalik ? ', haftalık lig payı ' + haftalik.toFixed(0) : ''}): ~${gun} ateşböceği, videolarla ~${gun + gorev + Math.round(giris)}`);
  console.log(`  Dolap ${Math.ceil(Math.max(0, dolapToplam - basarimToplam) / gun)} günde biter (başarımların ${basarimToplam} ateşböceği düşülerek); ışık yolu ${EKO.ISIK.length - 1}. seviye ${Math.ceil(EKO.ISIK[EKO.ISIK.length - 1] / gun)} günde`);
}
console.log(`Dolap: ${fiyatlar.length} satılık ürün (en ucuz ${fiyatlar[0]}, en pahalı ${fiyatlar[fiyatlar.length - 1]}, hepsi ${dolapToplam}) + ${EKO.KATALOG.filter(i => i.isik).length} ışık ödülü; başarımlar bir kez ${basarimToplam}`);
console.log(`Özet: tipik gün ortalama oyuncu ~${gunler[1]} ateşböceği (yeni ~${gunler[0]}, avcı ~${gunler[2]}, akışla ~${gunler[3]})`);
