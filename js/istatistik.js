/* Kuyu — yerel oyun istatistiği (denge için). Yalnızca cihazda tutulur, hiçbir yere gönderilmez.
   Ayarlar → Oyun istatistikleri sayfası özetini gösterir; "Panoya kopyala" ile JSON paylaşılabilir.
   Kayıt nesnesi (save) üzerinde çalışır, DOM bilmez; Node'da da yüklenir (tools/istatistik-test.js).

   Bir "koşu" her bölüm denemesi ya da Sonsuz/Günlük koşusudur. Her koşu tek bir sonla kaydedilir:
   gecis (bölüm geçildi), olum (bölümde öldü), atla (Bölümü atla), terk (yarıda bırakıldı: ana menü, yeniden
   başla, başka bölüm), kosu (Sonsuz/Günlük bitti). */
(function (root) {
  'use strict';
  var SURUM = 1, METRE_SAKLA = 30;

  function ensure(save) {
    if (!save.istat || save.istat.surum !== SURUM) {
      save.istat = { surum: SURUM, baslangic: new Date().toISOString().slice(0, 10), sure: 0, bolum: {},
        sonsuz: { kosu: 0, sure: 0, metreler: [], enIyiMetre: 0, akis: 0 }, gunluk: { kosu: 0, sure: 0, metreler: [], enIyiMetre: 0, akis: 0 },
        halka: { hiz: 0, serit: 0, yay: 0, gecit: 0, sarkac: 0, bos: 0, kurtarma: 0, kayma: 0, atis: 0 } };
    }
    return save.istat;
  }
  function bolumKaydi(I, n) {
    return I.bolum[n] || (I.bolum[n] = { deneme: 0, gecis: 0, olum: 0, atla: 0, terk: 0, sure: 0, enIyiSure: 0, olumYer: [], bos: 0, kurtarma: 0 });
  }
  function r1(x) { return Math.round(x * 10) / 10; }

  // sim'den gelen sayaçları ortak toplamlara ekle (her koşu sonunda bir kez)
  function halkaEkle(I, c) {
    var h = I.halka;
    h.hiz += c.boosts || 0; h.serit += c.gates || 0; h.yay += c.springs || 0; h.gecit += c.portals || 0; h.sarkac += c.swings || 0;
    h.bos += c.misses || 0; h.kurtarma += c.rescues || 0; h.kayma += c.slips || 0; h.atis += c.shots || 0;
    I.sure = r1(I.sure + (c.t || 0));
  }

  // tur: 'gecis' | 'olum' | 'atla' | 'terk'; c: sim sayaçları + { t, ilerleme (0..1), neden }
  function bolum(save, n, tur, c) {
    var I = ensure(save), b = bolumKaydi(I, n);
    b.deneme++;
    b[tur] = (b[tur] || 0) + 1;
    b.sure = r1(b.sure + (c.t || 0));
    b.bos += c.misses || 0; b.kurtarma += c.rescues || 0;
    if (tur === 'gecis' && (!b.enIyiSure || c.t < b.enIyiSure)) b.enIyiSure = r1(c.t);
    if (tur === 'olum') { b.olumYer.push(Math.round((c.ilerleme || 0) * 100)); if (b.olumYer.length > 10) b.olumYer.shift(); }
    halkaEkle(I, c);
  }
  // mod: 'sonsuz' | 'gunluk'; c: sim sayaçları + { t, metre, akis }
  function kosu(save, mod, c) {
    var I = ensure(save), k = I[mod];
    k.kosu++; k.sure = r1(k.sure + (c.t || 0));
    k.metreler.push(c.metre || 0); if (k.metreler.length > METRE_SAKLA) k.metreler.shift();
    k.enIyiMetre = Math.max(k.enIyiMetre, c.metre || 0); k.akis = Math.max(k.akis, c.akis || 0);
    halkaEkle(I, c);
  }

  function ortanca(a) { if (!a.length) return 0; var s = a.slice().sort(function (x, y) { return x - y; }); return s[Math.floor(s.length / 2)]; }
  // Ekran ve paylaşım için özet
  function ozet(save) {
    var I = ensure(save), list = Object.keys(I.bolum).map(function (n) { var b = I.bolum[n]; return Object.assign({ n: +n }, b); });
    var top = { deneme: 0, gecis: 0, olum: 0, atla: 0, terk: 0 };
    list.forEach(function (b) { Object.keys(top).forEach(function (k) { top[k] += b[k] || 0; }); });
    // zorlanılan bölümler: geçişten önceki ölüm ve atlama çok olanlar
    var zor = list.filter(function (b) { return b.olum + b.atla + b.terk > 0; })
      .sort(function (a, b) { return (b.olum + 2 * b.atla + b.terk) - (a.olum + 2 * a.atla + a.terk) || a.n - b.n; }).slice(0, 8)
      .map(function (b) { return { n: b.n, deneme: b.deneme, gecis: b.gecis, olum: b.olum, atla: b.atla, terk: b.terk, olumYerOrtanca: ortanca(b.olumYer), ortSure: b.gecis ? r1(b.sure / b.deneme) : null }; });
    function kosuOzet(k) { return { kosu: k.kosu, sure: k.sure, ortancaMetre: ortanca(k.metreler), enIyiMetre: k.enIyiMetre, enUzunAkis: k.akis, sonMetreler: k.metreler.slice(-10) }; }
    return { baslangic: I.baslangic, toplamSureDk: Math.round(I.sure / 6) / 10, bolumler: top, oynananBolum: list.length,
      zorlanilan: zor, sonsuz: kosuOzet(I.sonsuz), gunluk: kosuOzet(I.gunluk), halka: Object.assign({}, I.halka) };
  }
  function sifirla(save) { delete save.istat; return ensure(save); }

  var api = { ensure: ensure, bolum: bolum, kosu: kosu, ozet: ozet, sifirla: sifirla };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.KuyuIstat = api;
})(this);
