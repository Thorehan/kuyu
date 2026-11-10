# Kuyu

**Funday Morning Games** · 2D mobil oyun · prototip v0.18

Derin bir kuyunun dibindesin. Telefonu tek elle tut: ekranın soluna ya da sağına dokun, kanca o taraftaki hedefe fırlasın; basılı tut, ipe sarıl; bırak, savrul. Halkadan halkaya, ahşaptan ahşaba tırmanıp kuyudan çık.

**Canlı sürüm:** https://thorehan.github.io/kuyu/

**Geliştirme sırası ve kararlar:** [docs/gelistirme-sureci.md](docs/gelistirme-sureci.md) (oynanış sorunları → geliştirmeler → online → hikâye)

## Telefona kurulum
- **Android (Chrome):** menü → "Ana ekrana ekle" / "Uygulamayı yükle". **iPhone (Safari):** Paylaş → "Ana Ekrana Ekle".
- Ana ekrandan açılınca tam ekran ve dikey açılır; bir kez açıldıktan sonra **internetsiz** de çalışır (`sw.js`).
- Kurmadan tarayıcıda oynayanlar Ayarlar → **Tam ekran** ile tarayıcı çubuklarını gizleyebilir (Android).
- Simgeler `tools/simge.py` ile çizilir (`assets/icons/`).
- Telefonda denerken: [docs/telefon-testi.md](docs/telefon-testi.md)

## Açılış ve menü
Pofi ile aynı akış:
1. **Açılış:** Funday Morning logosu ve yükleme çubuğu (en az 2,2 sn, yazı tipleri ve logo yüklenene kadar).
2. **Giriş:** Yalnızca ilk açılışta. Oyuncu adı ve "Misafir olarak oyna". Google ve Apple düğmeleri şimdilik "yakında" der. İlerleme bu cihazda saklanır.
3. **Tanıtım:** "Funday Morning sunar", ardından kahraman dipten kanca atıp halkaya çekilir ve gün ışığına fırlar; "Kuyu" yazısı belirir. Dokununca geçilir.
4. **Ana menü (v0.9):** Arka planda kuyunun içinde ipte sallanan kahraman ve ateşböcekleri. Üstte profil (avatar ve ad), toplam ödül puanı ve ateşböceği. Başparmak bölgesinde Oyna kartı (kalınan bölümün adı ve hedefleri), Sonsuz Kuyu (rekor) ve Günlük Kuyu (günün en iyisi ve seri) kartları. En altta gezinme çubuğu: Ana sayfa, Bölümler, Görevler, Profil, Ayarlar (ses, titreşim, tam ekran, oyuncu adı, nasıl oynanır, tanıtımı yeniden izle).

Oyun ekranının üst şeridinde solda bölüm adı ve altında küçük göstergeler var: ateşböceği noktaları, atış/par (Kusursuz için), akış (x2 ve üstünde parlar). Sonsuz Kuyu'da metre, akış ve hız çarpanı, sağda büyük puan. Oyundaki **duraklat** düğmesi (II) paneli açar: Devam et, Baştan başla (Sonsuz'da Yeni koşu), Bölümü atla, ses ve titreşim, Ana menü. Duraklarken oyun ve su durur, tutunduğun ip bırakılmaz. Telefon arka plana alınınca (bildirim, arama) oyun kendiliğinden durur. Klavyede Esc ya da P duraklatır, Esc/Enter/Boşluk devam ettirir. `?bolum=N` ya da `?mod=sonsuz` bağlantısı açılıştan sonra tanıtımı atlayıp doğrudan oyuna girer.

