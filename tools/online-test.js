// Online mantığı testi: meydan okuma bağlantısı ve skor tablosu istemcisi (yerel sahte sunucuya karşı).
//   node tools/online-test.js
const { sunucu } = require('./sahte-sunucu.js');
let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log('HATA:', m); } };
// tarayıcı deposunun yerine geçen küçük nesne (online.js localStorage'dan ayar okur)
const kasa = {};
global.localStorage = { getItem: k => (k in kasa ? kasa[k] : null), setItem: (k, v) => { kasa[k] = String(v); }, removeItem: k => { delete kasa[k]; } };
const O = require('../js/online.js');

// ---- meydan okuma: kodla / çöz ----
const m = { tur: 's', seed: 3999999999, puan: 2450, ad: 'Çıra & <Kor>' };
const kod = O.meydanKodla(m), geri = O.meydanCoz(kod);
ok(geri && geri.seed === m.seed && geri.puan === 2450 && geri.tur === 's', 'kodla → çöz aynı tohum ve puan');
ok(geri.ad === 'Çıra Kor', 'ad temizlenir (işaretler atılır)');
ok(O.meydanCoz('h-' + (12345).toString(36) + '-900-Ali').tur === 'h', 'haftalık türü');
ok(O.meydanCoz('x-1-2-3') === null && O.meydanCoz('s-zzzzzzzz-1-a') === null && O.meydanCoz('') === null && O.meydanCoz('s-1--a') === null, 'bozuk bağlantı reddedilir');
ok(O.meydanCoz('s-1-5-%E0%A4%A') === null, 'bozuk ad kodlaması reddedilir');
ok(O.meydanBaglanti('https://ornek.test/kuyu/', m).indexOf('?meydan=s-') > 0, 'bağlantı biçimi');

// ---- skor tablosu: kapalıyken istek yok ----
ok(!O.acik(), 'ayar boşken online kapalı');
O.gonder({}, 'h-2026-11-09', 'A', 10, 5).then(() => ok(false, 'kapalıyken gönderilmemeli'), () => {}).then(() => new Promise(r => sunucu.listen(0, r))).then(async () => {
  const port = sunucu.address().port;
  localStorage.setItem('kuyu.online', JSON.stringify({ url: 'http://localhost:' + port, anahtar: 'deneme' }));
  ok(O.acik(), 'yerel ayarla online açık');
  const a = {}, b = {};
  ok(await O.gonder(a, 'h-2026-11-09', 'Ayşe', 1200, 600) === true, 'ilk skor yazılır');
  ok(await O.gonder(b, 'h-2026-11-09', 'Bora', 3400, 1500) === true, 'ikinci oyuncu');
  await O.gonder(a, 'h-2026-11-09', 'Ayşe', 900, 400);
  let rows = await O.tablo('h-2026-11-09', 50);
  ok(rows.length === 2 && rows[0].ad === 'Bora' && rows[1].puan === 1200, 'sıralı liste; kötü koşu en iyiyi düşürmez');
  await O.gonder(a, 'h-2026-11-09', 'Ayşe', 5000, 2000);
  rows = await O.tablo('h-2026-11-09', 50);
  const oz = O.ozet(rows, O.kimlik(a), 5);
  ok(oz.sira === 1 && oz.toplam === 2 && oz.liste[0].ben && oz.liste[0].puan === 5000, 'daha iyi puan yazılır, sıra 1');
  const o2 = O.ozet([{ oyuncu: 'x', ad: 'X', puan: 9 }, { oyuncu: 'y', ad: 'Y', puan: 8 }, { oyuncu: 'ben', ad: 'Ben', puan: 1 }], 'ben', 2);
  ok(o2.sira === 3 && o2.liste.length === 3 && o2.liste[2].ben && o2.liste[2].sira === 3, 'ilk sıraların dışındaysan kendi satırın eklenir');
  ok((await O.tablo('g-2026-11-11', 50)).length === 0, 'başka tahta boş');
  ok(await O.gonder(a, 'bozuk', 'Ayşe', 10, 1) === false, 'geçersiz tahta reddedilir');
  ok(await O.gonder(a, 'h-2026-11-09', 'Ayşe', 9e9, 1) === false, 'olanaksız puan reddedilir');
  ok(a.online.kimlik && a.online.kimlik !== b.online.kimlik && a.online.kimlik.length === 36, 'cihaz kimliği kalıcı ve tekil');
  O.ayarBaglanti('kapat'); ok(!O.acik(), '?online=kapat ile kapanır');
  O.ayarBaglanti('yerel'); ok(O.ayar().url === O.YEREL.url, '?online=yerel ile yerel sunucu');
}).catch(e => { bad++; console.log('HATA:', e.message); }).then(() => {
  sunucu.close();
  console.log(bad ? bad + ' hata' : 'Tamam: meydan okuma bağlantısı, skor tablosu istemcisi');
  process.exit(bad ? 1 : 0);
});
