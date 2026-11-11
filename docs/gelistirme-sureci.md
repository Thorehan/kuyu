# Kuyu · Geliştirme süreci

Bu belge geliştirme sırasını, kararları ve yapılanları tutar. Claude her turda buradan devam eder.

## Geliştirme sırası (karar: 2026-11-10, 2026-11-09'daki dörtlü sıranın yerine)
1. **Mekanik oynanış**: kontrol, nişan, fizik, halka türleri, denge.
2. **Oyun içi akış / alış-satış**: kazanma ve harcama döngüsü (ödül puanı, ateşböceği), görevler, ödüller, mağaza mantığı ve fiyatlar.
3. **UI / UX**: ekranlar, menüler, kartlar, erişilebilirlik.
4. **Görsellik**: kozmetik dolap (görünümler), bölgeler, görsel düzenleme, ses ve müzik. Görsel şimdilik öncelik değil.
5. **Online özellikler**
6. **Hikâye**: en son. Karakter kim, neden kaçıyor, ateşböcekleri ne işe yarıyor.

Bir aşamadaki işler bitmeden sonrakine geçilmez; yeni bulunan oynanış sorunları her zaman öne alınır.

## Geri dönüş noktaları
- `geri-donus-v0.17` (2026-11-10): oyun başarılı, halka türleri ve mağaza öncesi. En eski nokta.
- `geri-donus-v0.45` (2026-11-11): hikâye, alevlenme, karar ve zamanlama, fırlatma yolu, nişan kuralı; istişare iyileştirmeleri öncesi.
- `geri-donus-v0.47` (2026-11-12): kor karakter, panel teması, zincir, TAM kova; İstişare 2 (takip eden su vb.) öncesi.

İkisi de GitHub'da etiket olarak duruyor; dönmek gerekirse istenen noktadan yeni bir dal açılır (main'e zorla push yok).

## Kalıcı kararlar
- **Mobil oyun, tek elle oynanır.** İmleç yok; başparmak ekranın alt kısmında kalır. Her yeni özellik 375 px telefonda tek el ile denenir.
- **Görsel tasarım şimdilik bu haliyle devam eder.** İleride yapılacak görsel düzenleme bu yapının (renkler, yazı tipleri, ekran düzeni, sahne çizimi) üzerine yapılır; baştan tasarım yok.
- **Uçuş hızı iyi.** Kancanın çekme hızına (`CFG.REEL` 760) ve uçuşa yavaşlatma/hızlandırma eklenmez.
- **Şimdilik zorluk yok.** Diken ve taş çıkıntı yok (`gen.js` içinde `HAZARDS = false`). Tek tehlike alttan yükselen su; oyuncu erken kaybetmemeli.
- **Sonsuz Kuyu temposu değişmez** (2026-11-09): "kimse ölmüyor" bir sorun sayılmaz; oyun akışını ciddi etkileyen tempo/zorluk değişikliklerinde acele edilmez, önce konuşulur.
- **El kayması yalnızca Sonsuz Kuyu'da**, bölümlerde yok. **Kusursuz** madalyasında boş atışlar sayılmaz.
- **Ateşböceği alınamıyor olmamalı.** Ateşböcekleri halkanın içindedir; o halkaya tutunmak ya da içinden geçmek yeter. İstemeyen es geçer.

## Sıradaki iş sırası (2026-11-11)
Kalan işler geliştirme sırasına göre. Bekleyenler senden bir karar ya da telefon denemesi istiyor.
1. [x] Tam zamanında bırakma (v0.37): ip halkaya varmadan hemen önce bırakılırsa ışıltı, tını, "TAM!" ve Sonsuz'da +10 puan.
2. [x] Kendi hayaletinle yarış (v0.38): bölümde en kısa süreli, Sonsuz'da rekor, Günlük'te günün en iyi koşun soluk bir kopya olarak seninle tırmanır; ekran dışındaysa kenarda işaret. Ayarlar → Hayalet.
3. [x] Günlük Kuyu'ya günün kuralı (v0.39): altı kural sırayla döner (Yay, Rüzgâr, Ateşböceği gecesi, Sarkaç, Geçit, Hız). Yalnızca halka türleri değişir; yerler, su ve zorluk aynı. Her kural botla 1500 m'ye çıkılıyor, ortalama oyuncu 1:13–1:22'de yakalanıyor.
4. [x] Ateşböceği ışığı (v0.40): ömür boyu kazanılan ateşböceği (harcamak söndürmez) 10 ışık seviyesine bölünür (25, 60, 120, 200, 320, 480, 700, 1000, 1400, 2000). Menüdeki kuyuda ateşböcekleri çoğalır, sıcak parıltı artar, 3. seviyeden sonra duvar fenerleri yanar. Profil'de "Kuyunun ışığı" çubuğu; seviye atlayınca menüde bildirim.
5. [x] İkinci yolculuk (v0.41): 77. bölümden sonra her bölgeye ilk girişte kendi kartı; Çıra'nın yolu'nda toplanır, bölüm listesinde "· ikinci yolculuk".

