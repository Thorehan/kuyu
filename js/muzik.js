/* Kuyu — kendiliğinden çalan ortam müziği (dosyasız, Web Audio ile üretilir). window.KuyuMuzik.

   Gerçek müzik (ör. Mustafa'nın parçaları) gelince PARCALAR'a bölge başına bir ses dosyası yazılır;
   o bölgede dosya çalar, üretilen müzik susar. Dosya yoksa ya da yüklenemezse üretilen müzik çalar.

   Katmanlar: yumuşak ses halısı (akor), alçak zemin notası, akış sürerken açılan arpej, bölgeye özel renk
   (maden: damla, kristal: yankılı çan, kule: org). Notalar ~100 ms aralıkla biraz ileriye planlanır. */
(function (root) {
  'use strict';
  // Gerçek parçalar için yer: { tas: 'assets/muzik/tas.mp3', ... }. Boşsa üretilen müzik çalar.
  var PARCALAR = {};

  // bölge → akor dizisi (MIDI nota), tempo (BPM), tını
  var TEMA = {
    menu:    { bpm: 60, akor: [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]], tini: 'yumusak', arp: 0 },
    tas:     { bpm: 72, akor: [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]], tini: 'yumusak', arp: 1 },
    maden:   { bpm: 70, akor: [[50, 53, 57], [48, 52, 55], [55, 59, 62], [53, 57, 60]], tini: 'sicak', arp: 1 },
    kristal: { bpm: 76, akor: [[52, 56, 59], [54, 58, 61], [57, 61, 64], [52, 56, 59]], tini: 'can', arp: 1 },
    kule:    { bpm: 66, akor: [[48, 51, 55], [44, 48, 51], [46, 50, 53], [43, 47, 50]], tini: 'org', arp: 1 }
  };
  var SES = 0.16; // genel müzik düzeyi (efektlerin altında)

  var ctx = null, ana = null, filtre = null, yanki = null, sahne = 'menu', hedefYog = 0, yog = 0, kisik = false, acik = true;
  var sonraki = 0, adim = 0, zaman = null, dosya = null, dosyaSahne = null;

  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function kur(c) {
    ctx = c;
    ana = ctx.createGain(); ana.gain.value = 0;
    filtre = ctx.createBiquadFilter(); filtre.type = 'lowpass'; filtre.frequency.value = 2400;
    // basit yankı (kristal çanı için)
    yanki = ctx.createDelay(1); yanki.delayTime.value = 0.32;
    var geri = ctx.createGain(); geri.gain.value = 0.32;
    yanki.connect(geri); geri.connect(yanki); yanki.connect(filtre);
    filtre.connect(ana); ana.connect(ctx.destination);
  }

  // tek nota: zarf ile; hedef: filtre ya da yankı
  function nota(m, t, sure, tip, vol, atak, hedef) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tip; o.frequency.setValueAtTime(hz(m), t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (atak || 0.02));
    g.gain.exponentialRampToValueAtTime(0.0001, t + sure);
    o.connect(g); g.connect(hedef || filtre);
    o.start(t); o.stop(t + sure + 0.05);
  }
  function damla(t) { // maden: kısa, inen sinüs
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(1500 + Math.random() * 600, t); o.frequency.exponentialRampToValueAtTime(500, t + 0.12);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g); g.connect(yanki); o.start(t); o.stop(t + 0.2);
  }

  // bir sekizlik vuruş planla
  function planla(t) {
    var T = TEMA[sahne] || TEMA.tas, vurus = 60 / T.bpm / 2, olcu = adim % 16, akor = T.akor[Math.floor(adim / 16) % T.akor.length];
    if (olcu === 0) {
      // ses halısı: akorun üç notası, 2 ölçü boyu
      var tip = T.tini === 'org' ? 'square' : T.tini === 'sicak' ? 'sawtooth' : 'triangle', v = T.tini === 'org' ? 0.018 : T.tini === 'sicak' ? 0.022 : 0.05;
      akor.forEach(function (m) { nota(m, t, vurus * 16, tip, v, 0.9); });
      nota(akor[0] - 12, t, vurus * 16, 'sine', 0.09, 0.6); // zemin
    }
    // arpej: akış sürerken (yoğunluk) açılır
    if (T.arp && yog > 0.05 && olcu % 2 === 0) {
      var dizi = [akor[0], akor[1], akor[2], akor[1] + 12, akor[2], akor[1]], m2 = dizi[(olcu / 2) % dizi.length] + 12;
      nota(m2, t, vurus * 1.6, T.tini === 'can' ? 'sine' : 'triangle', 0.045 * yog, 0.005, T.tini === 'can' ? yanki : filtre);
    }
    // bölge rengi
    if (T.tini === 'can' && olcu === 8) nota(akor[2] + 24, t, 2.2, 'sine', 0.03, 0.005, yanki);
    if (T.tini === 'sicak' && (olcu === 5 || olcu === 13) && Math.random() < 0.6) damla(t);
    if (T.tini === 'org' && olcu === 12) nota(akor[0] + 12, t, vurus * 4, 'square', 0.012, 0.2);
    adim++;
    return vurus;
  }
  function dongu() {
    if (!ctx || !acik || dosya) return;
    // yoğunluk yumuşak değişir
    yog += (hedefYog - yog) * 0.2;
    while (sonraki < ctx.currentTime + 0.25) sonraki += planla(sonraki);
  }
  function duzey() {
    if (!ana) return;
    var hedef = !acik ? 0 : kisik ? SES * 0.35 : SES;
    ana.gain.cancelScheduledValues(ctx.currentTime);
    ana.gain.setTargetAtTime(hedef, ctx.currentTime, 0.4);
    if (dosya) dosya.volume = !acik ? 0 : kisik ? 0.35 : 1;
  }
  function dosyaDene(s) {
    if (dosyaSahne === s) return;
    if (dosya) { dosya.pause(); dosya = null; }
    dosyaSahne = s;
    if (!PARCALAR[s]) return;
    var a = new Audio(PARCALAR[s]); a.loop = true; a.volume = acik ? 1 : 0;
    a.play().then(function () { dosya = a; duzey(); }, function () { dosya = null; });
  }

  var api = {
    PARCALAR: PARCALAR,
    // ses bağlamı hazır olunca bir kez çağrılır
    baslat: function (c, ac) {
      if (!c) return;
      if (!ctx) { kur(c); sonraki = ctx.currentTime + 0.1; zaman = setInterval(dongu, 100); }
      acik = ac !== false; duzey();
    },
    acik: function (a) { acik = !!a; if (!acik && dosya) dosya.pause(); else if (acik && dosya) dosya.play().catch(function () {}); duzey(); },
    sahne: function (s) {
      if (!TEMA[s] || s === sahne) return;
      sahne = s; adim = 0; if (ctx) sonraki = Math.max(sonraki, ctx.currentTime + 0.05);
      dosyaDene(s);
    },
    yogunluk: function (v) { hedefYog = Math.max(0, Math.min(1, v)); },
    kis: function (k) { kisik = !!k; duzey(); },
    durum: function () { return { sahne: sahne, acik: acik, kisik: kisik, yogunluk: Math.round(yog * 100) / 100, calisiyor: !!ctx, adim: adim }; }
  };
  root.KuyuMuzik = api;
})(this);
