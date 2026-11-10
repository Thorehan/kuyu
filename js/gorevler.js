/* Kuyu — günlük görevler ve kalıcı başarımlar. Kayıt nesnesi (save) üzerinde çalışır, DOM bilmez;
   Node'da da yüklenir (tools/gorev-test.js). Tarayıcıda window.KuyuGorev.

   Bir "koşu" = geçilen bölüm ya da biten Sonsuz/Günlük Kuyu koşusu. Bölümde ölüp yeniden başlamak sayılmaz.
   Koşu özeti: { mode: 'level'|'endless'|'daily', won, ff, boosts, maxCombo, meters, speed (m/sn), perfect } */
(function (root) {
  'use strict';

  // ---------- günlük görevler ----------
  // Her gün 3 görev: kolay, orta, zor (farklı türlerden). Hedefler botların ölçtüğü oynanışa göre:
  // ortalama oyuncu Sonsuz Kuyu'da ~450 m, bir hız halkası ~33 m/sn, akış zinciri x1,50 çarpanda ~57 m/sn.
  var MISSIONS = {
    ff:       { ad: function (n) { return n + ' ateşböceği topla'; }, how: 'sum', key: 'ff', t: [5, 10, 18] },
    hiz:      { ad: function (n) { return n + ' hız halkasından geç'; }, how: 'sum', key: 'boosts', t: [2, 5, 9] },
    akis:     { ad: function (n) { return 'Bir koşuda x' + n + ' akışa ulaş'; }, how: 'max', key: 'maxCombo', t: [6, 10, 16] },
    bolum:    { ad: function (n) { return n + ' bölüm geç'; }, how: 'sum', key: 'won', only: 'level', t: [2, 4, 7] },
    kusursuz: { ad: function (n) { return n === 1 ? 'Bir bölümü Kusursuz geç' : n + ' bölümü Kusursuz geç'; }, how: 'sum', key: 'perfect', only: 'level', t: [1, 2, 4] },
    metre:    { ad: function (n) { return 'Tek koşuda ' + n + ' m tırman (Sonsuz ya da Günlük)'; }, how: 'max', key: 'meters', only: 'endless', t: [150, 300, 550] },
    gunluk:   { ad: function (n) { return n === 1 ? 'Günlük Kuyu\'yu oyna' : 'Günlük Kuyu\'da ' + n + ' deneme yap'; }, how: 'sum', key: 'one', only: 'daily', t: [1, 2, 3] },
    serit:    { ad: function (n) { return n + ' rüzgâr şeridinden geç'; }, how: 'sum', key: 'gates', t: [2, 5, 9] },
    hizMs:    { ad: function (n) { return 'Bir koşuda ' + n + ' m/sn hıza çık'; }, how: 'max', key: 'speed', t: [25, 40, 52] }
  };
  var KINDS = Object.keys(MISSIONS);
  var REWARD = [50, 100, 150]; // ödül puanı (toplam ödüle eklenir)
  var TIER_AD = ['Kolay', 'Orta', 'Zor'];

  function hash(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h;
  }
  function rng(seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  // O günün 3 görevi; aynı gün herkes için aynı.
  function pick(key) {
    var r = rng(hash('kuyu-gorev-' + key)), pool = KINDS.slice(), out = [];
    for (var tier = 0; tier < 3; tier++) {
      var i = Math.floor(r() * pool.length), k = pool.splice(i, 1)[0];
      out.push({ k: k, tier: tier, target: MISSIONS[k].t[tier], prog: 0, done: false, claimed: false });
    }
    return out;
  }
  // Bugünün görevlerini getir; gün değiştiyse yenisini kur.
  function daily(save, key) {
    if (!save.missions || save.missions.date !== key) save.missions = { date: key, list: pick(key) };
    return save.missions.list;
  }
  function missionText(m) { return MISSIONS[m.k].ad(m.target); }
  function runValue(m, run) {
    var d = MISSIONS[m.k];
    if (d.only === 'level' && run.mode !== 'level') return 0;
    if (d.only === 'endless' && run.mode === 'level') return 0;
    if (d.only === 'daily' && run.mode !== 'daily') return 0;
    if (d.key === 'one') return 1;
    if (d.key === 'won') return run.won ? 1 : 0;
    if (d.key === 'perfect') return run.won && run.perfect ? 1 : 0;
    return Math.floor(run[d.key] || 0);
  }

  // ---------- başarımlar ----------
  // Üç kademe: Bronz, Gümüş, Altın. Değerler kayıttan okunur, ayrıca sayılmaz (eski ilerleme de geçerli).
  var ACH = [
    { id: 'ates', ad: 'Ateşböceği avcısı', acik: 'Toplam ateşböceği', t: [25, 100, 400], val: function (s) { return s.totals.ff; } },
    { id: 'ruzgar', ad: 'Rüzgâr', acik: 'Toplam hız halkası', t: [10, 50, 200], val: function (s) { return s.totals.boosts; } },
    { id: 'akis', ad: 'Akış ustası', acik: 'Bir koşuda en uzun akış', t: [10, 20, 40], val: function (s) { return s.totals.maxCombo; }, fmt: function (n) { return 'x' + n; } },
    { id: 'hizli', ad: 'Işık hızı', acik: 'En yüksek hız', t: [30, 45, 55], val: function (s) { return Math.floor((s.stats && s.stats.maxSpeed) || 0); }, fmt: function (n) { return n + ' m/sn'; } },
    { id: 'kasif', ad: 'Kâşif', acik: 'Geçilen bölüm', t: [10, 30, 100], val: function (s) { return count(s, 'done'); } },
    { id: 'kusursuz', ad: 'Kusursuz', acik: 'Kusursuz geçilen bölüm', t: [5, 20, 60], val: function (s) { return count(s, 'perfect'); } },
    { id: 'derin', ad: 'Derin kuyu', acik: 'Bir koşuda en yüksek metre', t: [300, 1000, 3000], val: function (s) { return Math.max(s.totals.maxMeters, (s.endless && s.endless.meters) || 0); }, fmt: function (n) { return n + ' m'; } },
    { id: 'sadik', ad: 'Sadık', acik: 'En uzun Günlük Kuyu serisi', t: [3, 7, 30], val: function (s) { return (s.streak && s.streak.max) || 0; }, fmt: function (n) { return n + ' gün'; } },
    { id: 'gorevci', ad: 'Görevci', acik: 'Tamamlanan görev', t: [5, 25, 100], val: function (s) { return s.totals.missions; } }
  ];
  var KADEME = ['Bronz', 'Gümüş', 'Altın'];
  function count(s, f) { var n = 0, b = s.best || {}; for (var k in b) if (b[k][f]) n++; return n; }

  // Eski kayıtlarda toplamlar yok: bilinenlerden başlat (bölüm ateşböcekleri, sonsuz rekor akış ve metre).
  function ensure(save) {
    if (!save.totals) {
      var ff = 0, b = save.best || {};
      for (var k in b) ff += b[k].ff || 0;
      var e = save.endless || {};
      save.totals = { ff: ff, boosts: 0, maxCombo: e.combo || 0, maxMeters: e.meters || 0, missions: 0, runs: 0 };
    }
    if (!save.ach) save.ach = {};
    if (save.odulEk == null) save.odulEk = 0;
    return save;
  }
  function tierOf(a, v) { var t = 0; while (t < 3 && v >= a.t[t]) t++; return t; } // 0 = hiç, 3 = altın
  function achList(save) {
    ensure(save);
    return ACH.map(function (a) {
      var v = a.val(save), t = tierOf(a, v), f = a.fmt || String;
      return { id: a.id, ad: a.ad, acik: a.acik, val: v, tier: t, next: t < 3 ? a.t[t] : null, prev: t > 0 ? a.t[t - 1] : 0,
        valText: f(v), nextText: t < 3 ? f(a.t[t]) : null, kademe: t ? KADEME[t - 1] : null };
    });
  }
  // Yeni kazanılan kademeler (kayıtta işaretlenir).
  function newAch(save) {
    var out = [];
    achList(save).forEach(function (a) {
      var had = save.ach[a.id] || 0;
      if (a.tier > had) { save.ach[a.id] = a.tier; out.push(a); }
    });
    return out;
  }

  // Koşu bittiğinde: toplamlar, görev ilerlemesi, yeni başarımlar. Kaydı kalıcı yapmak çağıranın işi.
  function record(save, run, key) {
    ensure(save);
    var T = save.totals;
    T.runs++;
    T.ff += run.ff || 0;
    T.boosts += run.boosts || 0;
    T.maxCombo = Math.max(T.maxCombo, run.maxCombo || 0);
    if (run.mode !== 'level') T.maxMeters = Math.max(T.maxMeters, run.meters || 0);
    var doneNow = [];
    daily(save, key).forEach(function (m) {
      if (m.done) return;
      var v = runValue(m, run);
      m.prog = MISSIONS[m.k].how === 'max' ? Math.max(m.prog, v) : m.prog + v;
      if (m.prog >= m.target) { m.prog = m.target; m.done = true; T.missions++; doneNow.push({ text: missionText(m), reward: REWARD[m.tier] }); }
    });
    return { missions: doneNow, ach: newAch(save) };
  }
  // Tamamlanan görevin ödülünü al.
  function claim(save, i) {
    var m = save.missions && save.missions.list[i];
    if (!m || !m.done || m.claimed) return 0;
    m.claimed = true;
    save.odulEk = (save.odulEk || 0) + REWARD[m.tier];
    return REWARD[m.tier];
  }
  function unclaimed(save, key) { return daily(save, key).filter(function (m) { return m.done && !m.claimed; }).length; }

  var api = { MISSIONS: MISSIONS, ACH: ACH, REWARD: REWARD, TIER_AD: TIER_AD, KADEME: KADEME,
    pick: pick, daily: daily, missionText: missionText, record: record, claim: claim, unclaimed: unclaimed,
    achList: achList, newAch: newAch, ensure: ensure };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.KuyuGorev = api;
})(this);