6. [x] Hızlanma (v0.42, karar 2026-11-11): akış x5/x10/x15'te alevlenme, alevliyken erken bırakış +150/+250/+350 yukarı itiş; TAM bırakış +200, art arda her 3. TAM'da +150 daha. Kanca uçuşu ve ip sarma hızı aynı. Ortalama/iyi oyuncunun temposu aynı (1:17); akışla oynayan %13 daha yükseğe çıkıyor.

7. [x] Karar ve zamanlama (v0.43): ölçüm `tools/spam.js`. Boş atış akışı bitirir ve kanca dönene kadar yeni atış yok; ip halkadan uzaktayken bırakmak akış sayılmaz; alev akış içindeki TAM'larla dolar. Spam 6 km → ~1–2 km, düşünen oyuncu ve ortalama tempo aynı.
8. [x] Fırlatma yolu (v0.44, bölümler): turuncu oklu halkadan akışla fırlayınca ulaşılan ateşböceği; asılıyken ulaşılmaz. 54/73 üretilen bölümde, motorla doğrulanmış. Hız ödülü işe yaramadı (akış ana yolu zaten hızlı), ödül ateşböceği. Spam yine de %54–65 alıyor, bilerek seçen %78.
9. [x] Nişan kuralı (v0.45): yukarısı şartlı öncelikli, şartlar sağlanmazsa aşağısı. Bekleme (yukarı hedef 0,35 sn içinde menzile girecekse), hattı kesen yukarı halka, değilen halka engel değil. `tools/nisan.js` kurala aykırı aşağı atışı sayar (0).
10. [x] İstişare iyileştirmeleri (v0.46): fırlatma yolu ateşböceği yalnız akışla (spam 29–35 → 22–30/54, bilerek seçen 42/54); çarpana ustalık payı (TAM başına +0,05, en çok x2,00; akış oyuncusu x1,50 → x1,96); Sonsuz Kuyu'ya fırlatma yolu (~her 180 m, motorla denenmiş). Tempo 1:17, günlük kazanç ~100 → ~102.
12. [x] Görsellik ve oynanış (v0.47): kor karakter, panel/popup kor teması, hayalet ve rekor koşullu ve sade, ateşböceği zinciri (Sonsuz), TAM kova (bölümler).
14. [x] Takip eden su (v0.48, İstişare 2 adım 1): su en yüksek tutunma noktasının 15 → 8 m altında bekler, yalnız düşüş yakalatır; ilerlemezsen sürünür; Sonsuz'da el kayması ve kurtarma kancası yok, yanlış taraf ipi bırakır (yeniden yakalanabilir), boş atış kilidi 0,4 sn. Ölçüm `tools/hata.js`.
16. [x] Devam hakkı (v0.49): 5 sn teklif, video yalnız 1., ateşböceği 25/50/100, en çok 3, Günlük'te yok; en yüksek güvenli halkadan diriliş.
17. [x] Güçlendirmeler (v0.50): kalkan (su kapağıyla birleşti), fener, kanat; Sonsuz ve Günlük, ~her 22 halkada bir sırayla. Botlar kanattan sonra yolu yeniden bulur.
18. [x] Dokun ve başla (v0.51): ana menünün ortasına dokununca Sonsuz Kuyu (1. bölüm geçilene dek İlk Halka); Bölümler → Hikâye; Oyna ve Sonsuz kartları kalktı, Hikâye ve Günlük küçük kartlar.
15. [ ] İstişare 2 sırası: görsel akıcılık → 24 uzun bölüm.
13. [ ] Sırada: döner çark ve kor halka (istişare), Dolap'ta yeni türler (başlık, alev rengi), iki para birimi kararı.
11. [ ] Telefonda denenecek ayarlar: akış penceresi, boş atış kilidi, nişan beklemesi. Karar bekleyenler: istişare belgesi.

Bekleyenler: telefon denemesi düzeltmeleri, fiyatların gözden geçirilmesi, ana menü geri bildirimi, bekçinin adı, online için arka uç seçimi, Mustafa'nın parçaları.

