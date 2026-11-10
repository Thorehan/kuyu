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
- `geri-donus-v0.17` (2026-11-10): oyun başarılı, halka türleri ve mağaza öncesi. GitHub'da etiket olarak duruyor; dönmek gerekirse o noktadan devam edilir.

## Kalıcı kararlar
- **Mobil oyun, tek elle oynanır.** İmleç yok; başparmak ekranın alt kısmında kalır. Her yeni özellik 375 px telefonda tek el ile denenir.
- **Görsel tasarım şimdilik bu haliyle devam eder.** İleride yapılacak görsel düzenleme bu yapının (renkler, yazı tipleri, ekran düzeni, sahne çizimi) üzerine yapılır; baştan tasarım yok.
- **Uçuş hızı iyi.** Kancanın çekme hızına (`CFG.REEL` 760) ve uçuşa yavaşlatma/hızlandırma eklenmez.
- **Şimdilik zorluk yok.** Diken ve taş çıkıntı yok (`gen.js` içinde `HAZARDS = false`). Tek tehlike alttan yükselen su; oyuncu erken kaybetmemeli.
- **Sonsuz Kuyu temposu değişmez** (2026-11-09): "kimse ölmüyor" bir sorun sayılmaz; oyun akışını ciddi etkileyen tempo/zorluk değişikliklerinde acele edilmez, önce konuşulur.
- **El kayması yalnızca Sonsuz Kuyu'da**, bölümlerde yok. **Kusursuz** madalyasında boş atışlar sayılmaz.
- **Ateşböceği alınamıyor olmamalı.** Ateşböcekleri halkanın içindedir; o halkaya tutunmak ya da içinden geçmek yeter. İstemeyen es geçer.

## Yapılacaklar listesi (2026-11-10)
Altı başlık, geliştirme sırasıyla aynı. `[~]` üzerinde çalışılıyor, `[?]` senin kararını bekliyor.

### 1. Mekanik oynanış
**Bitenler:** tek el sol/sağ kontrolü ve nişan yardımı, kurtarma kancası, ateşböceği ve hız halkaları (karar noktaları), akış, hız çarpanı, su ilk halkadan sonra, bölümlerde el kayması yok, Kusursuz'da boş atış sayılmaz.
- [x] Nişan: yandaki halka yukarıdakinin önüne geçmesin (v0.17). Yukarıdaki hedefler dik ve yandakiler (sığ) diye ayrılır; yan = 3 m'den az yükselen ya da 45°'den düz açıdaki hedef. Önce bu taraftaki dik hedef, yoksa yandaki. Havadayken/ip sarılırken yan seçim %4,8 → %1,2 (`node tools/nisan.js`); kalanlar açıkça yukarıdaki yakın halkalar.
- [ ] Telefon denemesi sonuçlarına göre düzeltmeler (`docs/telefon-testi.md`, sende).
- [~] Yeni halka türleri (2026-11-10 sırası; hepsinde ceza yok, kaçıran yalnızca bonusu kaçırır, uçuş hızı değişmez):
  1. [x] **Rüzgâr şeridi** (v0.18): yolun üstünde yatay şerit; akış x2 ve üstündeyken içinden yukarı geçmek akışı +1 yapar ve puan verir, akış yokken söner. Karar noktası olmayan adımlara konur.
  2. [x] **Yay halkası** (v0.19): ip seni normal hızda çeker, halkaya ulaştığın an okun yönüne (sıradaki hedefe) fırlatır; bırakmak gerekmez, akış sürer. Tepede 1 sn süzülürsün (yavaş oyuncu düşmesin diye; süzülme olmadan ortalama oyuncu Sonsuz'da 13 sn'de yakalanıyordu). Asılarak oynayanı akışa sokar; akışla oynayan zaten halkaya varmadan geçer.
  3. [x] **Geçit çifti** (v0.20): mor giriş halkasına tutun, yaklaşınca (4 m) iki düğüm yukarıdaki mor çıkışa taşınır ve orada asılı kalırsın; akış sürer, düşme yok. Giriş ana yolun alternatifidir (seçim). Arada ateşböceği varsa geçit konmaz (atlatmasın). Bölümlerin 27/74'ünde birer çift, Sonsuz'da 1 km'de 4–5. İleride: çıkışa ateşböceği koyup gizli yol yapmak.
  4. [ ] **Sarkaç halka**: zincirde sallanır; hangi taraftaysa o tarafın işareti onu gösterir. Sol/sağ kararına zamanlama katar, beklemek yeter.
  - Çürük halka zorluk olduğu için ertelendi.
- [ ] 4. bölüme üçüncü ateşböceği (kutu bulmacası yüzünden yer yok; bölüm düzeni değişmeli).
- [ ] Yerel istatistik: bölüm başına süre, boş atış, ölüm (denge için).
- Dokunulmayacak: Sonsuz Kuyu su temposu (karar 2026-11-09).