## Tek el kontrolü
- **Hedefe dokunmak gerekmez, ama taraf seçmek gerekir.** Ekran ikiye bölünür: sol yarıya basınca kanca sol taraftaki hedefe, sağ yarıya basınca sağ taraftakine atılır. Sol/sağ kararı oyuncunundur; hep aynı tarafa basarak geçilemez.
- Nişan yardımı (`engine.aim`) bastığın tarafta, menzilde ve görüşte olan hedefi şu sırayla seçer:
  1. Bu taraftaki **en yakın dik yukarı** hedef (halka, ahşap, kova, kutu). Önce gerçekten o taraftakiler; tam tepedeki hedef (yatayda ±40 birim) iki taraftan da alınır ama ikinci sırada gelir. Böylece iki işaret mümkün olduğunca farklı seçenek gösterir.
  2. Dik hedef yoksa bu taraftaki **yandaki** (sığ) hedef: 3 m'den az yükselen ya da 45°'den düz açıdaki hedef (v0.17). Yandaki yakın halka, aynı taraftaki daha yukarıdaki hedefin önüne geçmez.
  3. Tutunmuyorsan (düşerken, yerdeyken) bu taraftaki en yakın aşağı hedef. Tutunurken aşağıya hiç atılmaz.
  4. **Bu tarafta hedef yoksa:** kanca o yöne boşa gidip döner, tutunduğun ip **bırakılmaz**. Ceza yok; kaybedilen biraz zaman ve bir atış. İşaretlerde o tarafa soluk bir "×" konur.
  5. **İki tarafta da menzilde hedef yoksa** (dipte tıkanma) **kurtarma kancası** en yakın yukarı hedefe uzanır (en çok 1000 birim, çift hızla). Akışı bozar, bir atış sayılır.
- "Yukarı", asılı olduğun noktanın (havadaysan kendi konumunun) en az 30 birim üstü demektir; aynı yükseklikteki yan halka yukarı sayılmaz. Ayarlar `CFG.UP_RISE` (60) ve `CFG.UP_ANGLE` (45). Denetim: `node tools/nisan.js`.
- **Hedef işaretleri:** sol yarının hedefi turkuaz, sağ yarınınki sarı kesikli halka ve okla gösterilir.
- **İlk bölüm ipucu**, **titreşim** ve tablet/fare için hedefe doğrudan dokunma önceki sürümdeki gibi.

## Karar noktaları
Her 2–3 adımda bir ana halkanın karşı tarafında ikinci bir halka durur; ikisi de ileri götürür:
- **Ateşböceği halkası** (sarı parlar): tutunmak ya da içinden geçmek ateşböceğini alır.
- **Hız halkası** (mavi, yukarı oklu): bırakınca 650 birim/sn yukarı itiş verir. Asılıp durduktan sonra bırakınca yaklaşık 32 m/sn (x1,25), çekilirken bırakınca en yüksek hız (57 m/sn, x1,50).
- Üretilen bölümlerde adımların %37'si karar noktası, iki karar arası en fazla 5 adım. El yapımı bölümlerde hız halkası 2. bölümde tanıtılır (ipucu anlatır); 2, 3 ve 4. bölümde birer, 5. bölümde iki tane var. 1. bölüm yalnızca ateşböceğiyle sade kalır, 6. bölümde yer uygun değildi. 5. bölümde hız halkası ile üçüncü ateşböceğine giden yol ayrı: oyuncu hangisini istediğini seçer.

## Tanıtım kartları
Yeni bir şey ilk kez karşına çıktığında oyun kısa süre durur, ekranın altında bir kart açılır (simge, başlık, bir iki cümle, "Anladım"; karta dokunmak da kapatır). Kartlar: ateşböceği halkası, hız halkası, rüzgâr şeridi, ahşap, kutu ve düğme, su yükseliyor, akış, boş atış, kurtarma kancası, el yorulur (Sonsuz Kuyu). Her biri bir kez gösterilir; Ayarlar → "Tanıtım kartlarını yeniden göster" ile sıfırlanır.

## Ateşböceği halkaları
- Ateşböcekleri artık serbest durmuyor; **halkanın içinde**. O halkaya tutunmak ya da içinden geçmek yeter.
- Halkalar **karar noktalarında**: ana yoldaki bir halkanın karşı tarafında, aynı yükseklik civarında. Oradan sıradaki halkaya da ulaşılabilir. İstemeyen ana halkaya gidip es geçer.
- İşaret ateşböceği halkasını gösteriyorsa o yana dokunmak yeter. Gerçek oyuncu gibi oynayan bot ateşböceklerinin 215/221'ini yalnızca işaretlere bakarak topluyor.
- El yapımı bölümlerde 3 (Kutu bölümünde 2), üretilen bölümlerin 73/74'ünde 3, sonsuz kuyuda ara ara.

