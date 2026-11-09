/* Kuyu — ekranlar, çizim, ses ve girdi. Kurallar js/engine.js, bölümler js/levels.js ve js/gen.js. */
(function () {
  'use strict';
  var E = window.KuyuEngine, HAND = window.KuyuLevels, GEN = window.KuyuGen, CFG = E.CFG;
  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var COL = {
    tasAcik: '#3a4743', tasKoyu: '#141c1b',
    ahsap: '#a2693a', ahsapKoyu: '#6e4223', bakir: '#d08a45', bakirKoyu: '#7a4b22',
    ip: '#eadfc4', gok: '#bfe6ee', atesbocegi: '#e8f27c', suAcik: '#5fc3c9',
    kahraman: '#f26a3a', kahramanKoyu: '#b8401b', atki: '#2fb3a6', diken: '#c9d1cf'
  };

  // ---------- kayıt ----------
  var KEY = 'kuyu.v2';
  var save = { best: {}, last: 1, mute: false, haptics: true, endless: { score: 0, meters: 0, combo: 0 }, maxLevel: 1, profile: null, stats: { maxSpeed: 0, bestReward: 0 } };
  try { var raw = localStorage.getItem(KEY); if (raw) save = Object.assign(save, JSON.parse(raw)); } catch (e) {}
  if (!save.stats) save.stats = { maxSpeed: 0, bestReward: 0 };
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} }

  // ---------- bölümler ----------
  var genCache = {};
  function levelDef(n) {
    if (n <= HAND.length) return HAND[n - 1];
    if (!genCache[n]) genCache[n] = GEN.createLevel(n);
    return genCache[n];
  }

  // ---------- ses ----------
  var audio = null;
  function ac() {
    if (save.mute) return null;
    if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }
  function tone(freq, dur, type, vol, slide) {
    var a = ac(); if (!a) return;
    var o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(vol || 0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  var SFX = {
    fire: function () { tone(520, 0.08, 'triangle', 0.05, 900); },
    attach: function () { tone(180, 0.12, 'square', 0.06, 90); },
    combo: function (n) { tone(440 * Math.pow(1.06, Math.min(n, 24)), 0.1, 'triangle', 0.07); },
    clink: function () { tone(1400, 0.07, 'square', 0.04, 1900); },
    slip: function () { tone(500, 0.2, 'sawtooth', 0.04, 200); },
    firefly: function () { tone(880, 0.12, 'sine', 0.09); setTimeout(function () { tone(1320, 0.16, 'sine', 0.08); }, 70); },
    gate: function () { tone(110, 0.35, 'sawtooth', 0.06, 70); },
    dead: function () { tone(300, 0.3, 'sawtooth', 0.06, 60); },
    won: function () { [660, 880, 1100, 1320].forEach(function (f, i) { setTimeout(function () { tone(f, 0.18, 'triangle', 0.08); }, i * 90); }); }
  };
  function setMuteIcon() {
    $('sesBtn').innerHTML = save.mute
      ? '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 8h3l4-3v10l-4-3H4z" fill="currentColor"/><path d="M14 8l4 4M18 8l-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
      : '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 8h3l4-3v10l-4-3H4z" fill="currentColor"/><path d="M14 7.5c1.2 1.3 1.2 3.7 0 5M16.3 5.5c2.3 2.5 2.3 6.5 0 9" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';
    $('sesBtn').setAttribute('aria-label', save.mute ? 'Sesi aç' : 'Sesi kapat');
  }

  // ---------- titreşim (Android tarayıcıları; iOS Safari desteklemez, sessizce atlanır) ----------
  function buzz(pattern) {
    if (save.haptics === false || !navigator.vibrate) return;
    // Tarayıcı, kullanıcı sayfaya hiç dokunmadan titreşime izin vermez (konsola hata basar).
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
    try { navigator.vibrate(pattern); } catch (e) {}
  }

  // ---------- durum ----------
  var mode = 'level', levelNo = 1, def, sim = null, paused = true, deaths = 0, cam = 0, shake = 0, parts = [], floaters = [], trail = [];
  var winT = null, deadT = null, resultShown = false;
  var aim = { x: 0, y: -1 };
  var canvas = $('oyun'), ctx = canvas.getContext('2d');
  var K = 1, DPR = 1, viewW = 0, viewH = 0, brick = null;

  function layout() {
    var box = $('sahne').getBoundingClientRect();
    var w = Math.min(box.width, 460), h = box.height;
    if (h / w > 2.1) h = w * 2.1;
    if (h < 360) h = 360;
    viewW = Math.floor(w); viewH = Math.floor(h);
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.width = viewW + 'px'; canvas.style.height = viewH + 'px';
    canvas.width = Math.round(viewW * DPR); canvas.height = Math.round(viewH * DPR);
    K = viewW / CFG.W;
    buildBricks();
  }

  // Taş duvar dokusu: 360 x 240 birimlik bir karo, dikeyde tekrar eder.
  function buildBricks() {
    var tw = Math.round(CFG.W * K * DPR), th = Math.round(240 * K * DPR);
    brick = document.createElement('canvas'); brick.width = tw; brick.height = th;
    var c = brick.getContext('2d'), s = K * DPR, rowH = 24, seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    c.fillStyle = '#121a19'; c.fillRect(0, 0, tw, th);
    for (var r = 0; r < 10; r++) {
      var y = r * rowH, off = (r % 2) * 22, x = -off;
      while (x < CFG.W) {
        var bw = 38 + Math.floor(rnd() * 24), shade = 30 + Math.floor(rnd() * 14);
        c.fillStyle = 'rgb(' + (shade - 6) + ',' + (shade + 4) + ',' + (shade + 1) + ')';
        c.fillRect((x + 1.5) * s, (y + 1.5) * s, (bw - 3) * s, (rowH - 3) * s);
        c.fillStyle = 'rgba(255,255,255,0.035)';
        c.fillRect((x + 1.5) * s, (y + 1.5) * s, (bw - 3) * s, 2 * s);
        if (rnd() < 0.18) {
          c.fillStyle = 'rgba(79,107,68,' + (0.25 + rnd() * 0.25) + ')';
          c.beginPath(); c.ellipse((x + bw * rnd()) * s, (y + rowH - 3) * s, (6 + rnd() * 8) * s, 3 * s, 0, 0, Math.PI * 2); c.fill();
        }
        x += bw;
      }
    }
  }

  // ---------- akış ----------
  function startLevel(n) {
    mode = 'level';
    levelNo = Math.max(1, Math.floor(n) || 1);
    def = levelDef(levelNo);
    save.last = levelNo; if (levelNo > save.maxLevel) save.maxLevel = levelNo; persist();
    deaths = 0;
    $('ipucu').textContent = def.hint;
    $('atlaBtn').hidden = false;
    $('puan').hidden = true; $('noktalar').hidden = false;
    $('baslik').textContent = levelNo + '. ' + def.name;
    reset();
  }
  function startEndless() {
    mode = 'endless';
    def = GEN.createEndless((Date.now() ^ (Math.random() * 1e9)) >>> 0);
    deaths = 0;
    $('ipucu').textContent = def.hint;
    $('atlaBtn').hidden = true;
    $('puan').hidden = false; $('noktalar').hidden = true;
    $('baslik').textContent = 'Sonsuz Kuyu';
    reset();
  }
  function reset() {
    if (mode === 'endless') def = GEN.createEndless((Date.now() ^ (Math.random() * 1e9)) >>> 0);
    sim = E.createSim(def);
    parts = []; floaters = []; trail = []; winT = null; deadT = null; resultShown = false; lastHud = '';
    $('katman').hidden = true;
    paused = false; acc = 0; lastT = 0;
    if (window.KuyuScreens) window.KuyuScreens.showGame();
    layout();
    cam = camTarget();
    updateHud(true);
  }

  function camTarget() {
    var vh = viewH / K;
    var t = sim.p.y - vh * (mode === 'endless' ? 0.58 : 0.62);
    if (winT !== null) t = sim.p.y - vh * 0.5;
    if (mode === 'endless') return Math.min(sim.startY + 80 - vh, t);
    return Math.max(-170, Math.min(sim.H + 30 - vh, t));
  }

  var lastHud = '';
  function updateHud(force) {
    var m = E.meters(sim);
    if (mode === 'endless') {
      var sc = E.score(sim), key = 'e' + sc + '|' + m + '|' + sim.combo + '|' + E.speedMult(sim);
      if (key === lastHud && !force) return; lastHud = key;
      $('puan').innerHTML = sc + '<small>puan</small>';
      $('altbaslik').textContent = m + ' m · akış x' + sim.combo + ' · hız x' + E.speedMult(sim).toFixed(2).replace('.', ',') + ' · rekor ' + (save.endless.score || 0);
    } else {
      var n = E.fireflyCount(sim), key2 = 'l' + n + '|' + m + '|' + sim.combo + '|' + sim.shots;
      if (key2 === lastHud && !force) return; lastHud = key2;
      var h = '';
      for (var i = 0; i < sim.fireflies.length; i++) h += '<i class="' + (i < n ? 'var' : '') + '"></i>';
      $('noktalar').innerHTML = h;
      $('noktalar').setAttribute('aria-label', n + ' / ' + sim.fireflies.length + ' ateşböceği');
      var depth = Math.max(0, Math.round(sim.p.y / 20));
      $('altbaslik').textContent = depth + ' m · atış ' + sim.shots + '/' + def.par + ' · akış x' + sim.combo;
    }
  }

  // ---------- parçacıklar ve yazılar ----------
  function burst(x, y, n, color, speed, life, grav) {
    if (reduceMotion) n = Math.ceil(n / 3);
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, v = speed * (0.4 + Math.random() * 0.8);
      parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: life, max: life, color: color, g: grav == null ? 600 : grav, r: 1.5 + Math.random() * 1.8 });
    }
  }
  function floatText(x, y, text, color, size) {
    floaters.push({ x: x, y: y, text: text, color: color, size: size || 15, life: 0.9, max: 0.9 });
  }

  function handleEvents() {
    var ev = sim.events; sim.events = [];
    for (var i = 0; i < ev.length; i++) {
      var e = ev[i];
      if (e.type === 'fire') SFX.fire();
      else if (e.type === 'rescue') { SFX.fire(); buzz(25); floatText(sim.p.x, sim.p.y - 26, 'kurtarma kancası', COL.gok, 14); }
      else if (e.type === 'attach') {
        SFX.attach(); shake = Math.max(shake, 3); buzz(e.what === 'box' ? 18 : 12);
        burst(e.x, e.y, 8, e.what === 'wood' || e.what === 'box' ? COL.ahsap : COL.bakir, 140, 0.4);
      } else if (e.type === 'combo') {
        SFX.combo(e.combo); if (e.combo >= 5) buzz(8);
        var pts = Math.min(e.combo, CFG.COMBO_CAP) * CFG.COMBO_PTS;
        floatText(e.x, e.y - 16, 'AKIŞ x' + e.combo + (mode === 'endless' ? '  +' + pts : ''), e.combo >= 8 ? COL.atesbocegi : COL.gok, 13 + Math.min(e.combo, 10));
      } else if (e.type === 'comboBreak') floatText(sim.p.x, sim.p.y - 26, 'akış bitti (' + e.why + ')', '#8fa09c', 12);
      else if (e.type === 'slip') { SFX.slip(); buzz(30); floatText(sim.p.x, sim.p.y - 24, 'el kaydı!', COL.kahraman, 15); }
      else if (e.type === 'clink') { SFX.clink(); burst(e.x, e.y, 7, '#e9f3f0', 220, 0.25, 0); }
      else if (e.type === 'firefly') { SFX.firefly(); buzz([8, 40, 8]); burst(e.x, e.y, 16, COL.atesbocegi, 160, 0.6, -40); if (mode === 'endless') floatText(e.x, e.y - 10, '+25', COL.atesbocegi, 14); }
      else if (e.type === 'gateOpen') { SFX.gate(); buzz(35); shake = Math.max(shake, 5); }
      else if (e.type === 'dead') {
        SFX.dead(); shake = 8; buzz(80);
        burst(sim.p.x, sim.p.y, 22, e.why === 'su' ? COL.suAcik : COL.kahraman, 260, 0.7);
        deadT = 0;
      } else if (e.type === 'won') { SFX.won(); buzz([20, 60, 30]); winT = 0; burst(sim.p.x, sim.p.y, 20, COL.gok, 200, 0.8, -60); }
    }
  }

  // ---------- çizim ----------
  function drawBackground(t) {
    var tileH = 240, start = Math.floor(cam / tileH) * tileH, vh = viewH / K;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (var y = start; y < cam + vh + tileH; y += tileH) ctx.drawImage(brick, 0, Math.round((y - cam) * K * DPR));
    ctx.restore();
    if (mode === 'endless') {
      // derinlik hissi: yükseldikçe kuyu biraz aydınlanır
      var m = E.meters(sim), a = Math.max(0.18, 0.55 - m / 3000);
      ctx.fillStyle = 'rgba(6,10,11,' + a + ')'; ctx.fillRect(0, cam, CFG.W, vh);
      var lg2 = ctx.createLinearGradient(0, cam, 0, cam + vh);
      lg2.addColorStop(0, 'rgba(191,230,238,0.10)'); lg2.addColorStop(1, 'rgba(191,230,238,0)');
      ctx.fillStyle = lg2; ctx.fillRect(0, cam, CFG.W, vh);
      return;
    }
    var g = ctx.createLinearGradient(0, cam, 0, cam + vh);
    var top = Math.max(0, Math.min(1, cam / sim.H)), bottom = Math.max(0, Math.min(1, (cam + vh) / sim.H));
    g.addColorStop(0, 'rgba(6,10,11,' + (0.15 + top * 0.55) + ')');
    g.addColorStop(1, 'rgba(6,10,11,' + (0.15 + bottom * 0.55) + ')');
    ctx.fillStyle = g; ctx.fillRect(0, cam, CFG.W, vh);
    var lg = ctx.createRadialGradient(180, -120, 20, 180, -120, 900);
    lg.addColorStop(0, 'rgba(191,230,238,0.30)'); lg.addColorStop(0.5, 'rgba(191,230,238,0.06)'); lg.addColorStop(1, 'rgba(191,230,238,0)');
    ctx.fillStyle = lg; ctx.fillRect(0, cam, CFG.W, vh);
    if (cam < 40) {
      var sg = ctx.createLinearGradient(0, -400, 0, 0);
      sg.addColorStop(0, '#7fc6dc'); sg.addColorStop(1, '#e3f4f2');
      ctx.fillStyle = sg; ctx.fillRect(CFG.WALL, -400, CFG.W - 2 * CFG.WALL, 400);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      var cx = 90 + Math.sin(t / 4000) * 30;
      ctx.beginPath(); ctx.ellipse(cx, -110, 40, 12, 0, 0, Math.PI * 2); ctx.ellipse(cx + 30, -118, 28, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = COL.tasAcik;
      ctx.fillRect(0, -16, CFG.WALL + 6, 22); ctx.fillRect(CFG.W - CFG.WALL - 6, -16, CFG.WALL + 6, 22);
      var hg = ctx.createLinearGradient(0, 0, 0, 420);
      hg.addColorStop(0, 'rgba(227,244,242,0.22)'); hg.addColorStop(1, 'rgba(227,244,242,0)');
      ctx.fillStyle = hg;
      ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(300, 0); ctx.lineTo(250, 420); ctx.lineTo(110, 420); ctx.closePath(); ctx.fill();
    }
  }

  function drawRect(r) {
    var vh = viewH / K;
    if (r.wall) { ctx.fillStyle = COL.tasKoyu; ctx.fillRect(r.x, cam - 10, r.w, vh + 20); return; }
    if (r.y > cam + vh + 10 || r.y + r.h < cam - 10) return;
    if (r.type === 's') {
      ctx.fillStyle = COL.tasKoyu; ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = COL.tasAcik; ctx.fillRect(r.x, r.y, r.w, Math.min(3, r.h));
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1;
      ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
    } else if (r.type === 'w') {
      ctx.fillStyle = COL.ahsap; ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = COL.ahsapKoyu; ctx.lineWidth = 1;
      var vert = r.h > r.w;
      ctx.beginPath();
      if (vert) { for (var gy = r.y + 9; gy < r.y + r.h; gy += 11) { ctx.moveTo(r.x, gy); ctx.lineTo(r.x + r.w, gy + 1.5); } }
      else { for (var gx = r.x + 14; gx < r.x + r.w; gx += 18) { ctx.moveTo(gx, r.y); ctx.lineTo(gx + 1.5, r.y + r.h); } }
      ctx.stroke();
      ctx.lineWidth = 1.5; ctx.strokeRect(r.x + 0.75, r.y + 0.75, r.w - 1.5, r.h - 1.5);
    } else if (r.type === 'k') {
      ctx.fillStyle = '#2b2f2f'; ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.fillStyle = COL.diken;
      var d = r.dir, n, i, sz = 9;
      ctx.beginPath();
      if (d === 'u' || d === 'd') {
        n = Math.max(1, Math.round(r.w / sz)); var sw = r.w / n;
        for (i = 0; i < n; i++) {
          var x0 = r.x + i * sw;
          if (d === 'u') { ctx.moveTo(x0, r.y + 4); ctx.lineTo(x0 + sw / 2, r.y - 7); ctx.lineTo(x0 + sw, r.y + 4); }
          else { ctx.moveTo(x0, r.y + r.h - 4); ctx.lineTo(x0 + sw / 2, r.y + r.h + 7); ctx.lineTo(x0 + sw, r.y + r.h - 4); }
        }
      } else {
        n = Math.max(1, Math.round(r.h / sz)); var sh = r.h / n;
        for (i = 0; i < n; i++) {
          var y0 = r.y + i * sh;
          if (d === 'r') { ctx.moveTo(r.x + r.w - 4, y0); ctx.lineTo(r.x + r.w + 7, y0 + sh / 2); ctx.lineTo(r.x + r.w - 4, y0 + sh); }
          else { ctx.moveTo(r.x + 4, y0); ctx.lineTo(r.x - 7, y0 + sh / 2); ctx.lineTo(r.x + 4, y0 + sh); }
        }
      }
      ctx.fill();
    } else if (r.type === 'g') {
      if (sim.gatesOpen) {
        ctx.strokeStyle = 'rgba(208,138,69,0.35)'; ctx.setLineDash([4, 5]); ctx.lineWidth = 1.5;
        ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2); ctx.setLineDash([]);
        return;
      }
      ctx.fillStyle = '#3b2a1c'; ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = COL.bakir; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (var bx = r.x + 10; bx < r.x + r.w; bx += 14) { ctx.moveTo(bx, r.y); ctx.lineTo(bx, r.y + r.h); }
      ctx.moveTo(r.x, r.y + r.h / 2); ctx.lineTo(r.x + r.w, r.y + r.h / 2);
      ctx.stroke();
    }
  }

  function drawRing(x, y) {
    ctx.fillStyle = '#1b1310'; ctx.fillRect(x - 4, y - 14, 8, 6);
    ctx.lineWidth = 4; ctx.strokeStyle = COL.bakirKoyu;
    ctx.beginPath(); ctx.arc(x, y + 1, CFG.RING_R - 1, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 2.6; ctx.strokeStyle = COL.bakir;
    ctx.beginPath(); ctx.arc(x, y, CFG.RING_R - 1, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,230,190,0.6)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, CFG.RING_R - 1, -2.4, -1.2); ctx.stroke();
  }

  function drawGoal(t) {
    var g = sim.goal; if (!g) return;
    var bob = Math.sin(t / 700) * 1.5;
    ctx.strokeStyle = COL.ip; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(g.x, -400); ctx.lineTo(g.x, g.y - 10 + bob); ctx.stroke();
    var pg = ctx.createRadialGradient(g.x, g.y + 14, 2, g.x, g.y + 14, 46);
    pg.addColorStop(0, 'rgba(232,242,124,0.35)'); pg.addColorStop(1, 'rgba(232,242,124,0)');
    ctx.fillStyle = pg; ctx.fillRect(g.x - 50, g.y - 36, 100, 100);
    ctx.strokeStyle = '#9aa3a0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(g.x, g.y + 6 + bob, 14, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = COL.ahsap;
    ctx.beginPath();
    ctx.moveTo(g.x - 15, g.y + 6 + bob); ctx.lineTo(g.x + 15, g.y + 6 + bob);
    ctx.lineTo(g.x + 11, g.y + 30 + bob); ctx.lineTo(g.x - 11, g.y + 30 + bob); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5c6664';
    ctx.fillRect(g.x - 14, g.y + 11 + bob, 28, 3); ctx.fillRect(g.x - 12, g.y + 23 + bob, 24, 3);
  }

  function drawBox(b) {
    var s = CFG.BOX_R + 1;
    ctx.fillStyle = COL.ahsap; ctx.fillRect(b.x - s, b.y - s, s * 2, s * 2);
    ctx.strokeStyle = COL.ahsapKoyu; ctx.lineWidth = 2;
    ctx.strokeRect(b.x - s + 1, b.y - s + 1, s * 2 - 2, s * 2 - 2);
    ctx.beginPath(); ctx.moveTo(b.x - s + 2, b.y - s + 2); ctx.lineTo(b.x + s - 2, b.y + s - 2);
    ctx.moveTo(b.x + s - 2, b.y - s + 2); ctx.lineTo(b.x - s + 2, b.y + s - 2); ctx.stroke();
  }

  function drawButton(b) {
    var dy = b.pressed ? 4 : 0;
    if (b.pressed) {
      var g = ctx.createRadialGradient(b.x + b.w / 2, b.y, 2, b.x + b.w / 2, b.y, 60);
      g.addColorStop(0, 'rgba(232,242,124,0.35)'); g.addColorStop(1, 'rgba(232,242,124,0)');
      ctx.fillStyle = g; ctx.fillRect(b.x - 20, b.y - 60, b.w + 40, 70);
    }
    ctx.fillStyle = COL.bakirKoyu; ctx.fillRect(b.x, b.y + 2, b.w, 6);
    ctx.fillStyle = b.pressed ? COL.atesbocegi : COL.bakir; ctx.fillRect(b.x + 4, b.y - 2 + dy, b.w - 8, 5);
  }

  // Ateşböceği halkası: halkanın içinde parlayan ateşböceği. Tutun ya da içinden geç, alınır.
  function drawFireflyRing(r, t) {
    var a = 0.75 + 0.25 * Math.sin(t / 260 + r.x);
    var g = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, 30);
    g.addColorStop(0, 'rgba(232,242,124,' + (0.55 * a) + ')'); g.addColorStop(1, 'rgba(232,242,124,0)');
    ctx.fillStyle = g; ctx.fillRect(r.x - 30, r.y - 30, 60, 60);
    ctx.lineWidth = 2.4; ctx.strokeStyle = 'rgba(232,242,124,' + (0.9 * a) + ')';
    ctx.beginPath(); ctx.arc(r.x, r.y, CFG.RING_R + 2, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#fbffd8'; ctx.beginPath(); ctx.arc(r.x + Math.cos(t / 300) * 2, r.y + Math.sin(t / 240) * 2, 3, 0, Math.PI * 2); ctx.fill();
  }
  function drawFirefly(f, t) {
    if (f.got || f.ring) return;
    var y = f.y + Math.sin(t / 400 + f.x) * 3, x = f.x + Math.cos(t / 600 + f.y) * 2;
    var g = ctx.createRadialGradient(x, y, 0, x, y, 16);
    g.addColorStop(0, 'rgba(232,242,124,0.9)'); g.addColorStop(0.3, 'rgba(232,242,124,0.35)'); g.addColorStop(1, 'rgba(232,242,124,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 16, y - 16, 32, 32);
    ctx.fillStyle = '#fbffd8'; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill();
  }

  function drawWater(t) {
    if (sim.water == null) return;
    var wy = sim.water;
    if (wy > cam + viewH / K + 20) return;
    var g = ctx.createLinearGradient(0, wy, 0, wy + 300);
    g.addColorStop(0, 'rgba(28,106,114,0.88)'); g.addColorStop(1, 'rgba(8,30,34,0.97)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(0, wy + 2000);
    for (var x = 0; x <= CFG.W; x += 12) ctx.lineTo(x, wy + Math.sin(x / 26 + t / 300) * 3);
    ctx.lineTo(CFG.W, wy + 2000); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(95,195,201,0.8)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (var x2 = 0; x2 <= CFG.W; x2 += 12) { var yy = wy + Math.sin(x2 / 26 + t / 300) * 3; if (x2 === 0) ctx.moveTo(x2, yy); else ctx.lineTo(x2, yy); }
    ctx.stroke();
  }

  function drawRange() {
    if (sim.rope || sim.hook || sim.status !== 'play') return;
    ctx.save();
    ctx.setLineDash([3, 7]); ctx.strokeStyle = 'rgba(191,230,238,0.13)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(sim.p.x, sim.p.y, CFG.HOOK_MAX, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function drawRope() {
    var p = sim.p, tx = null, ty = null;
    if (sim.rope) {
      if (sim.rope.kind === 'box') { tx = sim.rope.box.x; ty = sim.rope.box.y; }
      else { tx = sim.rope.x; ty = sim.rope.y; }
    } else if (sim.hook) { tx = sim.hook.x; ty = sim.hook.y; }
    if (tx === null) return;
    ctx.strokeStyle = COL.ip; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(p.x, p.y - 2); ctx.lineTo(tx, ty); ctx.stroke();
    if (sim.hook) {
      var a = Math.atan2(sim.hook.dy, sim.hook.dx);
      ctx.save(); ctx.translate(tx, ty); ctx.rotate(a);
      ctx.strokeStyle = '#cfd7d4'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(4, 0);
      ctx.moveTo(4, 0); ctx.lineTo(0, -5); ctx.moveTo(4, 0); ctx.lineTo(0, 5); ctx.stroke();
      ctx.restore();
    }
  }

  // Asılıyken elin ne kadar dayanacağı: oyuncunun çevresinde azalan yay.
  function drawGrip() {
    if (!sim.rope || sim.rope.kind !== 'anchor' || sim.hang <= 0) return;
    var left = Math.max(0, 1 - sim.hang / sim.grip);
    ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath(); ctx.arc(sim.p.x, sim.p.y, CFG.R + 6, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = left < 0.35 ? COL.kahraman : COL.gok;
    ctx.beginPath(); ctx.arc(sim.p.x, sim.p.y, CFG.R + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left); ctx.stroke();
  }

  function drawHero(t) {
    var p = sim.p, vx = p.x - p.px, vy = p.y - p.py;
    var sp = Math.sqrt(vx * vx + vy * vy);
    trail.unshift({ x: p.x, y: p.y }); if (trail.length > 7) trail.pop();
    var hot = sim.combo >= 2;
    if (trail.length > 2) {
      ctx.strokeStyle = hot ? COL.atesbocegi : COL.atki; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (var i = 1; i < trail.length; i++) {
        ctx.lineWidth = (hot ? 6 : 5) - i * 0.55;
        ctx.beginPath(); ctx.moveTo(trail[i - 1].x, trail[i - 1].y + 3); ctx.lineTo(trail[i].x, trail[i].y + 3 + i * 0.6); ctx.stroke();
      }
    }
    var st = Math.min(0.25, sp / 40), ang = Math.atan2(vy, vx);
    ctx.save(); ctx.translate(p.x, p.y);
    if (sp > 1) { ctx.rotate(ang); ctx.scale(1 + st, 1 - st * 0.6); ctx.rotate(-ang); }
    ctx.fillStyle = COL.kahramanKoyu;
    ctx.beginPath(); ctx.arc(0, 1, CFG.R, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = COL.kahraman;
    ctx.beginPath(); ctx.arc(0, 0, CFG.R, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.arc(-3.5, -4, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = hot ? COL.atesbocegi : COL.atki; ctx.fillRect(p.x - 8, p.y + 2, 16, 4);
    var lx = aim.x, ly = aim.y;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(p.x + lx * 3, p.y - 2 + ly * 2, 4.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1210';
    ctx.beginPath(); ctx.arc(p.x + lx * 5, p.y - 2 + ly * 3.4, 2, 0, Math.PI * 2); ctx.fill();
    if (Math.floor(t / 2600) % 3 === 0 && t % 2600 < 110) { ctx.fillStyle = COL.kahraman; ctx.fillRect(p.x + lx * 3 - 5, p.y - 7 + ly * 2, 10, 5); }
  }

  // Sol ve sağ dokunuşun kancayı nereye atacağı: sol hedef turkuaz, sağ hedef sarı halka ve ok.
  var COL_SOL = '#2fb3a6', COL_SAG = '#f2b23a';
  function drawAimMarkers(t) {
    if (sim.status !== 'play') return;
    var L = E.aim(sim, 0.2), R = E.aim(sim, 0.8);
    if (L.rescue || R.rescue) { drawRescueMarker(L.rescue ? L : R, t); return; }
    var same = L.kind !== 'none' && R.kind !== 'none' && Math.hypot(L.x - R.x, L.y - R.y) < 4;
    if (L.kind !== 'none') marker(L, COL_SOL, -1, t);
    if (R.kind !== 'none' && !same) marker(R, COL_SAG, 1, t);
    if (same) arrow(R.x, R.y, COL_SAG, 1);
  }
  // Menzilde hedef yok: kurtarma kancasının gideceği hedef ve yol, nereye basılırsa basılsın.
  function drawRescueMarker(m, t) {
    ctx.save();
    ctx.strokeStyle = COL.gok; ctx.globalAlpha = 0.55; ctx.lineWidth = 2; ctx.setLineDash([3, 7]); ctx.lineDashOffset = -t / 40;
    ctx.beginPath(); ctx.moveTo(sim.p.x, sim.p.y); ctx.lineTo(m.x, m.y); ctx.stroke();
    ctx.globalAlpha = 0.95; ctx.setLineDash([5, 4]); ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.arc(m.x, m.y, 19 * (1 + 0.1 * Math.sin(t / 150)), 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '800 13px "Baloo 2", system-ui, sans-serif';
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(8,13,14,0.85)';
    ctx.strokeText('dokun: kurtarma kancası', sim.p.x, sim.p.y - 30);
    ctx.fillStyle = COL.gok; ctx.fillText('dokun: kurtarma kancası', sim.p.x, sim.p.y - 30);
  }
  function marker(m, color, dir, t) {
    var pulse = 1 + 0.08 * Math.sin(t / 180);
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 2.2; ctx.globalAlpha = 0.9;
    ctx.setLineDash([5, 4]); ctx.lineDashOffset = -t / 60;
    ctx.beginPath(); ctx.arc(m.x, m.y, 17 * pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    arrow(m.x, m.y, color, dir);
  }
  function arrow(x, y, color, dir) {
    var ax = x + dir * 27;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(ax + dir * 6, y); ctx.lineTo(ax - dir * 3, y - 6); ctx.lineTo(ax - dir * 3, y + 6); ctx.closePath(); ctx.fill();
  }

  // İlk bölümde ekranın iki yarısını gösteren ipucu; birkaç tutunmadan sonra kaybolur.
  var hintAlpha = 0;
  function drawTouchHint(dt) {
    var want = mode === 'level' && levelNo === 1 && !(save.best[1] && save.best[1].done) && sim.hooks < 4 && sim.status === 'play';
    hintAlpha += ((want ? 1 : 0) - hintAlpha) * Math.min(1, dt * 4);
    if (hintAlpha < 0.02) return;
    var w = viewW, h = viewH;
    ctx.save();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.globalAlpha = hintAlpha;
    ctx.fillStyle = 'rgba(47,179,166,0.10)'; ctx.fillRect(0, h * 0.45, w / 2, h * 0.55);
    ctx.fillStyle = 'rgba(242,178,58,0.10)'; ctx.fillRect(w / 2, h * 0.45, w / 2, h * 0.55);
    ctx.strokeStyle = 'rgba(231,238,233,0.35)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(w / 2, h * 0.47); ctx.lineTo(w / 2, h - 8); ctx.stroke(); ctx.setLineDash([]);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var y = h * 0.8;
    thumbIcon(w * 0.25, y - 40, COL_SOL); thumbIcon(w * 0.75, y - 40, COL_SAG);
    ctx.font = '800 17px "Baloo 2", system-ui, sans-serif';
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(8,13,14,0.9)';
    ctx.strokeText('\u25C0 Sola dokun', w * 0.25, y); ctx.fillStyle = COL_SOL; ctx.fillText('\u25C0 Sola dokun', w * 0.25, y);
    ctx.strokeText('Sağa dokun \u25B6', w * 0.75, y); ctx.fillStyle = COL_SAG; ctx.fillText('Sağa dokun \u25B6', w * 0.75, y);
    ctx.font = '600 13px "Figtree", system-ui, sans-serif';
    ctx.strokeText('Basılı tut: ipe sarıl · Bırak: savrul', w / 2, y + 30);
    ctx.fillStyle = 'rgba(231,238,233,0.9)'; ctx.fillText('Basılı tut: ipe sarıl · Bırak: savrul', w / 2, y + 30);
    ctx.restore();
  }
  function thumbIcon(x, y, color) {
    var bob = Math.sin(performance.now() / 300) * 3;
    ctx.save();
    ctx.globalAlpha *= 0.9;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(x, y + bob, 11, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.ellipse(x, y + bob - 6, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawParticles(dt) {
    for (var i = parts.length - 1; i >= 0; i--) {
      var q = parts[i];
      q.life -= dt; if (q.life <= 0) { parts.splice(i, 1); continue; }
      q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt;
      ctx.globalAlpha = Math.max(0, q.life / q.max);
      ctx.fillStyle = q.color; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function drawFloaters(dt) {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var i = floaters.length - 1; i >= 0; i--) {
      var f = floaters[i];
      f.life -= dt; if (f.life <= 0) { floaters.splice(i, 1); continue; }
      f.y -= 36 * dt;
      ctx.globalAlpha = Math.min(1, f.life / f.max * 1.6);
      ctx.font = '800 ' + f.size + 'px "Baloo 2", system-ui, sans-serif';
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(8,13,14,0.85)'; ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  function render(t, dt) {
    var sx = 0, sy = 0;
    if (shake > 0 && !reduceMotion) { sx = (Math.random() - 0.5) * shake; sy = (Math.random() - 0.5) * shake; }
    shake = Math.max(0, shake - dt * 30);
    ctx.setTransform(K * DPR, 0, 0, K * DPR, sx * DPR, (-cam * K + sy) * DPR);
    drawBackground(t);
    drawGoal(t);
    var vh = viewH / K;
    for (var i = 0; i < sim.rects.length; i++) drawRect(sim.rects[i]);
    sim.buttons.forEach(drawButton);
    sim.rings.forEach(function (r) { if (r.y > cam - 30 && r.y < cam + vh + 30) { drawRing(r.x, r.y); if (r.ff && !r.got) drawFireflyRing(r, t); } });
    sim.fireflies.forEach(function (f) { if (f.y > cam - 20 && f.y < cam + vh + 20) drawFirefly(f, t); });
    sim.boxes.forEach(drawBox);
    drawAimMarkers(t);
    drawRope();
    if (sim.status !== 'dead') { drawHero(t); drawGrip(); }
    drawParticles(dt);
    drawWater(t);
    drawFloaters(dt);
    drawTouchHint(dt);
  }

  // ---------- döngü ----------
  var acc = 0, lastT = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    if (paused || !sim) { lastT = 0; return; }
    var dt = Math.min(0.05, (t - (lastT || t)) / 1000); lastT = t;
    if (sim.status === 'play') {
      acc += dt;
      var n = 0;
      while (acc >= CFG.DT && n < 8) { E.step(sim); acc -= CFG.DT; n++; if (sim.status !== 'play') break; }
      if (n === 8) acc = 0;
    } else if (sim.status === 'won' && winT !== null) {
      winT += dt;
      sim.p.px = sim.p.x; sim.p.py = sim.p.y;
      sim.p.x += (sim.goal.x - sim.p.x) * Math.min(1, dt * 8);
      sim.p.y += (sim.goal.y + 34 - sim.p.y) * Math.min(1, dt * 8);
      if (winT > 0.35) { sim.goal.y -= 420 * dt; sim.p.y = sim.goal.y + 34; }
      if (winT > 1.1 && !resultShown) showLevelResult();
    } else if (sim.status === 'dead' && deadT !== null) {
      deadT += dt;
      if (mode === 'level' && deadT > 0.75) { deaths++; reset(); }
      else if (mode === 'endless' && deadT > 0.6 && !resultShown) showEndlessResult();
    }
    handleEvents();
    var target = camTarget();
    cam += (target - cam) * Math.min(1, dt * (sim.status === 'dead' ? 2 : 7));
    render(t, dt);
    updateHud();
  }

  // ---------- sonuçlar ----------
  var ICON = {
    ff: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="#e8f27c"/><circle cx="12" cy="12" r="10" fill="#e8f27c" opacity=".25"/></svg>',
    perfect: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#bfe6ee" stroke-width="2.5"/><circle cx="12" cy="12" r="3.5" fill="#bfe6ee"/></svg>',
    flow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 16c4 0 4-8 9-8s5 8 9 8" fill="none" stroke="#f26a3a" stroke-width="2.8" stroke-linecap="round"/></svg>'
  };
  function medal(ok, icon, title, sub) {
    return '<div class="madalya' + (ok ? ' var' : '') + '">' + icon + '<b>' + title + '</b><span>' + sub + '</span></div>';
  }
  function fmt(n, d) { return n.toFixed(d).replace('.', ','); }
  // Bölüm sonu hız kutusu: en yüksek hız, çarpan ve çarpanlı sonuç
  function speedBlock(speed, mult, base, result, label) {
    return '<div class="hiz-kutu"><div><small>En yüksek hız</small><b>' + fmt(speed, 1) + ' m/sn</b></div>' +
      '<div><small>Hız çarpanı</small><b>x' + fmt(mult, 2) + '</b></div>' +
      '<div><small>' + label + '</small><b>' + base + (mult > 1 ? ' → ' + result : '') + '</b></div></div>';
  }
  function noteStats(speed, reward) {
    var st = save.stats || (save.stats = { maxSpeed: 0, bestReward: 0 });
    if (speed > (st.maxSpeed || 0)) st.maxSpeed = speed;
    if (reward > (st.bestReward || 0)) st.bestReward = reward;
    persist();
  }
  function showLevelResult() {
    resultShown = true;
    var ff = E.fireflyCount(sim), time = sim.t;
    var perfect = sim.shots <= def.par, flow = sim.maxCombo >= def.flow;
    var b = save.best[levelNo] || {};
    var newTime = !b.time || time < b.time;
    // Ödül: temel (bölüm + ateşböceği + madalyalar) × hız çarpanı
    var base = 100 + 25 * ff + (perfect ? 50 : 0) + (flow ? 50 : 0);
    var mult = E.speedMult(sim), reward = Math.round(base * mult);
    var speed = E.speedMs(sim.maxSpeed);
    save.best[levelNo] = {
      ff: Math.max(b.ff || 0, ff), time: b.time ? Math.min(b.time, time) : time,
      perfect: !!(b.perfect || perfect), flow: !!(b.flow || flow), done: true,
      reward: Math.max(b.reward || 0, reward), speed: Math.max(b.speed || 0, speed)
    };
    noteStats(speed, reward);
    if (levelNo + 1 > save.maxLevel) save.maxLevel = levelNo + 1;
    persist();
    $('kart').innerHTML =
      '<h2>Gün ışığı!</h2>' +
      '<div class="madalyalar">' +
      medal(ff >= sim.fireflies.length, ICON.ff, 'Ateşböceği', ff + '/' + sim.fireflies.length) +
      medal(perfect, ICON.perfect, 'Kusursuz', sim.shots + ' atış · en çok ' + def.par) +
      medal(flow, ICON.flow, 'Akış', 'en iyi x' + sim.maxCombo + ' · hedef x' + def.flow) +
      '</div>' +
      speedBlock(speed, mult, base, reward, 'Bölüm ödülü') +
      '<p>' + time.toFixed(1) + ' sn' + (newTime ? ' · <span class="rekor">en iyi süre</span>' : ' · en iyi ' + b.time.toFixed(1) + ' sn') +
      (deaths ? ' · ' + (deaths + 1) + '. deneme' : ' · ilk denemede') + '</p>' +
      '<div class="dugmeler"><button type="button" id="tekrarBtn">Tekrar</button>' +
      '<button type="button" class="ana" id="sonrakiBtn">Bölüm ' + (levelNo + 1) + '</button></div>';
    $('katman').hidden = false;
    $('tekrarBtn').onclick = function () { reset(); };
    $('sonrakiBtn').onclick = function () { startLevel(levelNo + 1); };
    $('sonrakiBtn').focus({ preventScroll: true });
  }
  function showEndlessResult() {
    resultShown = true;
    var raw = E.score(sim), mult = E.speedMult(sim), sc = E.finalScore(sim), m = E.meters(sim), rec = save.endless || {};
    var speed = E.speedMs(sim.maxSpeed);
    var isRecord = sc > (rec.score || 0);
    save.endless = { score: Math.max(rec.score || 0, sc), meters: Math.max(rec.meters || 0, m), combo: Math.max(rec.combo || 0, sim.maxCombo) };
    noteStats(speed, 0);
    $('kart').innerHTML =
      '<h2>' + (isRecord ? 'Yeni rekor!' : 'Kuyu kazandı') + '</h2>' +
      '<div class="buyuk">' + sc + '</div>' +
      '<p>' + m + ' m tırmanış + ' + sim.bonus + ' akış + ' + sim.fireflyPts + ' ateşböceği = ' + raw + '</p>' +
      speedBlock(speed, mult, raw, sc, 'Puan') +
      '<p>En uzun akış x' + sim.maxCombo + ' · ' + sim.hooks + ' tutunma · ' + sim.t.toFixed(0) + ' sn</p>' +
      '<p>Rekor: <span class="rekor">' + save.endless.score + '</span> · en yüksek ' + save.endless.meters + ' m</p>' +
      '<div class="dugmeler"><button type="button" id="menuDonBtn">Menü</button>' +
      '<button type="button" class="ana" id="yenidenBtn">Yeniden dene</button></div>';
    $('katman').hidden = false;
    $('menuDonBtn').onclick = function () { goHome(); };
    $('yenidenBtn').onclick = function () { reset(); };
    $('yenidenBtn').focus({ preventScroll: true });
  }

  // ---------- ekranlar ----------
  // Menü, açılış ve giriş js/screens.js içinde. Oyun ana menüye dönünce durur (su da durur).
  function goHome() {
    paused = true;
    if (sim) E.release(sim);
    if (window.KuyuScreens) window.KuyuScreens.home();
  }
  $('menuBtn').onclick = function () { goHome(); };
  $('atlaBtn').onclick = function () { if (mode === 'level') startLevel(levelNo + 1); };
  $('sesBtn').onclick = function () { save.mute = !save.mute; persist(); setMuteIcon(); };
  setMuteIcon();

  // ---------- girdi ----------
  var active = null;
  function toWorld(ev) {
    var r = canvas.getBoundingClientRect();
    return { x: (ev.clientX - r.left) / K, y: cam + (ev.clientY - r.top) / K };
  }
  canvas.addEventListener('pointerdown', function (ev) {
    ev.preventDefault();
    ac();
    if (!sim || paused || sim.status !== 'play') return;
    active = ev.pointerId;
    try { canvas.setPointerCapture(ev.pointerId); } catch (e) {}
    // Tek el: dokunuşun ekrandaki yatay yeri yönü seçer (sol / orta / sağ), nişan yardımı hedefi bulur.
    // Hedefin tam üstüne basılırsa (tablet, fare) doğrudan o hedef alınır.
    var w = toWorld(ev), r = canvas.getBoundingClientRect();
    var f = (ev.clientX - r.left) / Math.max(1, r.width);
    var tgt = E.aim(sim, f, w.x, w.y);
    // Tutunurken yukarıda hedef yoksa ip bırakılmaz ve aşağı atılmaz; parmak kalkınca yine bırakılır.
    if (tgt.hold) return;
    var dx = tgt.x - sim.p.x, dy = tgt.y - sim.p.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    aim = { x: dx / d, y: dy / d };
    E.press(sim, tgt.x, tgt.y, { rescue: !!tgt.rescue });
  });
  function up(ev) {
    if (ev.pointerId !== active) return;
    active = null;
    E.release(sim);
  }
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  window.addEventListener('keydown', function (e) {
    if (e.target && e.target.tagName === 'INPUT') return;
    if (paused) return;
    if (e.key === 'r' || e.key === 'R') reset();
    else if (e.key === 'Escape') goHome();
    else if (e.key === 'Enter' && !$('katman').hidden) { if (mode === 'level') startLevel(levelNo + 1); else reset(); }
  });
  var rt = null;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(layout, 80); });

  // test ve hata ayıklama için salt okunur erişim
  window.KuyuDebug = { state: function () { return { sim: sim, cam: cam, K: K, mode: mode, level: levelNo }; } };

  // Ekran yöneticisinin kullandığı arayüz
  window.KuyuGame = {
    startLevel: function (n) { ac(); startLevel(n); },
    startEndless: function () { ac(); startEndless(); },
    pause: function () { paused = true; },
    save: function () { return save; },
    persist: persist,
    levelDef: levelDef,
    handCount: HAND.length,
    toggleMute: function () { save.mute = !save.mute; persist(); setMuteIcon(); return save.mute; },
    toggleHaptics: function () { save.haptics = save.haptics === false; persist(); if (save.haptics) buzz(20); return save.haptics; },
    unlockAudio: function () { ac(); },
    sfx: SFX
  };

  requestAnimationFrame(frame);
})();
