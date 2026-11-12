# Kuyu · Durum (kalınan nokta)

> Her oturumun başında okunur, iş bitince güncellenir. Kısa tutulur (~40 satır).

## Devir kimde: **Mustafa** (Mac)

- Devir tarihi: 11/11/2026 · Törehan → Mustafa (Törehan'ın haftalık kullanım sınırı doluyor)
- Devir noktası: v0.51, etiket `geri-donus-v0.51`
- Devir Mustafa'dayken Törehan projede geliştirme yapmaz; geri devir `docs/DEVIR-MUSTAFA.md` §6'daki adımlarla yapılır.

## Son durum (v0.55)

- **Yayında v0.55** (12/11/2026'da Mustafa'nın onayıyla push edildi; v0.52–v0.55 birlikte çıktı).
- Bu dönemde yapılanlar (ayrıntı `docs/yol-haritasi.md`, `README.md`):
  - v0.52: bölge suyu (Hikâye'de zorluk eğrisi, 17. bölümden başlar)
  - v0.53: ekonomi dengesi, Dolap 47 görünüm, Alev rengi, ışık yolu 20 seviye
  - v0.54: Haftalık Kuyu ve lig
  - v0.55: meydan okuma bağlantısı, skor tablosu istemcisi (kapalı), yedek kodu, pazar araştırması
- Testler temiz: bot çıkış 0 · nişanda kurala aykırı 0 · tek taraf 0/74 · spam ile geçilen bölüm 74 → 37/76 · hatasız oyuncu Sonsuz ve Haftalık'ta yanmıyor · ortalama gün ~119 ateşböceği · birim testleri (ekonomi, görev, hayalet, istatistik, online) tamam.
- Telefonda denenmedi: v0.50'den beri hiçbir şey. Liste: `docs/telefon-testi.md` §6.

## Sıradaki iş

1. **Telefonda deneme**, özellikle bölge suyu mesafeleri ve Haftalık Kuyu.
2. **Skor tablosunu açmak:** Supabase hesabı + iki değer (`docs/online-kurulum.md`).
3. İstişare 2'nin kalanı: görsel akıcılık → 24 uzun bölüm (Törehan ile planlanır).

## Açık sorular (Törehan'a)

- Bu dönemde alınan ve oyunun hissine dokunan kararların gözden geçirilmesi: `docs/yol-haritasi.md` → "Törehan'ın gözden geçirmesi için".
- Online için arka uç: öneri Supabase (istemci bu biçimde yazıldı); hesap kimde açılacak?
- Ölçüm (analitik) eklensin mi, hangi hizmet?
- Bekçinin adı. İki para birimi mi, tek mi. Müzik parçaları (Mustafa'dan).

## Devir geçmişi

| Tarih | Kimden → kime | Sürüm | Not |
|---|---|---|---|
| 11/11/2026 | Törehan → Mustafa | v0.51 | İlk devir; `CLAUDE.md`, bu dosya ve `DEVIR-MUSTAFA.md` eklendi |