## Rüzgâr şeridi (v0.18)
Yolun üstünde, bir halkadan sıradakine giden hatta duran yatay şerit (112 birim genişlik). Tutunulmaz, kancayı durdurmaz.
- **Akış x2 ve üstündeyken** şeridi aşağıdan yukarı geçersen akış +1 olur ve havada kalma süresi tazelenir; Sonsuz Kuyu'da akış puanı gelir. Şerit o anda altın renginde yanar.
- Akış yokken şerit soluk ve kesiklidir, geçmek bir şey vermez. Ceza yok.
- Üretici şeridi yalnızca karar noktası olmayan adımlara koyar (yol tek), en az bir adım arayla; rastgele sayı kullanmaz, mevcut bölümler ve Günlük Kuyu tohumları değişmez. El yapımı 1–6. bölümlerde şerit yok.
- Botlarla (74 üretilen bölümde 164 şerit): akışla oynayan %79'unu, asılarak oynayan ~%40'ını, tek tarafa basan hiçbirini almaz.

## Hız ve ödül
- **En yüksek hız:** Raunt boyunca ipte değilken, yukarı ya da yana giderken ulaşılan en yüksek hız (m/sn). Kancanın çekme hızı ve düşüş sayılmaz. Bekleyerek oynayan yaklaşık 5–6 m/sn, ipi erken bırakıp zincirleyen 40–57 m/sn.
- **Hız çarpanı:** 10 m/sn'den sonra başlar, 57,5 m/sn'de en yüksek: x1,00 – x1,50 (0,05 adımlarla).
- **Bölüm ödülü** = (100 + 25 × ateşböceği + 50 Kusursuz + 50 Akış) × hız çarpanı.
- **Bölüm sonu kartı** ekranın altından açılır: ödül sayarak gelir ve hesabı yazılır, üç madalya (bu oyunda ilk kez kazanılan "YENİ" etiketiyle), süre ve en yüksek hız (kırılan rekorlar "REKOR" etiketiyle), büyük "Bölüm N ›" düğmesi, Tekrar ve Bölümler. Sonsuz Kuyu sonucu da aynı yapıda.
- **Sonsuz Kuyu puanı** = (metre + akış bonusu + ateşböcekleri) × hız çarpanı.

## Görevler ve başarımlar (v0.16)
Alt menüdeki **Görevler** sekmesinde iki bölüm var. Mantık `js/gorevler.js` içinde, testi `node tools/gorev-test.js`.

**Bugünün görevleri:** Her gün 3 görev gelir: kolay, orta ve zor, üçü de farklı türden. Görevler o gün herkes için aynıdır ve Türkiye saatiyle gece yarısı yenilenir. Ödüller 50, 100 ve 150 ödül puanıdır. Tamamlanan görevde "Al" düğmesi çıkar; alınan puan ana menüdeki toplam ödüle eklenir. Alınmamış ödül varsa alt menüdeki Görevler simgesinde turuncu nokta yanar.

Görev türleri ve kolay / orta / zor hedefleri:

| Tür | Kolay / Orta / Zor | Sayım |
|---|---|---|
| Ateşböceği topla | 5 / 10 / 18 | gün boyu toplam |
| Hız halkasından geç | 2 / 5 / 9 | gün boyu toplam |
| Bir koşuda xN akış | 6 / 10 / 16 | tek koşu |
| Bölüm geç | 2 / 4 / 7 | gün boyu toplam |
| Kusursuz bölüm | 1 / 2 / 4 | gün boyu toplam |
| Tek koşuda N m (Sonsuz ya da Günlük) | 150 / 300 / 550 | tek koşu |
| Günlük Kuyu denemesi | 1 / 2 / 3 | gün boyu toplam |
| Bir koşuda N m/sn hız | 25 / 40 / 52 | tek koşu |
| Rüzgâr şeridinden geç | 2 / 5 / 9 | gün boyu toplam |

Hedefler botların ölçtüğü oynanışa göre seçildi. Ortalama oyuncu Sonsuz Kuyu'da yaklaşık 450 m çıkıyor. Bir hız halkası yaklaşık 33 m/sn veriyor, x1,50 çarpanda hız yaklaşık 57 m/sn.

**Koşu:** Geçilen bir bölüm ya da biten bir Sonsuz veya Günlük Kuyu koşusu. Bölümde ölüp yeniden başlamak koşu sayılmaz.

