# Kuyu · Durum (kalınan nokta)

> Her oturumun başında okunur, iş bitince güncellenir. Kısa tutulur (~40 satır).

## Devir kimde: **Mustafa** (Mac)

- Devir tarihi: 11/11/2026 · Törehan → Mustafa (Törehan'ın haftalık kullanım sınırı doluyor)
- Devir noktası: v0.51, etiket `geri-donus-v0.51`
- Devir Mustafa'dayken Törehan projede geliştirme yapmaz; geri devir `docs/DEVIR-MUSTAFA.md` §6'daki adımlarla yapılır.

## Son durum (v0.51)

- Yayında: https://thorehan.github.io/kuyu/
- Son yapılanlar:
  - v0.48: takip eden su
  - v0.49: devam hakkı
  - v0.50: güçlendirmeler (kalkan, fener, kanat) ve su takibi düzeltmesi
  - v0.51: "dokun ve başla" ana ekranı, Bölümler → Hikâye
- Testler temiz:
  - bot çıkış 0
  - nişanda kurala aykırı 0
  - tek tarafa basan oyuncu 0/74
  - ekonomi günde ~98 ateşböceği
  - hata.js: hatasız oyuncu hiç yanmıyor, %10 hata ~2 dk'da yakıyor, spam ~1 dk'da yanıyor
- Telefonda henüz denenmedi: v0.50'nin su ayarı ve v0.51'in ana ekranı.

## Sıradaki iş (İstişare 2'nin kalanı, sırayla)

1. **Telefonda deneme:** `docs/telefon-testi.md`. Özellikle şunlar: su çok mu affediyor, çok mu sert; dokun ve başla; güçlendirmeler.
2. **Görsel akıcılık:**
   - kamera: yumuşak takip, hıza göre bakış
   - ekran ve koşu geçişleri
   - paralaks derinlik (arka duvar katmanları)
   - su ve ışık
3. **24 uzun, öğretici bölüm (4 bölge × 6):** Her yeni mekanik kendi bölümünde öğretilir. Bölümler 1,5–2,5 dk sürer, kontrol noktalıdır. Eski ilerleme, bekçinin notları ve bölge finalleri yeni bölümlere taşınır. En büyük iş bu; başlamadan önce Törehan ile plan konuşulur.

## Açık sorular (Törehan'a)

- Bekçinin adı.
- İki para birimi mi, tek mi (ateşböceği + ödül puanı)?
- Online için arka uç seçimi.
- Müzik: gerçek parçalar Mustafa'dan (`js/muzik.js` → `PARCALAR`, dosyalar `assets/muzik/`).

## Devir geçmişi

| Tarih | Kimden → kime | Sürüm | Not |
|---|---|---|---|
| 11/11/2026 | Törehan → Mustafa | v0.51 | İlk devir; `CLAUDE.md`, bu dosya ve `DEVIR-MUSTAFA.md` eklendi |
