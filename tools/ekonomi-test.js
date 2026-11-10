// Ekonomi mantığı testi: node tools/ekonomi-test.js
const K = require('../js/ekonomi.js');
let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log('HATA:', m); } };

// eski kayıt: başlangıç bakiyesi bölüm ateşböcekleri
const save = { best: { 1: { ff: 3, done: true }, 2: { ff: 2, done: true } } };
K.ensure(save);
ok(save.cuzdan.ates === 5, 'başlangıç bakiyesi 5');
ok(K.gorunum(save).atki === '#2fb3a6' && K.gorunum(save).iz === 'atki', 'varsayılan görünüm');

// bölüm ödemesi yalnızca yeni ateşböceği
ok(K.bolumOde(save, 1, 3) === 2 && save.cuzdan.ates === 7, 'bölüm: 1 → 3 iki yeni');
ok(K.bolumOde(save, 3, 3) === 0 && save.cuzdan.ates === 7, 'bölüm tekrar: kasılmaz');

// günlük giriş
let d = K.girisDurum(save, '2026-11-10');
ok(d.hazir && d.gun === 0 && d.odul === 5, 'ilk gün hazır, 5');
ok(K.girisAl(save, '2026-11-10', 2) === 10 && save.cuzdan.ates === 17, 'video ile ×2');
ok(K.girisAl(save, '2026-11-10', 1) === 0, 'aynı gün ikinci kez alınmaz');
ok(K.girisDurum(save, '2026-11-11').gun === 1 && K.girisDurum(save, '2026-11-11').odul === 5, 'ertesi gün 2. gün');
// gün kaçırmak sıfırlamaz
ok(K.girisAl(save, '2026-11-15', 1) === 5 && save.giris.gun === 2, 'gün kaçırınca kaldığı yerden');
for (let i = 0; i < 5; i++) K.girisAl(save, '2026-12-0' + (i + 1), 1);
ok(save.giris.gun === 0 && save.giris.toplam === 7, '7. günden sonra başa döner');

// dolap (temiz kayıt)
const save2 = K.ensure({ best: {} });
const y = K.satinAl(save2, 'atki-pembe');
ok(y.neden === 'yetersiz' && y.eksik === 100 && save2.cuzdan.ates === 0, 'yetersiz bakiye');
Object.assign(save, save2);
K.kazan(save, 500);
const r = K.satinAl(save, 'atki-kiraz');
ok(r.ok && K.sahip(save, 'atki-kiraz') && save.dolap.kusan.atki === 'atki-kiraz', 'satın al ve kuşan');
ok(save.cuzdan.harcanan === 40, 'harcanan 40');
ok(K.satinAl(save, 'atki-kiraz').neden === 'sahip', 'iki kez alınmaz');
ok(K.kusan(save, 'atki-turkuaz') && K.gorunum(save).atki === '#2fb3a6', 'eskisine dön');
ok(!K.kusan(save, 'ip-ates'), 'sahip olunmayan kuşanılmaz');
ok(K.KATALOG.every(i => K.TURLER[i.tur]), 'her ürünün türü var');
ok(Object.keys(K.VARSAYILAN).every(t => K.item(K.VARSAYILAN[t]).fiyat === 0), 'varsayılanlar bedava');
console.log(bad ? bad + ' hata' : 'Tamam: cüzdan, günlük giriş, dolap');
process.exit(bad ? 1 : 0);
