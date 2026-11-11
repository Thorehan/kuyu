# Kuyu · Oyun planı ve yol haritası (11/11/2026, v0.55)

Mustafa'nın devir döneminde yazıldı. Dayanak: bot ölçümleri (`tools/denge.js`, `tools/ekonomi-olcum.js`, `tools/hata.js`) ve pazar araştırması (`docs/pazar-arastirmasi.md`). `CLAUDE.md` §3'teki kalıcı kararların hiçbiri değiştirilmedi.

## Oyunun iddiası
Tek elle, dikey, çevrimdışı oynanan; zorla reklamı, enerjisi ve satılan gücü olmayan bir ustalık oyunu. Rakiplerde en çok şikâyet edilen üç şey (zorla reklam, enerji, tekrar) Kuyu'da yok; en çok övülen şey (akıcı kontrol) Kuyu'nun çekirdeği.

## Döngüler
- **Saniyeler:** taraf seç, tutun, doğru anda bırak (akış, TAM, alev).
- **Dakikalar:** bir koşu. Sonsuz 1–3 dk, Haftalık 1–2,5 dk, bölüm 15–20 sn.
- **Gün:** 3 görev, günlük giriş, Günlük Kuyu ve serisi. Ortalama ~119 ateşböceği.
- **Hafta:** Haftalık Kuyu ligi (ödül hafta bitince), 7 günlük giriş takvimi.
- **Aylar:** Dolap (47 görünüm, ~8 hafta), ışık yolu (20 seviye, ~4 ay), başarımlar, Hikâye bölgeleri.

## Bu dönemde yapılanlar (v0.52 – v0.55)
1. Hikâye'de zorluk eğrisi: bölge suyu.
2. Ekonomi: gerçekçi ölçüm, Dolap ve ışık yolu, görev ve başarım hedefleri.
3. Haftalık Kuyu ve lig.
4. Meydan okuma bağlantısı, skor tablosu istemcisi (kapalı), yedek kodu, koleksiyon.
5. Pazar araştırması.

## Sıradaki işler (öneri, sırayla)
1. **Telefonda deneme** (`docs/telefon-testi.md`, yeni 6. bölüm dahil). v0.50'den beri hiçbir ayar gerçek telefonda sınanmadı; bölge suyu mesafeleri (26/22/18 m) ilk bakılacak şey.
2. **Skor tablosunu açmak:** Supabase hesabı + iki değer (`docs/online-kurulum.md`). Sonra girdi kaydı ve sunucuda yeniden oynatma (hile önleme).
3. **Ölçüm:** gerçek oyuncuların 1. ve 7. gün tutundurması. Gizlilik dostu bir hizmet seçimi (Törehan ile).
4. **24 uzun, öğretici bölüm** (Törehan'ın planı). Bölge suyu ve kontrol noktası bu bölümlere taşınır.
5. **Görsel akıcılık** (İstişare 2'nin kalanı): kamera, geçişler, paralaks, su ve ışık.
6. **Sezon takvimi:** tarihe bağlı tema ve süreli ışık ödülleri (arka uç gerekmez).
7. **Karakter koleksiyonu:** Çıra'nın farklı biçimleri (şapka, gözlük, başka korlar). Çizim işi.
8. **Mağaza:** Unity'ye taşıma ya da PWA sarmalayıcı; bildirimler; gelir modeli (reklam kaldırma ya da destekçi paketi + yalnız isteğe bağlı video).

## Törehan'ın gözden geçirmesi için (bu dönemde alınan, oyunun hissine dokunan kararlar)
Her biri ayrı commit; beğenilmezse `git revert` ile tek tek geri alınır.
| Karar | Commit | Geri alınırsa |
|---|---|---|
| 17+ bölümlerde izleyen su ve yanlış tarafta ipin bırakılması | v0.52 | Bölümler yine herkesçe geçilir |
| Görev hedefleri ve başarım eşikleri | v0.53 | Hedefler yeniden çok kolay olur |
| Dolap fiyatları ve yeni ürünler, ışık yolu ödülleri | v0.53 | Dolap 2 haftada biter |
| Haftalık Kuyu kuralları ve lig eşikleri | v0.54 | Mod kalkar |
| Online istemci biçimi (Supabase) | v0.55 | Arka uç seçimi yeniden açılır |

## Bilinçli olarak yapılmayanlar
- Sonsuz Kuyu'nun su ayarı (30 → 18 m), `CFG.REEL`, nişan kuralı, devam bedelleri: kalıcı karar, dokunulmadı.
- İkinci para birimi, satılan güçlendirme, enerji, zorla reklam: kalıcı karara ve araştırmaya aykırı.
- 24 uzun bölüm: Törehan ile konuşulmadan başlanmaz.
- Sahte rakipli skor tablosu: oyuncuyu yanıltır.
- Yeniden deneme hakkı ya da görev yenilemeyi ateşböceğiyle satmak: "kozmetik ve devam hakkı" kararının dışında.