## Yapılacaklar listesi (2026-11-10)
Altı başlık, geliştirme sırasıyla aynı. `[~]` üzerinde çalışılıyor, `[?]` senin kararını bekliyor.

### 1. Mekanik oynanış
**Bitenler:** tek el sol/sağ kontrolü ve nişan yardımı, kurtarma kancası, ateşböceği ve hız halkaları (karar noktaları), akış, hız çarpanı, su ilk halkadan sonra, bölümlerde el kayması yok, Kusursuz'da boş atış sayılmaz.
- [x] Nişan: yandaki halka yukarıdakinin önüne geçmesin (v0.17). Yukarıdaki hedefler dik ve yandakiler (sığ) diye ayrılır; yan = 3 m'den az yükselen ya da 45°'den düz açıdaki hedef. Önce bu taraftaki dik hedef, yoksa yandaki. Havadayken/ip sarılırken yan seçim %4,8 → %1,2 (`node tools/nisan.js`); kalanlar açıkça yukarıdaki yakın halkalar.
- [ ] Telefon denemesi sonuçlarına göre düzeltmeler (`docs/telefon-testi.md`, sende).
- [x] Yeni halka türleri (2026-11-10 sırası; hepsinde ceza yok, kaçıran yalnızca bonusu kaçırır, uçuş hızı değişmez):
  1. [x] **Rüzgâr şeridi** (v0.18): yolun üstünde yatay şerit; akış x2 ve üstündeyken içinden yukarı geçmek akışı +1 yapar ve puan verir, akış yokken söner. Karar noktası olmayan adımlara konur.
  2. [x] **Yay halkası** (v0.19): ip seni normal hızda çeker, halkaya ulaştığın an okun yönüne (sıradaki hedefe) fırlatır; bırakmak gerekmez, akış sürer. Tepede 1 sn süzülürsün (yavaş oyuncu düşmesin diye; süzülme olmadan ortalama oyuncu Sonsuz'da 13 sn'de yakalanıyordu). Asılarak oynayanı akışa sokar; akışla oynayan zaten halkaya varmadan geçer.
  3. [x] **Geçit çifti** (v0.20): mor giriş halkasına tutun, yaklaşınca (4 m) iki düğüm yukarıdaki mor çıkışa taşınır ve orada asılı kalırsın; akış sürer, düşme yok. Giriş ana yolun alternatifidir (seçim). Arada ateşböceği varsa geçit konmaz (atlatmasın). Bölümlerin 27/74'ünde birer çift, Sonsuz'da 1 km'de 4–5. İleride: çıkışa ateşböceği koyup gizli yol yapmak.
  4. [x] **Sarkaç halka** (v0.21): tepedeki pimden zincirle asılı, ±55 birim, 2,6 sn'de bir salınım. Hangi taraftaysa o tarafın işareti onu gösterir; uzaksa beklemek yeter. Tutununca seni de sallar. Ana yoldaki ortadaki halkalardan (x 100–260) 5 adım arayla. Motor hatası düzeltildi: sarkaç kancanın üstüne kayınca kanca içinden geçip ıskalıyordu.
  - Çürük halka zorluk olduğu için ertelendi.
- [x] 4. bölüme üçüncü ateşböceği (v0.29): (60, 600), kapağın üstünde solda küçük bir sapma. Bulmaca odasına konunca oyuncu ateşböceği halkasından kutuyu çekip düğmeyi ıskalıyordu; (80, 340) yalnız sola basarak geçilebilen bir yol açıyordu. Bu yerde ateşböceği rotası 3/3, bütün tarzlar geçer, tek taraf geçemez.
- [x] Kutu sürtünmesi (v0.29): yerdeki kutu buz gibi kayıp düğmeden çıkıyordu (çarpışma sürtünmesi yalnızca yüzeye doğru giderken uygulanıyordu). Artık yerdeki kutunun yatay hızı söner (`CFG.BOX_ZEMIN` 0,85); 4. bölümde denenen 8 zamanlamanın 8'inde kutu düğmede kalır (önce 1'inde). Kahraman fiziği değişmedi.
- [x] Yerel istatistik (v0.28): Ayarlar → Oyun istatistikleri. Bölüm başına deneme, geçiş, ölüm (yüksekliğin yüzde kaçında), atlama, yarıda bırakma, en iyi süre, boş atış, kurtarma; Sonsuz/Günlük koşu metreleri (son 30), en uzun akış; halka kullanımı ve toplam oynama süresi. "Panoya kopyala" ile JSON paylaşılır (telefon denemesinden sonra bana gönder, denge buna göre ayarlanır). Yalnızca cihazda; sıfırlama iki dokunuşla.
- Dokunulmayacak: Sonsuz Kuyu su temposu (karar 2026-11-09).