### 2. Oyun içi akış / alış-satış
- [x] Günlük Kuyu: herkes aynı gün aynı tohumla aynı sonsuz kuyu (online skor tablosunun zemini). v0.15
- [x] Görevler ve başarımlar: günde 3 görev (kolay/orta/zor, ödül puanı), 9 başarım × 3 kademe, Görevler sekmesi. v0.16
Karar (2026-11-10): oyunda güçlendirme yok, **harcamalar yalnızca kozmetik**. Sıra:
1. [ ] Ekonomi: harcanabilir para (cüzdan), neyle kazanılır (bölüm, görev, Sonsuz, günlük giriş), fiyat tablosu. Saatte kazanç bot ölçümüyle.
2. [ ] Günlük giriş ödülü: 7 günlük takvim, 7. gün büyük ödül; "video izle, ikiye katla" (yalnızca oyuncu seçerse, Pofi kuralı). Web sürümünde reklam yok, yer tutucu; gerçek reklam Unity'de.
3. [ ] Mağaza ve dolap mantığı: satın al, kuşan, sahip olunanlar; ilk ürünler basit renk değişimleri (atkı, ip, iz). Asıl görünümler 4. aşamada çizilir.
4. [ ] Görev ödüllerine de "video ile ikiye katla".

### 3. UI / UX
- [x] **Ana menü düzeni (v0.9):** üst şerit (profil + toplam ödül + ateşböceği), Oyna kartında sıradaki bölümün adı ve hedefleri, başparmak bölgesinde modlar, alt gezinme çubuğu (Ana sayfa / Bölümler / Profil / Ayarlar). Görevler v0.16'da eklendi; Dolap 4. aşamada.
- [ ] Ana menü için senin geri bildirimin (telefonda).
- [x] Oyun içi duraklatma paneli (v0.10): Devam et, Baştan / Yeni koşu, Bölümü atla, ses ve titreşim, Ana menü. Oyun ve su durur, ip bırakılmaz; telefon arka plana alınınca kendiliğinden durur.
- [x] Oyun içi üst şerit (v0.11): solda bölüm adı ve küçük göstergeler (ateşböceği, atış/par, akış; Sonsuz'da metre, akış, hız çarpanı), sağda duraklat. Atla ve Ses duraklatma paneline taşındı. 360 px'te kesilme yok.
- [x] Bölümler ekranı (v0.12): özet ve ilerleme çubuğu, Tümü / Eksik hedefler filtresi, 1–6 Öğrenme ve 10'arlı gruplar (her grupta ilerleme), geçildi/tam işaretleri, Sıradaki etiketi ve otomatik kaydırma. Bölgeler gelince grup adları bölge adları olur.
- [x] Bölüm sonu kartı (v0.13): alt sayfa; sayarak gelen büyük ödül ve hesabı; madalyalar (bu oyunda ilk kez kazanılan "YENİ" etiketiyle zıplar); süre ve hız göstergeleri (rekor etiketli); büyük "Bölüm N ›", Tekrar, Bölümler. Sonsuz Kuyu kartı aynı yapıda.
- [x] Tanıtım kartları (v0.14): ateşböceği halkası, hız halkası, ahşap, kutu, su, akış, boş atış, kurtarma kancası, el yorulması ilk görüldüğünde oyun durur ve kısa kart çıkar; her biri bir kez. Ayarlar → "Tanıtım kartlarını yeniden göster".
- [ ] Erişilebilirlik: turkuaz/sarı işaretlerin renk körlüğünde ayırt edilmesi (şekil farkı), yazı boyutu.

### 4. Görsellik (şimdilik öncelik değil)
- [ ] Kozmetik dolap: atkı rengi, kanca/ip görünümü, uçuş izi (2. aşamadaki mağaza mantığının görünümleri).
- [ ] Bölgeler: her 10–15 bölümde görünüm değişir (taş kuyu → maden → kristal mağara → eski kule).
- [ ] Görsel düzenleme: bu yapının üzerine; baştan tasarım yok.
- [?] Müzik: Mustafa'dan istenecek mi?

### 5. Online özellikler
- [?] Arka uç seçimi ve maliyet (Firebase, Supabase vb.).
- [ ] Google / Apple girişi, bulut kayıt (şu an misafir, ilerleme cihazda).
- [ ] Skor tabloları: Sonsuz Kuyu genel ve haftalık, Günlük Kuyu günlük.
- [ ] Hayalet yarışı: koşu "hangi anda hangi taraf" listesiyle birebir tekrar oynatılır (motor deterministik); arkadaşının ya da rekor sahibinin hayaletiyle yarış.
- [ ] Hile denetimi: sunucu gönderilen koşuyu yeniden oynatıp skoru doğrular.
- [ ] Arkadaş rekorları ve "bu kuyuyu benimle oyna" paylaşım bağlantısı.
- [?] Yayın: Unity'ye taşıma zamanı, mağaza hesabı, yalnızca seçilen ödüllü reklam (Pofi kuralı).

### 6. Oyun hikâyesi (en son ele alınır)
- [ ] Kahraman kim, adı ne?
- [ ] Kuyuya nasıl düştü, neden yukarı kaçıyor; su neyi temsil ediyor?
- [ ] Ateşböcekleri ne işe yarıyor (yol mu gösteriyor, kuyuyu mu aydınlatıyor)? Toplama ile bağlantısı.
- [ ] Kuyunun ağzındaki dünya; kova kimin?
- [ ] Anlatım biçimi: tanıtım sahnesi, bölge geçiş kartları, kısa diyaloglar.
- [ ] Hikâyenin meta ile bağı (bölgeler, kozmetikler).

## Yapılanlar
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