**Başarımlar:** Kalıcıdır. 9 başarımın her birinde Bronz, Gümüş ve Altın kademesi var:

| Başarım | Ölçü | Bronz / Gümüş / Altın |
|---|---|---|
| Ateşböceği avcısı | toplam ateşböceği | 25 / 100 / 400 |
| Rüzgâr | toplam hız halkası | 10 / 50 / 200 |
| Akış ustası | bir koşuda en uzun akış | x10 / x20 / x40 |
| Işık hızı | en yüksek hız | 30 / 45 / 55 m/sn |
| Kâşif | geçilen bölüm | 10 / 30 / 100 |
| Kusursuz | Kusursuz geçilen bölüm | 5 / 20 / 60 |
| Derin kuyu | bir koşuda en yüksek metre | 300 / 1000 / 3000 |
| Sadık | en uzun Günlük Kuyu serisi | 3 / 7 / 30 gün |
| Görevci | tamamlanan görev | 5 / 25 / 100 |

Önceki ilerleme de sayılır: bölüm ateşböcekleri, Sonsuz rekoru, en yüksek hız ve seri kayıttan okunur. Yeni kazanılan görev ve başarımlar bölüm sonu ile Sonsuz/Günlük sonuç kartında gösterilir (en çok 3 satır, fazlası için "ve N tane daha").

## Profil kartı
Ana menüde "Merhaba, {ad}" düğmesi açar: en yüksek hız; en yüksek ve geçilen bölüm, ateşböceği, Kusursuz/Akış sayısı, toplam ve en iyi bölüm ödülü; Sonsuz Kuyu rekor puanı, en yüksek metre, kat (3 m = 1 kat) ve en uzun akış.

## Zorluk
Şimdilik zorluk yok: diken ve taş çıkıntı kaldırıldı (`js/gen.js` içinde `HAZARDS = false`, el yapımı bölümlerde de yok). Tek tehlike alttan yükselen su, o da yavaş başlar; amaç oyuncunun erken kaybetmemesi.

## Oynanış
- **Bas ve tut:** Kanca parmağının yönüne fırlar. Halka ya da ahşaba saplanırsa seni oraya çeker. Kutu gibi hafif şeyleri sana çeker. Taş kancayı tutmaz.
- **Bırak:** İpten kopar, o anki hızınla savrulursun. İp tam sarılmadan bırakmak seni halkanın ötesine fırlatır.
- **Tutunma gücü:** Asılı kalmak bedava değil. İpin ucunda asılıyken oyuncunun çevresindeki yay azalır; bitince el kayar.
- **El kayması yalnızca Sonsuz Kuyu'da.** Bölümlerde asılı kalınabilir (akış yine bozulur).
- **Akış:** İp tam sarılmadan bırakıp havadayken sıradaki noktaya tutunursan akış sayacı artar. 0,45 sn'den uzun asılı kalmak, yere basmak ya da 1,1 sn tutunmadan havada kalmak akışı bitirir.
- **Tehlike:** Bazı bölümlerde ve sonsuz modda su aşağıdan yükselir.

## Modlar
### Bölümler
- İlk 6 bölüm elle tasarlandı ve her biri bir şey öğretir: halka, ahşap duvarlar, zikzak, kutu ve düğme, yükselen su, hepsi bir arada.
- 7. bölümden sonrası **sınırsız**: `js/gen.js` her bölümü numarasından üretir; aynı numara her zaman aynı bölümü verir.
- **Bütün bölümler açık.** Bölümler ekranında üstte özet ve ilerleme çubuğu, "Tümü / Eksik hedefler" filtresi var. Bölümler 1–6 "Öğrenme" ve ardından 10'arlı gruplar hâlinde; her grubun ilerleme çubuğu var. Geçilen bölümde onay, tüm hedefleri tamamlanmışta yıldız görünür. Geçilmemiş ilk bölüm "Sıradaki" etiketiyle işaretlenir ve ekran açılınca oraya kaydırılır. İstediğin bölüme dokun ya da numarasını yaz. Oyun sırasında **Atla** düğmesi sınırsız ve ücretsizdir.
- Doğrudan bağlantı: adresin sonuna `?bolum=25` ekle.
- Her bölümde üç hedef:
  - **Ateşböceği:** üçünü de topla. Biri genelde ipi erken bırakıp fırlayarak alınır.
  - **Kusursuz:** bölümü en fazla `par` atışla bitir. Hedef olmayan tarafa basılan boş atışlar sayılmaz; kurtarma kancası sayılır.
  - **Akış:** bölümde en az `flow` uzunluğunda bir akış zinciri kur.

