/* Kuyu — online: meydan okuma bağlantısı ve skor tablosu istemcisi. Tarayıcıda window.KuyuOnline, Node'da module.exports.

   1) Meydan okuma (arka uç gerekmez): koşunun tohumu, puanı ve oyuncu adı bağlantıya yazılır
      (?meydan=s-<tohum>-<puan>-<ad>). Bağlantıyı açan aynı kuyuyu oynar; sonuç kartı iki puanı karşılaştırır.
      Puan beyana dayanır (arkadaşlar arası); doğrulama skor tablosuyla birlikte sunucuda yapılacak.

   2) Skor tablosu (arka uç gerekir, hazır ama KAPALI): AYAR boşken hiçbir istek atılmaz, arayüzde hiçbir şey görünmez.
      Supabase (PostgREST) biçiminde iki çağrı: rpc/skor_gonder ve skorlar listesi. Kurulum: docs/online-kurulum.md.
      Gönderilen: rastgele cihaz kimliği (hesap değil), oyuncu adı, puan, metre. Başka hiçbir şey gönderilmez.
      Yerelde denemek için: node tools/sahte-sunucu.js, sonra oyunu ?online=yerel ile aç (kapatmak için ?online=kapat). */
(function (root) {
  'use strict';
  // Supabase projesi açılınca bu iki alan doldurulur (anon anahtar herkese açık olacak şekilde tasarlanmıştır;
  // yazma yalnızca rpc/skor_gonder ile, satır düzeyi güvenlik açık). Boşken online kapalıdır.
  var AYAR = { url: '', anahtar: '' };
  var YEREL = { url: 'http://localhost:8767', anahtar: 'yerel-deneme' };
  var DEPO = 'kuyu.online';

  function depo() { try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { return null; } }
  function ayar() {
    var d = depo();
    try { var o = d && JSON.parse(d.getItem(DEPO) || 'null'); if (o && o.url && o.anahtar) return o; } catch (e) {}
    return AYAR;
  }
  // ?online=yerel → yerel sahte sunucu; ?online=kapat → varsayılana dön
  function ayarBaglanti(deger) {
    var d = depo(); if (!d) return;
    if (deger === 'yerel') d.setItem(DEPO, JSON.stringify(YEREL));
    else if (deger === 'kapat') d.removeItem(DEPO);
  }
  function acik() { var a = ayar(); return !!(a.url && a.anahtar); }

  function uuid() {
    var c = typeof crypto !== 'undefined' ? crypto : null;
    if (c && c.randomUUID) return c.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (ch) { var r = Math.random() * 16 | 0; return (ch === 'x' ? r : (r & 3 | 8)).toString(16); });
  }
  // Cihaz kimliği: hesap değil, yalnızca aynı oyuncunun satırını güncellemek için. Kayıtta durur.
  function kimlik(save) { if (!save.online) save.online = {}; if (!save.online.kimlik) save.online.kimlik = uuid(); return save.online.kimlik; }
  function temizAd(s) { return String(s || '').replace(/[<>&"]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16) || 'Tırmanıcı'; }

  function istek(yol, govde) {
    var a = ayar();
    if (!acik() || typeof fetch !== 'function') return Promise.reject(new Error('online kapalı'));
    var kes = typeof AbortController === 'function' ? new AbortController() : null;
    var zaman = kes ? setTimeout(function () { kes.abort(); }, 6000) : null;
    return fetch(a.url.replace(/\/$/, '') + yol, {
      method: govde ? 'POST' : 'GET',
      headers: { apikey: a.anahtar, Authorization: 'Bearer ' + a.anahtar, 'Content-Type': 'application/json' },
      body: govde ? JSON.stringify(govde) : undefined, signal: kes ? kes.signal : undefined
    }).then(function (r) { if (zaman) clearTimeout(zaman); if (!r.ok) throw new Error('sunucu ' + r.status); return r.json(); },
      function (e) { if (zaman) clearTimeout(zaman); throw e; });
  }
  // tahta: 'h-2026-11-09' (Haftalık Kuyu, pazartesi tarihi) ya da 'g-2026-11-11' (Günlük Kuyu)
  function gonder(save, tahta, ad, puan, metre) {
    return istek('/rest/v1/rpc/skor_gonder', { p_tahta: tahta, p_oyuncu: kimlik(save), p_ad: temizAd(ad), p_puan: Math.max(0, Math.floor(puan)), p_metre: Math.max(0, Math.floor(metre || 0)) });
  }
  function tablo(tahta, n) {
    return istek('/rest/v1/skorlar?tahta=eq.' + encodeURIComponent(tahta) + '&select=ad,puan,metre,oyuncu&order=puan.desc&limit=' + (n || 100))
      .then(function (rows) { return Array.isArray(rows) ? rows : []; });
  }
  // Listedeki yerin: { sira (1'den), toplam, liste: ilk 'ust' satır + sen }. Listede yoksan sira null (ilk n dışında).
  function ozet(rows, benim, ust) {
    var sira = null;
    for (var i = 0; i < rows.length; i++) if (rows[i].oyuncu === benim) { sira = i + 1; break; }
    var liste = rows.slice(0, ust || 5).map(function (r, k) { return { sira: k + 1, ad: temizAd(r.ad), puan: r.puan, ben: r.oyuncu === benim }; });
    if (sira && sira > liste.length) liste.push({ sira: sira, ad: temizAd(rows[sira - 1].ad), puan: rows[sira - 1].puan, ben: true }); // ilk 'ust' dışındaysan kendi satırın da eklenir
    return { sira: sira, toplam: rows.length, liste: liste };
  }

  // ---------- meydan okuma ----------
  // tur: 's' Sonsuz Kuyu kuralları, 'h' Haftalık Kuyu kuralları. Tohum 32 bit, 36'lık yazılır.
  function meydanKodla(m) { return (m.tur === 'h' ? 'h' : 's') + '-' + (m.seed >>> 0).toString(36) + '-' + Math.max(0, Math.floor(m.puan)) + '-' + encodeURIComponent(temizAd(m.ad)); }
  function meydanCoz(str) {
    var p = /^([sh])-([0-9a-z]{1,7})-(\d{1,9})-(.{1,96})$/.exec(String(str || ''));
    if (!p) return null;
    var seed = parseInt(p[2], 36), ad;
    try { ad = decodeURIComponent(p[4]); } catch (e) { return null; }
    if (!(seed >= 0 && seed <= 0xFFFFFFFF)) return null;
    return { tur: p[1], seed: seed >>> 0, puan: parseInt(p[3], 10), ad: temizAd(ad) };
  }
  function meydanBaglanti(taban, m) { return taban + '?meydan=' + meydanKodla(m); }

  var api = { AYAR: AYAR, YEREL: YEREL, ayar: ayar, ayarBaglanti: ayarBaglanti, acik: acik, kimlik: kimlik, temizAd: temizAd,
    gonder: gonder, tablo: tablo, ozet: ozet, meydanKodla: meydanKodla, meydanCoz: meydanCoz, meydanBaglanti: meydanBaglanti };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.KuyuOnline = api;
})(typeof window !== 'undefined' ? window : this);
