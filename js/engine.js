/* Kuyu — kanca fiziği ve kurallar (çizimden bağımsız). Tarayıcıda window.KuyuEngine, Node'da module.exports.

   Dünya: genişlik 360 birim, y aşağı doğru artar. Bölüm modunda taban y = H, kova üstte.
   Sonsuz modda (def.endless) kuyu yukarı doğru def.extend(sim) ile üretilir, y eksiye gider.

   Kural: kanca hafif şeyi (kutu) sana çeker, ağır şeye (halka, ahşap) seni çeker.
   Taş kancayı tutmaz. Diken öldürür. Su aşağıdan yükselir.

   Denge: Asılı kalmak bedava değil.
   - Tutunma gücü: ipin ucunda asılıyken (tam sarılmış) süre sayar; def.grip saniyeyi geçince el kayar.
   - Akış: ip tam sarılmadan bırakıp (fırlayıp) havadayken sıradaki noktaya tutunursan akış sayacı artar.
     Uzun asılı kalmak, yere basmak ya da havada çok kalmak akışı bozar.
*/
(function (root) {
  'use strict';

  var CFG = {
    W: 360, WALL: 16,
    G: 1500,            // yerçekimi (birim/s²)
    R: 11,              // oyuncu yarıçapı
    HOOK_SPEED: 2600,   // kanca uçuş hızı
    HOOK_BACK: 3400,    // geri sarılma hızı
    HOOK_MAX: 300,      // menzil
    REEL: 760,          // ip sarma hızı
    MIN_LEN: 24,        // asılı kalınca ip boyu
    BOX_R: 13,
    RING_R: 10,
    DT: 1 / 120,
    MAXV: 1150,
    GRIP: 2.2,          // varsayılan tutunma süresi (s); seviye def.grip ile değiştirir
    EARLY: 0.25,        // bu süreden kısa asılıp bırakmak "fırlama" sayılır
    COMBO_HANG: 0.45,   // bundan uzun asılı kalmak akışı bozar
    COMBO_AIR: 1.1,     // havada bundan uzun tutunmadan kalmak akışı bozar
    UP_RISE: 60,        // nişan: bundan az yükselen hedef "yanda" sayılır (3 m)
    UP_ANGLE: 45,       // nişan: bundan düz açıdaki hedef "yanda" sayılır (derece)
    NEAR_V: 40,         // yatayda bu kadar yakın (tam tepedeki) hedef iki taraftan da alınır
    GATE_W: 56,         // rüzgâr şeridi: merkezden sağa-sola bu kadar (toplam 112 birim genişlik)
    BOOST: 650,         // hız halkasından bırakınca eklenen yukarı hız (birim/sn)
    WATER_GRACE: 1.0,   // ilk halkaya tutunduktan bu kadar sonra su yükselmeye başlar
    RESCUE_MAX: 1000,   // kurtarma kancası: menzilde hedef yokken en yakın yukarıdaki hedefe bu kadar uzağa atılır
    SPEED_BASE: 200,    // hız çarpanı bu serbest uçuş hızından sonra başlar
    SPEED_TOP: 1150,    // bu hızda çarpan en yüksek (x1,5)
    COMBO_PTS: 3,       // sonsuz mod: akışlı her tutunma min(akış, COMBO_CAP) × bu kadar puan
    COMBO_CAP: 12
  };

  function rect(a) { return { x: a[0], y: a[1], w: a[2], h: a[3], type: a[4], dir: a[5] || 'u' }; }

  function createSim(def) {
    var H = def.H || 0;
    var rects = [
      { x: -60, y: -1e7, w: 60 + CFG.WALL, h: 2e7, type: 's', wall: true },
      { x: CFG.W - CFG.WALL, y: -1e7, w: 60 + CFG.WALL, h: 2e7, type: 's', wall: true }
    ].concat((def.rects || []).map(rect));
    var sx = def.start[0], sy = def.start[1];
    var s = {
      def: def, H: H, endless: !!def.endless, rects: rects, t: 0, status: 'play',
      p: { x: sx, y: sy, px: sx, py: sy },
      pressed: false, hook: null, rope: null, lastAnchor: null,
      rings: (def.rings || []).map(function (r) { return { x: r[0], y: r[1], ff: r[2] === 'ff', hiz: r[2] === 'hiz', kapi: r[2] === 'kapi' }; }),
      goal: def.goal ? { x: def.goal[0], y: def.goal[1] } : null,
      boxes: (def.boxes || []).map(function (b) { return { x: b[0], y: b[1], px: b[0], py: b[1] }; }),
      buttons: (def.buttons || []).map(function (b) { return { x: b[0], y: b[1], w: b[2], h: 8, pressed: false }; }),
      fireflies: [],
      gatesOpen: false,
      water: def.water || def.waterSpeed ? (def.endless ? sy + (def.waterStart || 300) : H + 80) : null,
      // El kayması yalnızca Sonsuz Kuyu'da: bölümlerde asılı kalınabilir (akış yine bozulur).
      grip: def.endless ? (def.grip || CFG.GRIP) : Infinity,
      events: [],
      grounded: false,
      // akış ve skor
      hang: 0, air: 0, chain: false, combo: 0, maxCombo: 0, hooks: 0, shots: 0, slips: 0,
      startY: sy, topY: sy, bonus: 0, fireflyPts: 0, maxSpeed: 0, rescues: 0, misses: 0, boosts: 0, gates: 0
    };
    // Ateşböcekleri halkaların içinde: o halkaya tutunmak ya da içinden geçmek yeter.
    s.rings.forEach(function (rg) { if (rg.ff) s.fireflies.push({ x: rg.x, y: rg.y, got: false, ring: rg }); });
    (def.fireflies || []).forEach(function (f) { s.fireflies.push({ x: f[0], y: f[1], got: false }); });
    if (def.extend) def.extend(s);
    return s;
  }

  // ---------- geometri ----------
  function solid(s, r) {
    if (r.type === 'g') return !s.gatesOpen;
    return r.type === 's' || r.type === 'w';
  }

  function segRect(x0, y0, x1, y1, r) {
    var dx = x1 - x0, dy = y1 - y0, tmin = 0, tmax = 1;
    var axes = [[dx, x0, r.x, r.x + r.w], [dy, y0, r.y, r.y + r.h]];
    for (var i = 0; i < 2; i++) {
      var d = axes[i][0], o = axes[i][1], lo = axes[i][2], hi = axes[i][3];
      if (Math.abs(d) < 1e-9) { if (o < lo || o > hi) return null; continue; }
      var t1 = (lo - o) / d, t2 = (hi - o) / d;
      if (t1 > t2) { var tmp = t1; t1 = t2; t2 = tmp; }
      if (t1 > tmin) tmin = t1;
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return null;
    }
    return { t: tmin };
  }

  function segCircle(x0, y0, x1, y1, cx, cy, r) {
    var dx = x1 - x0, dy = y1 - y0, fx = x0 - cx, fy = y0 - cy;
    var a = dx * dx + dy * dy, b = 2 * (fx * dx + fy * dy), c = fx * fx + fy * fy - r * r;
    if (c <= 0) return null; // başlangıç zaten içinde: bu nesneyi yok say
    var disc = b * b - 4 * a * c;
    if (disc < 0 || a < 1e-9) return null;
    var t = (-b - Math.sqrt(disc)) / (2 * a);
    return t >= 0 && t <= 1 ? t : null;
  }

  // Kanca ucunun bu adımda neye çarptığı. ignore: az önce tutunulan halka ya da ahşap.
  function hookRay(s, x0, y0, x1, y1, ignore) {
    var best = null, i;
    var minY = Math.min(y0, y1) - 40, maxY = Math.max(y0, y1) + 40;
    function consider(tt, hit) { if (tt != null && (!best || tt < best.t)) { hit.t = tt; best = hit; } }
    for (i = 0; i < s.rings.length; i++) {
      var rg = s.rings[i];
      if (rg === ignore || rg.kapi || rg.y < minY || rg.y > maxY) continue;
      consider(segCircle(x0, y0, x1, y1, rg.x, rg.y, CFG.RING_R + 2), { kind: 'ring', ring: rg });
    }
    if (s.goal) consider(segCircle(x0, y0, x1, y1, s.goal.x, s.goal.y, 16), { kind: 'goal' });
    for (i = 0; i < s.boxes.length; i++) consider(segCircle(x0, y0, x1, y1, s.boxes[i].x, s.boxes[i].y, CFG.BOX_R + 2), { kind: 'box', box: s.boxes[i] });
    for (i = 0; i < s.rects.length; i++) {
      var r = s.rects[i];
      if ((r.type === 'g' && s.gatesOpen) || r === ignore) continue;
      if (r.y > maxY || r.y + r.h < minY) continue;
      var h = segRect(x0, y0, x1, y1, r);
      if (h) consider(h.t, { kind: r.type === 'w' ? 'wood' : 'stone', rect: r });
    }
    if (best) { best.x = x0 + (x1 - x0) * best.t; best.y = y0 + (y1 - y0) * best.t; }
    return best;
  }

  // Daire ile dikdörtgen çakışmasını çöz. Döner: normal (ya da null).
  function collideCircle(b, r, R, friction) {
    var cx = Math.max(r.x, Math.min(b.x, r.x + r.w)), cy = Math.max(r.y, Math.min(b.y, r.y + r.h));
    var dx = b.x - cx, dy = b.y - cy, d2 = dx * dx + dy * dy;
    if (d2 >= R * R) return null;
    var d = Math.sqrt(d2), nx, ny;
    if (d < 1e-6) {
      var l = b.x - r.x, rr = r.x + r.w - b.x, t = b.y - r.y, bb = r.y + r.h - b.y, m = Math.min(l, rr, t, bb);
      if (m === t) { nx = 0; ny = -1; d = -t; } else if (m === bb) { nx = 0; ny = 1; d = -bb; }
      else if (m === l) { nx = -1; ny = 0; d = -l; } else { nx = 1; ny = 0; d = -rr; }
    } else { nx = dx / d; ny = dy / d; }
    b.x += nx * (R - d); b.y += ny * (R - d);
    var vx = b.x - b.px, vy = b.y - b.py, vn = vx * nx + vy * ny;
    if (vn < 0) {
      vx -= nx * vn; vy -= ny * vn;
      var f = ny < -0.5 ? friction : 0.985;
      vx *= f; vy *= f;
      b.px = b.x - vx; b.py = b.y - vy;
    }
    return { nx: nx, ny: ny };
  }

  function overlapsRect(b, r, R) {
    var cx = Math.max(r.x, Math.min(b.x, r.x + r.w)), cy = Math.max(r.y, Math.min(b.y, r.y + r.h));
    var dx = b.x - cx, dy = b.y - cy;
    return dx * dx + dy * dy < R * R;
  }

  function integrate(b, dt) {
    var vx = (b.x - b.px) * 0.9995, vy = (b.y - b.py) * 0.9995;
    var max = CFG.MAXV * dt, sp = Math.sqrt(vx * vx + vy * vy);
    if (sp > max) { vx *= max / sp; vy *= max / sp; }
    b.px = b.x; b.py = b.y;
    b.x += vx; b.y += vy + CFG.G * dt * dt;
  }

  // ---------- akış ----------
  function breakCombo(s, why) {
    if (s.combo >= 2) s.events.push({ type: 'comboBreak', combo: s.combo, why: why });
    s.combo = 0; s.chain = false;
  }

  // İpi bırak (parmak kalktı, yeni atış ya da el kaydı).
  function detach(s, why) {
    var rp = s.rope;
    if (!rp) return;
    if (rp.kind === 'anchor') {
      s.lastAnchor = rp; s.lastAnchorT = s.t;
      s.chain = s.hang < CFG.EARLY && why !== 'slip';
      s.air = 0;
      // Hız halkası: bırakınca yukarı fırlatır (el kayması hariç)
      if (rp.ref && rp.ref.hiz && why !== 'slip') {
        s.p.py += CFG.BOOST * CFG.DT;
        s.boosts++;
        s.events.push({ type: 'boost', x: s.p.x, y: s.p.y });
      }
    }
    s.events.push({ type: why === 'slip' ? 'slip' : 'release', box: rp.kind === 'box', chain: s.chain });
    s.rope = null;
    s.hang = 0;
  }

  function onAttach(s, x, y, what) {
    s.hooks++;
    if (s.waterFrom == null) { s.waterFrom = s.t; if (s.water != null) s.events.push({ type: 'waterStart' }); }
    s.combo = s.chain && s.combo > 0 ? s.combo + 1 : 1;
    s.chain = false;
    s.hang = 0;
    if (s.combo > s.maxCombo) s.maxCombo = s.combo;
    if (s.combo >= 2) {
      s.bonus += Math.min(s.combo, CFG.COMBO_CAP) * CFG.COMBO_PTS;
      s.events.push({ type: 'combo', combo: s.combo, x: x, y: y });
    }
    s.events.push({ type: 'attach', x: x, y: y, what: what });
  }

  // ---------- tek el nişan yardımı ----------
  // Telefonda oyuncu hedefe dokunmaz: başparmağın ekranın neresine bastığı yalnızca yönü seçer.
  //   f = dokunuşun ekran genişliğindeki yeri (0 sol kenar, 1 sağ kenar)
  //   sol taraf sol yukarı, orta düz yukarı, sağ taraf sağ yukarı.
  // O yönde menzilde ve görüşte olan tutunma noktaları (halka, kova, ahşap, kutu) arasından en uygunu seçilir.
  // Dokunuş bir hedefin hemen üstündeyse (tablet, fare) doğrudan o hedef alınır.
  function currentIgnore(s) {
    if (s.rope && s.rope.kind === 'anchor') return s.rope.ref;
    if (s.lastAnchor) {
      var dl = dist(s.p.x, s.p.y, s.lastAnchor.x, s.lastAnchor.y);
      if (dl < 48 || (s.t - s.lastAnchorT < 0.45 && dl < 110)) return s.lastAnchor.ref;
    }
    return null;
  }

  function candidates(s, range) {
    var p = s.p, R = (range || CFG.HOOK_MAX) - 4, out = [], i;
    function add(x, y, kind, ref) { var d = dist(p.x, p.y, x, y); if (d <= R && d > 18) out.push({ x: x, y: y, kind: kind, ref: ref, d: d }); }
    for (i = 0; i < s.rings.length; i++) { var rg = s.rings[i]; if (!rg.kapi && Math.abs(rg.y - p.y) <= R) add(rg.x, rg.y, 'ring', rg); }
    if (s.goal) add(s.goal.x, s.goal.y, 'goal', 'goal');
    for (i = 0; i < s.boxes.length; i++) add(s.boxes[i].x, s.boxes[i].y, 'box', s.boxes[i]);
    for (i = 0; i < s.rects.length; i++) {
      var r = s.rects[i];
      if (r.type !== 'w' || r.y > p.y + R || r.y + r.h < p.y - R) continue;
      // ahşabın oyuncuya bakan yüzünde, menzile giren en yüksek nokta (en çok yükseklik kazandıran)
      var px = Math.max(r.x, Math.min(p.x, r.x + r.w));
      var hx = Math.abs(px - p.x);
      if (hx >= R) continue;
      var reachUp = Math.sqrt(R * R - hx * hx) * 0.96;
      var py = Math.max(r.y + 6, p.y - reachUp);
      if (py > r.y + r.h - 4) continue;
      add(px, py, 'wood', r);
    }
    return out;
  }

  // Bu noktaya atılan kanca gerçekten oraya mı takılır?
  function reachable(s, c, ignore) {
    var p = s.p, dx = c.x - p.x, dy = c.y - p.y, d = Math.sqrt(dx * dx + dy * dy);
    var hit = hookRay(s, p.x, p.y, p.x + dx / d * (d + 6), p.y + dy / d * (d + 6), ignore);
    if (!hit) return false;
    if (c.kind === 'goal') return hit.kind === 'goal';
    return (hit.ring || hit.rect || hit.box) === c.ref;
  }

  function aim(s, f, tapX, tapY) {
    var p = s.p, ignore = currentIgnore(s), list = candidates(s), i, c;
    // hassas dokunuş: hedefin üstüne basıldıysa onu al
    if (tapX != null) {
      var near = null;
      for (i = 0; i < list.length; i++) {
        c = list[i];
        if (c.ref === ignore) continue;
        var dt = dist(tapX, tapY, c.x, c.y);
        if (dt < 40 && (!near || dt < near.dt) && reachable(s, c, ignore)) near = { c: c, dt: dt };
      }
      if (near) return { x: near.c.x, y: near.c.y, kind: near.c.kind, assisted: true };
    }
    // Ekran ikiye bölünür: sol yarı sol, sağ yarı sağ. Taraf seçimi oyuncunun kararıdır.
    var side = f < 0.5 ? -1 : 1;
    var th = (side < 0 ? -120 : -60) * Math.PI / 180;
    var dirX = Math.cos(th), dirY = Math.sin(th);
    // "Yukarı" asılı olduğun noktaya göre ölçülür: aynı yükseklikteki yan halka yukarı sayılmaz.
    var refY = s.rope && s.rope.kind === 'anchor' ? s.rope.y : p.y;
    var holding = s.rope && s.rope.kind === 'anchor';
    var refX = holding ? s.rope.x : p.x, slope = Math.tan(CFG.UP_ANGLE * Math.PI / 180);
    // Yukarıdakiler ikiye ayrılır: dik (gerçekten yukarı) ve sığ (neredeyse aynı hizada, yanda).
    // Yandaki yakın hedef, aynı taraftaki daha yukarıdaki hedefin önüne geçmesin.
    var upSide = [], flatSide = [], downSide = [], anyReach = false;
    for (i = 0; i < list.length; i++) {
      c = list[i];
      if (c.ref === ignore) continue;
      var dx = c.x - p.x;
      // yalnızca bastığın taraf; tam tepedeki hedef (±NEAR_V) iki taraftan da alınır
      var sideOk = side < 0 ? dx <= CFG.NEAR_V : dx >= -CFG.NEAR_V;
      // tam tepedeki hedef ikinci sırada: o tarafta başka hedef varsa işaret onu gösterir (iki seçenek ayrışır)
      c.strict = side < 0 ? dx < -CFG.NEAR_V : dx > CFG.NEAR_V;
      var rise = refY - c.y, up = rise > 30;
      var flat = up && (rise < CFG.UP_RISE || rise < Math.abs(c.x - refX) * slope);
      if (sideOk) (flat ? flatSide : up ? upSide : downSide).push(c);
      else if (!anyReach && (up || !holding) && reachable(s, c, ignore)) anyReach = true;
    }
    // Öncelik: bu taraftaki en yakın dik yukarı hedef, sonra yandaki sığ hedef; tutunmuyorsan en son aşağıdaki.
    // Tutunurken aşağıya hiç atılmaz.
    var tiers = holding ? [upSide, flatSide] : [upSide, flatSide, downSide];
    for (var tI = 0; tI < tiers.length; tI++) {
      var tier = tiers[tI].sort(function (u, v) { return (u.strict === v.strict) ? u.d - v.d : (u.strict ? -1 : 1); });
      for (i = 0; i < tier.length; i++) {
        if (reachable(s, tier[i], ignore)) return { x: tier[i].x, y: tier[i].y, kind: tier[i].kind, ref: tier[i].ref, tier: tI, assisted: true };
      }
    }
    var missAt = { x: p.x + dirX * CFG.HOOK_MAX, y: p.y + dirY * CFG.HOOK_MAX, kind: 'none', miss: true, assisted: false };
    // Bu tarafta hedef yok. Diğer tarafta varsa ya da tutunuyorsan: kanca bu yöne boşa gider, ip bırakılmaz.
    if (holding || anyReach) return missAt;
    // İki tarafta da menzilde hiç hedef yok (dipte tıkanma): kurtarma kancası en yakın yukarıdaki hedefe uzanır.
    var far = candidates(s, CFG.RESCUE_MAX).filter(function (cc) { return cc.ref !== ignore && cc.y < p.y - 12; })
      .sort(function (u, v) { return u.d - v.d; });
    for (i = 0; i < far.length; i++) {
      if (reachable(s, far[i], ignore)) return { x: far[i].x, y: far[i].y, kind: far[i].kind, ref: far[i].ref, rescue: true, assisted: true };
    }
    return missAt;
  }

  // ---------- girdi ----------
  function press(s, tx, ty, opts) {
    if (s.status !== 'play') return;
    s.pressed = true;
    // Tutunduğun ya da az önce bıraktığın noktaya yeni atış takılmasın (zincirlerken ipin yolu üstünde kalır).
    var ignore = currentIgnore(s);
    var keep = !!(opts && opts.keep);
    // Boş atış (bu tarafta hedef yok): kanca gidip döner, tutunduğun ip bırakılmaz.
    if (s.rope && !keep) detach(s, 'repress');
    var dx = tx - s.p.x, dy = ty - s.p.y, d = Math.sqrt(dx * dx + dy * dy);
    if (d < 4) { dx = 0; dy = -1; d = 1; }
    var rescue = !!(opts && opts.rescue);
    s.hook = { x: s.p.x, y: s.p.y, ox: s.p.x, oy: s.p.y, dx: dx / d, dy: dy / d, state: 'fly', ignore: ignore,
      max: rescue ? CFG.RESCUE_MAX : CFG.HOOK_MAX, rescue: rescue, keep: keep };
    s.shots++;
    if (keep) s.misses++;
    if (rescue) { s.rescues++; if (s.combo > 0) breakCombo(s, 'kurtarma'); }
    s.events.push({ type: rescue ? 'rescue' : keep ? 'missShot' : 'fire' });
  }

  function release(s) {
    s.pressed = false;
    detach(s, 'release');
    if (s.hook && s.hook.state !== 'back') s.hook.state = 'back';
  }

  // ---------- adım ----------
  function step(s) {
    if (s.status !== 'play') return;
    var dt = CFG.DT, i, j, p = s.p;
    s.t += dt;
    if (s.endless && s.def.extend) s.def.extend(s);

    // kanca uçuşu
    var hk = s.hook;
    if (hk && hk.state === 'fly') {
      var hs = hk.rescue ? CFG.HOOK_SPEED * 2 : CFG.HOOK_SPEED;
      var nx = hk.x + hk.dx * hs * dt, ny = hk.y + hk.dy * hs * dt;
      var hit = hookRay(s, hk.x, hk.y, nx, ny, hk.ignore);
      if (hit) {
        if ((hit.kind === 'ring' || hit.kind === 'wood' || hit.kind === 'goal' || hit.kind === 'box') && s.rope) detach(s, 'repress');
        if (hit.kind === 'ring' || hit.kind === 'wood' || hit.kind === 'goal') {
          var ax = hit.kind === 'ring' ? hit.ring.x : hit.kind === 'goal' ? s.goal.x : hit.x;
          var ay = hit.kind === 'ring' ? hit.ring.y : hit.kind === 'goal' ? s.goal.y : hit.y;
          s.rope = { kind: 'anchor', x: ax, y: ay, len: dist(p.x, p.y, ax, ay), target: hit.kind, ref: hit.ring || hit.rect || null };
          s.hook = null;
          onAttach(s, ax, ay, hit.kind);
          if (hit.ring && hit.ring.ff) collectRing(s, hit.ring);
          if (hit.kind === 'goal') { s.status = 'won'; s.events.push({ type: 'won' }); return; }
        } else if (hit.kind === 'box') {
          s.rope = { kind: 'box', box: hit.box, len: dist(p.x, p.y, hit.box.x, hit.box.y) };
          s.hook = null;
          s.events.push({ type: 'attach', x: hit.box.x, y: hit.box.y, what: 'box' });
        } else {
          hk.x = hit.x; hk.y = hit.y; hk.state = 'back';
          s.events.push({ type: 'clink', x: hit.x, y: hit.y });
        }
      } else {
        hk.x = nx; hk.y = ny;
        if (dist(hk.ox, hk.oy, hk.x, hk.y) >= (hk.max || CFG.HOOK_MAX)) { hk.state = 'back'; s.events.push({ type: 'miss' }); }
      }
    } else if (hk && hk.state === 'back') {
      var bx = p.x - hk.x, by = p.y - hk.y, bd = Math.sqrt(bx * bx + by * by), stepLen = CFG.HOOK_BACK * dt;
      if (bd <= stepLen) s.hook = null; else { hk.x += bx / bd * stepLen; hk.y += by / bd * stepLen; }
    }

    // oyuncu
    integrate(p, dt);
    var rp = s.rope;
    if (rp && rp.kind === 'anchor') {
      rp.len = Math.max(CFG.MIN_LEN, rp.len - CFG.REEL * dt);
      var ddx = p.x - rp.x, ddy = p.y - rp.y, dd = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
      var atMin = rp.len <= CFG.MIN_LEN + 0.01;
      if (dd > rp.len || atMin) {
        p.x = rp.x + ddx / dd * rp.len; p.y = rp.y + ddy / dd * rp.len;
        if (atMin) {
          var vx = (p.x - p.px) * 0.97, vy = (p.y - p.py) * 0.97;
          p.px = p.x - vx; p.py = p.y - vy;
        }
      }
      // tutunma gücü ve akış
      if (atMin) {
        s.hang += dt;
        if (s.hang > CFG.COMBO_HANG && s.combo > 0) breakCombo(s, 'asılı');
        if (s.hang > s.grip) { s.slips++; detach(s, 'slip'); }
      }
    } else if (!rp) {
      s.air += dt;
      if (s.air > CFG.COMBO_AIR && s.combo > 0) breakCombo(s, 'hava');
    }
    s.grounded = false;
    for (j = 0; j < 2; j++) {
      for (i = 0; i < s.rects.length; i++) {
        var r = s.rects[i];
        if (!solid(s, r)) continue;
        if (r.y > p.y + 40 || r.y + r.h < p.y - 40) continue;
        var n = collideCircle(p, r, CFG.R, 0.86);
        if (n && n.ny < -0.5) s.grounded = true;
      }
    }
    if (s.grounded && !s.rope && s.combo > 0) breakCombo(s, 'yer');

    // kutular
    for (i = 0; i < s.boxes.length; i++) {
      var b = s.boxes[i];
      integrate(b, dt);
      if (rp && rp.kind === 'box' && rp.box === b) {
        rp.len = Math.max(CFG.MIN_LEN + 6, rp.len - CFG.REEL * dt);
        var ex = b.x - p.x, ey = b.y - p.y, ed = Math.sqrt(ex * ex + ey * ey) || 1;
        if (ed > rp.len) { b.x = p.x + ex / ed * rp.len; b.y = p.y + ey / ed * rp.len; }
      }
      for (j = 0; j < 2; j++) for (var k = 0; k < s.rects.length; k++) if (solid(s, s.rects[k])) collideCircle(b, s.rects[k], CFG.BOX_R, 0.6);
    }

    // düğmeler ve kapılar
    var wasOpen = s.gatesOpen, any = false;
    for (i = 0; i < s.buttons.length; i++) {
      var bt = s.buttons[i];
      bt.pressed = s.boxes.some(function (bb) { return bb.x > bt.x - 4 && bb.x < bt.x + bt.w + 4 && bb.y + CFG.BOX_R > bt.y - 3 && bb.y < bt.y + bt.h; });
      if (bt.pressed) any = true;
    }
    s.gatesOpen = any;
    if (any !== wasOpen) s.events.push({ type: any ? 'gateOpen' : 'gateClose' });

    // ateşböcekleri
    for (i = 0; i < s.fireflies.length; i++) {
      var f = s.fireflies[i];
      if (!f.got && Math.abs(f.y - p.y) < 40 && dist(p.x, p.y, f.x, f.y) < CFG.R + (f.ring ? 20 : 12)) {
        f.got = true; if (f.ring) f.ring.got = true; s.fireflyPts += 25;
        s.events.push({ type: 'firefly', x: f.x, y: f.y });
      }
    }

    // Rüzgâr şeritleri (kapı) yolun üstünde durur; yalnızca akış sürerken (x2 ve üstü) içinden geçmek sayılır:
    // akış bir artar, havada kalma süresi tazelenir. Asılı kalıp akışı bozan için kapı sönüktür.
    var moving = !s.rope || (s.rope.kind === 'anchor' && s.rope.len > CFG.MIN_LEN + 1);
    if (moving && s.combo >= 2) {
      for (i = 0; i < s.rings.length; i++) {
        var gt = s.rings[i];
        // şeridi aşağıdan yukarı geçmek: bu adımda çizginin altından üstüne çıktıysan ve şerit genişliğindeysen
        if (gt.kapi && !gt.got && p.py > gt.y && p.y <= gt.y && Math.abs(p.x - gt.x) < CFG.GATE_W) passGate(s, gt);
      }
    }

    if (p.y < s.topY) s.topY = p.y;
    // Raunttaki en yüksek hız: ipte değilken, yukarı ya da yana giderken. Kancanın çekme hızı ve düşüş sayılmaz.
    if (!s.rope) {
      var fvx = (p.x - p.px) / dt, fvy = (p.y - p.py) / dt;
      if (fvy <= 0) { var fv = Math.sqrt(fvx * fvx + fvy * fvy); if (fv > s.maxSpeed) s.maxSpeed = fv; }
    }

    // ölüm
    for (i = 0; i < s.rects.length; i++) {
      var hr = s.rects[i];
      if (hr.type === 'k' && hr.y < p.y + 30 && hr.y + hr.h > p.y - 30 && overlapsRect(p, hr, CFG.R * 0.8)) return die(s, 'diken');
    }
    if (s.water != null) {
      // Su ilk halkaya tutununca tetiklenir (oyuncu başlamadan beklerken yükselmez), kısa bir payla başlar.
      if (s.waterFrom != null && s.t - s.waterFrom > CFG.WATER_GRACE) {
        var speed = s.def.waterSpeed ? s.def.waterSpeed(s) : s.def.water;
        s.water -= speed * dt;
        // sonsuz modda su çok geride kalmasın
        if (s.endless && s.water > p.y + 950) s.water = p.y + 950;
      }
      if (p.y + CFG.R * 0.5 > s.water) return die(s, 'su');
    }
    if (!s.endless && p.y > s.H + 220) return die(s, 'düşüş');
  }

  function passGate(s, gt) {
    gt.got = true;
    s.gates++;
    s.combo++;
    s.air = 0;        // havada kalma süresi tazelenir
    if (s.combo > s.maxCombo) s.maxCombo = s.combo;
    if (s.combo >= 2) s.bonus += Math.min(s.combo, CFG.COMBO_CAP) * CFG.COMBO_PTS;
    s.events.push({ type: 'kapi', x: gt.x, y: gt.y, combo: s.combo });
  }

  function collectRing(s, rg) {
    for (var i = 0; i < s.fireflies.length; i++) {
      var f = s.fireflies[i];
      if (f.ring === rg && !f.got) { f.got = true; rg.got = true; s.fireflyPts += 25; s.events.push({ type: 'firefly', x: f.x, y: f.y }); }
    }
  }
  // Hız çarpanı: 1,00 – 1,50 (0,05 adımlarla)
  function speedMult(s) {
    var k = Math.max(0, Math.min(1, (s.maxSpeed - CFG.SPEED_BASE) / (CFG.SPEED_TOP - CFG.SPEED_BASE)));
    return 1 + Math.round(k * 10) / 20;
  }
  function speedMs(v) { return v / 20; } // birim/sn → m/sn (20 birim = 1 m)
  function die(s, why) { s.status = 'dead'; s.rope = null; s.hook = null; s.events.push({ type: 'dead', why: why }); }
  function dist(ax, ay, bx, by) { var x = ax - bx, y = ay - by; return Math.sqrt(x * x + y * y); }
  function fireflyCount(s) { return s.fireflies.filter(function (f) { return f.got; }).length; }
  // Sonsuz mod puanı: tırmanılan metre + akış bonusu + ateşböcekleri
  function meters(s) { return Math.max(0, Math.floor((s.startY - s.topY) / 20)); }
  function score(s) { return meters(s) + s.bonus + s.fireflyPts; }
  function finalScore(s) { return Math.round(score(s) * speedMult(s)); }

  var api = {
    CFG: CFG, createSim: createSim, step: step, press: press, release: release,
    fireflyCount: fireflyCount, hookRay: hookRay, meters: meters, score: score, segRect: segRect, aim: aim,
    candidates: candidates, reachable: reachable, currentIgnore: currentIgnore,
    speedMult: speedMult, speedMs: speedMs, finalScore: finalScore
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KuyuEngine = api;
})(typeof window !== 'undefined' ? window : this);