### Sonsuz Kuyu
- Bölüm yok; kuyu tırmandıkça yukarı doğru üretilir. Su durmadan yükselir ve tırmandıkça hızlanır.
- **Puan** = tırmanılan metre + akış bonusu + ateşböcekleri (25'er).
- Akışlı her tutunma `min(akış, 12) × 3` puan verir. Asılıp bekleyerek de çıkılabilir, ama su bir noktadan sonra bekleyen oyuncuyu yakalar. Az tutunup zincir kuran oyuncu hem daha uzun yaşar hem çok daha fazla puan toplar.
- Doğrudan bağlantı: `?mod=sonsuz`

### Günlük Kuyu (v0.15)
- Sonsuz Kuyu'nun kuralları, ama tohum günün tarihinden üretilir: o gün herkes **aynı kuyuyu** oynar. Gün sınırı herkes için İstanbul saati (UTC+3); yeni kuyu Türkiye'de gece yarısı gelir.
- Deneme sınırsız; günün en iyi puanı, en yüksek metresi ve deneme sayısı saklanır. Sonuç kartında yeni kuyuya kalan süre yazar.
- **Seri:** art arda her gün en az bir deneme yaparsan seri büyür; bir gün kaçarsa 1'den başlar. En uzun seri de saklanır.
- Ana menüde Günlük Kuyu kartı, Profil'de Günlük Kuyu bölümü (bugünün en iyisi, seri, en uzun seri, bugünkü deneme).
- Online skor tablosunun zemini: aynı tohum, aynı kuyu. Doğrudan bağlantı: `?mod=gunluk`

## Denge değerleri
Hepsi `js/engine.js` başındaki `CFG` içinde, sonsuz modun suyu `js/gen.js` içinde `waterSpeed`.

| Değer | Şu an | Ne yapar |
|---|---|---|
| `GRIP` | 2,2 sn (bölüm 1–2: 3,0; üretilen bölümler: 1,8; sonsuz: 1,4) | Asılı kalınabilecek süre |
| `EARLY` | 0,25 sn | Bundan kısa asılıp bırakmak akışı sürdürür |
| `COMBO_HANG` | 0,45 sn | Bundan uzun asılı kalmak akışı bitirir |
| `COMBO_AIR` | 1,1 sn | Havada bundan uzun tutunmadan kalmak akışı bitirir |
| `COMBO_PTS` × `COMBO_CAP` | 3 × 12 | Akış bonusu (tutunma başına en çok 36) |
| Sonsuz su hızı | 38 + metre × 0,3, en çok 300 birim/sn (`gen.js` → `ENDLESS_WATER`) | Değiştirilmiyor (karar 2026-11-09). `node tools/tempo.js` üç sanal oyuncunun ne zaman yakalandığını ölçer: şu an tepki süresi olan ortalama ve iyi oyuncu yaklaşık 1 dk 20 sn, akışla oynayan 20 dk+ |
| `WATER_GRACE` | 1 sn | Su ilk halkaya tutununca tetiklenir, bu kadar sonra yükselmeye başlar; oyuncu başlamadan beklerken su gelmez |
| Bölüm suyu | 5. bölüm 80; üretilen her 3. bölümde 45 + n × 0,5, en çok 90 | |

Bot ölçümü (8 tohum, sonsuz mod, engel yok): iki tarz da 1500 m test sınırına ulaşıyor. Asılıp bekleyen bot yaklaşık 3.000 puan, akışla çıkan bot 7.000–7.400 puan topluyor.

## Yerelde çalıştırma
```bash
python -m http.server 8766
```
Sonra `http://localhost:8766` adresini aç.

## Doğrulama botu
```bash
node tools/bot.js
```
Bot oyunun kendi fizik motoruyla oynar:
- El yapımı 6 bölümü iki tarzda oynar: "rahat" (her noktada asılır) ve "akış" (ip tam sarılmadan sıradakine atılır). Hepsini geçmeli, ateşböceklerini toplamalı ve madalya hedeflerine ulaşmalı.
- Üretilen 7–80. bölümleri oynar. Rahat koşu hepsini geçmek zorunda.
- Sonsuz modu 8 farklı tohumla iki tarzda oynar ve metre/puanı yazar.

`node tools/bot.js 3 --trace` tek bölümü ayrıntılı gösterir, `node tools/bot.js --gen 200` üretilen bölümleri 200'e kadar dener.

Tek el (gerçek oyuncu) denetimi:
```bash
node tools/oyuncu.js
```
Bot rota bilmez; yalnızca ekrandaki sol ve sağ işarete bakar. Sonuçlar (6 el yapımı + 74 üretilen bölüm):

| Tarz | Ne yapar | Sonuç |
|---|---|---|
| `isaret` | daha yukarıdaki işarete dokunur | 80/80 geçer, ateşböceği 123/221, ort. hız x1,21 |
| `ates` | ateşböceği halkası gösteren işareti seçer | 80/80 geçer, ateşböceği 214/221 (el yapımlarda hepsi) |
| `hiz` | hız halkası gösteren işareti seçer | 80/80 geçer, ort. hız x1,27 |
| `akis` | ipi erken bırakıp zincirler | 80/80 geçer, hız x1,50 |
| `sadeceSag` / `sadeceSol` | hep aynı yarıya basar | **0/74 geçer** (sol/sağ kararı gerçekten gerekli) |

`tools/bot.js` ayrıca her bölümde ateşböceği rotasını (`ffRoute`) oynar ve bütün ateşböceklerinin alınabildiğini doğrular.

## Proje yapısı
| Dosya | İçerik |
|---|---|
| `index.html` | Sayfa: oyun, açılış, giriş, tanıtım, ana menü, bölümler, ayarlar |
| `css/kuyu.css` | Oyun ekranının görünümü |
| `css/ekranlar.css` | Açılış, giriş, tanıtım ve menü görünümü |
| `js/engine.js` | Kanca fiziği, tutunma gücü, akış ve puan (tarayıcı + Node) |
| `js/levels.js` | El yapımı 6 bölüm |
| `js/gen.js` | Bölüm 7+ ve sonsuz kuyu üretici |
| `js/gorevler.js` | Günlük görevler ve başarımlar (tarayıcı + Node) |
| `js/game.js` | Oyun ekranı: çizim, ses, girdi, kayıt |
| `js/screens.js` | Açılış, giriş, tanıtım, ana menü, bölümler, ayarlar ve arka plan sahnesi |
| `assets/funday-morning-logo.webp` | Şirket logosu (Pofi ile aynı) |
| `tools/bot.js` | Doğrulama botu (koordinatla oynar) |
| `tools/oyuncu.js` | Gerçek oyuncu gibi tek elle oynayan bot (yalnızca işaretlere bakar) |
| `docs/gelistirme-sureci.md` | Geliştirme sırası, kalıcı kararlar, yapılanlar |
| `docs/telefon-testi.md` | Telefonda 10 dakikalık deneme listesi |
| `sw.js`, `manifest.webmanifest` | Ana ekrana kurulum ve internetsiz açılış |
| `tools/kontrol.js` | Duman testi: sözdizimi, sayfa bağlantıları, servis çalışanı listesi, sürüm etiketi |
| `tools/tempo.js` | Sonsuz Kuyu su temposu ölçümü |
| `tools/gorev-test.js` | Görev ve başarım mantığı testi |
| `tools/nisan.js` | Nişan denetimi: işaret yandaki sığ hedefi mi gösteriyor |
| `tools/simge.py` | Uygulama simgelerini çizer |

Düz JavaScript, derleme adımı yok. Her yayında `index.html` içindeki `?v=` sürüm etiketini artırın ve `node tools/kontrol.js` çalıştırın; yeni bir js/css dosyası eklenirse `sw.js` listesine de yazılmalı; yoksa telefonlar eski CSS/JS'i önbellekten kullanabilir. Kayıt tarayıcıda `kuyu.v2` anahtarıyla tutulur.
