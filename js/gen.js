/* Kuyu — prosedürel kuyu üretici. Tarayıcıda window.KuyuGen, Node'da module.exports.

   Önce her zaman ulaşılabilir bir "ana yol" kurulur: her düğüm (halka ya da ahşap duvar paneli)
   bir öncekinin asılma noktasından menzil içinde. Engeller (diken, taş çıkıntı) sonra eklenir ve
   ana yolun çevresinde bir koridoru boş bırakmak zorundadır. Böylece her bölüm ve sonsuz kuyunun
   her metresi çözülebilir kalır; tools/bot.js bunu gerçek fizikle dener.

   createLevel(n)   n >= 7 için sabit bir bölüm (aynı n hep aynı bölümü verir)
   createEndless(seed)  sonsuz koşu: kuyu oyuncu tırmandıkça yukarı doğru üretilir
*/
(function (root) {
  'use strict';
  var W = 360, WL = 16, WR = 344, MIN = 24, REACH = 258;
  // Şimdilik zorluk yok: diken ve taş çıkıntı üretilmez, tek tehlike alttan yükselen su.
  // Engelleri geri açmak için true yapın (koridor kuralları duruyor).
  var HAZARDS = false;

  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // Düğümün tutunma noktası ve oyuncunun asılı kalacağı yaklaşık yer
  function target(n) { return n.kind === 'panelL' ? { x: WL + 10, y: n.y } : n.kind === 'panelR' ? { x: WR - 10, y: n.y } : { x: n.x, y: n.y }; }
  function hangOf(n) {
    if (n.kind === 'panelL') return { x: WL + 10 + 12, y: n.y + 20 };
    if (n.kind === 'panelR') return { x: WR - 10 - 12, y: n.y + 20 };
    return { x: n.x, y: n.y + MIN };
  }

  function nextNode(r, hp, diff, prevKind) {
    for (var tries = 0; tries < 60; tries++) {
      var dy = lerp(165, 232, diff) + (r() - 0.5) * 36;
      var roll = r(), panelP = 0.07 + 0.1 * diff, kind = 'ring', tx;
      if (roll < panelP && hp.x > 140 && prevKind !== 'panelL') { kind = 'panelL'; tx = WL + 10; }
      else if (roll > 1 - panelP && hp.x < 220 && prevKind !== 'panelR') { kind = 'panelR'; tx = WR - 10; }
      else {
        var dir = hp.x < 110 ? 1 : hp.x > 250 ? -1 : (r() < 0.5 ? -1 : 1);
        tx = clamp(hp.x + dir * (60 + r() * 130), 56, 304);
      }
      var ty = hp.y - dy, d = dist(hp, { x: tx, y: ty });
      if (d >= 150 && d <= REACH) return { kind: kind, x: tx, y: ty };
    }
    return { kind: 'ring', x: clamp(hp.x + (hp.x < 180 ? 70 : -70), 60, 300), y: hp.y - 185 };
  }

  // Bir dikdörtgenin bir doğru parçasına en yakın uzaklığı (örnekleyerek)
  function rectSegDist(rc, a, b) {
    var best = 1e9;
    for (var i = 0; i <= 24; i++) {
      var t = i / 24, x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
      var cx = clamp(x, rc.x, rc.x + rc.w), cy = clamp(y, rc.y, rc.y + rc.h);
      var d = Math.hypot(x - cx, y - cy);
      if (d < best) best = d;
    }
    return best;
  }
  function rectPointDist(rc, p) {
    var cx = clamp(p.x, rc.x, rc.x + rc.w), cy = clamp(p.y, rc.y, rc.y + rc.h);
    return Math.hypot(p.x - cx, p.y - cy);
  }

  // Ana yol: önceki asılma noktasından sonraki tutunma noktasına giden parçalar. Akışla oynayan
  // oyuncu ipi erken bırakıp halkanın ötesine fırlar ve doğrudan bir halkadan diğerine savrulur;
  // bu yüzden koridor şunları da kapsar: tutunma noktasının ötesine uzanan fırlama payı ve
  // ardışık tutunma noktaları arası.
  function corridor(segs, anchors) {
    var out = segs.slice();
    segs.forEach(function (sg) {
      var a = sg[0], t = sg[1], d = dist(a, t) || 1;
      out.push([t, { x: clamp(t.x + (t.x - a.x) / d * 110, WL, WR), y: t.y + (t.y - a.y) / d * 110 }]);
    });
    for (var i = 1; i < anchors.length; i++) out.push([anchors[i - 1], anchors[i]]);
    return out;
  }
  function clearOfPath(rc, segs, anchors, gap) {
    var all = corridor(segs, anchors);
    for (var i = 0; i < all.length; i++) if (rectSegDist(rc, all[i][0], all[i][1]) < gap) return false;
    for (var j = 0; j < anchors.length; j++) {
      var a = anchors[j];
      if (rectPointDist(rc, a) < gap + 40) return false;
      // sarkaç payı: halkanın altında ip boyu kadar savrulma yayı
      if (rc.type === 'k') {
        for (var th = -75; th <= 75; th += 15) {
          var rad = th * Math.PI / 180;
          for (var L = 60; L <= 150; L += 45) {
            if (rectPointDist(rc, { x: a.x + Math.sin(rad) * L, y: a.y + Math.cos(rad) * L }) < 26) return false;
          }
        }
      }
    }
    return true;
  }

  // Bir yükseklik bandına engel ekle.
  function addHazards(r, out, diff, yTop, yBottom, segs, anchors, panels) {
    if (!HAZARDS) return;
    var count = Math.floor(diff * 2.6 + r() * 1.4);
    for (var k = 0; k < count; k++) {
      for (var tries = 0; tries < 14; tries++) {
        var roll = r(), rc;
        var y = lerp(yTop, yBottom, r());
        if (roll < 0.42) { // diken blok
          var w = 36 + Math.floor(r() * 50);
          rc = { x: clamp(40 + r() * (W - 80 - w), 30, W - 30 - w), y: y, w: w, h: 16, type: 'k', dir: r() < 0.5 ? 'u' : 'd' };
        } else if (roll < 0.72) { // taş çıkıntı (kancayı tutmaz)
          var w2 = 46 + Math.floor(r() * 70), left = r() < 0.5;
          rc = { x: left ? WL : WR - w2, y: y, w: w2, h: 14, type: 's' };
        } else { // duvar dikeni
          var h = 70 + Math.floor(r() * 110), leftW = r() < 0.5;
          rc = { x: leftW ? WL : WR - 14, y: y, w: 14, h: h, type: 'k', dir: leftW ? 'r' : 'l' };
          var hitsPanel = panels.some(function (p) { return p.x === (leftW ? WL : WR - 10) && p.y < rc.y + rc.h + 30 && p.y + p.h > rc.y - 30; });
          if (hitsPanel) continue;
        }
        if (clearOfPath(rc, segs, anchors, rc.type === 'k' ? 46 : 30) && !overlapsAny(rc, out.rects)) { out.rects.push(rc); break; }
      }
    }
  }
  function overlapsAny(rc, rects) {
    return rects.some(function (o) { return o.type !== 'wall' && rc.x < o.x + o.w + 12 && rc.x + rc.w > o.x - 12 && rc.y < o.y + o.h + 12 && rc.y + rc.h > o.y - 12; });
  }

  // Bir düğümü sahneye yerleştir.
  function placeNode(out, n) {
    if (n.kind === 'ring') out.rings.push({ x: n.x, y: n.y });
    else {
      var rc = { x: n.kind === 'panelL' ? WL : WR - 10, y: n.y - 55, w: 10, h: 110, type: 'w' };
      out.rects.push(rc); out.panels.push(rc);
    }
  }

  // ---------- ateşböceği halkaları ----------
  // Ana yoldaki bir tutunma noktasının (t) alternatifi: önceki asılma noktasından (from) ulaşılır,
  // kendisinden sonraki hedefe (next) de ulaşılır. Oyuncu ister bu halkaya gider (ateşböceğini alır),
  // ister ana halkaya gider (es geçer). Hiçbiri olmazsa null.
  function ffAlternative(r, from, t, next, rings) {
    var tries = [];
    var mx = 2 * from.x - t.x;            // önceki noktaya göre karşı taraf
    [0, 30, -30, 60, -60].forEach(function (ox) { [0, 25, -25].forEach(function (oy) { tries.push({ x: mx + ox, y: t.y + oy }); }); });
    // karşı taraf olmuyorsa aynı tarafta, ana halkanın biraz yanında
    [-90, 90, -120, 120].forEach(function (ox) { tries.push({ x: t.x + ox, y: t.y + 10 }); });
    for (var i = 0; i < tries.length; i++) {
      var c = { x: clamp(tries[i].x, 56, 304), y: tries[i].y };
      var d1 = dist(from, c);
      if (d1 < 120 || d1 > REACH) continue;
      if (dist(c, t) < 80) continue;
      if (next && dist({ x: c.x, y: c.y + MIN }, next) > REACH - 8) continue;
      var crowded = rings.some(function (rg) { return Math.hypot(rg.x - c.x, rg.y - c.y) < 70; });
      if (crowded) continue;
      return { x: Math.round(c.x), y: Math.round(c.y) };
    }
    return null;
  }

  // ---------- sonlu bölüm ----------
  function createLevel(num) {
    var r = rng(num * 7919 + 13);
    var nodesN = Math.min(18, 7 + Math.floor(num / 3));
    var diff = clamp(0.25 + (num - 7) / 45, 0.25, 1);
    var out = { rects: [], rings: [], panels: [] };
    var start = { x: 180, y: 0 }, hp = { x: 180, y: 0 }, nodes = [], prevKind = null;
    for (var i = 0; i < nodesN; i++) {
      var n = nextNode(r, hp, diff, prevKind);
      nodes.push(n); prevKind = n.kind;
      hp = hangOf(n);
    }
    // kova: son asılma noktasından ulaşılır
    var goal = { x: clamp(lerp(hp.x, 180, 0.6), 90, 270), y: hp.y - 175 };
    // engeller
    var allPts = [start].concat(nodes.map(hangOf));
    var segs = [], anchors = nodes.map(target);
    for (i = 0; i < nodes.length; i++) segs.push([allPts[i], target(nodes[i])]);
    segs.push([hp, goal]);
    nodes.forEach(function (nn) { placeNode(out, nn); });
    for (i = 0; i < nodes.length; i++) {
      var yB = allPts[i].y - 30, yT = target(nodes[i]).y + 10;
      if (i > 0) addHazards(r, out, diff, yT, yB, segs.slice(Math.max(0, i - 2), i + 3), anchors.slice(Math.max(0, i - 2), i + 3), out.panels);
    }
    // ateşböceği halkaları: üç karar noktasında, ana yolun alternatifi
    var ffRings = [], ffAt = {};
    [0.25, 0.5, 0.75].forEach(function (q) {
      var base = Math.max(1, Math.min(nodesN - 2, Math.round(nodesN * q)));
      for (var k = 0; k < 4; k++) {
        var ii = base + (k % 2 ? -1 : 1) * Math.ceil(k / 2);
        if (ii < 1 || ii > nodesN - 2 || ffAt[ii] || ffAt[ii - 1] || ffAt[ii + 1]) continue;
        var alt = ffAlternative(r, allPts[ii], target(nodes[ii]), target(nodes[ii + 1]), out.rings.concat(ffRings));
        if (alt) { ffRings.push(alt); ffAt[ii] = alt; break; }
      }
    });

    // hız halkaları: ateşböceği olmayan adımlarda, en fazla 3 adım arayla bir karar noktası kalsın
    var hizRings = [], hizAt = {}, lastDecision = 0;
    for (var hi = 1; hi <= nodesN - 2; hi++) {
      if (ffAt[hi]) { lastDecision = hi; continue; }
      if (ffAt[hi - 1] || ffAt[hi + 1] || hizAt[hi - 1]) continue;
      if (hi - lastDecision < 2 && r() < 0.6) continue;
      var alt2 = ffAlternative(r, allPts[hi], target(nodes[hi]), target(nodes[hi + 1]), out.rings.concat(ffRings, hizRings));
      if (alt2) { hizRings.push(alt2); hizAt[hi] = alt2; lastDecision = hi; }
    }

    // koordinatları kaydır: kova y=50'de, taban aşağıda
    var off = 50 - goal.y;
    function sh(p) { return [Math.round(p.x), Math.round(p.y + off)]; }
    var H = Math.round(start.y + off + 60);
    var rects = [[WL, H - 40, W - 2 * WL, 40, 's']].concat(out.rects.map(function (rc) {
      return [Math.round(rc.x), Math.round(rc.y + off), rc.w, rc.h, rc.type, rc.dir];
    }));
    var waterLevel = num % 3 === 2;
    var route = nodes.map(function (nn) { var t = target(nn); return ['hook', Math.round(t.x), Math.round(t.y + off)]; });
    route.push(['hook', Math.round(goal.x), Math.round(goal.y + off)]);
    // ateşböceklerini alan rota: karar noktalarında ateşböceği halkasına gider
    var ffRoute = route.map(function (st, k) { var a = ffAt[k]; return a ? ['hook', a.x, Math.round(a.y + off)] : st; });
    // hız rotası: karar noktalarında hız halkasına gider
    var hizRoute = route.map(function (st, k) { var a = hizAt[k] || ffAt[k]; return a ? ['hook', a.x, Math.round(a.y + off)] : st; });
    return {
      id: num, name: levelName(num, r), H: H, generated: true,
      hint: waterLevel ? 'Su yükseliyor. Asılı kalma, fırlayıp tutun.' : 'Az tutunarak çık: ipi erken bırak, havadayken sıradakine at.',
      start: [180, Math.round(off - 20)], goal: sh(goal),
      water: waterLevel ? Math.min(90, 45 + num * 0.5) : 0, waterDelay: 3,
      grip: 1.8,
      rects: rects,
      rings: out.rings.map(sh).concat(ffRings.map(function (a) { return [a.x, Math.round(a.y + off), 'ff']; }))
        .concat(hizRings.map(function (a) { return [a.x, Math.round(a.y + off), 'hiz']; })),
      route: route,
      ffRoute: ffRoute,
      hizRoute: hizRoute,
      par: route.length,
      flow: Math.max(3, Math.floor(route.length * 0.5))
    };
  }

  var NAMES_A = ['Yosunlu', 'Derin', 'Sessiz', 'Eski', 'Dar', 'Islak', 'Kör', 'Yankılı', 'Taşlı', 'Karanlık', 'Uzun', 'Serin'];
  var NAMES_B = ['Kuyu', 'Baca', 'Geçit', 'Dehliz', 'Boğaz', 'Kova Yolu', 'Sarnıç', 'Çukur'];
  function levelName(n, r) { return NAMES_A[Math.floor(r() * NAMES_A.length)] + ' ' + NAMES_B[Math.floor(r() * NAMES_B.length)]; }

  // ---------- sonsuz koşu ----------
  // Zorluk tırmanılan yüksekliğe göre artar; su hızı da.
  function createEndless(seed) {
    var r = rng(seed >>> 0);
    var startY = 0;
    var st = { hp: { x: 180, y: startY }, prevKind: null, nodes: [], frontier: startY, segs: [], anchors: [], prevHp: null, prevT: null, lastFF: -9 };
    var def = {
      id: 'sonsuz', name: 'Sonsuz Kuyu', endless: true, seed: seed,
      hint: 'Su durmadan yükselir. Sağa ya da sola dokunarak tırman; ipi erken bırakıp zincirlersen ekstra puan.',
      start: [180, startY - 20], rects: [[WL, startY, W - 2 * WL, 60, 's']], rings: [], fireflies: [],
      grip: 1.6, waterStart: 380, waterDelay: 3,
      // Su önce çok yavaş, tırmandıkça hızlanır: koşu erken bitmez, bekleyen oyuncuyu ancak yüksekte yakalar.
      waterSpeed: function (s) { var m = (s.startY - s.topY) / 20; return Math.min(300, 38 + m * 0.3); },
      path: st.nodes
    };
    def.extend = function (s) {
      // oyuncunun 1400 birim üstüne kadar üret
      while (st.frontier > s.p.y - 1400) {
        var m = (startY - st.hp.y) / 20;
        var diff = clamp(m / 400, 0, 1);
        var n = nextNode(r, st.hp, diff, st.prevKind);
        st.prevKind = n.kind;
        var t = target(n);
        st.segs.push([st.hp, t]); st.anchors.push(t);
        if (st.segs.length > 4) { st.segs.shift(); st.anchors.shift(); }
        var out = { rects: [], rings: [], panels: s.panels || (s.panels = []) };
        placeNode(out, n);
        out.rects.forEach(function (rc) { rc.dir = rc.dir || 'u'; s.rects.push(rc); });
        out.rings.forEach(function (rg) { s.rings.push(rg); });
        // engeller bir önceki asılma noktası ile bu tutunma noktası arasına
        if (m > 6) {
          var hz = { rects: [], rings: [], panels: s.panels };
          hz.rects = s.rects.filter(function (o) { return !o.wall && o.y > t.y - 300 && o.y < st.hp.y + 300; });
          var before = hz.rects.length;
          addHazards(r, hz, diff, t.y + 10, st.hp.y - 30, st.segs, st.anchors, s.panels);
          hz.rects.slice(before).forEach(function (rc) { s.rects.push(rc); });
        }
        // ateşböceği halkası: bir önceki düğümün alternatifi (artık sıradaki hedef belli: t)
        // her 2-3 adımda bir karar noktası: ateşböceği ya da hız halkası
        if (st.prevT && st.nodes.length - st.lastFF >= 2 && (st.nodes.length - st.lastFF >= 3 || r() < 0.6)) {
          var near = s.rings.filter(function (rg) { return Math.abs(rg.y - st.prevT.y) < 300; });
          var alt = ffAlternative(r, st.prevHp, st.prevT, t, near);
          if (alt) {
            var isFF = r() < 0.4;
            var fr = { x: alt.x, y: alt.y, ff: isFF, hiz: !isFF };
            s.rings.push(fr);
            if (isFF) s.fireflies.push({ x: alt.x, y: alt.y, got: false, ring: fr });
            st.lastFF = st.nodes.length;
          }
        }
        st.prevHp = st.hp; st.prevT = t;
        st.nodes.push(n);
        st.hp = hangOf(n);
        st.frontier = t.y;
      }
      // çok aşağıda kalanları temizle
      if (s.water != null && s.t % 1 < 0.01) {
        var cut = s.water + 500;
        s.rects = s.rects.filter(function (o) { return o.wall || o.y < cut; });
        s.rings = s.rings.filter(function (o) { return o.y < cut; });
        s.fireflies = s.fireflies.filter(function (o) { return o.y < cut; });
        if (s.panels) s.panels = s.panels.filter(function (o) { return o.y < cut; });
      }
    };
    return def;
  }

  var api = { createLevel: createLevel, createEndless: createEndless, target: target, hangOf: hangOf, ffAlternative: ffAlternative, rng: rng };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KuyuGen = api;
})(typeof window !== 'undefined' ? window : this);
