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
      hint: 'Ekrana bas: kanca o yöne fırlar. Basılı tut: ipe sarılırsın. Bırak: düşersin. Halkadan halkaya tırman, en üstteki kovayı yakala.',
      start: [180, 1040], goal: [180, 50],
      rects: [[16, 1060, 328, 40, 's']],
      rings: [[180, 860], [110, 680], [250, 500], [150, 330], [220, 180]],
      fireflies: [[180, 960], [180, 603], [180, 740]],
      route: [['fling', 180, 860, 90], ['hook', 180, 860], ['hook', 110, 680], ['hook', 250, 500], ['hook', 150, 330], ['hook', 220, 180], ['hook', 180, 50]]
    },
    {
      id: 2, name: 'Ahşap Duvarlar', par: 7, flow: 4, grip: 3.0, H: 1300,
      hint: 'Kanca ahşaba saplanır, taştan seker. Kahverengi panellere atıl, duvardan duvara tırman.',
      start: [180, 1240], goal: [180, 60],
      rects: [
        [16, -200, 44, 1500, 's'], [300, -200, 44, 1500, 's'],
        [60, 1260, 240, 40, 's'],
        [60, 1040, 10, 100, 'w'], [290, 880, 10, 100, 'w'], [60, 720, 10, 100, 'w'],
        [290, 560, 10, 100, 'w'], [60, 400, 10, 100, 'w'], [290, 240, 10, 100, 'w'],
        [150, 800, 60, 14, 's']
      ],
      fireflies: [[180, 1034], [174, 862], [276, 336]],
      route: [['hook', 70, 1090], ['hook', 290, 930], ['hook', 70, 770], ['hook', 290, 610], ['hook', 70, 450], ['fling', 290, 290, 70], ['hook', 290, 290], ['hook', 180, 60]]
    },
    {
      id: 3, name: 'Dikenli Kuyu', par: 7, flow: 4, H: 1400,
      hint: 'Dikenlere değme. Halkayı bırakmadan önce nereye düşeceğine bak.',
      start: [180, 1318], goal: [180, 50],
      rects: [
        [140, 1330, 80, 20, 's'], [16, 1384, 328, 16, 'k', 'u'],
        [16, 900, 14, 200, 'k', 'r'], [330, 700, 14, 250, 'k', 'l'],
        [150, 600, 60, 18, 'k', 'u'],
        [16, 330, 140, 16, 'k', 'd']
      ],
      rings: [[180, 1150], [90, 960], [270, 780], [100, 600], [240, 420], [130, 240]],
      fireflies: [[135, 1080], [170, 522], [180, 1060]],
      route: [['fling', 180, 1150, 100], ['hook', 180, 1150], ['hook', 90, 960], ['hook', 270, 780], ['hook', 100, 600], ['hook', 240, 420], ['hook', 130, 240], ['hook', 180, 50]]
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
      rings: [[180, 930], [160, 680], [90, 500], [250, 330], [140, 170]],
      fireflies: [[180, 1035], [170, 427], [124, 586]],
      route: [['hook', 180, 930], ['box', 0], ['wait', 0.8], ['hook', 180, 930], ['fling', 160, 680, 90], ['hook', 160, 680], ['hook', 90, 500], ['hook', 250, 330], ['hook', 140, 170], ['hook', 180, 50]]
    },
    {
      id: 5, name: 'Yükselen Su', par: 8, flow: 5, H: 1600, water: 105, waterDelay: 1.5,
      hint: 'Su yükseliyor. Asılı kalıp bekleme, sıradaki halkaya hemen atıl.',
      start: [180, 1540], goal: [180, 60],
      rects: [[16, 1560, 328, 40, 's'], [270, 1100, 74, 20, 's'], [16, 700, 70, 20, 's']],
      rings: [[220, 1360], [110, 1180], [250, 1000], [120, 820], [260, 640], [140, 460], [240, 280]],
      fireflies: [[165, 1283], [190, 743], [190, 383]],
      route: [['hook', 220, 1360], ['hook', 110, 1180], ['hook', 250, 1000], ['hook', 120, 820], ['hook', 260, 640], ['hook', 140, 460], ['hook', 240, 280], ['hook', 180, 60]]
    },
    {
      id: 6, name: 'Kuyu Ağzı', par: 9, flow: 5, H: 1700, water: 62, waterDelay: 2,
      hint: 'Hepsi bir arada. Kovaya ulaş, gün ışığına çık.',
      start: [180, 1640], goal: [180, 50],
      rects: [
        [16, 1660, 328, 40, 's'],
        [200, 1420, 144, 16, 's'],
        [330, 1100, 14, 300, 'k', 'l'],
        [240, 1030, 70, 18, 'k', 'u'],
        [16, 400, 14, 250, 'k', 'r'],
        [200, 250, 144, 16, 's']
      ],
      rings: [[100, 1476], [230, 1270], [120, 1106], [260, 900], [100, 720], [260, 556], [150, 380], [100, 220]],
      fireflies: [[165, 1385], [180, 650], [46, 174]],
      route: [['hook', 100, 1476], ['hook', 230, 1270], ['hook', 120, 1106], ['hook', 260, 900], ['hook', 100, 720], ['hook', 260, 556], ['hook', 150, 380], ['fling', 100, 220, 80], ['hook', 180, 50]]
    }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = LEVELS;
  else root.KuyuLevels = LEVELS;
})(typeof window !== 'undefined' ? window : this);
