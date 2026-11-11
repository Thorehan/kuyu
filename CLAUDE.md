# Kuyu · Claude için çalışma kuralları

Funday Morning Games'in 2D mobil oyunu. Düz HTML + JS (derleme yok), GitHub Pages'te yayında: https://thorehan.github.io/kuyu/ (`main`'e push edilince ~1 dk'da güncellenir). İki ortak **sırayla** çalışır: **Törehan** (Windows) ve **Mustafa** (Mac). Yanıtlar Türkçe.

## 1 · Devir kuralı (en önemli kural)

Projede aynı anda **yalnız bir kişi** geliştirir. Kimin sırası olduğu `docs/DURUM.md` dosyasındaki **"Devir kimde"** satırında yazar; tek doğru kaynak budur.

Her oturumun başında, başka hiçbir şey yapmadan önce:
1. `git pull` (yerelde commit'lenmemiş değişiklik varsa önce kullanıcıya sor, üstüne yazma).
2. `docs/DURUM.md` → "Devir kimde" satırını oku.
3. Karşındaki kişiyi belirle: `git config user.name` ipucu verir; emin değilsen kullanıcıya "Sen Törehan mısın, Mustafa mı?" diye sor.
4. **Devir bu kişide değilse geliştirme yapma:** dosya düzenleme, commit ve push yok. Yalnız okuma, soru yanıtlama ve öneri yapılabilir. Kullanıcıya "Devir şu an X'te; önce X devretmeli (bkz. docs/DEVIR-MUSTAFA.md §6)" de. Kullanıcı ısrar etse bile devri kendin değiştirme: devri yalnız devri elinde tutan kişi devredebilir.

Devir elindeyken iş bitirme ve devretme adımları `docs/DEVIR-MUSTAFA.md` §6'da.

## 2 · Kaynaklar (okuma sırası)

| Dosya | Ne var |
|---|---|
| `docs/DURUM.md` | Devir kimde, son sürüm, sıradaki iş, açık sorular (kısa tutulur) |
| `docs/DEVIR-MUSTAFA.md` | Devir belgesi: kurulum, nasıl çalışılır, nasıl devredilir |
| `README.md` | Oyunun bütün mekanikleri ve sürüm sürüm açıklaması (uzun; gerektiğinde bölüm bölüm oku) |
| `docs/gelistirme-sureci.md` | Geliştirme sırası, yapılanlar günlüğü, yapılacaklar |
| `docs/hikaye.md` | Hikâye "Çıra": tek kaynak, metin kuralları |
| `docs/telefon-testi.md` | Telefonda deneme listesi |

Kod: `js/engine.js` (deterministik fizik ve kurallar, DT 1/120), `js/gen.js` (bölüm, Sonsuz ve Günlük üreticisi), `js/game.js` (çizim, ses, oyun döngüsü, sonuç kartları), `js/screens.js` (menüler), `js/ekonomi.js`, `js/gorev.js`, `js/hayalet.js`, `js/notlar.js`, `js/muzik.js`; stil `css/`.

## 3 · Kalıcı tasarım kararları (Törehan'ın kararları; değiştirmeden önce sor)

- **Mobil, tek elle oynanır.** Ekranın sol yarısı sol hedefe, sağ yarısı sağ hedefe kanca atar. Her özellik 375 px genişlikte denenir.
- **Nişan kuralı:** Yukarısı belirli şartlarda önceliklidir, şartlar sağlanmazsa aşağıdaki seçilir. Sıra: bu taraftaki dik yukarı hedef → yandaki sığ hedef → aşağıdaki. Hattı başka bir dik yukarı halka kesiyorsa o halka alınır. Çıra'nın değdiği halka engel sayılmaz. Yükselirken yukarı hedef 0,35 sn içinde menzile girecekse kanca bekler. Her mekanik değişiklikten sonra `node tools/nisan.js` çalıştırılır, "kurala aykırı" 0 olmalı.
- **Karar önemli olmalı:** Düşünmeden sol-sağ spam ilerletmemeli (`node tools/spam.js`). Tek tarafa basan oyuncu bölüm geçememeli (`node tools/oyuncu.js`: sadeceSag/Sol 0/74).
- **Uçuş ve ip çekme hızı sabit** (`CFG.REEL` 760). İtişler serbest, ama yalnız ustalıkla gelir: TAM bırakış, alevlenme, hız halkası, kanat.
- **Sonsuz Kuyu ana mod.** Yanmak zamanla değil yanlış karardan gelir: su, tutunulan en yüksek noktanın 30 → 18 m altında takip eder (`gen.js` → `suTakip`). Ölçüm `node tools/hata.js`: hatasız oyuncu hiç yanmamalı.
- **Hedef his:** Acele değil, akıcı ve sürekli oynanabilir (Subway Surfers gibi).
- **Ekonomi:** Para birimi ateşböceği. Kozmetik ve devam hakkı için harcanır (25 / 50 / 100, koşuda en çok 3). Güçlendirmeler satın alınmaz, yolda bulunur. Video yalnız oyuncu kendisi seçerse oynar.
- **Görsel tasarım korunur:** Yeni görseller bu yapının üstüne eklenir, baştan tasarım yapılmaz. Hikâye metninde ölüm yok, cümleler kısa.
- **Zorluk yok:** Diken ve taş yok, tek tehlike su.

## 4 · Çalışma biçimi

- Üretici (`gen.js`) rastgele sayı çağrılarının sırasını değiştirmeden ekleme yapar; böylece eski bölümler ve Günlük tohumları aynı kalır.
- **Her değişiklikten sonra:** `node tools/kontrol.js` (sözdizimi ve sürüm etiketi). Mekanik değişiklikte ayrıca şunlar çalıştırılır:
  - `node tools/bot.js` (çıkış 0 olmalı)
  - `node tools/nisan.js`
  - `node tools/oyuncu.js`
  - `node tools/spam.js`
  - `node tools/hata.js 6`
  - ekonomi ölçümü: `node tools/ekonomi-olcum.js` (günde ~98 ateşböceği)
  - birim testleri: `node tools/ekonomi-test.js`, `node tools/gorev-test.js`, `node tools/hayalet-test.js`, `node tools/istatistik-test.js`
- **Yerelde deneme:** Proje klasöründe `python3 -m http.server 8766` (Windows'ta `python`), sonra http://localhost:8766. Tarayıcıda servis çalışanı önbellekler; değişiklik görünmüyorsa kayıtlı servis çalışanını sil ve sayfayı yenile.
- **Sürüm:** Her yayında `index.html` içindeki `?v=0.xx` ve "Kuyu v0.xx" etiketleri birlikte artırılır (`kontrol.js` denetler). README'nin başındaki sürüm ve `docs/gelistirme-sureci.md` "Yapılanlar" bölümü güncellenir.
- **Git:**
  - Commit mesajı "Kuyu v0.xx: kısa başlık" ve madde madde açıklama.
  - Yalnız `main` var. Push edilince Pages yayınlar; `curl https://thorehan.github.io/kuyu/index.html` ile yeni sürüm etiketi doğrulanır.
  - **`main`'e zorla push (force push) yok.** Geri dönüş gerekirse `git revert` ya da etiketten yeni dal açılır.
  - Geri dönüş etiketleri (`geri-donus-v0.17`, `v0.45`, `v0.47`, `v0.51`) silinmez.
- **Gizlilik:** E-posta, anahtar ya da parola dosyalara ve commit'lere yazılmaz.
