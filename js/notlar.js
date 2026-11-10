/* Kuyu — Bekçinin notları (docs/hikaye.md).
   Her bölgede üç not; her biri belli bir bölümde, ateşböceği yolundaki (gizli yol) en üstteki ateşböceği
   halkasına iliştirilmiştir. O halkayı alan notu da bulur. Motor ve bölüm düzeni değişmez; not yalnızca
   bir işarettir. Okumak isteğe bağlıdır; bulunan notlar Profil → "Çıra'nın yolu"nda toplanır.
   Metin kuralları: kısa cümle, en çok iki cümle, "ölmek" yok. */
(function (root) {
  'use strict';
  var NOTLAR = [
    // Taş Kuyu
    { bolum: 4, metin: 'Fırtına dindi ama fener sönük. Kuyuya fitili sarkıttım; tutun ona, küçük kor.' },
    { bolum: 9, metin: 'Su her gece biraz yükseliyor. Acele et Çıra, ama korkma.' },
    { bolum: 14, metin: 'Duvarlarda ateşböcekleri gördüm. Hepsi senin ışığın; topladıkça yolun aydınlanır.' },
    // Maden
    { bolum: 20, metin: 'Gençken bu madende yağ taşırdım. Duvardaki fenerleri ben asmıştım.' },
    { bolum: 27, metin: 'Madenciler ışığı paylaşırdı. Bir fener sönerse yanındaki onu yeniden yakardı.' },
    { bolum: 34, metin: 'Kovayı her sabah biraz daha yukarıda bekletiyorum. Kolum eskisi kadar güçlü değil.' },
    // Kristal Mağara
    { bolum: 41, metin: 'Kristaller ışığı unutmaz. Bak, senin ışığın hâlâ içlerinde parlıyor.' },
    { bolum: 48, metin: 'Mağarada çan gibi bir ses var. Bence kristaller seni karşılıyor.' },
    { bolum: 54, metin: 'Köyde artık kimse kuyuya inmiyor. Ama ben geleceğini biliyorum.' },
    // Eski Kule
    { bolum: 61, metin: 'Kulenin merdiveni yüz on iki basamak. Her gece sayıyorum, her gece pencereye bakıyorum.' },
    { bolum: 68, metin: 'Fenerin camını sildim, yağını doldurdum. Bir tek sen eksiksin.' },
    { bolum: 74, metin: 'Az kaldı Çıra. Pencerede seni bekliyorum.' }
  ];
  NOTLAR.forEach(function (n, i) { n.no = i + 1; n.bolge = Math.floor(i / 3); });

  function bolumde(n) {
    for (var i = 0; i < NOTLAR.length; i++) if (NOTLAR[i].bolum === n) return NOTLAR[i];
    return null;
  }
  // Notun iliştiği halka: bölümün en üstteki ateşböceği halkası ([x, y] ya da null)
  function halka(def) {
    var en = null;
    (def.rings || []).forEach(function (r) { if (r[2] === 'ff' && (!en || r[1] < en[1])) en = r; });
    return en ? [en[0], en[1]] : null;
  }

  var api = { NOTLAR: NOTLAR, bolumde: bolumde, halka: halka };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.KuyuNotlar = api;
})(typeof window !== 'undefined' ? window : this);
