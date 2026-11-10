# Kuyu · Müzik brifi

Funday Morning Games · 2D mobil oyun · hazırlayan: geliştirme ekibi · 2026-11-10

Paylaşılan sayfa: Artifact "Kuyu Müzik Brifi" (aynı içerik).

## Oyun
Kuyu, tek elle oynanan dikey bir tırmanma oyunu. Kahraman bir kuyunun dibinden kancayla halkadan halkaya savrularak gün ışığına çıkar; alttan su yükselir. Oyuncu ipi erken bırakıp havadayken sıradakine tutunursa **akış** zinciri kurar; oyunun ritmi budur. Oturumlar kısa (bölüm 10–60 sn, Sonsuz Kuyu 1–3 dk), çoğunlukla telefon hoparlöründen ya da kulaklıkla dinlenir.

Şu an oyunda kod içinde üretilen geçici bir ortam müziği çalıyor (Ayarlar → Müzik). Tempo ve tonlar aşağıdaki tabloyla aynı; dinleyip referans alabilirsin: https://thorehan.github.io/kuyu/

## İstenen parçalar (döngü)

| Dosya | Nerede çalar | Ruh hâli | Tempo | Ton (öneri) |
|---|---|---|---|---|
| `menu` | ana menü, Dolap, Görevler, Ayarlar | sakin, davetkâr, merak | 60 | La minör |
| `tas` | Taş Kuyu (bölüm 1–16; Sonsuz 0–500 m) | serin, yosunlu taş, sabırlı; damla yankıları olabilir | 72 | La minör |
| `maden` | Maden (17–36; 500–1000 m) | sıcak, fener ışığı, ahşap kirişler, hafif metal tını | 70 | Re dorian |
| `kristal` | Kristal Mağara (37–56; 1000–1500 m) | parıltılı, yankılı çanlar, büyülü ama huzurlu | 76 | Mi lidya |
| `kule` | Eski Kule (57–76; 1500–2000 m) | ay ışığı, eski taş, org ya da koro dokusu, hafif hüzün | 66 | Do minör |

- **Süre:** 60–120 sn, **dikişsiz döngü** (başa dönüşte tık, boşluk ya da sönüş yok; son ölçü baştakine bağlansın).
- **Yoğunluk:** oyun üstünde çalacak; dikkat dağıtmayan, melodisi geride bir zemin. Kanca, ateşböceği ve akış efektleri (yüksek, kısa tınılar) üstüne oturacak; 1–4 kHz bandını kalabalık bırakma.
- **Telefon hoparlörü:** 120 Hz altı küçük hoparlörde kaybolur; bas varsa orta frekansta da duyulsun.
- **Bölgeler arası:** Sonsuz Kuyu'da bölge değişince parça değişir; aynı aileden duyulsun (ortak bir motif bölgeden bölgeye dönüşebilir).

## İsteğe bağlı: akış katmanı
Oyuncu akış zinciri kurdukça müzik canlanıyor (şu an arpej katmanı açılıyor). İstersen her bölge parçası için **aynı uzunlukta, senkron ikinci bir dosya** (`tas-akis` gibi): yalnızca ritim/arpej katmanı. Oyun onu akışla birlikte yavaşça açıp kapatır. Yapılmazsa tek parça yeterli.

## Teslim
- **Biçim:** her parça için `.mp3` (128–160 kbps) ve `.ogg` (q5); 44,1 kHz, stereo.
- **Ses düzeyi:** yaklaşık −16 LUFS (entegre), tepe −1 dBTP; parçalar birbirine yakın düzeyde.
- **Boyut:** parça başına 2 MB'tan küçük (mobil, internetsiz önbellek).
- **Adlar:** `menu`, `tas`, `maden`, `kristal`, `kule` (+ varsa `-akis`). Yer: `assets/muzik/`.
- **Haklar:** oyunda ve mağaza tanıtımlarında kullanım için Funday Morning Games'e.

## İsteğe bağlı: ses efektleri
Şu an kod içinde üretiliyorlar. İstenirse kısa (≤ 0,5 sn), kuru (yankısız) dosyalar:
kanca atış · tutunma (halka) · tutunma (ahşap) · ateşböceği alma · akış zinciri (yükselen 3 basamak) · hız halkası · yay fırlatma · geçit · rüzgâr şeridi · su yükseliyor · bölüm geçildi (2–3 sn) · suya yakalandın (1–2 sn).

## Sonra
Dosyalar gelince `js/muzik.js` → `PARCALAR`'a yazılır (ör. `maden: 'assets/muzik/maden.mp3'`); o sahnede dosya döngüyle çalar, yüklenemezse üretilen müzik devam eder.
