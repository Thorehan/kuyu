/* Kuyu — seviyeler. Dünya genişliği 360, yan duvarlar taş.
   rects: [x, y, w, h, tür, yön]  tür: s taş (kanca tutmaz), w ahşap (kanca tutar), k diken, g kapı (düğmeyle açılır)
   par: "Kusursuz" madalyası için en fazla atış.  flow: "Akış" madalyası için gereken akış.
   grip: tutunma süresi (s), yoksa motorun varsayılanı.
   route: botun seviyeyi doğrulamak için izlediği yol (oyunda ipucu değil).
     ['hook', x, y]          oraya kanca at, asılı kalana kadar tut
     ['fling', x, y, boy]    kanca at, ip bu boya inince bırak (fırlama)
     ['box', i]              i. kutuyu kendine çek, sonra bırak
     ['wait', saniye]
*/
(function (root) {
  'use strict';
  var LEVELS = [
    {
      id: 1, name: 'İlk Halka', par: 6, flow: 4, grip: 3.0, H: 1100,
      hint: 'Tek elle oyna: ekranın sağına bas, kanca sağ yukarıdaki halkaya; soluna bas, sol yukarıdakine atılır. Basılı tut: ipe sarıl. Bırak: savrul. En üstteki kovayı yakala.',
      start: [180, 1040], goal: [180, 50],
      rects: [[16, 1060, 328, 40, 's']],
      rings: [[180, 860], [110, 680], [250, 500], [150, 330], [220, 180], [270, 835, 'ff'], [56, 500, 'ff'], [80, 180, 'ff']],
      route: [['fling', 180, 860, 90], ['hook', 180, 860], ['hook', 110, 680], ['hook', 250, 500], ['hook', 150, 330], ['hook', 220, 180], ['hook', 180, 50]],
      ffRoute: [['hook', 270, 835], ['hook', 110, 680], ['hook', 56, 500], ['hook', 150, 330], ['hook', 80, 180], ['hook', 180, 50]]
    },
    {
      id: 2, name: 'Ahşap Duvarlar', par: 7, flow: 4, grip: 3.0, H: 1300,
      hint: 'Kanca ahşaba saplanır, taştan seker. Mavi oklu halka hız halkası: tutun, bırakınca yukarı fırlarsın.',
      start: [180, 1240], goal: [180, 60],
      rects: [
        [16, -200, 44, 1500, 's'], [300, -200, 44, 1500, 's'],
        [60, 1260, 240, 40, 's'],
        [60, 1040, 10, 100, 'w'], [290, 880, 10, 100, 'w'], [60, 720, 10, 100, 'w'],
        [290, 560, 10, 100, 'w'], [60, 400, 10, 100, 'w'], [290, 240, 10, 100, 'w']
      ],
      rings: [[96, 886, 'ff'], [96, 566, 'ff'], [96, 246, 'ff'], [264, 1046, 'hiz']],
      route: [['hook', 70, 1046], ['hook', 290, 886], ['hook', 70, 726], ['hook', 290, 566], ['hook', 70, 406], ['hook', 290, 246], ['hook', 180, 60]],
      ffRoute: [['hook', 70, 1046], ['hook', 96, 886], ['hook', 70, 726], ['hook', 96, 566], ['hook', 70, 406], ['hook', 96, 246], ['hook', 180, 60]]
    },
    {
      id: 3, name: 'Zikzak', par: 7, flow: 4, H: 1400,
      hint: 'Halkalar iki yana dağılmış. Sıradaki halka hangi taraftaysa ekranın o yanına dokun.',
      start: [180, 1318], goal: [180, 50],
      rects: [
        [140, 1330, 80, 20, 's'], [16, 1384, 328, 16, 's'],
      ],
      rings: [[180, 1150], [90, 960], [270, 780], [100, 600], [240, 420], [130, 240], [60, 1170, 'hiz'], [270, 960, 'ff'], [304, 600, 'ff'], [304, 240, 'ff']],
      route: [['fling', 180, 1150, 100], ['hook', 180, 1150], ['hook', 90, 960], ['hook', 270, 780], ['hook', 100, 600], ['hook', 240, 420], ['hook', 130, 240], ['hook', 180, 50]],
      ffRoute: [['hook', 180, 1150], ['hook', 270, 960], ['hook', 270, 780], ['hook', 304, 600], ['hook', 240, 420], ['hook', 304, 240], ['hook', 180, 50]]
    },
    {
      id: 4, name: 'Kutu', par: 9, flow: 4, H: 1200,
      hint: 'Kanca hafif şeyleri sana çeker. Halkaya çık, kutuyu kendine çek, düğmenin üstüne düşür. Kapak açılır.',
      start: [180, 1140], goal: [180, 50],
      rects: [
        [16, 1160, 328, 40, 's'],
        [262, 1060, 82, 16, 's'],
        [16, 800, 328, 20, 'g']
      ],
      buttons: [[140, 1152, 80]],
      boxes: [[300, 1046]],
      rings: [[180, 930], [160, 680], [90, 500], [250, 330], [140, 170], [250, 520, 'ff'], [270, 190, 'ff'], [280, 740, 'hiz']],
      route: [['hook', 180, 930], ['box', 0], ['wait', 0.8], ['hook', 180, 930], ['fling', 160, 680, 90], ['hook', 160, 680], ['hook', 90, 500], ['hook', 250, 330], ['hook', 140, 170], ['hook', 180, 50]],
      ffRoute: [['hook', 180, 930], ['box', 0], ['wait', 0.8], ['hook', 180, 930], ['hook', 160, 680], ['hook', 250, 520], ['hook', 250, 330], ['hook', 270, 190], ['hook', 180, 50]]
    },
    {
      id: 5, name: 'Yükselen Su', par: 8, flow: 5, H: 1600, water: 80, waterDelay: 1.5,
      hint: 'Su yükseliyor. Asılı kalıp bekleme, sıradaki halkaya hemen atıl.',
      start: [180, 1540], goal: [180, 60],
      rects: [[16, 1560, 328, 40, 's'], [270, 1100, 74, 20, 's'], [16, 700, 70, 20, 's']],
      rings: [[220, 1360], [110, 1180], [250, 1000], [120, 820], [260, 640], [140, 460], [240, 280], [270, 1180, 'ff'], [304, 820, 'ff'], [304, 460, 'ff'], [56, 1000, 'hiz'], [70, 255, 'hiz']],
      route: [['hook', 220, 1360], ['hook', 110, 1180], ['hook', 250, 1000], ['hook', 120, 820], ['hook', 260, 640], ['hook', 140, 460], ['hook', 240, 280], ['hook', 180, 60]],
      ffRoute: [['hook', 220, 1360], ['hook', 270, 1180], ['hook', 250, 1000], ['hook', 304, 820], ['hook', 260, 640], ['hook', 304, 460], ['hook', 240, 280], ['hook', 180, 60]]
    },
    {
      id: 6, name: 'Kuyu Ağzı', par: 9, flow: 5, H: 1700, water: 62, waterDelay: 2,
      hint: 'Son kuyu: ahşap, halkalar ve yükselen su. Kovaya ulaş, gün ışığına çık.',
      start: [180, 1640], goal: [180, 50],
      rects: [
        [16, 1660, 328, 40, 's']
      ],
      rings: [[100, 1476], [230, 1270], [120, 1106], [260, 900], [100, 720], [260, 556], [150, 380], [100, 220], [260, 1476, 'ff'], [70, 925, 'ff'], [56, 556, 'ff']],
      route: [['hook', 100, 1476], ['hook', 230, 1270], ['hook', 120, 1106], ['hook', 260, 900], ['hook', 100, 720], ['hook', 260, 556], ['hook', 150, 380], ['fling', 100, 220, 80], ['hook', 180, 50]],
      ffRoute: [['hook', 260, 1476], ['hook', 230, 1270], ['hook', 120, 1106], ['hook', 70, 925], ['hook', 100, 720], ['hook', 56, 556], ['hook', 150, 380], ['hook', 180, 50]]
    }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = LEVELS;
  else root.KuyuLevels = LEVELS;
})(typeof window !== 'undefined' ? window : this);
