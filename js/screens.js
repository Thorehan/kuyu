/* Kuyu — ekran akışı: Funday Morning açılışı → (ilk açılışta) giriş → tanıtım → ana menü.
   Bölümler ve ayarlar sayfaları da burada. Oyunun kendisi js/game.js (window.KuyuGame). */
(function () {
  'use strict';
  var G = window.KuyuGame;
  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EKRANLAR = ['ekAcilis', 'ekGiris', 'ekTanitim', 'ekAna', 'ekBolumler', 'ekAyarlar', 'ekProfil'];
  var current = 'ekAcilis';
  var q = new URLSearchParams(location.search);
  var deepLink = q.get('mod') === 'sonsuz' ? { mode: 'endless' } : q.get('bolum') ? { mode: 'level', n: parseInt(q.get('bolum'), 10) || 1 } : null;
  var save = function () { return G.save(); };

  function show(id) {
    current = id;
    EKRANLAR.forEach(function (e) { $(e).hidden = e !== id; });
    $('oyunEkrani').hidden = id !== 'oyun';
    if (id === 'ekAna' || id === 'ekTanitim') startScene(); else stopScene();
  }

  var toastT = null;
  function toast(msg, ms) {
    var b = $('bildirim');
    b.textContent = msg; b.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(function () { b.hidden = true; }, ms || 2400);
  }

  function cleanName(s) { return String(s || '').replace(/[<>&"]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16); }

  // ---------- açılış ----------
  function boot() {
    show('ekAcilis');
    var loaded = false;
    var logo = $('acilisLogo');
    var waits = [document.fonts && document.fonts.ready, logo.decode ? logo.decode() : null];
    Promise.all(waits.map(function (p) { return Promise.resolve(p).catch(function () {}); })).then(function () { loaded = true; });
    var t0 = performance.now(), MIN_MS = deepLink ? 900 : 2200;
    (function stepLoad(now) {
      var k = Math.min(1, (now - t0) / MIN_MS);
      var p = loaded ? k : Math.min(k, 0.9);
      $('yuklemeDolgu').style.width = (p * 100) + '%';
      if (p >= 1) setTimeout(afterSplash, 250);
      else requestAnimationFrame(stepLoad);
    })(t0);
  }
  function afterSplash() {
    if (!save().profile) { show('ekGiris'); $('oyuncuAd').focus({ preventScroll: true }); return; }
    if (deepLink) return openDeepLink();
    runIntro();
  }
  function openDeepLink() {
    var d = deepLink; deepLink = null;
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
    if (d.mode === 'endless') G.startEndless(); else G.startLevel(d.n);
  }

  // ---------- giriş ----------
  $('girisForm').addEventListener('submit', function (e) {
    e.preventDefault();
    G.unlockAudio();
    var s = save();
    s.profile = { name: cleanName($('oyuncuAd').value) || 'Tırmanıcı', method: 'misafir', createdAt: Date.now() };
    G.persist();
    if (deepLink) openDeepLink(); else runIntro();
  });
  document.querySelectorAll('[data-saglayici]').forEach(function (b) {
    b.addEventListener('click', function () { toast(b.dataset.saglayici + ' ile giriş yakında. Şimdilik misafir olarak oynayabilirsin.', 2800); });
  });

  // ---------- tanıtım ----------
  var introStage = 0, introTimer = 0, dayStart = 0;
  function runIntro() {
    show('ekTanitim');
    $('ekTanitim').classList.remove('gun');
    introStage = 1;
    requestAnimationFrame(function () { $('sunar').classList.add('goster'); });
    introTimer = setTimeout(function () {
      $('sunar').classList.remove('goster');
      introTimer = setTimeout(introDay, 550);
    }, reduceMotion ? 900 : 2000);
  }
  function introDay() {
    clearTimeout(introTimer);
    introStage = 2;
    dayStart = performance.now();
    sceneT0 = performance.now();
    $('sunar').classList.remove('goster');
    $('ekTanitim').classList.add('gun');
    if (G.sfx && !save().mute) {
      setTimeout(function () { if (introStage === 2) G.sfx.fire(); }, 300);
      setTimeout(function () { if (introStage === 2) G.sfx.attach(); }, 450);
      setTimeout(function () { if (introStage === 2) G.sfx.won(); }, 1350);
    }
  }
  $('ekTanitim').addEventListener('click', function () {
    G.unlockAudio();
    if (introStage === 1) introDay();
    else if (introStage === 2 && performance.now() - dayStart > 500) { introStage = 0; home(); }
  });

  // ---------- ana menü ----------
  function medalCount() {
    var s = save(), n = 0, done = 0;
    Object.keys(s.best || {}).forEach(function (k) {
      var b = s.best[k];
      n += (b.ff || 0) + (b.perfect ? 1 : 0) + (b.flow ? 1 : 0);
      if (b.done) done++;
    });
    return { medals: n, done: done };
  }
  function home() {
    var s = save();
    $('selamAd').textContent = (s.profile && s.profile.name) || 'Tırmanıcı';
    $('oynaNo').textContent = s.last || 1;
    var rec = s.endless || {};
    $('sonsuzRekor').textContent = rec.score ? 'Rekor ' + rec.score + ' · ' + rec.meters + ' m' : 'Bölüm yok, su yükselir';
    var mc = medalCount();
    $('madalyaSay').textContent = mc.done ? mc.done + ' bölüm · ' + mc.medals + ' hedef' : 'Hepsi açık, sonu yok';
    show('ekAna');
  }
  $('oynaBtn').addEventListener('click', function () { G.startLevel(save().last || 1); });
  $('sonsuzBtn').addEventListener('click', function () { G.startEndless(); });
  $('bolumlerBtn').addEventListener('click', function () { openLevels(); });
  $('ayarBtn').addEventListener('click', function () { openSettings(); });
  $('profilBtn').addEventListener('click', function () { openProfile(); });

  // ---------- profil kartı ----------
  function fmt(n, d) { return Number(n || 0).toFixed(d).replace('.', ','); }
  function openProfile() {
    var s = save(), st = s.stats || {}, rec = s.endless || {};
    var best = s.best || {}, keys = Object.keys(best);
    var done = keys.filter(function (k) { return best[k].done; }).map(Number);
    var ff = 0, perfect = 0, flow = 0, total = 0;
    keys.forEach(function (k) { var b = best[k]; ff += b.ff || 0; if (b.perfect) perfect++; if (b.flow) flow++; total += b.reward || 0; });
    $('pAd').textContent = (s.profile && s.profile.name) || 'Tırmanıcı';
    $('pHesap').textContent = 'Misafir · ilerleme bu cihazda';
    $('pHiz').textContent = fmt(st.maxSpeed, 1) + ' m/sn';
    $('pHizNot').textContent = st.maxSpeed >= 40 ? 'Akış ustası: ipi erken bırakıp zincir kuruyorsun.' : 'İpi tam sarılmadan bırak, havadayken sıradakine tutun: hız ve ödül artar.';
    $('pBolum').textContent = done.length ? Math.max.apply(null, done) : '–';
    $('pGecilen').textContent = done.length;
    $('pAtes').textContent = ff;
    $('pMadalya').textContent = perfect + ' · ' + flow;
    $('pOdul').textContent = total;
    $('pEnIyiOdul').textContent = st.bestReward || 0;
    $('pRekor').textContent = rec.score || 0;
    $('pMetre').textContent = (rec.meters || 0) + ' m';
    $('pKat').textContent = Math.floor((rec.meters || 0) / 3);
    $('pAkis').textContent = 'x' + (rec.combo || 0);
    show('ekProfil');
  }
  document.querySelectorAll('[data-geri]').forEach(function (b) { b.addEventListener('click', home); });

  // ---------- bölümler ----------
  var listUpto = 0;
  function openLevels() {
    var s = save();
    listUpto = Math.max(18, Math.ceil(((s.maxLevel || 1) + 6) / 3) * 3);
    renderLevels();
    show('ekBolumler');
    $('ekBolumler').scrollTop = 0;
  }
  function renderLevels() {
    var s = save(), h = '';
    for (var n = 1; n <= listUpto; n++) {
      var b = s.best[n], d = G.levelDef(n).name, dots = '';
      for (var k = 0; k < 3; k++) dots += '<i class="' + (b && k < b.ff ? 'var' : '') + '"></i>';
      dots += '<i class="m' + (b && b.perfect ? ' var' : '') + '"></i><i class="m' + (b && b.flow ? ' var' : '') + '"></i>';
      h += '<button type="button" data-n="' + n + '"' + (n === (s.last || 1) ? ' aria-current="true"' : '') + '>' +
        '<span class="no">Bölüm ' + n + (b && b.done ? ' ✓' : '') + '</span><b>' + d + '</b><span class="rozet">' + dots + '</span></button>';
    }
    $('liste').innerHTML = h;
  }
  $('liste').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-n]'); if (!b) return;
    G.startLevel(+b.dataset.n);
  });
  $('dahaBtn').addEventListener('click', function () { listUpto += 18; renderLevels(); });
  $('gitForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var n = parseInt($('gitNo').value, 10);
    if (n > 0) G.startLevel(n); else toast('Bir bölüm numarası yaz (1 ya da daha büyük).');
  });

  // ---------- ayarlar ----------
  function openSettings() {
    var s = save();
    $('sesAnahtar').setAttribute('aria-checked', s.mute ? 'false' : 'true');
    $('titresimAnahtar').setAttribute('aria-checked', s.haptics === false ? 'false' : 'true');
    $('adDegis').value = (s.profile && s.profile.name) || '';
    show('ekAyarlar');
  }
  $('sesAnahtar').addEventListener('click', function () {
    var muted = G.toggleMute();
    $('sesAnahtar').setAttribute('aria-checked', muted ? 'false' : 'true');
  });
  $('titresimAnahtar').addEventListener('click', function () {
    var on = G.toggleHaptics();
    $('titresimAnahtar').setAttribute('aria-checked', on ? 'true' : 'false');
  });
  $('adForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var s = save(), name = cleanName($('adDegis').value);
    if (!name) { toast('Ad boş olamaz.'); return; }
    s.profile = Object.assign({}, s.profile || { method: 'misafir', createdAt: Date.now() }, { name: name });
    G.persist();
    toast('Adın kaydedildi: ' + name);
  });
  $('tanitimBtn').addEventListener('click', runIntro);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && (current === 'ekBolumler' || current === 'ekAyarlar' || current === 'ekProfil')) home();
    if ((e.key === 'Enter' || e.key === ' ') && current === 'ekTanitim') $('ekTanitim').click();
  });

  // ---------- sahne: kuyunun içi (ana menü ve tanıtım) ----------
  // Tanıtımda kahraman dipten kanca atar, halkaya çekilir ve gün ışığına fırlar; sonra halkada sallanır.
  var sceneRaf = 0, sceneT0 = 0, sceneCanvas = null, brick = null, brickKey = '';
  var flies = [];
  for (var i = 0; i < 14; i++) flies.push({ x: Math.random(), y: 0.25 + Math.random() * 0.65, p: Math.random() * 6.28, s: 0.4 + Math.random() * 0.6 });

  function startScene() {
    sceneCanvas = current === 'ekAna' ? $('anaSahne') : $('tanitimSahne');
    if (!sceneRaf) sceneRaf = requestAnimationFrame(drawScene);
  }
  function stopScene() { if (sceneRaf) cancelAnimationFrame(sceneRaf); sceneRaf = 0; }

  function fitCanvas(c) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = c.clientWidth, h = c.clientHeight;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    var ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h, dpr: dpr };
  }

  function bricks(w, h, dpr) {
    var key = w + 'x' + h + 'x' + dpr;
    if (brick && brickKey === key) return brick;
    brickKey = key;
    brick = document.createElement('canvas'); brick.width = Math.round(w * dpr); brick.height = Math.round(h * dpr);
    var c = brick.getContext('2d'), seed = 11, rowH = 26;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    c.scale(dpr, dpr);
    c.fillStyle = '#101817'; c.fillRect(0, 0, w, h);
    for (var r = 0; r * rowH < h; r++) {
      var y = r * rowH, x = -(r % 2) * 24;
      while (x < w) {
        var bw = 40 + Math.floor(rnd() * 26), sh = 28 + Math.floor(rnd() * 14);
        c.fillStyle = 'rgb(' + (sh - 6) + ',' + (sh + 4) + ',' + (sh + 1) + ')';
        c.fillRect(x + 1.5, y + 1.5, bw - 3, rowH - 3);
        if (rnd() < 0.16) { c.fillStyle = 'rgba(79,107,68,.35)'; c.beginPath(); c.ellipse(x + bw * rnd(), y + rowH - 3, 7 + rnd() * 8, 3, 0, 0, 6.29); c.fill(); }
        x += bw;
      }
    }
    // kenarlar daha koyu: kuyunun yuvarlak hissi
    var g = c.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(5,9,10,.75)'); g.addColorStop(0.22, 'rgba(5,9,10,0)'); g.addColorStop(0.78, 'rgba(5,9,10,0)'); g.addColorStop(1, 'rgba(5,9,10,.75)');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    return brick;
  }

  function hero(ctx, x, y, r, look, scarf) {
    ctx.fillStyle = '#b8401b'; ctx.beginPath(); ctx.arc(x, y + 1.2, r, 0, 6.29); ctx.fill();
    ctx.fillStyle = '#f26a3a'; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.29); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.arc(x - r * 0.32, y - r * 0.36, r * 0.32, 0, 6.29); ctx.fill();
    ctx.fillStyle = scarf || '#2fb3a6'; ctx.fillRect(x - r * 0.75, y + r * 0.2, r * 1.5, r * 0.36);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + look.x * r * 0.27, y - r * 0.18 + look.y * r * 0.18, r * 0.4, 0, 6.29); ctx.fill();
    ctx.fillStyle = '#1a1210'; ctx.beginPath(); ctx.arc(x + look.x * r * 0.45, y - r * 0.18 + look.y * r * 0.3, r * 0.18, 0, 6.29); ctx.fill();
  }
  function ring(ctx, x, y, r) {
    ctx.fillStyle = '#1b1310'; ctx.fillRect(x - r * 0.4, y - r * 1.4, r * 0.8, r * 0.6);
    ctx.lineWidth = r * 0.42; ctx.strokeStyle = '#7a4b22'; ctx.beginPath(); ctx.arc(x, y + 1, r * 0.9, 0, 6.29); ctx.stroke();
    ctx.lineWidth = r * 0.28; ctx.strokeStyle = '#d08a45'; ctx.beginPath(); ctx.arc(x, y, r * 0.9, 0, 6.29); ctx.stroke();
  }
  function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3); }

  function drawScene(now) {
    sceneRaf = requestAnimationFrame(drawScene);
    if (!sceneCanvas || sceneCanvas.clientWidth === 0) return;
    var f = fitCanvas(sceneCanvas), ctx = f.ctx, w = f.w, h = f.h, t = now / 1000;
    var u = Math.min(w, 460) / 360; // dünya birimi
    var cx = w / 2;
    ctx.drawImage(bricks(w, h, f.dpr), 0, 0, w, h);
    // gün ışığı yukarıdan
    var lg = ctx.createRadialGradient(cx, -h * 0.15, 10, cx, -h * 0.15, h * 0.95);
    lg.addColorStop(0, 'rgba(227,244,242,.55)'); lg.addColorStop(0.35, 'rgba(191,230,238,.14)'); lg.addColorStop(1, 'rgba(191,230,238,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(227,244,242,.07)';
    ctx.beginPath(); ctx.moveTo(cx - w * 0.28, 0); ctx.lineTo(cx + w * 0.28, 0); ctx.lineTo(cx + w * 0.14, h * 0.75); ctx.lineTo(cx - w * 0.14, h * 0.75); ctx.closePath(); ctx.fill();

    // ateşböcekleri
    flies.forEach(function (fl) {
      var x = (fl.x + Math.sin(t * 0.3 * fl.s + fl.p) * 0.05) * w, y = (fl.y + Math.cos(t * 0.4 * fl.s + fl.p) * 0.03) * h;
      var a = 0.45 + 0.4 * Math.sin(t * 2 * fl.s + fl.p);
      var g = ctx.createRadialGradient(x, y, 0, x, y, 12 * u);
      g.addColorStop(0, 'rgba(232,242,124,' + (a * 0.9) + ')'); g.addColorStop(1, 'rgba(232,242,124,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 12 * u, y - 12 * u, 24 * u, 24 * u);
    });

    // halkalar
    var ringY = current === 'ekAna' ? h * 0.47 : h * 0.52;
    ring(ctx, cx, ringY, 11 * u);
    ring(ctx, cx - 110 * u, ringY + 150 * u, 9 * u);
    ring(ctx, cx + 105 * u, ringY - 140 * u, 9 * u);

    var r = 13 * u, rope = 46 * u;
    if (current === 'ekTanitim') {
      var k = reduceMotion ? 9 : (now - sceneT0) / 1000;
      var startY = h * 0.9, ringX = cx;
      if (k < 0.3) { hero(ctx, cx, startY, r, { x: 0, y: -1 }); }
      else if (k < 0.45) { // kanca uçuyor
        var hk = ease((k - 0.3) / 0.15);
        ctx.strokeStyle = '#eadfc4'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, startY); ctx.lineTo(cx, startY + (ringY - startY) * hk); ctx.stroke();
        hero(ctx, cx, startY, r, { x: 0, y: -1 });
      } else if (k < 0.85) { // çekiliyor
        var pk = Math.pow((k - 0.45) / 0.4, 1.6), py = startY + (ringY + rope - startY) * pk;
        ctx.strokeStyle = '#eadfc4'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(ringX, ringY); ctx.stroke();
        trailUp(ctx, cx, py, r, 0.6);
        hero(ctx, cx, py, r, { x: 0, y: -1 });
      } else if (k < 1.3) { // bırakıp gün ışığına fırlıyor
        var fk = (k - 0.85) / 0.45, fy = ringY + rope - (ringY + rope + r * 3) * ease(fk);
        trailUp(ctx, cx, fy, r, 1);
        hero(ctx, cx, fy, r, { x: 0, y: -1 }, '#e8f27c');
      } else { // geri gelip halkada sallanıyor
        swing(ctx, cx, ringY, rope, r, t, Math.min(1, (k - 1.3) / 0.5));
      }
      if (k > 1.05 && k < 1.6) { // ışık parlaması
        ctx.fillStyle = 'rgba(227,244,242,' + (0.35 * (1 - Math.abs(k - 1.25) / 0.35)) + ')';
        ctx.fillRect(0, 0, w, h);
      }
    } else {
      swing(ctx, cx, ringY, rope, r, t, 1);
    }

    // dipte su
    var wy = h - 34 * u;
    ctx.fillStyle = 'rgba(28,106,114,.85)';
    ctx.beginPath(); ctx.moveTo(0, h);
    for (var x = 0; x <= w + 12; x += 12) ctx.lineTo(x, wy + Math.sin(x / 30 + t * 2) * 3);
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(95,195,201,.8)'; ctx.lineWidth = 2; ctx.beginPath();
    for (var x2 = 0; x2 <= w + 12; x2 += 12) { var yy = wy + Math.sin(x2 / 30 + t * 2) * 3; if (x2 === 0) ctx.moveTo(x2, yy); else ctx.lineTo(x2, yy); }
    ctx.stroke();
    // ana menüde düğmeler okunur kalsın: alt kısım koyulaşır
    if (current === 'ekAna') {
      var bg = ctx.createLinearGradient(0, h * 0.55, 0, h);
      bg.addColorStop(0, 'rgba(13,20,22,0)'); bg.addColorStop(1, 'rgba(13,20,22,.75)');
      ctx.fillStyle = bg; ctx.fillRect(0, h * 0.55, w, h * 0.45);
    }
  }
  function trailUp(ctx, x, y, r, a) {
    ctx.strokeStyle = 'rgba(232,242,124,' + (0.55 * a) + ')'; ctx.lineCap = 'round';
    for (var i = 1; i < 6; i++) { ctx.lineWidth = r * (0.6 - i * 0.08); ctx.beginPath(); ctx.moveTo(x, y + r * 0.4 + (i - 1) * r * 0.55); ctx.lineTo(x, y + r * 0.4 + i * r * 0.55); ctx.stroke(); }
  }
  function swing(ctx, cx, ringY, rope, r, t, amp) {
    var ang = Math.sin(t * 1.7) * 0.42 * amp;
    var hx = cx + Math.sin(ang) * rope, hy = ringY + Math.cos(ang) * rope;
    ctx.strokeStyle = '#eadfc4'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, ringY); ctx.lineTo(hx, hy - r * 0.2); ctx.stroke();
    hero(ctx, hx, hy, r, { x: Math.sin(t * 0.8) * 0.6, y: -0.5 });
  }

  window.addEventListener('resize', function () { brickKey = ''; });

  // oyunun kullandığı arayüz
  window.KuyuScreens = {
    home: home,
    showGame: function () { show('oyun'); },
    toast: toast
  };

  boot();
})();
