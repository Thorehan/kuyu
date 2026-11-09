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
- **Ateşböceği alınamıyor olmamalı.** Ateşböcekleri halkanın içindedir; o halkaya tutunmak ya da içinden geçmek yeter. İstemeyen es geçer.

## Sıradaki işler
### 1. Oynanış sorunları
- [x] Nişan yardımı: önce en yakın yukarıdaki hedef; o tarafta yoksa diğer taraftaki yukarı hedef; yukarıda hiç yoksa aşağıdaki.
- [x] Dipte tıkanma: menzilde hiç hedef yokken kurtarma kancası.
- [x] Ateşböceği halkaları: karar noktalarında, kolay alınır, es geçilebilir.

### 2. Geliştirmeler
- [x] Raunttaki en yüksek hız; bölüm sonunda gösterilir ve ödüle çarpan olur.
- [x] Profil kartı: en yüksek hız, en yüksek bölüm, sonsuz modda en yüksek metre ve kat.
- [ ] Ana ekrana ekleme (manifest, simge), tam ekran.
- [ ] Ödül puanının ne işe yarayacağı (mağaza, kozmetik vb.) henüz kararlaştırılmadı.

### 3. Online özellikler
- [ ] (henüz konuşulmadı) Örnek: skor tablosu, arkadaş rekorları, Google/Apple girişi.

### 4. Hikâye
- [ ] Karakter, kaçış nedeni, ateşböceklerinin anlamı.

## Yapılanlar
- 2026-11-09 · v0.5 · Ayrıca: tutunurken aşağı çekilme engellendi (iki halka arası döngü), önbellek için `?v=` sürüm etiketi, `tools/oyuncu.js`.
- 2026-11-09 · v0.5 · Nişan yardımı yukarı önceliği, kurtarma kancası, ateşböceği halkaları, hız çarpanı, profil kartı.
- 2026-11-09 · `d1897b3` v0.4 · Hedef işaretleri, ilk bölüm dokunma ipucu, titreşim; engeller kalktı.
- 2026-11-08 · `5a08a7d` Tek el kontrolü (nişan yardımı).
- 2026-11-08 · `8b8c695` v0.3 · Funday Morning açılışı, giriş, tanıtım, ana menü.
- 2026-11-08 · `a04b6c0` v0.2 · Tutunma gücü, akış, sonsuz mod, sınırsız bölümler.