### 2. Oyun içi akış / alış-satış
- [x] Günlük Kuyu: herkes aynı gün aynı tohumla aynı sonsuz kuyu (online skor tablosunun zemini). v0.15
- [x] Görevler ve başarımlar: günde 3 görev (kolay/orta/zor, ödül puanı), 9 başarım × 3 kademe, Görevler sekmesi. v0.16
Karar (2026-11-10): oyunda güçlendirme yok, **harcamalar yalnızca kozmetik**. Sıra:
1. [x] Ekonomi (v0.22): para birimi ateşböceği (cüzdan). Kazanç: bölümde ilk kez alınan ateşböceği (tekrar oynayarak kasılmaz), Sonsuz/Günlük'te toplanan her ateşböceği, görev (5/10/15), başarım kademesi (10/25/50), günlük giriş. Ölçüm `node tools/ekonomi-olcum.js`: ortalama oyuncu tipik bir günde ~100, videolarla ~145.
2. [x] Günlük giriş (v0.22): 7 günlük takvim 5-5-10-10-15-15-50; gün kaçırınca sıfırlanmaz. "Video izle, ikiye katla" yer tutucusu (3 sn, "deneme" yazılı); gerçek ödüllü reklam Unity'de.
3. [x] Dolap (v0.22): alt menüde (Profil ana menüdeki "Merhaba" düğmesinde). Atkı 7, ip 5, uçuş izi 5 seçenek; 30–300 ateşböceği, hepsi 1280 (tipik oyuncu için 9–13 gün). Satın alınca kuşanılır; önizlemede sallanan kahraman. Atkı oyunda ve menü sahnesinde, ip ve iz oyunda uygulanır.
4. [x] Görev ödüllerinde "▶ ×2" video seçeneği (v0.22).
5. [ ] Fiyat ve kazancı telefon denemesinden sonra gözden geçir.
6. [ ] Daha çok ürün (4. aşama görsellikte: kahraman kostümleri, kanca biçimleri, halka temaları).

