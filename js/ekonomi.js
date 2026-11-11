/* Kuyu — ekonomi: cüzdan (ateşböceği), günlük giriş takvimi ve dolap (kozmetik mağaza).
   Kayıt nesnesi (save) üzerinde çalışır, DOM bilmez; Node'da da yüklenir (tools/ekonomi-test.js).
   Tarayıcıda window.KuyuEkonomi.

   Karar (2026-11-10): harcamalar kozmetik (v0.49'dan beri ayrıca devam hakkı); güçlendirme satılmaz. Para birimi ateşböceği.
   Kazanç: bölümde İLK KEZ alınan ateşböceği (aynı bölümü tekrar oynayıp kasılmaz), Sonsuz/Günlük koşuda
   toplanan her ateşböceği, görev, başarım kademesi, günlük giriş. Video ile ikiye katlama yalnızca oyuncu seçerse. */
(function (root) {
  'use strict';

  var GIRIS = [5, 5, 10, 10, 15, 15, 50];      // 7 günlük takvim; 7. günden sonra başa döner
  var GOREV_ATES = [5, 10, 15];                 // kolay / orta / zor görev
  var BASARIM_ATES = [10, 25, 50];              // bronz / gümüş / altın kademe

  // Dolap. Fiyatlar tools/ekonomi-olcum.js ile ölçülen kazanca göre (README → Ekonomi).
  var KATALOG = [
    // kahraman gövdesi (renk2: alt gölge)
    { id: 'govde-turuncu', tur: 'govde', ad: 'Turuncu', renk: '#f26a3a', renk2: '#b8401b', fiyat: 0 },
    { id: 'govde-deniz', tur: 'govde', ad: 'Deniz', renk: '#3aa0f2', renk2: '#1b5fb8', fiyat: 60 },
    { id: 'govde-cimen', tur: 'govde', ad: 'Çimen', renk: '#5cc45a', renk2: '#2f7d2d', fiyat: 60 },
    { id: 'govde-lavanta', tur: 'govde', ad: 'Lavanta', renk: '#a77cf2', renk2: '#6a45b8', fiyat: 90 },
    { id: 'govde-pembe', tur: 'govde', ad: 'Pembe', renk: '#f27ab0', renk2: '#b8457a', fiyat: 90 },
    { id: 'govde-gece', tur: 'govde', ad: 'Gece', renk: '#4a5680', renk2: '#252b45', fiyat: 120 },
    { id: 'govde-altin', tur: 'govde', ad: 'Altın', renk: '#f2c23a', renk2: '#b88a1b', fiyat: 150 },
    { id: 'govde-nar', tur: 'govde', ad: 'Nar', renk: '#e23b4a', renk2: '#8f1d2a', fiyat: 220 },
    { id: 'govde-buz', tur: 'govde', ad: 'Buz', renk: '#bfeaff', renk2: '#6fb6d8', fiyat: 300 },
    { id: 'govde-golge', tur: 'govde', ad: 'Gölge', renk: '#3a3f52', renk2: '#14161f', fiyat: 450 },
    { id: 'govde-ay', tur: 'govde', ad: 'Ay ışığı', renk: '#f4f1e0', renk2: '#b9b39a', fiyat: 700 },
    { id: 'govde-koz', tur: 'govde', ad: 'Köz', renk: '#ff5a2a', renk2: '#7a1a0a', isik: 14 },
    { id: 'govde-gunes', tur: 'govde', ad: 'Güneş', renk: '#fff0a8', renk2: '#f2b23a', isik: 20 },
    // kanca biçimi (renk alanı biçim adı)
    { id: 'kanca-ok', tur: 'kanca', ad: 'Ok', renk: 'ok', fiyat: 0 },
    { id: 'kanca-capa', tur: 'kanca', ad: 'Çapa', renk: 'capa', fiyat: 50 },
    { id: 'kanca-yildiz', tur: 'kanca', ad: 'Yıldız', renk: 'yildiz', fiyat: 80 },
    { id: 'kanca-kalp', tur: 'kanca', ad: 'Kalp', renk: 'kalp', fiyat: 100 },
    { id: 'kanca-hilal', tur: 'kanca', ad: 'Hilal', renk: 'hilal', fiyat: 160 },
    { id: 'kanca-elmas', tur: 'kanca', ad: 'Elmas', renk: 'elmas', fiyat: 260 },
    { id: 'atki-turkuaz', tur: 'atki', ad: 'Turkuaz', renk: '#2fb3a6', fiyat: 0 },
    { id: 'atki-kiraz', tur: 'atki', ad: 'Kiraz', renk: '#e2445c', fiyat: 40 },
    { id: 'atki-mor', tur: 'atki', ad: 'Mor', renk: '#9b6bff', fiyat: 40 },
    { id: 'atki-altin', tur: 'atki', ad: 'Altın', renk: '#f2c23a', fiyat: 70 },
    { id: 'atki-gece', tur: 'atki', ad: 'Gece', renk: '#3b4fc4', fiyat: 70 },
    { id: 'atki-pembe', tur: 'atki', ad: 'Pembe', renk: '#ff8fc8', fiyat: 100 },
    { id: 'atki-kar', tur: 'atki', ad: 'Kar', renk: '#eef6f4', fiyat: 130 },
    { id: 'atki-zumrut', tur: 'atki', ad: 'Zümrüt', renk: '#35c27a', fiyat: 160 },
    { id: 'atki-gokkusagi', tur: 'atki', ad: 'Gökkuşağı', renk: 'gokkusagi', fiyat: 300 },
    { id: 'atki-fener', tur: 'atki', ad: 'Fener', renk: '#ffb84a', isik: 6 },
    { id: 'ip-keten', tur: 'ip', ad: 'Keten', renk: '#eadfc4', fiyat: 0 },
    { id: 'ip-gok', tur: 'ip', ad: 'Gök', renk: '#8fd6ff', fiyat: 30 },
    { id: 'ip-zumrut', tur: 'ip', ad: 'Zümrüt', renk: '#5fd39a', fiyat: 50 },
    { id: 'ip-altin', tur: 'ip', ad: 'Altın', renk: '#ffd36b', fiyat: 60 },
    { id: 'ip-ates', tur: 'ip', ad: 'Ateş', renk: '#ff7a3a', fiyat: 90 },
    { id: 'ip-gumus', tur: 'ip', ad: 'Gümüş', renk: '#d6dee6', fiyat: 130 },
    { id: 'ip-mor', tur: 'ip', ad: 'Mor', renk: '#b58cff', fiyat: 160 },
    { id: 'ip-gokkusagi', tur: 'ip', ad: 'Gökkuşağı', renk: 'gokkusagi', fiyat: 400 },
    { id: 'ip-fitil', tur: 'ip', ad: 'Fitil', renk: '#ffe2a0', isik: 9 },
    { id: 'iz-atki', tur: 'iz', ad: 'Atkı rengi', renk: 'atki', fiyat: 0 },
    { id: 'iz-kar', tur: 'iz', ad: 'Kar', renk: '#e8f4f2', fiyat: 40 },
    { id: 'iz-mor', tur: 'iz', ad: 'Mor', renk: '#b58cff', fiyat: 60 },
    { id: 'iz-altin', tur: 'iz', ad: 'Altın', renk: '#ffd36b', fiyat: 80 },
    { id: 'iz-ates', tur: 'iz', ad: 'Ateş', renk: '#ff7a3a', fiyat: 120 },
    { id: 'iz-buz', tur: 'iz', ad: 'Buz', renk: '#8fd6ff', fiyat: 150 },
    { id: 'iz-gokkusagi', tur: 'iz', ad: 'Gökkuşağı', renk: 'gokkusagi', fiyat: 250 },
    { id: 'iz-kivilcim', tur: 'iz', ad: 'Kıvılcım', renk: '#ffe9a8', isik: 3 },
    { id: 'iz-samanyolu', tur: 'iz', ad: 'Samanyolu', renk: '#dfe9ff', isik: 17 },
    // alev rengi (v0.53): akışta alevlenince Çıra'nın çevresindeki alev; renk tabanı, renk2 ucu (TAM ALEV)
    { id: 'alev-kor', tur: 'alev', ad: 'Kor', renk: '#ff9a3c', renk2: '#ffe08a', fiyat: 0 },
    { id: 'alev-mavi', tur: 'alev', ad: 'Mavi alev', renk: '#3aa0f2', renk2: '#c8f0ff', fiyat: 200 },
    { id: 'alev-yesil', tur: 'alev', ad: 'Yeşil alev', renk: '#3ecf6a', renk2: '#d9ffb0', fiyat: 280 },
    { id: 'alev-mor', tur: 'alev', ad: 'Mor alev', renk: '#a05cff', renk2: '#f0d0ff', fiyat: 360 },
    { id: 'alev-beyaz', tur: 'alev', ad: 'Ak alev', renk: '#dfe9ff', renk2: '#ffffff', fiyat: 600 },
    { id: 'alev-altin', tur: 'alev', ad: 'Altın alev', renk: '#f2b23a', renk2: '#fff6c8', isik: 11 }
  ];
  var TURLER = { govde: 'Kahraman', atki: 'Atkı', ip: 'İp', kanca: 'Kanca', iz: 'Uçuş izi', alev: 'Alev' };
  var VARSAYILAN = { govde: 'govde-turuncu', atki: 'atki-turkuaz', ip: 'ip-keten', kanca: 'kanca-ok', iz: 'iz-atki', alev: 'alev-kor' };
  // Işık yolu (v0.53): ömür boyu kazanılan ateşböceği (harcamak düşürmez) 20 ışık seviyesine bölünür. İlk 10 seviye
  // v0.40'taki "Kuyunun ışığı"; 11–20 uzun vadeli hedef. Bazı seviyeler satın alınamayan bir görünüm açar (isik: N).
  var ISIK = [0, 25, 60, 120, 200, 320, 480, 700, 1000, 1400, 2000, 2700, 3500, 4400, 5400, 6500, 7700, 9000, 10500, 12000, 14000];
  function isikSeviye(save) {
    var n = (save.cuzdan && save.cuzdan.kazanilan) || 0, sv = 0;
    while (sv + 1 < ISIK.length && n >= ISIK[sv + 1]) sv++;
    return sv;
  }
  // Işık seviyesiyle açılan görünümler dolaba eklenir (kuşanmak oyuncunun seçimi). Yeni eklenenleri döner.
  function isikOdul(save) {
    var sv = isikSeviye(save), yeni = [];
    KATALOG.forEach(function (it) { if (it.isik && it.isik <= sv && save.dolap.sahip.indexOf(it.id) < 0) { save.dolap.sahip.push(it.id); yeni.push(it); } });
    return yeni;
  }
  function isikSiradaki(save) {
    var sv = isikSeviye(save), en = null;
    KATALOG.forEach(function (it) { if (it.isik && it.isik > sv && (!en || it.isik < en.isik)) en = it; });
    return en;
  }

  function item(id) { for (var i = 0; i < KATALOG.length; i++) if (KATALOG[i].id === id) return KATALOG[i]; return null; }

  // Eski kayıtlar: başlangıç bakiyesi bölümlerde toplanmış ateşböcekleri (zaten kazanılmıştı).
  function ensure(save) {
    if (!save.cuzdan) {
      var ff = 0, b = save.best || {};
      for (var k in b) ff += b[k].ff || 0;
      save.cuzdan = { ates: ff, kazanilan: ff, harcanan: 0 };
    }
    if (!save.dolap) save.dolap = { sahip: [], kusan: {} };
    // her türün bedava varsayılanı sahip olunur ve kuşanılır (sonradan eklenen türler eski kayıtlara da gelir)
    Object.keys(VARSAYILAN).forEach(function (t) {
      if (save.dolap.sahip.indexOf(VARSAYILAN[t]) < 0) save.dolap.sahip.push(VARSAYILAN[t]);
      if (!save.dolap.kusan[t]) save.dolap.kusan[t] = VARSAYILAN[t];
    });
    if (!save.giris) save.giris = { gun: 0, son: null, toplam: 0 };
    isikOdul(save);
    return save;
  }

  function kazan(save, n) {
    ensure(save);
    n = Math.max(0, Math.floor(n || 0));
    save.cuzdan.ates += n; save.cuzdan.kazanilan += n;
    isikOdul(save);
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

  // ---------- Haftalık Kuyu ligi (v0.54) ----------
  // Lig, haftanın en iyi puanına göre belirlenir (sahte rakip yok; online skor tablosu gelince aynı puan gönderilir).
  // Eşikler tools/denge.js ölçümünden: %20 hata yapan ~1000, %10 hata ~1600, akışla %10 hata ~11000, akışla %5 ~52000.
  // Ödül hafta bitince, bir sonraki açılışta ödenir (kayıt: save.haftalik = { key, best, meters, tries }).
  var LIG = [
    { ad: 'Bronz', puan: 500, odul: 15 }, { ad: 'Gümüş', puan: 2000, odul: 30 }, { ad: 'Altın', puan: 6000, odul: 50 },
    { ad: 'Elmas', puan: 20000, odul: 80 }, { ad: 'Fener', puan: 50000, odul: 120 }
  ];
  function ligOf(puan) { var k = -1; for (var i = 0; i < LIG.length; i++) if (puan >= LIG[i].puan) k = i; return k; }
  function ligOdul(puan) { var k = ligOf(puan); return k < 0 ? 0 : LIG[k].odul; }
  function haftalikDurum(save, key) {
    var h = save.haftalik && save.haftalik.key === key ? save.haftalik : { key: key, best: 0, meters: 0, tries: 0 };
    var k = ligOf(h.best);
    return { key: key, best: h.best, meters: h.meters, tries: h.tries, lig: k, ligAd: k < 0 ? null : LIG[k].ad,
      sonraki: k + 1 < LIG.length ? LIG[k + 1] : null, odul: k < 0 ? 0 : LIG[k].odul };
  }
  // Koşu bitti: haftanın en iyisini güncelle. Döner: { rekor, lig, ligAtladi }
  function haftalikKaydet(save, key, puan, metre) {
    ensure(save);
    haftalikKapat(save, key); // önceki haftadan kalan varsa önce onu öde
    var h = save.haftalik && save.haftalik.key === key ? save.haftalik : { key: key, best: 0, meters: 0, tries: 0 };
    var once = ligOf(h.best), rekor = puan > h.best;
    h.tries++; h.best = Math.max(h.best, puan); h.meters = Math.max(h.meters, metre || 0);
    save.haftalik = h;
    return { rekor: rekor, lig: ligOf(h.best), ligAtladi: ligOf(h.best) > once };
  }
  // Yeni hafta başladıysa geçen haftanın lig ödülünü öde ve kaydı kapat. Ödenecek bir şey yoksa null.
  function haftalikKapat(save, key) {
    ensure(save);
    var h = save.haftalik;
    if (!h || h.key === key) return null;
    var k = ligOf(h.best), sonuc = k < 0 ? null : { lig: k, ligAd: LIG[k].ad, puan: h.best, odul: kazan(save, LIG[k].odul) };
    save.haftalik = null;
    return sonuc;
  }

  // ---------- dolap ----------
  function sahip(save, id) { ensure(save); return save.dolap.sahip.indexOf(id) >= 0; }
  // Devam hakkı (Sonsuz): bir koşuda en çok 3; bedel artar. Video yalnız ilk devamda (oyuncu seçerse).
  var DEVAM_BEDEL = [25, 50, 100];
  function devamBedel(n) { return n < DEVAM_BEDEL.length ? DEVAM_BEDEL[n] : null; }
  function devamOde(save, n) {
    ensure(save);
    var b = devamBedel(n);
    if (b == null || save.cuzdan.ates < b) return false;
    save.cuzdan.ates -= b; save.cuzdan.harcanan += b;
    return true;
  }
  function satinAl(save, id) {
    ensure(save);
    var it = item(id);
    if (!it) return { ok: false, neden: 'yok' };
    if (sahip(save, id)) return { ok: false, neden: 'sahip' };
    if (it.isik) return { ok: false, neden: 'isik', seviye: it.isik }; // satın alınmaz: ışık seviyesiyle açılır
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
    Object.keys(VARSAYILAN).forEach(function (t) { var it = item(k[t]) || item(VARSAYILAN[t]); out[t] = it.renk; if (it.renk2) out[t + '2'] = it.renk2; });
    return out;
  }

  var api = { GIRIS: GIRIS, GOREV_ATES: GOREV_ATES, BASARIM_ATES: BASARIM_ATES, KATALOG: KATALOG, TURLER: TURLER, VARSAYILAN: VARSAYILAN,
    ensure: ensure, kazan: kazan, bolumOde: bolumOde, girisDurum: girisDurum, girisAl: girisAl,
    LIG: LIG, ligOf: ligOf, ligOdul: ligOdul, haftalikDurum: haftalikDurum, haftalikKaydet: haftalikKaydet, haftalikKapat: haftalikKapat,
    ISIK: ISIK, isikSeviye: isikSeviye, isikOdul: isikOdul, isikSiradaki: isikSiradaki,
    item: item, sahip: sahip, satinAl: satinAl, kusan: kusan, gorunum: gorunum, DEVAM_BEDEL: DEVAM_BEDEL, devamBedel: devamBedel, devamOde: devamOde };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.KuyuEkonomi = api;
})(this);
