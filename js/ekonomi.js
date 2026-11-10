/* Kuyu — ekonomi: cüzdan (ateşböceği), günlük giriş takvimi ve dolap (kozmetik mağaza).
   Kayıt nesnesi (save) üzerinde çalışır, DOM bilmez; Node'da da yüklenir (tools/ekonomi-test.js).
   Tarayıcıda window.KuyuEkonomi.

   Karar (2026-11-10): oyunda güçlendirme yok, harcamalar yalnızca kozmetik. Para birimi ateşböceği.
   Kazanç: bölümde İLK KEZ alınan ateşböceği (aynı bölümü tekrar oynayıp kasılmaz), Sonsuz/Günlük koşuda
   toplanan her ateşböceği, görev, başarım kademesi, günlük giriş. Video ile ikiye katlama yalnızca oyuncu seçerse. */
(function (root) {
  'use strict';

  var GIRIS = [5, 5, 10, 10, 15, 15, 50];      // 7 günlük takvim; 7. günden sonra başa döner
  var GOREV_ATES = [5, 10, 15];                 // kolay / orta / zor görev
  var BASARIM_ATES = [10, 25, 50];              // bronz / gümüş / altın kademe

  // Dolap. Fiyatlar tools/ekonomi-olcum.js ile ölçülen kazanca göre (README → Ekonomi).
  var KATALOG = [
    { id: 'atki-turkuaz', tur: 'atki', ad: 'Turkuaz', renk: '#2fb3a6', fiyat: 0 },
    { id: 'atki-kiraz', tur: 'atki', ad: 'Kiraz', renk: '#e2445c', fiyat: 40 },
    { id: 'atki-mor', tur: 'atki', ad: 'Mor', renk: '#9b6bff', fiyat: 40 },
    { id: 'atki-altin', tur: 'atki', ad: 'Altın', renk: '#f2c23a', fiyat: 70 },
    { id: 'atki-gece', tur: 'atki', ad: 'Gece', renk: '#3b4fc4', fiyat: 70 },
    { id: 'atki-pembe', tur: 'atki', ad: 'Pembe', renk: '#ff8fc8', fiyat: 100 },
    { id: 'atki-gokkusagi', tur: 'atki', ad: 'Gökkuşağı', renk: 'gokkusagi', fiyat: 300 },
    { id: 'ip-keten', tur: 'ip', ad: 'Keten', renk: '#eadfc4', fiyat: 0 },
    { id: 'ip-gok', tur: 'ip', ad: 'Gök', renk: '#8fd6ff', fiyat: 30 },
    { id: 'ip-zumrut', tur: 'ip', ad: 'Zümrüt', renk: '#5fd39a', fiyat: 50 },
    { id: 'ip-altin', tur: 'ip', ad: 'Altın', renk: '#ffd36b', fiyat: 60 },
    { id: 'ip-ates', tur: 'ip', ad: 'Ateş', renk: '#ff7a3a', fiyat: 90 },
    { id: 'iz-atki', tur: 'iz', ad: 'Atkı rengi', renk: 'atki', fiyat: 0 },
    { id: 'iz-kar', tur: 'iz', ad: 'Kar', renk: '#e8f4f2', fiyat: 40 },
    { id: 'iz-mor', tur: 'iz', ad: 'Mor', renk: '#b58cff', fiyat: 60 },
    { id: 'iz-altin', tur: 'iz', ad: 'Altın', renk: '#ffd36b', fiyat: 80 },
    { id: 'iz-gokkusagi', tur: 'iz', ad: 'Gökkuşağı', renk: 'gokkusagi', fiyat: 250 }
  ];
  var TURLER = { atki: 'Atkı', ip: 'İp', iz: 'Uçuş izi' };
  var VARSAYILAN = { atki: 'atki-turkuaz', ip: 'ip-keten', iz: 'iz-atki' };

  function item(id) { for (var i = 0; i < KATALOG.length; i++) if (KATALOG[i].id === id) return KATALOG[i]; return null; }

  // Eski kayıtlar: başlangıç bakiyesi bölümlerde toplanmış ateşböcekleri (zaten kazanılmıştı).
  function ensure(save) {
    if (!save.cuzdan) {
      var ff = 0, b = save.best || {};
      for (var k in b) ff += b[k].ff || 0;
      save.cuzdan = { ates: ff, kazanilan: ff, harcanan: 0 };
    }
    if (!save.dolap) save.dolap = { sahip: [VARSAYILAN.atki, VARSAYILAN.ip, VARSAYILAN.iz], kusan: { atki: VARSAYILAN.atki, ip: VARSAYILAN.ip, iz: VARSAYILAN.iz } };
    if (!save.giris) save.giris = { gun: 0, son: null, toplam: 0 };
    return save;
  }

  function kazan(save, n) {
    ensure(save);
    n = Math.max(0, Math.floor(n || 0));
    save.cuzdan.ates += n; save.cuzdan.kazanilan += n;
    return n;
  }
  // Bölüm sonu: yalnızca önceki en iyiyi aşan (ilk kez alınan) ateşböcekleri ödenir.
  function bolumOde(save, oncekiEnIyi, simdi) { return kazan(save, Math.max(0, (simdi || 0) - (oncekiEnIyi || 0))); }

  // ---------- günlük giriş ----------
  function girisDurum(save, key) {
    ensure(save);
    var g = save.giris;
    return { gun: g.gun, hazir: g.son !== key, odul: GIRIS[g.gun], takvim: GIRIS.slice(), toplam: g.toplam };
  }
  // kat: 1 ya da 2 (video). Bugün alındıysa 0 döner.
  function girisAl(save, key, kat) {
    var d = girisDurum(save, key);
    if (!d.hazir) return 0;
    var n = kazan(save, d.odul * (kat === 2 ? 2 : 1));
    save.giris.son = key; save.giris.gun = (save.giris.gun + 1) % GIRIS.length; save.giris.toplam++;
    return n;
  }

  // ---------- dolap ----------
  function sahip(save, id) { ensure(save); return save.dolap.sahip.indexOf(id) >= 0; }
  function satinAl(save, id) {
    ensure(save);
    var it = item(id);
    if (!it) return { ok: false, neden: 'yok' };
    if (sahip(save, id)) return { ok: false, neden: 'sahip' };
    if (save.cuzdan.ates < it.fiyat) return { ok: false, neden: 'yetersiz', eksik: it.fiyat - save.cuzdan.ates };
    save.cuzdan.ates -= it.fiyat; save.cuzdan.harcanan += it.fiyat;
    save.dolap.sahip.push(id);
    save.dolap.kusan[it.tur] = id;
    return { ok: true };
  }
  function kusan(save, id) {
    var it = item(id);
    if (!it || !sahip(save, id)) return false;
    save.dolap.kusan[it.tur] = id;
    return true;
  }
  // Çizim için kuşanılan renkler: { atki, ip, iz } ('gokkusagi' canlı renk, iz 'atki' ise atkıyı izler)
  function gorunum(save) {
    ensure(save);
    var k = save.dolap.kusan, out = {};
    Object.keys(VARSAYILAN).forEach(function (t) { var it = item(k[t]) || item(VARSAYILAN[t]); out[t] = it.renk; });
    return out;
  }

  var api = { GIRIS: GIRIS, GOREV_ATES: GOREV_ATES, BASARIM_ATES: BASARIM_ATES, KATALOG: KATALOG, TURLER: TURLER, VARSAYILAN: VARSAYILAN,
    ensure: ensure, kazan: kazan, bolumOde: bolumOde, girisDurum: girisDurum, girisAl: girisAl,
    item: item, sahip: sahip, satinAl: satinAl, kusan: kusan, gorunum: gorunum };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.KuyuEkonomi = api;
})(this);
