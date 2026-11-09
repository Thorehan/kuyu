// Görev ve başarım mantığı testi: node tools/gorev-test.js
const G = require('../js/gorevler.js');
let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log('HATA:', m); } };
// aynı gün aynı görevler, farklı türler, kademeler sırayla
const a = G.pick('2026-11-10'), b = G.pick('2026-11-10'), c = G.pick('2026-11-11');
ok(JSON.stringify(a) === JSON.stringify(b), 'aynı gün aynı görev');
ok(new Set(a.map(m => m.k)).size === 3, 'üç farklı tür');
ok(a.map(m => m.tier).join() === '0,1,2', 'kolay/orta/zor');
console.log('10 Kasım:', a.map(G.missionText).join(' | '));
console.log('11 Kasım:', c.map(G.missionText).join(' | '));
// 30 gün boyunca tür dağılımı
const cnt = {};
for (let d = 1; d <= 60; d++) { const k = new Date(Date.UTC(2026, 10, d)).toISOString().slice(0, 10); G.pick(k).forEach(m => cnt[m.k] = (cnt[m.k] || 0) + 1); }
console.log('60 günde tür sayısı:', JSON.stringify(cnt));
// eski kayıt: toplamlar bölüm ateşböceklerinden başlar
const save = { best: { 1: { ff: 3, done: true, perfect: true }, 2: { ff: 2, done: true } }, endless: { score: 900, meters: 420, combo: 14 }, stats: { maxSpeed: 47 }, streak: { max: 4 } };
G.ensure(save);
ok(save.totals.ff === 5 && save.totals.maxCombo === 14 && save.totals.maxMeters === 420, 'eski kayıttan başlatma');
// her türden ilerleme: bütün türleri zorla
save.missions = { date: 'X', list: Object.keys(G.MISSIONS).map(k => ({ k, tier: 0, target: G.MISSIONS[k].t[0], prog: 0, done: false, claimed: false })) };
let r = G.record(save, { mode: 'level', won: true, ff: 3, boosts: 1, maxCombo: 4, speed: 20.7, perfect: true }, 'X');
const p = k => save.missions.list.find(m => m.k === k);
ok(p('ff').prog === 3 && p('bolum').prog === 1 && p('kusursuz').prog === 1 && p('metre').prog === 0 && p('gunluk').prog === 0, 'bölüm koşusu ilerlemesi');
ok(p('kusursuz').done && r.missions.length === 1, 'kusursuz görevi tamam');
ok(Number.isInteger(p('hizMs').prog), 'hız ilerlemesi tam sayı');
ok(r.ach.length === 4, 'eski kayıtla 4 başarım açılır');
console.log('ilk koşuda açılan başarımlar:', r.ach.map(x => x.ad + ' ' + x.kademe).join(', '));
r = G.record(save, { mode: 'daily', ff: 2, boosts: 2, maxCombo: 7, meters: 160, speed: 30 }, 'X');
ok(p('metre').done && p('gunluk').done && p('akis').done && p('hiz').done && p('ff').done && p('hizMs').done, 'günlük koşu görevleri');
ok(p('bolum').prog === 1, 'günlük koşu bölüm saymaz');
ok(save.totals.maxMeters === 420 && save.totals.ff === 10, 'toplamlar');
// ödül alma bir kez
const i = save.missions.list.indexOf(p('ff'));
ok(G.claim(save, i) === 50 && G.claim(save, i) === 0 && save.odulEk === 50, 'ödül bir kez alınır');
ok(G.claim(save, save.missions.list.indexOf(p('bolum'))) === 0, 'bitmemiş görev alınmaz');
// başarım bir kez bildirilir
ok(G.newAch(save).length === 0, 'başarım tekrar bildirilmez');
// gün değişince yeni görevler
G.daily(save, '2026-11-12'); ok(save.missions.date === '2026-11-12' && save.missions.list.every(m => !m.done), 'yeni gün sıfırlanır');
console.log(bad ? bad + ' hata' : 'Tamam: görevler ve başarımlar');
process.exit(bad ? 1 : 0);
