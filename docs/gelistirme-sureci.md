# Kuyu · Geliştirme süreci

Bu belge geliştirme sırasını, kararları ve yapılanları tutar. Claude her turda buradan devam eder.

## Geliştirme sırası (karar: 2026-11-09)
1. **Oynanış sorunları**
2. **Geliştirmeler**
3. **Online özellikler**
4. **Hikâye**: en son. Karakter kim, neden kaçıyor, ateşböcekleri ne işe yarıyor.

Bir aşamadaki işler bitmeden sonrakine geçilmez; yeni bulunan oynanış sorunları her zaman öne alınır.

## Kalıcı kararlar
- **Mobil oyun, tek elle oynanır.** İmleç yok; başparmak ekranın alt kısmında kalır. Her yeni özellik 375 px telefonda tek el ile denenir.
- **Görsel tasarım şimdilik bu haliyle devam eder.** İleride yapılacak görsel düzenleme bu yapının (renkler, yazı tipleri, ekran düzeni, sahne çizimi) üzerine yapılır; baştan tasarım yok.
- **Uçuş hızı iyi.** Kancanın çekme hızına (`CFG.REEL` 760) ve uçuşa yavaşlatma/hızlandırma eklenmez.
- **Şimdilik zorluk yok.** Diken ve taş çıkıntı yok (`gen.js` içinde `HAZARDS = false`). Tek tehlike alttan yükselen su; oyuncu erken kaybetmemeli.
- **Sonsuz Kuyu temposu değişmez** (2026-11-09): "kimse ölmüyor" bir sorun sayılmaz; oyun akışını ciddi etkileyen tempo/zorluk değişikliklerinde acele edilmez, önce konuşulur.
- **El kayması yalnızca Sonsuz Kuyu'da**, bölümlerde yok. **Kusursuz** madalyasında boş atışlar sayılmaz.
- **Ateşböceği alınamıyor olmamalı.** Ateşböcekleri halkanın içindedir; o halkaya tutunmak ya da içinden geçmek yeter. İstemeyen es geçer.

## Yapılacaklar listesi (2026-11-09)
Dört başlık: **oynanış, UI/UX, hikâye, online**. `[~]` üzerinde çalışılıyor, `[?]` senin kararını bekliyor.

### 1. Oynanış
**Bitenler:** tek el sol/sağ kontrolü ve nişan yardımı, kurtarma kancası, ateşböceği ve hız halkaları (karar noktaları), akış, hız çarpanı, su ilk halkadan sonra, bölümlerde el kayması yok, Kusursuz'da boş atış sayılmaz.
- [ ] Telefon denemesi sonuçlarına göre düzeltmeler (`docs/telefon-testi.md`, sende).
- [?] Yeni halka türleri: sallanan halka (zamanlama), yay halkası (sabit fırlatma). Çürük halka zorluk olduğu için ertelendi.
- [?] Ödül puanı ne işe yarayacak: öneri kozmetik dolap (atkı rengi, kanca/ip görünümü, uçuş izi).
- [ ] Günlük Kuyu: herkes aynı gün aynı tohumla aynı sonsuz kuyu (online skor tablosunun zemini).
- [ ] Görevler ve başarımlar (ör. bir koşuda x20 akış, 10 hız halkası, 100 ateşböceği).
- [ ] Bölgeler: her 10–15 bölümde görünüm değişir (taş kuyu → maden → kristal mağara → eski kule).
- [ ] 4. bölüme üçüncü ateşböceği (kutu bulmacası yüzünden yer yok; bölüm düzeni değişmeli).
- [?] Müzik: Mustafa'dan istenecek mi?
- [ ] Yerel istatistik: bölüm başına süre, boş atış, ölüm (denge için).
- Dokunulmayacak: Sonsuz Kuyu su temposu (karar 2026-11-09).

### 2. UI / UX
- [x] **Ana menü düzeni (v0.9):** üst şerit (profil + toplam ödül + ateşböceği), Oyna kartında sıradaki bölümün adı ve hedefleri, başparmak bölgesinde modlar, alt gezinme çubuğu (Ana sayfa / Bölümler / Profil / Ayarlar). İleride Dolap ve Görevler bu çubuğa eklenir.
- [ ] Ana menü için senin geri bildirimin (telefonda).
- [x] Oyun içi duraklatma paneli (v0.10): Devam et, Baştan / Yeni koşu, Bölümü atla, ses ve titreşim, Ana menü. Oyun ve su durur, ip bırakılmaz; telefon arka plana alınınca kendiliğinden durur.
- [x] Oyun içi üst şerit (v0.11): solda bölüm adı ve küçük göstergeler (ateşböceği, atış/par, akış; Sonsuz'da metre, akış, hız çarpanı), sağda duraklat. Atla ve Ses duraklatma paneline taşındı. 360 px'te kesilme yok.
- [x] Bölümler ekranı (v0.12): özet ve ilerleme çubuğu, Tümü / Eksik hedefler filtresi, 1–6 Öğrenme ve 10'arlı gruplar (her grupta ilerleme), geçildi/tam işaretleri, Sıradaki etiketi ve otomatik kaydırma. Bölgeler gelince grup adları bölge adları olur.
- [x] Bölüm sonu kartı (v0.13): alt sayfa; sayarak gelen büyük ödül ve hesabı; madalyalar (bu oyunda ilk kez kazanılan "YENİ" etiketiyle zıplar); süre ve hız göstergeleri (rekor etiketli); büyük "Bölüm N ›", Tekrar, Bölümler. Sonsuz Kuyu kartı aynı yapıda.
- [ ] Yeni şeylerin tanıtımı: hız halkası, ateşböceği halkası, kurtarma kancası ilk görüldüğünde kısa kart.
- [ ] Erişilebilirlik: turkuaz/sarı işaretlerin renk körlüğünde ayırt edilmesi (şekil farkı), yazı boyutu.
- [ ] Görsel düzenleme (ileride): bu yapının üzerine; baştan tasarım yok.

### 3. Oyun hikâyesi (en son ele alınır)
- [ ] Kahraman kim, adı ne?
- [ ] Kuyuya nasıl düştü, neden yukarı kaçıyor; su neyi temsil ediyor?
- [ ] Ateşböcekleri ne işe yarıyor (yol mu gösteriyor, kuyuyu mu aydınlatıyor)? Toplama ile bağlantısı.
- [ ] Kuyunun ağzındaki dünya; kova kimin?
- [ ] Anlatım biçimi: tanıtım sahnesi, bölge geçiş kartları, kısa diyaloglar.
- [ ] Hikâyenin meta ile bağı (bölgeler, kozmetikler).

### 4. Online özellikler
- [?] Arka uç seçimi ve maliyet (Firebase, Supabase vb.).
- [ ] Google / Apple girişi, bulut kayıt (şu an misafir, ilerleme cihazda).
- [ ] Skor tabloları: Sonsuz Kuyu genel ve haftalık, Günlük Kuyu günlük.
- [ ] Hayalet yarışı: koşu "hangi anda hangi taraf" listesiyle birebir tekrar oynatılır (motor deterministik); arkadaşının ya da rekor sahibinin hayaletiyle yarış.
- [ ] Hile denetimi: sunucu gönderilen koşuyu yeniden oynatıp skoru doğrular.
- [ ] Arkadaş rekorları ve "bu kuyuyu benimle oyna" paylaşım bağlantısı.
- [?] Yayın: Unity'ye taşıma zamanı, mağaza hesabı, yalnızca seçilen ödüllü reklam (Pofi kuralı).

## Yapılanlar
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
