/* Kuyu — Hayalet: kendi en iyi koşunla yarış (internetsiz).
   Koşu sırasında kahramanın yeri saniyede 15 kez kaydedilir (sim zamanına göre, kare hızından bağımsız).
   En iyi koşu (bölümde en kısa süre, Sonsuz'da en yüksek puan, Günlük'te günün en iyisi) saklanır; sonraki
   koşuda soluk bir kopya aynı zamanlamayla tırmanır. Yalnızca görüntüdür: oyuna, nişana ve puana etkisi yok.
   Kayıt ayrı anahtarda ('kuyu.hayalet') durur; ana kayıt büyümez. Yer bilgisi farklarla (delta) yazılır.
   Online gelince arkadaşın hayaleti de aynı biçimle eklenebilir. */
(function (root) {
  'use strict';
  var HZ = 15, ADIM = 1 / HZ, SURUM = 1, EN_COK = HZ * 600; // en çok 10 dk

  function yeni(startY) { return { y0: startY, pts: [], sonT: -1 }; }
  // Her karede çağrılır; sim zamanı bir sonraki örnek anını geçtiyse yer yazılır.
  function ornekle(k, sim) {
    if (!k || k.pts.length >= EN_COK * 2) return;
    while (sim.t >= (k.pts.length / 2) * ADIM) { k.pts.push(Math.round(sim.p.x), Math.round(sim.p.y - k.y0)); if (k.pts.length >= EN_COK * 2) break; }
  }
  function sure(k) { return k ? (k.pts.length / 2 - 1) * ADIM : 0; }

  // Farklarla metne çevir: "x,y;dx,dy;..." yerine tek dizi: ilk ikili mutlak, sonrakiler fark
  function kodla(k) {
    var p = k.pts, out = [];
    for (var i = 0; i < p.length; i += 2) {
      if (i === 0) out.push(p[0], p[1]); else out.push(p[i] - p[i - 2], p[i + 1] - p[i - 1]);
    }
    return out.join(',');
  }
  function coz(s) {
    if (!s) return null;
    var a = s.split(','), pts = [];
    for (var i = 0; i < a.length; i += 2) {
      var x = +a[i], y = +a[i + 1];
      if (i > 0) { x += pts[i - 2]; y += pts[i - 1]; }
      pts.push(x, y);
    }
    return { pts: pts };
  }
  // t anındaki yer (y kuyunun başlangıcına göre); kayıt bittiyse null
  function yer(h, t) {
    if (!h || t < 0) return null;
    var n = h.pts.length / 2, f = t / ADIM, i = Math.floor(f);
    if (i >= n - 1) return null;
    var a = f - i, p = h.pts;
    return { x: p[i * 2] + (p[i * 2 + 2] - p[i * 2]) * a, y: p[i * 2 + 1] + (p[i * 2 + 3] - p[i * 2 + 1]) * a };
  }

  // ---- saklama ----
  var KEY = 'kuyu.hayalet';
  function oku() {
    try { var d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (d && d.v === SURUM) return d; } catch (e) {}
    return { v: SURUM, bolum: {}, sonsuz: null, gunluk: null, haftalik: null };
  }
  function yaz(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  // yer: { tur: 'bolum', n } | { tur: 'sonsuz' } | { tur: 'gunluk', gun } | { tur: 'haftalik', hafta }
  function al(yerTanim) {
    var d = oku(), r = null;
    if (yerTanim.tur === 'bolum') r = d.bolum[yerTanim.n];
    else if (yerTanim.tur === 'sonsuz') r = d.sonsuz;
    else if (yerTanim.tur === 'gunluk') r = d.gunluk && d.gunluk.gun === yerTanim.gun ? d.gunluk : null;
    else if (yerTanim.tur === 'haftalik') r = d.haftalik && d.haftalik.hafta === yerTanim.hafta ? d.haftalik : null;
    return r ? coz(r.d) : null;
  }
  function sakla(yerTanim, k, deger) {
    if (!k || k.pts.length < 4) return;
    var d = oku(), r = { d: kodla(k), deger: deger };
    if (yerTanim.tur === 'bolum') d.bolum[yerTanim.n] = r;
    else if (yerTanim.tur === 'sonsuz') d.sonsuz = r;
    else if (yerTanim.tur === 'gunluk') { r.gun = yerTanim.gun; d.gunluk = r; }
    else if (yerTanim.tur === 'haftalik') { r.hafta = yerTanim.hafta; d.haftalik = r; }
    yaz(d);
  }

  var api = { HZ: HZ, yeni: yeni, ornekle: ornekle, sure: sure, kodla: kodla, coz: coz, yer: yer, al: al, sakla: sakla };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KuyuHayalet = api;
})(typeof window !== 'undefined' ? window : this);