### 3. UI / UX
- [x] **Ana menü düzeni (v0.9):** üst şerit (profil + toplam ödül + ateşböceği), Oyna kartında sıradaki bölümün adı ve hedefleri, başparmak bölgesinde modlar, alt gezinme çubuğu. v0.22'den beri: Ana sayfa / Bölümler / Görevler / Dolap / Ayarlar; Profil ana menüdeki "Merhaba" düğmesinde.
- [ ] Ana menü için senin geri bildirimin (telefonda).
- [x] Oyun içi duraklatma paneli (v0.10): Devam et, Baştan / Yeni koşu, Bölümü atla, ses ve titreşim, Ana menü. Oyun ve su durur, ip bırakılmaz; telefon arka plana alınınca kendiliğinden durur.
- [x] Oyun içi üst şerit (v0.11): solda bölüm adı ve küçük göstergeler (ateşböceği, atış/par, akış; Sonsuz'da metre, akış, hız çarpanı), sağda duraklat. Atla ve Ses duraklatma paneline taşındı. 360 px'te kesilme yok.
- [x] Bölümler ekranı (v0.12): özet ve ilerleme çubuğu, Tümü / Eksik hedefler filtresi, 1–6 Öğrenme ve 10'arlı gruplar (her grupta ilerleme), geçildi/tam işaretleri, Sıradaki etiketi ve otomatik kaydırma. Bölgeler gelince grup adları bölge adları olur.
- [x] Bölüm sonu kartı (v0.13): alt sayfa; sayarak gelen büyük ödül ve hesabı; madalyalar (bu oyunda ilk kez kazanılan "YENİ" etiketiyle zıplar); süre ve hız göstergeleri (rekor etiketli); büyük "Bölüm N ›", Tekrar, Bölümler. Sonsuz Kuyu kartı aynı yapıda.
- [x] Tanıtım kartları (v0.14): ateşböceği halkası, hız halkası, ahşap, kutu, su, akış, boş atış, kurtarma kancası, el yorulması ilk görüldüğünde oyun durur ve kısa kart çıkar; her biri bir kez. Ayarlar → "Tanıtım kartlarını yeniden göster".
- [x] **Denetim 2026-11-10 (v0.23), 360×640 telefon:** bütün sekmelerde yana taşma yok; günlük giriş penceresi sığıyor. Bulunan ve düzeltilenler:
  - Bölüm sonu kartı (madalya + 3–4 kazanım satırı) sahneden uzundu, başlık kesiliyordu ve kaydırılamıyordu. Artık kart sahneden uzunsa üstten başlar ve kaydırılır; 720 pikselden kısa ekranlarda kart sıkı dizilir ve en çok 2 kazanım satırı gösterir (fazlası "ve N tane daha").
  - 7. bölümde yay, sarkaç ve rüzgâr şeridi aynı bölümde ilk kez çıkıyordu: yeni oyuncu art arda 3 tanıtım kartıyla kesiliyordu. Artık el yapımı 1–6. bölümler dışında bir koşuda en çok bir yeni öğe kartı; kalanı sonraki bölümlerde (7, 8, 9. bölümler birer yeni şey öğretir). Acil kartlar (boş atış, kurtarma, su, akış, el yorulması) sınırsız.
  - Servis çalışanı internetsiz açılışta en eski kayıtlı sürümü açıyordu (v0.22'de düzeltildi).
- [x] Erişilebilirlik (v0.27): işaretlerde renk dışında yön oku zaten var (sol ◀, sağ ▶). Ayarlar → "Büyük yazı": menülerdeki 10–13 px'lik yazılar 2–3 px büyür (oyun alanı ve büyük başlıklar değişmez), cihazda saklanır. 360×640'ta yana taşma yok, ana menü tek ekrana sığar.
- [x] Ana menüde görev şeridi (v0.24): Oyna kartının üstünde "Görevler 1/3", üç küçük ilerleme çubuğu ve tamamlanmaya en yakın görev ("10 ateşböceği topla · 6/10"); alınmamış ödül varsa altın renkte "Ödül hazır", hepsi bittiyse yeni görevlere kalan süre. Dokununca Görevler açılır. Menü sahnesindeki kahraman artık logo ile şerit arasındaki boşlukta sallanır.
- [x] Sonuç kartında Dolap kısa yolu (v0.26): bu koşunun kazancıyla ilk kez yetişilen en ucuz ürün için "Dolap'ta yeni · Gök ip alınabilir ›"; yalnızca eşik o koşuda aşıldığında çıkar. Dokununca oyun durur ve Dolap o ürünün önizlemesiyle açılır (satın alma yine "Al" ile).

### 4. Görsellik (şimdilik öncelik değil)
- [x] Dolap görünümleri: atkı, ip, uçuş izi (v0.22); kahraman rengi ve kanca biçimi (v0.31). Kahraman: Turuncu (bedava), Deniz 60, Çimen 60, Lavanta 90, Pembe 90, Gece 120, Altın 150. Kanca: Ok (bedava), Çapa 50, Yıldız 80, Kalp 100 (kalp ve yıldız hep dik çizilir). Bütün dolap 2080 ateşböceği (tipik oyuncu için 2–3 hafta). Halka renkleri oynanışın parçası olduğu için satılmaz.
- [ ] Daha sonra: kahraman kostümleri (şapka, gözlük), bölgeye özel ürünler.
- [x] Bölgeler (v0.30): Taş Kuyu (1–16) → Maden (17–36) → Kristal Mağara (37–56) → Eski Kule (57–76), sonra baştan (20'şer). Sonsuz Kuyu'da her 500 m'de bir; sınır kuyunun içinde görünür. Değişen: duvar dokusu ve rengi, taş çıkıntı rengi, ortam ışığı, arka plan süsleri (madende fener, mağarada duvar dibinde kristal, kulede pencere ve ay ışığı). Halkalar, işaretler ve oyun renkleri her bölgede aynı. Bölümler ekranında grup adları bölge adı; yeni bölgeye ilk girişte oyunu durdurmayan kısa duyuru (Sonsuz'da metresiyle). Oynanış değişmedi.
- [x] Bölgelere özel müzik (v0.32, üretilen); gerçek parçalar müzik kararına bağlı.
- [ ] Görsel düzenleme: bu yapının üzerine; baştan tasarım yok.
- [x] Ortam müziği (v0.32): dosyasız, Web Audio ile üretilir (`js/muzik.js`). Bölgeye göre tema (Taş Kuyu La minör sakin, Maden sıcak ve damlalı, Kristal Mağara yankılı çan, Eski Kule org), menüde daha sakin sürüm; akış sürerken arpej katmanı açılır; duraklatınca ve sonuç kartında kısılır, telefon arka plandayken susar. Ayarlar'da Müzik ve Ses efektleri ayrı; duraklatma panelinde Müzik ve Efekt düğmeleri.
- [~] Gerçek müzik: Mustafa'dan istenecek (karar 2026-11-10). Brif: `docs/muzik-brifi.md`. Gelince `js/muzik.js` → `PARCALAR`'a bölge başına bir dosya yazılır (tas, maden, kristal, kule, menu); o bölgede dosya çalar, üretilen müzik susar.

### 5. Online özellikler
- [?] Arka uç seçimi ve maliyet (Firebase, Supabase vb.).
- [ ] Google / Apple girişi, bulut kayıt (şu an misafir, ilerleme cihazda).
- [ ] Skor tabloları: Sonsuz Kuyu genel ve haftalık, Günlük Kuyu günlük.
- [ ] Hayalet yarışı (online): kendi hayaletin v0.38'de var (`js/hayalet.js`, yer kaydı); arkadaşının ya da rekor sahibinin hayaleti aynı biçimle eklenir.
- [ ] Hile denetimi: sunucu gönderilen koşuyu yeniden oynatıp skoru doğrular.
- [ ] Arkadaş rekorları ve "bu kuyuyu benimle oyna" paylaşım bağlantısı.
- [?] Yayın: Unity'ye taşıma zamanı, mağaza hesabı, yalnızca seçilen ödüllü reklam (Pofi kuralı).

### 6. Oyun hikâyesi (karar 2026-11-10: "Çıra", ayrıntılar `docs/hikaye.md`)
Kullanıcı hikâyeye online'dan önce geçti; online (5) sonra.
- [x] Kahraman: Çıra, köyün fenerinden düşen küçük kor. Su onu söndürebilecek tek şey; ip fenerin fitili; ateşböcekleri saçılan ışığı; kova fener bekçisinin.
- [x] Bölgelerin hikâyedeki yeri: köyün unutulmuş katmanları (taş kuyu, maden, kristal mağara, fener kulesi).
- [x] Sözsüz önsöz (v0.34): tanıtım sahnesinin başında fener → kıvılcım düşer → Çıra dipte uyanır → gün ışığına fırlar.
- [x] Bölge hikâye kartları (v0.34): yeni bölgeye ilk girişte oyunu durdurmayan kart (bölge adı + tek cümle).
- [x] Profil → Çıra'nın yolu (v0.34): açılan bölgelerin hikâyesi, açılmayanlar kilitli.
- [x] Menü metinleri (v0.34): "Çıra'yı fenerine geri götür", "ÇIRA'YI IŞIĞA ÇIKAR".
- [x] Bölge finalleri (v0.36, 16, 36, 56, 76): ilk geçişte sözsüz son sahne (ateşböcekleri yol gösterir, madende fenerler yanar, mağarada kristaller çınlar, kulede fener yeniden yanar).
- [x] Bekçinin notları (v0.35): 12 not (bölge başına 3; 4, 9, 14, 20, 27, 34, 41, 48, 54, 61, 68, 74. bölümler), bölümün en üstteki ateşböceği halkasına asılı. Halkayı alan notu bulur; metin bölüm sonunda kartla gelir, Çıra'nın yolu'nda toplanır. Bot: 12/12 ateşböceği rotasıyla alınıyor.
- [x] Son: 76. bölümde fener yeniden yanar (v0.36); ikinci yolculuk (77+) metinleri (v0.41).
- [?] Bekçinin adı.

## Yapılanlar
- 2026-11-11 · v0.34 · Hikâye: Çıra (önsöz, bölge kartları, Çıra'nın yolu, metinler); oyun ekranı gizliyken döngü çizim yapmaz.
- 2026-11-11 · v0.35 · Bekçinin notları: 12 not, ateşböceği yolunda; Çıra'nın yolu'nda okunur.
- 2026-11-12 · v0.51 · Dokun ve başla: ana menü sadeleşti, dokununca Sonsuz Kuyu; Bölümler → Hikâye.
- 2026-11-12 · v0.50 · Güçlendirmeler: kalkan, fener, kanat (Sonsuz); köşe göstergesi, tanıtım kartları. Su düzeltmesi: su hızlı tırmanışta 200–300 m geride kalıyordu (düşüş 15 sn); artık uzaklıkla orantılı yetişir, mesafe 30 → 18 m, sarkacın tepesi tutunma sayılmaz, sürünme 7,5 m/sn.
- 2026-11-12 · v0.49 · Devam hakkı: Sonsuz'da yakalanınca 5 sn teklif (video / ateşböceği / geç), artan bedel, en çok 3.
- 2026-11-12 · v0.48 · Takip eden su: Sonsuz'da yanmak yanlış karardan; geri dönüş noktası `geri-donus-v0.47`.
- 2026-11-12 · v0.47 · Görsellik ve oynanış: kor karakter, panel teması, sade hayalet + rekor çizgisi, ateşböceği zinciri, TAM kova.
- 2026-11-11 · v0.46 · İstişare iyileştirmeleri: fırlatma yolu ateşböceği yalnız akışla, çarpana ustalık payı, Sonsuz Kuyu'da fırlatma yolu. Geri dönüş noktası `geri-donus-v0.45`.
- 2026-11-11 · v0.45 · Nişan kuralı: yükselirken aşağıya atılma düzeltildi (bekleme, hattı kesen yukarı halka, değilen halka engel değil); nişan testine kural denetimi.
- 2026-11-11 · v0.44 · Fırlatma yolu: bölümlerde gerçek yol ayrımı (turuncu oklu halka → akışla ulaşılan ateşböceği), üreticide motorla doğrulama, bot denetimi, tanıtım kartı.
- 2026-11-11 · v0.43 · Karar ve zamanlama: boş atış bedeli, akış penceresi, alev TAM ile dolar; `tools/spam.js` ölçümü; rota botunda akış için nişanla yedek ölçüt.
- 2026-11-11 · v0.42 · Alevlenme ve TAM itişi: akış basamaklarında Çıra alevlenir, erken bırakışlar ve TAM bırakışlar yukarı iter; ilk alevlenmede kısa açıklama.
- 2026-11-11 · v0.41 · İkinci yolculuk: 77+ bölge kartları ve Çıra'nın yolu metinleri; bölüm listesinde yolculuk adı.
- 2026-11-11 · v0.40 · Kuyunun ışığı: kazanılan ateşböcekleri menüdeki kuyuyu kalıcı aydınlatır (10 seviye); Profil'de ilerleme.
- 2026-11-11 · v0.39 · Günün kuralı: Günlük Kuyu'da herkes için aynı tek değişiklik; menü kartında ve koşu başında gösterilir.
- 2026-11-11 · v0.38 · Hayalet: en iyi koşunun soluk kopyası (bölüm, Sonsuz, Günlük); yalnızca görüntü, ayrı kayıt (`kuyu.hayalet`, ~60 bayt/sn). Ayarlar'dan kapatılır.
- 2026-11-11 · v0.37 · Tam zamanında bırakma: ip halkaya ~0,09 sn kala bırakılınca ışıltı + "TAM!" (+10 Sonsuz puanı); sonuç kartında sayısı. Fizik ve tempo aynı.
- 2026-11-11 · v0.36 · Bölge finalleri: 16, 36, 56, 76. bölüm sonunda bir kez oynayan sözsüz sahne; menü düğmesi bölüm sonu sırasında sonuç kartını açar (bölüm kaydedilmeden çıkılmaz).
- 2026-11-10 · v0.33 · Müzik brifi (Mustafa için); servis çalışanı müzik dosyalarını da internetsiz saklar.
- 2026-11-10 · v0.32 · Ortam müziği (bölgeye ve akışa göre), Müzik ve Ses efektleri ayrı ayarlar.
- 2026-11-10 · v0.31 · Dolap'a kahraman rengi ve kanca biçimi; beş sekme.
- 2026-11-10 · v0.30 · Bölgeler: Taş Kuyu, Maden, Kristal Mağara, Eski Kule (bölümlerde numaraya, Sonsuz'da yüksekliğe göre).
- 2026-11-10 · v0.29 · 4. bölüme üçüncü ateşböceği; kutu yerde artık kaymıyor (düğmeden çıkıp kapağı kapatıyordu).
- 2026-11-10 · v0.28 · Yerel istatistik sayfası ve panoya kopyalama.
- 2026-11-10 · v0.27 · Büyük yazı ayarı; sonuç kartında Dolap kısa yolu (v0.26).
- 2026-11-10 · v0.25 · Dolap: ilk dokunuş önizleme, satın alma ayrı "Al" düğmesiyle (oyuncu geri bildirimi: dokununca hemen satın alınıyordu).
- 2026-11-10 · v0.24 · Ana menüde görev şeridi.
- 2026-11-10 · v0.23 · UI/UX denetimi (360×640): sonuç kartı kısa ekranda taşmıyor ve kaydırılabiliyor; tanıtım kartı sınırı (koşu başına bir yeni öğe kartı).
- 2026-11-10 · v0.22 · Servis çalışanı düzeltmesi: internetsiz açılışta en eski kayıtlı sürüm açılıyordu ve önbellek her sürümde şişiyordu; artık dosya başına tek (en son) kayıt.
- 2026-11-10 · v0.22 · Ekonomi, günlük giriş, Dolap, video ile ikiye katlama; görev ödülleri ateşböceği. Düzeltme: Sonsuz/Günlük'te toplanan ateşböcekleri sayılmıyordu (görevler dahil).
- 2026-11-10 · v0.21 · Sarkaç halka (yeni halka türlerinin sonuncusu), tanıtım kartı; rota botu sarkaçları canlı konumundan hedefler.
- 2026-11-10 · v0.20 · Geçit çifti: mor giriş → yukarıdaki çıkış, tanıtım kartı, "GEÇİT +N m".
- 2026-11-10 · v0.19 · Yay halkası: ulaşınca okun yönüne fırlatır, tepede süzülme, tanıtım kartı. Botlar fırlatılınca tepede dokunur.
- 2026-11-10 · v0.18 · Rüzgâr şeridi (ilk yeni halka türü), tanıtım kartı, "rüzgâr şeridinden geç" görevi. Geri dönüş noktası: `geri-donus-v0.17`.
- 2026-11-10 · v0.17 · Nişan: yandaki sığ halka yukarıdakinin önüne geçmiyor; `tools/nisan.js` denetimi. Geliştirme sırası altı aşamaya çıktı.
- 2026-11-10 · v0.16 · Görevler ve başarımlar: günlük 3 görev, ödül alma, 9 başarım (Bronz/Gümüş/Altın), alt menüde Görevler sekmesi, sonuç kartında kazanımlar.
- 2026-11-10 · v0.15 · Günlük Kuyu: günün tohumu (İstanbul saati), günün en iyisi, deneme sayısı, seri; ana menü kartı ve profil.
- 2026-11-10 · v0.14 · Tanıtım kartları (9 tür), Ayarlar'dan sıfırlama.
- 2026-11-10 · v0.13 · Bölüm sonu ve Sonsuz Kuyu sonuç kartları yenilendi: büyük ödül, YENİ madalya ve REKOR anları.
- 2026-11-10 · v0.12 · Bölümler ekranı: özet, filtre, gruplar, sıradaki bölüm.
- 2026-11-10 · v0.11 · Oyun içi üst şerit sadeleşti: göstergeler, Atla/Ses panelde.
- 2026-11-09 · v0.10 · Oyun içi duraklatma paneli; arka plana alınınca otomatik duraklatma.
- 2026-11-09 · v0.9 · Yapılacaklar listesi dört başlıkta (oynanış, UI/UX, hikâye, online); yeni ana menü düzeni ve alt gezinme çubuğu.
- 2026-11-09 · v0.8 · Sprint 1: ana ekrana kurulum ve internetsiz açılış, tam ekran düğmesi, simgeler; bölümlerde el kayması yok; Kusursuz'da boş atış sayılmaz; 6. bölüme hız halkası; telefon deneme listesi; `kontrol.js`, `tempo.js`. Su temposu ölçüldü ama değiştirilmedi.
- 2026-11-09 · v0.7.1 · Su ilk halkadan sonra tetiklenir; "su yükseliyor" uyarısı.
- 2026-11-09 · v0.7 · El yapımı bölümlere hız halkası; 2. bölüm ipucu hız halkasını anlatır.
- 2026-11-09 · v0.6 · Katı sol/sağ seçimi, boş atışta ip korunur, karar noktaları, hız halkası, `oyuncu.js` tarzları (sadeceSag/sadeceSol 0/74).
- 2026-11-09 · v0.5 · Ayrıca: tutunurken aşağı çekilme engellendi (iki halka arası döngü), önbellek için `?v=` sürüm etiketi, `tools/oyuncu.js`.
- 2026-11-09 · v0.5 · Nişan yardımı yukarı önceliği, kurtarma kancası, ateşböceği halkaları, hız çarpanı, profil kartı.
- 2026-11-09 · `d1897b3` v0.4 · Hedef işaretleri, ilk bölüm dokunma ipucu, titreşim; engeller kalktı.
- 2026-11-08 · `5a08a7d` Tek el kontrolü (nişan yardımı).
- 2026-11-08 · `8b8c695` v0.3 · Funday Morning açılışı, giriş, tanıtım, ana menü.
- 2026-11-08 · `a04b6c0` v0.2 · Tutunma gücü, akış, sonsuz mod, sınırsız bölümler.
