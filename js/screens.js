/* Kuyu — ekran akışı: Funday Morning açılışı → (ilk açılışta) giriş → tanıtım → ana menü.
   Bölümler ve ayarlar sayfaları da burada. Oyunun kendisi js/game.js (window.KuyuGame). */
(function () {
  'use strict';
  var G = window.KuyuGame;
  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EKRANLAR = ['ekAcilis', 'ekGiris', 'ekTanitim', 'ekAna', 'ekBolumler', 'ekAyarlar', 'ekProfil', 'ekGorevler', 'ekDolap', 'ekIstat'];
  var current = 'ekAcilis';
  var q = new URLSearchParams(location.search);
  var deepLink = q.get('mod') === 'gunluk' ? { mode: 'daily' } : q.get('mod') === 'sonsuz' ? { mode: 'endless' } : q.get('bolum') ? { mode: 'level', n: parseInt(q.get('bolum'), 10) || 1 } : null;
  var save = function () { return G.save(); };

  var SEKMELER = ['ekAna', 'ekBolumler', 'ekGorevler', 'ekDolap', 'ekProfil', 'ekAyarlar', 'ekIstat'];
  function show(id) {
    current = id;
    EKRANLAR.forEach(function (e) { $(e).hidden = e !== id; });
    $('oyunEkrani').hidden = id !== 'oyun';
    // alt gezinme çubuğu yalnızca menü sekmelerinde
    $('altMenu').hidden = SEKMELER.indexOf(id) < 0;
    document.querySelectorAll('#altMenu [data-sekme]').forEach(function (b) {
      if (b.dataset.sekme === id) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (id === 'ekAna' || id === 'ekTanitim') startScene(); else stopScene();
    if (id === 'ekDolap') startPreview(); else stopPreview();
    if (id !== 'oyun' && id !== 'ekAcilis') G.muzikSahne('menu'); // menülerde sakin müzik
    if (SEKMELER.indexOf(id) >= 0) $('gorevNokta').hidden = !G.gorevBekleyen();
  }

  // Hikâye kartı: ekranın üstünde, oyunu durdurmaz; dokununca ya da birkaç saniye sonra kapanır.
  var hikayeT = null;
  function hikaye(baslik, metin, ms) {
    $('hkBaslik').textContent = baslik; $('hkMetin').textContent = metin;
    $('hikayeKart').hidden = false; $('hikayeKart').classList.remove('gizlen');
    clearTimeout(hikayeT);
    hikayeT = setTimeout(hikayeKapat, ms || 5200);
  }
  function hikayeKapat() { $('hikayeKart').classList.add('gizlen'); setTimeout(function () { $('hikayeKart').hidden = true; }, 300); }
  $('hikayeKart').addEventListener('click', function () { clearTimeout(hikayeT); hikayeKapat(); });
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
    if (d.mode === 'daily') G.startDaily(); else if (d.mode === 'endless') G.startEndless(); else G.startLevel(d.n);
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
      var o = reduceMotion ? 0 : ONSOZ * 1000;
      setTimeout(function () { if (introStage === 2) G.sfx.firefly(); }, reduceMotion ? 0 : 1150); // kor dibe iner
      setTimeout(function () { if (introStage === 2) G.sfx.fire(); }, o + 300);
      setTimeout(function () { if (introStage === 2) G.sfx.attach(); }, o + 450);
      setTimeout(function () { if (introStage === 2) G.sfx.won(); }, o + 1350);
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
    var cur = s.last || 1, curDef = G.levelDef(cur), cb = (s.best || {})[cur] || {};
    $('oynaNo').textContent = cur;
    $('oynaAd').textContent = curDef.name;
    // bu bölümün hedefleri: ateşböceği noktaları + kusursuz + akış
    var ffN = (curDef.rings || []).filter(function (r) { return r[2] === 'ff'; }).length;
    var hd = '';
    for (var k = 0; k < ffN; k++) hd += '<i class="' + (k < (cb.ff || 0) ? 'var' : '') + '"></i>';
    hd += '<i class="m' + (cb.perfect ? ' var' : '') + '"></i><i class="m' + (cb.flow ? ' var' : '') + '"></i>';
    $('oynaHedef').innerHTML = hd;
    // üst şerit: toplam ödül ve ateşböceği
    var tot = 0, ates = 0;
    Object.keys(s.best || {}).forEach(function (k2) { tot += s.best[k2].reward || 0; ates += s.best[k2].ff || 0; });
    $('toplamOdul').textContent = tot + (s.odulEk || 0);
    $('toplamAtes').textContent = G.cuzdan().ates; // harcanabilir bakiye
    var rec = s.endless || {};
    $('sonsuzRekor').textContent = rec.score ? 'Rekor ' + rec.score + ' · ' + rec.meters + ' m' : 'Bölüm yok, su yükselir';
    renderAnaGorev();
    var di = G.dailyInfo();
    $('gunlukBilgi').textContent = di.tries ? di.kural.ad + ' · en iyi ' + di.best : 'Bugün: ' + di.kural.ad;
    isikGuncelle();
    var ik = G.isik ? G.isik() : null;
    if (ik && ik.seviye > ik.gorulen) { G.isikGordu(ik.seviye); setTimeout(function () { toast('Kuyu biraz daha aydınlandı · Işık ' + ik.seviye + '/' + ik.en); }, 700); }
    $('gunlukSeri').hidden = !di.streak;
    $('gunlukSeri').textContent = di.streak + ' gün seri' + (di.playedToday ? '' : ' · bugün oyna, seri sürsün');
    show('ekAna');
    // günlük giriş: bugün alınmadıysa ana menüye ilk gelişte bir kez göster
    var gd = G.giris();
    if (gd.hazir && girisSorulan !== G.dailyInfo().key) { girisSorulan = G.dailyInfo().key; openGiris(); }
  }
  var girisSorulan = null;
  // Ana menüdeki görev şeridi: kaç görev bitti, tamamlanmaya en yakın görev, alınmamış ödül, yenilenmeye kalan süre.
  function renderAnaGorev() {
    var list = G.gorevler(), bitti = 0, bekleyen = 0, cubuk = '';
    list.forEach(function (m) {
      if (m.done) bitti++;
      if (m.done && !m.claimed) bekleyen++;
      cubuk += '<i class="' + (m.claimed ? 'alindi' : m.done ? 'bitti' : '') + '"><i style="width:' + Math.round(m.prog / m.target * 100) + '%"></i></i>';
    });
    var alt;
    if (bekleyen) alt = bekleyen === 1 ? 'Ödül hazır · almak için dokun' : bekleyen + ' ödül hazır · almak için dokun';
    else if (bitti === list.length) {
      var left = G.yeniGune(), hh = Math.floor(left / 3600000), mm = Math.floor(left % 3600000 / 60000);
      alt = 'Hepsi tamam ✓ · yenileri ' + (hh ? hh + ' sa ' : '') + mm + ' dk sonra';
    } else {
      // tamamlanmaya en yakın görev
      var en = list.filter(function (m) { return !m.done; }).sort(function (a, b) { return b.prog / b.target - a.prog / a.target; })[0];
      alt = window.KuyuGorev.missionText(en) + ' · ' + en.prog + '/' + en.target;
    }
    $('anaGorevBaslik').textContent = 'Görevler ' + bitti + '/' + list.length;
    $('anaGorevAlt').textContent = alt;
    $('anaGorevCubuk').innerHTML = cubuk;
    $('anaGorevBtn').classList.toggle('hazir', bekleyen > 0);
    $('anaGorevBtn').setAttribute('aria-label', 'Bugünün görevleri: ' + bitti + ' / ' + list.length + ' tamam. ' + alt);
  }
  $('anaGorevBtn').addEventListener('click', function () { openTasks(); });
  $('oynaBtn').addEventListener('click', function () { G.startLevel(save().last || 1); });
  $('sonsuzBtn').addEventListener('click', function () { G.startEndless(); });
  $('gunlukBtn').addEventListener('click', function () { G.startDaily(); });
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
    var ik = G.isik();
    $('isikSeviye').textContent = 'Işık ' + ik.seviye + '/' + ik.en;
    $('isikYazi').textContent = ik.toplam + ' ateşböceği' + (ik.ust ? ' · sonraki ışığa ' + (ik.ust - ik.toplam) : ' · kuyu tümüyle aydınlık');
    $('isikDolu').style.width = (ik.ust ? Math.round((ik.toplam - ik.alt) / (ik.ust - ik.alt) * 100) : 100) + '%';
    $('hikayeListe').innerHTML = G.hikaye().map(function (hb) {
      return '<div class="hk-sayfa' + (hb.acik ? '' : ' kilitli') + '" style="--isik:' + hb.isik + '"><b>' + hb.ad + '</b>' +
        '<span>' + (hb.acik ? hb.metin : hb.ilkBolum + '. bölümde açılır') + '</span>' +
        (hb.acik && hb.notlar && hb.notlar.length ? '<ul class="hk-notlar">' + hb.notlar.map(function (n) {
          return n.metin ? '<li class="bulundu"><i aria-hidden="true"></i><span><em>Bekçinin notu · ' + n.bolum + '. bölüm</em>' + n.metin + '</span></li>'
            : '<li><i aria-hidden="true"></i><span><em>Bulunmadı · ' + n.bolum + '. bölüm</em>Ateşböceği yolunda bir not asılı.</span></li>';
        }).join('') + '</ul>' : '') +
        (hb.son ? '<p class="hk-son"><em>' + hb.son.baslik + '</em>' + hb.son.metin + '</p>' : '') + '</div>';
    }).join('');
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
    var di = G.dailyInfo();
    $('pGunluk').textContent = di.best;
    $('pSeri').textContent = di.streak + ' gün';
    $('pMaxSeri').textContent = di.maxStreak + ' gün';
    $('pDeneme').textContent = di.tries;
    show('ekProfil');
  }
  document.querySelectorAll('[data-geri]').forEach(function (b) { b.addEventListener('click', home); });
  document.querySelectorAll('#altMenu [data-sekme]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.dataset.sekme;
      if (t === current) return;
      if (t === 'ekAna') home(); else if (t === 'ekBolumler') openLevels(); else if (t === 'ekGorevler') openTasks(); else if (t === 'ekDolap') openDolap(); else if (t === 'ekProfil') openProfile(); else openSettings();
    });
  });

  // ---------- görevler ve başarımlar ----------
  var KADEME_AD = ['', 'Bronz', 'Gümüş', 'Altın'], ZORLUK = ['Kolay', 'Orta', 'Zor'], ODUL = [5, 10, 15]; // ateşböceği
  var ROZET = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="6.2" fill="currentColor" opacity=".22"/><circle cx="12" cy="9" r="6.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.6 14l-1.6 7.5L12 19l5 2.5-1.6-7.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  function openTasks() { renderTasks(); show('ekGorevler'); $('ekGorevler').scrollTop = 0; }
  function renderGirisSatir() {
    var gd = G.giris();
    $('girisSatir').innerHTML = '<i class="ikon-ates" aria-hidden="true"></i><span><b>Günlük giriş · ' + (gd.gun + 1) + '. gün</b><small>' +
      (gd.hazir ? 'Bugünün ödülü ' + gd.odul + ' ateşböceği' : 'Bugün alındı · yarın ' + gd.odul + ' ateşböceği') + '</small></span>' +
      (gd.hazir ? '<button type="button" class="ana g-al" id="girisSatirBtn">Aç</button>' : '<span class="g-alindi">✓</span>');
    var b = $('girisSatirBtn'); if (b) b.onclick = openGiris;
  }
  function renderTasks() {
    renderGirisSatir();
    var left = G.yeniGune(), hh = Math.floor(left / 3600000), mm = Math.floor(left % 3600000 / 60000);
    $('gorevSure').textContent = 'yenisi ' + (hh ? hh + ' sa ' : '') + mm + ' dk sonra';
    $('gorevListe').innerHTML = G.gorevler().map(function (m, i) {
      var pct = Math.round(m.prog / m.target * 100), text = window.KuyuGorev.missionText(m);
      var sag = m.claimed ? '<span class="g-alindi">✓ Alındı</span>'
        : m.done ? '<span class="g-al-ikili"><button type="button" class="ana g-al" data-al="' + i + '">Al +' + ODUL[m.tier] + '</button>' +
          '<button type="button" class="g-al video-btn" data-al2="' + i + '" aria-label="Video izle, ' + ODUL[m.tier] * 2 + ' ateşböceği al">▶ +' + ODUL[m.tier] * 2 + '</button></span>'
        : '<span class="g-odul"><i class="ikon-ates" aria-hidden="true"></i>' + ODUL[m.tier] + '</span>';
      return '<div class="gorev' + (m.done ? ' tamam' : '') + (m.claimed ? ' alindi' : '') + '">' +
        '<div class="g-ic"><small class="g-zor z' + m.tier + '">' + ZORLUK[m.tier] + '</small><b>' + text + '</b>' +
        '<div class="cubuk ince" aria-hidden="true"><i style="width:' + pct + '%"></i></div>' +
        '<span class="g-ilerleme">' + m.prog + ' / ' + m.target + '</span></div>' + sag + '</div>';
    }).join('');
    var list = G.basarimlar(), got = 0;
    list.forEach(function (a) { got += a.tier; });
    $('basarimSay').textContent = got + '/' + list.length * 3 + ' kademe';
    $('basarimListe').innerHTML = list.map(function (a) {
      var pct = a.next == null ? 100 : Math.round(Math.max(0, a.val - a.prev) / (a.next - a.prev) * 100);
      var pips = '';
      for (var k = 1; k <= 3; k++) pips += '<i class="' + (k <= a.tier ? 'var' : '') + '"></i>';
      return '<div class="basarim t' + a.tier + '" aria-label="' + a.ad + ', ' + (a.kademe || 'kazanılmadı') + ', ' + a.valText + '">' +
        '<span class="b-rozet">' + ROZET + '</span>' +
        '<div class="b-ic"><div class="b-ust"><b>' + a.ad + '</b><span class="b-pip" aria-hidden="true">' + pips + '</span></div>' +
        '<small>' + a.acik + ': ' + a.valText + (a.nextText ? ' · sıradaki ' + KADEME_AD[a.tier + 1] + ' ' + a.nextText : ' · tamamlandı') + '</small>' +
        '<div class="cubuk ince" aria-hidden="true"><i style="width:' + pct + '%"></i></div></div></div>';
    }).join('');
    $('gorevNokta').hidden = !G.gorevBekleyen();
  }
  $('gorevListe').addEventListener('click', function (e) {
    var b2 = e.target.closest('[data-al2]');
    if (b2) { video(function () { var r2 = G.gorevAl(+b2.dataset.al2, 2); if (r2) { if (G.sfx) G.sfx.firefly(); toast('+' + r2 + ' ateşböceği'); } renderTasks(); }); return; }
    var b = e.target.closest('[data-al]'); if (!b) return;
    var r = G.gorevAl(+b.dataset.al);
    if (r) { if (G.sfx) G.sfx.firefly(); toast('+' + r + ' ateşböceği'); }
    renderTasks();
  });

  // ---------- ödüllü video (yer tutucu) ----------
  // Web sürümünde reklam yok. Unity'de burada ödüllü reklam oynar; yalnızca oyuncu seçerse (Pofi kuralı).
  function video(done) {
    var k = $('videoKatman'), n = 3;
    k.hidden = false; $('videoSayac').textContent = n;
    var iv = setInterval(function () {
      n--; $('videoSayac').textContent = Math.max(0, n);
      if (n <= 0) { clearInterval(iv); k.hidden = true; done(); }
    }, 1000);
  }

  // ---------- günlük giriş ----------
  function openGiris() {
    var gd = G.giris(), h = '';
    for (var i = 0; i < gd.takvim.length; i++) {
      var durum = i < gd.gun ? 'alindi' : i === gd.gun ? (gd.hazir ? 'bugun' : 'alindi') : '';
      if (!gd.hazir && i === gd.gun) durum = 'yarin';
      h += '<div class="gun ' + durum + (i === 6 ? ' buyuk-gun' : '') + '"><small>' + (i + 1) + '. gün</small><i class="ikon-ates" aria-hidden="true"></i><b>' + gd.takvim[i] + '</b>' +
        (durum === 'alindi' ? '<em>✓</em>' : durum === 'yarin' ? '<em>yarın</em>' : '') + '</div>';
    }
    $('girisTakvim').innerHTML = h;
    $('girisAlBtn').hidden = $('girisVideoBtn').hidden = !gd.hazir;
    $('girisAlBtn').textContent = 'Al +' + gd.odul;
    $('girisVideoBtn').textContent = '▶ Video izle, +' + gd.odul * 2 + ' al';
    $('girisKapat').textContent = gd.hazir ? 'Sonra' : 'Kapat';
    $('girisKatman').hidden = false;
  }
  function closeGiris() { $('girisKatman').hidden = true; if (current === 'ekAna') home2(); else if (current === 'ekGorevler') renderTasks(); }
  function home2() { $('toplamAtes').textContent = G.cuzdan().ates; }
  function girisAl(kat) {
    var r = G.girisAl(kat);
    if (r) { if (G.sfx) G.sfx.firefly(); toast('+' + r + ' ateşböceği'); }
    closeGiris();
  }
  $('girisAlBtn').addEventListener('click', function () { girisAl(1); });
  $('girisVideoBtn').addEventListener('click', function () { $('girisKatman').hidden = true; video(function () { girisAl(2); }); });
  $('girisKapat').addEventListener('click', closeGiris);

  // ---------- dolap ----------
  // Sahip olunmayan ürüne ilk dokunuş ÖNİZLEMEdir: kahraman o renge bürünür, altta "Al · fiyat" çubuğu açılır.
  // Satın alma yalnızca o çubuktaki "Al" ile olur. Sahip olunan ürüne dokunmak doğrudan kuşanır.
  var dolapTur = 'govde', previewRaf = 0, onizleme = null, onizlemeGorunum = null;
  function openDolap() { onizleme = null; renderDolap(); show('ekDolap'); $('ekDolap').scrollTop = 0; }
  function swatch(it) {
    if (it.tur === 'kanca') {
      var cv = document.createElement('canvas'), d = 2; cv.width = cv.height = 34 * d;
      var c = cv.getContext('2d'); c.scale(d, d); c.fillStyle = '#24302d'; c.beginPath(); c.arc(17, 17, 17, 0, 6.29); c.fill();
      c.translate(17, 17); c.scale(2, 2); G.kancaCiz(c, it.renk, '#e6eeec', -Math.PI / 2);
      return '<span class="renk kanca-renk" style="background:url(' + cv.toDataURL() + ') center/cover" aria-hidden="true"></span>';
    }
    if (it.tur === 'govde') return '<span class="renk" style="background:radial-gradient(circle at 35% 30%, ' + it.renk + ' 55%, ' + it.renk2 + ')" aria-hidden="true"></span>';
    var c = it.renk === 'gokkusagi' ? 'conic-gradient(#ff5d5d, #ffd35d, #7ce36a, #5dd6ff, #9b6bff, #ff5d5d)' : it.renk === 'atki' ? 'linear-gradient(135deg, #2fb3a6 50%, #e2445c 50%)' : it.renk;
    return '<span class="renk" style="background:' + c + '" aria-hidden="true"></span>';
  }
  function renderDolap() {
    var sv = save(), bak = G.cuzdan().ates, kus = sv.dolap.kusan, sahip = sv.dolap.sahip;
    $('dolapBakiye').textContent = bak;
    document.querySelectorAll('[data-dolap]').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.dolap === dolapTur ? 'true' : 'false'); });
    $('dolapListe').innerHTML = window.KuyuEkonomi.KATALOG.filter(function (it) { return it.tur === dolapTur; }).map(function (it) {
      var has = sahip.indexOf(it.id) >= 0, on = kus[it.tur] === it.id, bak2 = onizleme === it.id, durum;
      if (bak2) durum = '<span class="d-durum onizleme">Önizleme</span>';
      else if (on) durum = '<span class="d-durum kusanili">Kuşanıldı</span>';
      else if (has) durum = '<span class="d-durum">Kuşan</span>';
      else durum = '<span class="d-durum fiyat' + (bak < it.fiyat ? ' yetmez' : '') + '"><i class="ikon-ates" aria-hidden="true"></i>' + it.fiyat + '</span>';
      return '<button type="button" class="d-urun' + (bak2 ? ' onizlenen' : on && !onizlemeTur(it.tur) ? ' secili' : '') + '" data-urun="' + it.id + '" aria-label="' + it.ad + (bak2 ? ', önizleniyor' : on ? ', kuşanıldı' : has ? ', kuşan' : ', ' + it.fiyat + ' ateşböceği, önizlemek için dokun') + '">' +
        swatch(it) + '<b>' + it.ad + '</b>' + durum + '</button>';
    }).join('');
    renderSatinCubuk(bak);
  }
  function onizlemeTur(tur) { var it = onizleme && window.KuyuEkonomi.item(onizleme); return it && it.tur === tur; }
  function renderSatinCubuk(bak) {
    var it = onizleme && window.KuyuEkonomi.item(onizleme);
    $('satinCubuk').hidden = !it;
    if (!it) return;
    $('scUrun').innerHTML = swatch(it) + '<span><b>' + it.ad + '</b><small>' + window.KuyuEkonomi.TURLER[it.tur] + '</small></span>';
    var yeter = bak >= it.fiyat;
    $('scAl').disabled = !yeter;
    $('scAl').innerHTML = yeter ? 'Al · <i class="ikon-ates" aria-hidden="true"></i>' + it.fiyat : (it.fiyat - bak) + ' eksik';
    $('scAl').setAttribute('aria-label', yeter ? it.ad + ' satın al, ' + it.fiyat + ' ateşböceği' : it.fiyat - bak + ' ateşböceği eksik');
  }
  $('scVazgec').addEventListener('click', function () { onizleme = null; renderDolap(); });
  $('scAl').addEventListener('click', function () {
    var it = onizleme && window.KuyuEkonomi.item(onizleme); if (!it) return;
    var r = G.satinAl(it.id);
    if (r.ok) { onizleme = null; if (G.sfx) G.sfx.won(); toast(it.ad + ' alındı ve kuşanıldı'); }
    else if (r.neden === 'yetersiz') toast(r.eksik + ' ateşböceği eksik. Bölüm, Sonsuz Kuyu, görev ve günlük girişten toplanır.');
    renderDolap();
  });
  document.querySelectorAll('[data-dolap]').forEach(function (b) { b.addEventListener('click', function () { dolapTur = b.dataset.dolap; renderDolap(); }); });
  $('dolapListe').addEventListener('click', function (e) {
    var b = e.target.closest('[data-urun]'); if (!b) return;
    var id = b.dataset.urun;
    if (save().dolap.sahip.indexOf(id) >= 0) { onizleme = null; G.kusan(id); renderDolap(); return; }
    onizleme = id; // ilk dokunuş: yalnızca önizleme
    renderDolap();
  });
  // önizleme: halkada sallanan kahraman, kuşanılan atkı, ip ve iz
  function startPreview() {
    var cv = $('dolapOnizleme'), dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = cv.clientWidth || 300, h = 150;
    cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + 'px';
    var c = cv.getContext('2d');
    cancelAnimationFrame(previewRaf);
    (function tick(now) {
      var t = now / 1000, L = Object.assign({}, G.gorunum()), oz = onizleme && window.KuyuEkonomi.item(onizleme);
      if (oz) { L[oz.tur] = oz.renk; if (oz.renk2) L[oz.tur + '2'] = oz.renk2; }
      onizlemeGorunum = L;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.fillStyle = '#121b1a'; c.fillRect(0, 0, w, h);
      var cx = w / 2, ringY = 26, rope = 78, r = 16;
      var ang = Math.sin(t * 1.7) * 0.5, hx = cx + Math.sin(ang) * rope, hy = ringY + Math.cos(ang) * rope;
      // iz: sallanmanın gerisinde kalan kısa çizgi
      var izc = L.iz === 'atki' ? G.renk(L.atki, now) : G.renk(L.iz, now);
      c.strokeStyle = izc; c.lineCap = 'round';
      for (var i = 1; i < 7; i++) {
        var a2 = Math.sin((t - i * 0.05) * 1.7) * 0.5, a1 = Math.sin((t - (i - 1) * 0.05) * 1.7) * 0.5;
        c.lineWidth = 9 - i * 1.1; c.globalAlpha = 1 - i * 0.12;
        c.beginPath(); c.moveTo(cx + Math.sin(a1) * rope, ringY + Math.cos(a1) * rope + 5); c.lineTo(cx + Math.sin(a2) * rope, ringY + Math.cos(a2) * rope + 5); c.stroke();
      }
      c.globalAlpha = 1;
      c.lineWidth = 3; c.strokeStyle = '#d08a45'; c.beginPath(); c.arc(cx, ringY, 9, 0, 6.29); c.stroke();
      c.strokeStyle = G.renk(L.ip, now); c.lineWidth = 2.5; c.beginPath(); c.moveTo(cx, ringY); c.lineTo(hx, hy - r * 0.2); c.stroke();
      c.save(); c.translate(cx, ringY - 13); c.scale(1.7, 1.7); G.kancaCiz(c, L.kanca, null, -Math.PI / 2); c.restore();
      hero(c, hx, hy, r, { x: Math.sin(t * 0.8) * 0.6, y: -0.5 }, G.renk(L.atki, now));
      previewRaf = requestAnimationFrame(tick);
    })(performance.now());
  }
  function stopPreview() { cancelAnimationFrame(previewRaf); }

  // ---------- bölümler ----------
  // Gruplar: 1–6 Öğrenme (el yapımı), sonra 10'arlı. Sıradaki bölüm = geçilmemiş ilk bölüm.
  var listUpto = 0, filtre = 'tumu';
  function groupOf(n) { if (n <= 6) return { a: 1, b: 6, ad: 'Öğrenme' }; var a = 7 + Math.floor((n - 7) / 10) * 10; return { a: a, b: a + 9, ad: G.bolgeAdi(a) }; }
  function goalsOf(n) {
    var d = G.levelDef(n), ff = (d.rings || []).filter(function (r) { return r[2] === 'ff'; }).length;
    var b = (save().best || {})[n] || {};
    var got = Math.min(ff, b.ff || 0) + (b.perfect ? 1 : 0) + (b.flow ? 1 : 0);
    return { d: d, b: b, ff: ff, total: ff + 2, got: got };
  }
  function nextLevel() { var best = save().best || {}, n = 1; while (best[n] && best[n].done) n++; return n; }
  function openLevels() {
    var s = save(), nx = nextLevel();
    listUpto = Math.max(16, groupOf(Math.max(nx, s.maxLevel || 1)).b);
    renderLevels();
    show('ekBolumler');
    // sıradaki bölüme kaydır
    var el = $('liste').querySelector('[data-siradaki]');
    var ek = $('ekBolumler');
    if (el) ek.scrollTop = Math.max(0, el.offsetTop - ek.clientHeight / 2 + el.offsetHeight / 2); else ek.scrollTop = 0;
  }
  function renderLevels() {
    var s = save(), best = s.best || {}, nx = nextLevel(), h = '', shown = 0;
    var doneAll = 0, gotAll = 0, totAll = 0;
    Object.keys(best).forEach(function (k) {
      if (!best[k].done) return;
      var g = goalsOf(+k); doneAll++; gotAll += g.got; totAll += g.total;
    });
    $('ozetGecilen').textContent = doneAll;
    $('ozetHedef').textContent = gotAll + '/' + totAll;
    $('ozetCubuk').style.width = (totAll ? Math.round(gotAll / totAll * 100) : 0) + '%';
    for (var ga = 1; ga <= listUpto;) {
      var gr = groupOf(ga), cards = '', gDone = 0, gGot = 0, gTot = 0;
      for (var n = gr.a; n <= gr.b; n++) {
        var g = goalsOf(n), b = g.b, done = !!b.done, full = done && g.got >= g.total, isNext = n === nx;
        gTot += g.total; gGot += g.got; if (done) gDone++;
        if (filtre === 'eksik' && !(done && !full) && !isNext) continue;
        var dots = '';
        for (var k = 0; k < g.ff; k++) dots += '<i class="' + (k < (b.ff || 0) ? 'var' : '') + '"></i>';
        dots += '<i class="m' + (b.perfect ? ' var' : '') + '"></i><i class="m' + (b.flow ? ' var' : '') + '"></i>';
        cards += '<button type="button" class="bkart' + (done ? ' gecildi' : '') + (full ? ' tam' : '') + (isNext ? ' siradaki' : '') + '" data-n="' + n + '"' +
          (isNext ? ' data-siradaki aria-current="true"' : '') + ' aria-label="Bölüm ' + n + ', ' + g.d.name + (done ? ', geçildi' : '') + ', ' + g.got + '/' + g.total + ' hedef">' +
          '<span class="bk-ust"><span class="no">' + n + '</span>' + (isNext ? '<span class="etiket">Sıradaki</span>' : full ? '<span class="yildiz" aria-hidden="true">★</span>' : done ? '<span class="tik" aria-hidden="true">✓</span>' : '') + '</span>' +
          '<b>' + g.d.name + '</b><span class="rozet">' + dots + '</span></button>';
        shown++;
      }
      if (cards) {
        var pct = gTot ? Math.round(gGot / gTot * 100) : 0;
        h += '<div class="bgrup"><div class="bgrup-ust"><b>' + (gr.ad ? gr.ad + ' · ' : '') + gr.a + '–' + gr.b + '</b><span>' + gDone + '/' + (gr.b - gr.a + 1) + ' geçildi</span></div>' +
          '<div class="cubuk ince" aria-hidden="true"><i style="width:' + pct + '%"></i></div><div class="liste">' + cards + '</div></div>';
      }
      ga = gr.b + 1;
    }
    if (!shown) h = '<p class="bos">Eksik hedefi olan geçilmiş bölüm yok. Tümü sekmesinden yeni bölümlere geçebilirsin.</p>';
    $('liste').innerHTML = h;
    $('dahaBtn').hidden = filtre === 'eksik';
  }
  $('liste').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-n]'); if (!b) return;
    G.startLevel(+b.dataset.n);
  });
  document.querySelectorAll('[data-filtre]').forEach(function (b) {
    b.addEventListener('click', function () {
      filtre = b.dataset.filtre;
      document.querySelectorAll('[data-filtre]').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      renderLevels();
    });
  });
  $('dahaBtn').addEventListener('click', function () { listUpto = groupOf(listUpto + 1).b; renderLevels(); });
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
    $('muzikAnahtar').setAttribute('aria-checked', G.muzikAcik() ? 'true' : 'false');
    $('yaziAnahtar').setAttribute('aria-checked', s.buyukYazi ? 'true' : 'false');
    $('hayaletAnahtar').setAttribute('aria-checked', G.hayaletAcik() ? 'true' : 'false');
    $('adDegis').value = (s.profile && s.profile.name) || '';
    show('ekAyarlar');
  }
  $('muzikAnahtar').addEventListener('click', function () {
    var on = G.toggleMuzik();
    $('muzikAnahtar').setAttribute('aria-checked', on ? 'true' : 'false');
  });
  $('sesAnahtar').addEventListener('click', function () {
    var muted = G.toggleMute();
    $('sesAnahtar').setAttribute('aria-checked', muted ? 'false' : 'true');
  });
  // Büyük yazı (erişilebilirlik): <html class="buyuk-yazi">; menülerdeki küçük yazılar büyür, oyun alanı değişmez.
  function yaziUygula() { document.documentElement.classList.toggle('buyuk-yazi', !!save().buyukYazi); }
  yaziUygula();
  $('yaziAnahtar').addEventListener('click', function () {
    var on = G.toggleBuyukYazi();
    $('yaziAnahtar').setAttribute('aria-checked', on ? 'true' : 'false');
    yaziUygula();
  });
  $('hayaletAnahtar').addEventListener('click', function () {
    var on = G.toggleHayalet();
    $('hayaletAnahtar').setAttribute('aria-checked', on ? 'true' : 'false');
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

  // ---------- oyun istatistikleri (js/istatistik.js) ----------
  function kutu(etiket, deger) { return '<div><small>' + etiket + '</small><b>' + deger + '</b></div>'; }
  function openIstat() {
    var o = G.istatOzet(), b = o.bolumler, h = o.halka;
    $('istatBas').textContent = o.baslangic + ' tarihinden beri bu cihazda oynadıkların. Hiçbir yere gönderilmez.';
    $('istatGenel').innerHTML = kutu('Oynama süresi', String(o.toplamSureDk).replace('.', ',') + ' dk') + kutu('Bölüm denemesi', b.deneme) +
      kutu('Geçiş', b.gecis) + kutu('Ölüm', b.olum) + kutu('Atlanan', b.atla) + kutu('Yarıda bırakılan', b.terk);
    $('istatZor').innerHTML = o.zorlanilan.length ? o.zorlanilan.map(function (z) {
      var parca = [z.deneme + ' deneme', z.gecis + ' geçiş'];
      if (z.olum) parca.push(z.olum + ' ölüm (çoğu %' + z.olumYerOrtanca + ' yükseklikte)');
      if (z.atla) parca.push(z.atla + ' atlama');
      if (z.terk) parca.push(z.terk + ' yarıda');
      return '<div class="istat-satir"><b>' + z.n + '. bölüm</b><span>' + parca.join(' · ') + '</span></div>';
    }).join('') : '<p class="bos">Henüz zorlanılan bölüm yok.</p>';
    function kosuSatir(ad, k) {
      if (!k.kosu) return '<div class="istat-satir"><b>' + ad + '</b><span>Henüz koşu yok</span></div>';
      return '<div class="istat-satir"><b>' + ad + '</b><span>' + k.kosu + ' koşu · ortanca ' + k.ortancaMetre + ' m · en iyi ' + k.enIyiMetre + ' m · en uzun akış x' + k.enUzunAkis + '</span>' +
        '<small>Son koşular: ' + k.sonMetreler.join(', ') + ' m</small></div>';
    }
    $('istatKosu').innerHTML = kosuSatir('Sonsuz Kuyu', o.sonsuz) + kosuSatir('Günlük Kuyu', o.gunluk);
    $('istatHalka').innerHTML = kutu('Hız halkası', h.hiz) + kutu('Rüzgâr şeridi', h.serit) + kutu('Yay', h.yay) + kutu('Geçit', h.gecit) +
      kutu('Sarkaç', h.sarkac) + kutu('Boş atış', h.bos) + kutu('Kurtarma', h.kurtarma) + kutu('El kayması', h.kayma) + kutu('Atış', h.atis);
    $('istatSifirla').textContent = 'İstatistiği sıfırla'; sifirSor = false;
    var eskiMetin = document.querySelector('.istat-metin'); if (eskiMetin) eskiMetin.remove();
    show('ekIstat'); $('ekIstat').scrollTop = 0;
  }
  var sifirSor = false;
  $('istatBtn').addEventListener('click', openIstat);
  $('istatKopyala').addEventListener('click', function () {
    var metin = JSON.stringify({ oyun: 'Kuyu', surum: (document.querySelector('.surum') || {}).textContent, istatistik: G.istatOzet() }, null, 1);
    function yedek() { // pano izni yoksa metni seçili bir kutuda göster
      var eski = document.querySelector('.istat-metin'); if (eski) eski.remove();
      var ta = document.createElement('textarea'); ta.value = metin; ta.className = 'istat-metin'; ta.readOnly = true;
      $('istatKopyala').after(ta); ta.focus(); ta.select(); toast('Metin seçildi; uzun basıp kopyala.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(metin).then(function () { toast('İstatistik panoya kopyalandı'); }, yedek);
    else yedek();
  });
  $('istatSifirla').addEventListener('click', function () {
    if (!sifirSor) { sifirSor = true; $('istatSifirla').textContent = 'Emin misin? Silmek için tekrar dokun'; return; }
    G.istatSifirla(); toast('İstatistik sıfırlandı'); openIstat();
  });
  $('ipucuSifirBtn').addEventListener('click', function () { G.resetIntros(); toast('Tanıtım kartları yeni şeyleri ilk gördüğünde yeniden çıkacak.'); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && (current === 'ekBolumler' || current === 'ekAyarlar' || current === 'ekProfil')) home();
    if ((e.key === 'Enter' || e.key === ' ') && current === 'ekTanitim') $('ekTanitim').click();
  });

  // ---------- sahne: kuyunun içi (ana menü ve tanıtım) ----------
  // Tanıtımda kahraman dipten kanca atar, halkaya çekilir ve gün ışığına fırlar; sonra halkada sallanır.
  var sceneRaf = 0, sceneT0 = 0, sceneCanvas = null, brick = null, brickKey = '';
  var flies = [];
  for (var i = 0; i < 44; i++) flies.push({ x: 0.04 + Math.random() * 0.92, y: 0.2 + Math.random() * 0.7, p: Math.random() * 6.28, s: 0.4 + Math.random() * 0.6 });
  // Kuyunun ışığı (ana menü): seviye arttıkça daha çok ateşböceği, sıcak bir parıltı ve duvarda yanan fenerler.
  // Tanıtım sahnesi her zaman aynı kalır (önsöz).
  var isikSv = 0;
  function isikGuncelle() { isikSv = G.isik ? G.isik().seviye : 0; }
  var DUVAR_FENER = [[0.07, 0.78], [0.93, 0.66], [0.07, 0.54], [0.93, 0.42], [0.07, 0.3], [0.93, 0.18], [0.07, 0.1], [0.93, 0.88]];

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
    var L0 = (current === 'ekDolap' && onizlemeGorunum) || G.gorunum();
    ctx.fillStyle = L0.govde2 || '#b8401b'; ctx.beginPath(); ctx.arc(x, y + 1.2, r, 0, 6.29); ctx.fill();
    ctx.fillStyle = L0.govde || '#f26a3a'; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.29); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.arc(x - r * 0.32, y - r * 0.36, r * 0.32, 0, 6.29); ctx.fill();
    ctx.fillStyle = scarf || G.renk(G.gorunum().atki); ctx.fillRect(x - r * 0.75, y + r * 0.2, r * 1.5, r * 0.36);
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

    // kuyunun ışığı: sıcak parıltı ve duvar fenerleri (yalnızca ana menüde)
    var ana = current === 'ekAna', sv = ana ? isikSv : 0;
    if (sv > 0) {
      var pg = ctx.createRadialGradient(cx, h * 0.62, 0, cx, h * 0.62, h * 0.7);
      pg.addColorStop(0, 'rgba(232,230,140,' + (0.025 * sv) + ')'); pg.addColorStop(1, 'rgba(232,230,140,0)');
      ctx.fillStyle = pg; ctx.fillRect(0, 0, w, h);
      for (var fi = 0; fi < Math.min(DUVAR_FENER.length, sv - 2); fi++) duvarFener(ctx, DUVAR_FENER[fi][0] * w, DUVAR_FENER[fi][1] * h, u, t + fi);
    }
    // ateşböcekleri: menüde ışık seviyesiyle çoğalır (8 + 3 × seviye), tanıtımda 14
    var flyN = ana ? 8 + 3 * sv : 14;
    flies.slice(0, flyN).forEach(function (fl) {
      var x = (fl.x + Math.sin(t * 0.3 * fl.s + fl.p) * 0.05) * w, y = (fl.y + Math.cos(t * 0.4 * fl.s + fl.p) * 0.03) * h;
      var a = 0.45 + 0.4 * Math.sin(t * 2 * fl.s + fl.p);
      var g = ctx.createRadialGradient(x, y, 0, x, y, 12 * u);
      g.addColorStop(0, 'rgba(232,242,124,' + (a * 0.9) + ')'); g.addColorStop(1, 'rgba(232,242,124,0)');
      ctx.fillStyle = g; ctx.fillRect(x - 12 * u, y - 12 * u, 24 * u, 24 * u);
    });

    // halkalar
    var ringY = current === 'ekAna' ? h * 0.47 : h * 0.52;
    if (current === 'ekAna') {
      // kahraman logo ile alttaki kartlar (görev şeridi) arasındaki boşlukta sallansın, arkalarına girmesin
      var cvTop = sceneCanvas.getBoundingClientRect().top;
      var lb = document.querySelector('#ekAna .ana-logo').getBoundingClientRect().bottom - cvTop;
      var at = document.querySelector('#ekAna .ana-alt').getBoundingClientRect().top - cvTop;
      ringY = Math.max(lb + 16 * u, Math.min(ringY, at - 46 * u - 13 * u - 12));
    }
    ring(ctx, cx, ringY, 11 * u);
    ring(ctx, cx - 110 * u, ringY + 150 * u, 9 * u);
    ring(ctx, cx + 105 * u, ringY - 140 * u, 9 * u);

    var r = 13 * u, rope = 46 * u;
    if (current === 'ekTanitim') {
      // Önsöz (docs/hikaye.md): kuyunun ağzında fener → bir kıvılcım kopup düşer → dipte Çıra gözünü açar.
      var k0 = reduceMotion ? 99 : (now - sceneT0) / 1000, k = k0 - ONSOZ;
      var startY = h * 0.9, ringX = cx, fx = cx, fyF = h * 0.07;
      fener(ctx, fx, fyF, u, t, k0 < ONSOZ ? 1 : 0.6);
      if (k0 < ONSOZ) {
        if (k0 > 0.35 && k0 < 1.15) { // kıvılcım düşüyor
          var dk = (k0 - 0.35) / 0.8, sy = fyF + 14 * u + (startY - fyF - 14 * u) * dk * dk;
          var sg = ctx.createRadialGradient(fx, sy, 0, fx, sy, 14 * u);
          sg.addColorStop(0, 'rgba(255,200,120,0.9)'); sg.addColorStop(1, 'rgba(255,160,80,0)');
          ctx.fillStyle = sg; ctx.fillRect(fx - 14 * u, sy - 14 * u, 28 * u, 28 * u);
          ctx.strokeStyle = 'rgba(255,170,90,0.5)'; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.moveTo(fx, sy - 30 * u * dk); ctx.lineTo(fx, sy); ctx.stroke();
          ctx.fillStyle = '#ffd08a'; ctx.beginPath(); ctx.arc(fx, sy, 3 * u, 0, 6.29); ctx.fill();
        } else if (k0 >= 1.15) { // iner, parlar, Çıra uyanır
          var wk = Math.min(1, (k0 - 1.15) / 0.4), gl = ctx.createRadialGradient(cx, startY, 0, cx, startY, 40 * u * (1.2 - wk * 0.4));
          gl.addColorStop(0, 'rgba(255,190,110,' + (0.5 * (1 - wk * 0.5)) + ')'); gl.addColorStop(1, 'rgba(255,190,110,0)');
          ctx.fillStyle = gl; ctx.fillRect(cx - 50 * u, startY - 50 * u, 100 * u, 100 * u);
          hero(ctx, cx, startY, r * (0.4 + 0.6 * wk), { x: 0, y: wk < 0.7 ? 1 : -1 });
        }
      } else if (k < 0.3) { hero(ctx, cx, startY, r, { x: 0, y: -1 }); }
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
  // Duvar feneri (kuyunun ışığı): duvara çakılı küçük fener
  function duvarFener(ctx, x, y, u, t) {
    var fl = 0.85 + 0.15 * Math.sin(t * 7);
    var g = ctx.createRadialGradient(x, y, 1, x, y, 34 * u);
    g.addColorStop(0, 'rgba(255,200,120,' + (0.38 * fl) + ')'); g.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 34 * u, y - 34 * u, 68 * u, 68 * u);
    ctx.fillStyle = '#2b2118'; ctx.fillRect(x - 5 * u, y - 7 * u, 10 * u, 13 * u); ctx.fillRect(x - 7 * u, y - 9 * u, 14 * u, 2.5 * u);
    ctx.fillStyle = 'rgba(255,214,150,' + (0.7 + 0.3 * fl) + ')'; ctx.fillRect(x - 3 * u, y - 4 * u, 6 * u, 8 * u);
  }
  // Kuyunun ağzındaki fener (önsöz)
  var ONSOZ = 1.7;
  function fener(ctx, x, y, u, t, parlak) {
    var fl = (0.85 + 0.15 * Math.sin(t * 9)) * parlak;
    var g = ctx.createRadialGradient(x, y, 2, x, y, 70 * u);
    g.addColorStop(0, 'rgba(255,200,120,' + (0.5 * fl) + ')'); g.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 70 * u, y - 70 * u, 140 * u, 140 * u);
    ctx.strokeStyle = 'rgba(160,140,120,0.8)'; ctx.lineWidth = 1.5 * u; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, y - 10 * u); ctx.stroke();
    ctx.fillStyle = '#2b2118'; ctx.fillRect(x - 8 * u, y - 10 * u, 16 * u, 20 * u);
    ctx.fillStyle = 'rgba(255,214,150,' + Math.min(1, 0.6 + 0.4 * fl) + ')'; ctx.fillRect(x - 5 * u, y - 6 * u, 10 * u, 12 * u);
    ctx.fillStyle = '#2b2118'; ctx.fillRect(x - 10 * u, y - 12 * u, 20 * u, 3 * u); ctx.fillRect(x - 10 * u, y + 9 * u, 20 * u, 3 * u);
  }
  function trailUp(ctx, x, y, r, a) {
    ctx.strokeStyle = 'rgba(232,242,124,' + (0.55 * a) + ')'; ctx.lineCap = 'round';
    for (var i = 1; i < 6; i++) { ctx.lineWidth = r * (0.6 - i * 0.08); ctx.beginPath(); ctx.moveTo(x, y + r * 0.4 + (i - 1) * r * 0.55); ctx.lineTo(x, y + r * 0.4 + i * r * 0.55); ctx.stroke(); }
  }
  function swing(ctx, cx, ringY, rope, r, t, amp) {
    var ang = Math.sin(t * 1.7) * 0.42 * amp;
    var hx = cx + Math.sin(ang) * rope, hy = ringY + Math.cos(ang) * rope;
    ctx.strokeStyle = G.renk(G.gorunum().ip); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, ringY); ctx.lineTo(hx, hy - r * 0.2); ctx.stroke();
    hero(ctx, hx, hy, r, { x: Math.sin(t * 0.8) * 0.6, y: -0.5 });
  }

  window.addEventListener('resize', function () { brickKey = ''; });

  // ---------- tam ekran ve kurulum ----------
  var standalone = (window.matchMedia && (window.matchMedia('(display-mode: fullscreen)').matches || window.matchMedia('(display-mode: standalone)').matches)) || navigator.standalone;
  var canFull = !!(document.documentElement.requestFullscreen) && !standalone;
  if (!canFull) {
    $('tamEkranBtn').hidden = true;
    $('tamEkranYazi').textContent = standalone ? 'Oyun ana ekrandan açıldı, zaten tam ekran.' : 'Bu tarayıcıda tam ekran yok. Paylaş menüsünden "Ana Ekrana Ekle" ile kurarsan tam ekran açılır.';
  }
  $('tamEkranBtn').addEventListener('click', function () {
    if (document.fullscreenElement) { document.exitFullscreen().catch(function () {}); return; }
    document.documentElement.requestFullscreen({ navigationUI: 'hide' }).then(function () {
      try { screen.orientation && screen.orientation.lock && screen.orientation.lock('portrait').catch(function () {}); } catch (e) {}
    }).catch(function () { toast('Tam ekran açılamadı.'); });
  });
  document.addEventListener('fullscreenchange', function () { $('tamEkranBtn').textContent = document.fullscreenElement ? 'Kapat' : 'Aç'; });

  // Servis çalışanı: ana ekrana eklenebilir ve internetsiz açılır (https ya da localhost'ta)
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }

  // oyunun kullandığı arayüz
  window.KuyuScreens = {
    home: home,
    // sonuç kartındaki kısa yol: Dolap o ürünün önizlemesiyle açılır
    dolap: function (id) {
      var it = window.KuyuEkonomi.item(id);
      openDolap();
      if (it) { dolapTur = it.tur; onizleme = id; renderDolap(); }
    },
    levels: function () { openLevels(); },
    showGame: function () { show('oyun'); },
    toast: toast,
    hikaye: hikaye
  };

  boot();
})();
