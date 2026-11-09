# Kuyu

**Funday Morning Games** · 2D mobil oyun · prototip v0.4

Derin bir kuyunun dibindesin. Telefonu tek elle tut: ekranın soluna ya da sağına dokun, kanca o taraftaki hedefe fırlasın; basılı tut, ipe sarıl; bırak, savrul. Halkadan halkaya, ahşaptan ahşaba tırmanıp kuyudan çık.

**Canlı sürüm:** https://thorehan.github.io/kuyu/

## Açılış ve menü
Pofi ile aynı akış:
1. **Açılış:** Funday Morning logosu ve yükleme çubuğu (en az 2,2 sn, yazı tipleri ve logo yüklenene kadar).
2. **Giriş:** Yalnızca ilk açılışta. Oyuncu adı ve "Misafir olarak oyna". Google ve Apple düğmeleri şimdilik "yakında" der. İlerleme bu cihazda saklanır.
3. **Tanıtım:** "Funday Morning sunar", ardından kahraman dipten kanca atıp halkaya çekilir ve gün ışığına fırlar; "Kuyu" yazısı belirir. Dokununca geçilir.
4. **Ana menü:** Kuyunun içinde ipte sallanan kahraman ve ateşböcekleri. "Oyna" kalınan bölümden devam eder. "Sonsuz Kuyu" kartı rekoru, "Bölümler" kartı geçilen bölüm ve hedef sayısını gösterir. Sağ üstte Ayarlar: ses, oyuncu adı, hesap bilgisi, nasıl oynanır, tanıtımı yeniden izle.

Oyundaki menü düğmesi ana menüye döner; oyun (ve su) orada bekler. `?bolum=N` ya da `?mod=sonsuz` bağlantısı açılıştan sonra tanıtımı atlayıp doğrudan oyuna girer.

## Tek el kontrolü
- **Hedefe dokunmak gerekmez.** Başparmağın ekranın neresine bastığı yalnızca yönü seçer: sol taraf sol yukarı, orta düz yukarı, sağ taraf sağ yukarı. Nişan yardımı (`engine.aim`) o yönde menzilde ve görüşte olan en uygun halkayı, kovayı, ahşabı ya da kutuyu seçer. Ahşapta menzile giren en yüksek noktaya tutunulur.
- **Hedef işaretleri:** Sola dokununca gidilecek hedefin çevresinde turkuaz, sağa dokununca gidilecek hedefin çevresinde sarı kesikli halka ve ok durur. İkisi aynı hedefse tek halka iki okla görünür.
- **İlk bölüm ipucu:** 1. bölüm ilk kez oynanırken ekranın alt yarısı turkuaz (sol) ve sarı (sağ) olarak ikiye ayrılır, "Sola dokun / Sağa dokun" yazar. Dört tutunmadan sonra kaybolur.
- **Titreşim:** Tutunma, ateşböceği, kapak açılması, el kayması, ölüm ve kazanmada kısa titreşim. Ayarlar'dan kapatılır. Android tarayıcılarında çalışır; iOS Safari titreşimi desteklemez.
- Tablet ya da farede hedefin tam üstüne basılırsa doğrudan o hedef alınır.

## Zorluk
Şimdilik zorluk yok: diken ve taş çıkıntı kaldırıldı (`js/gen.js` içinde `HAZARDS = false`, el yapımı bölümlerde de yok). Tek tehlike alttan yükselen su, o da yavaş başlar; amaç oyuncunun erken kaybetmemesi.

## Oynanış
- **Bas ve tut:** Kanca parmağının yönüne fırlar. Halka ya da ahşaba saplanırsa seni oraya çeker. Kutu gibi hafif şeyleri sana çeker. Taş kancayı tutmaz.
- **Bırak:** İpten kopar, o anki hızınla savrulursun. İp tam sarılmadan bırakmak seni halkanın ötesine fırlatır.
- **Tutunma gücü:** Asılı kalmak bedava değil. İpin ucunda asılıyken oyuncunun çevresindeki yay azalır; bitince el kayar.
- **Akış:** İp tam sarılmadan bırakıp havadayken sıradaki noktaya tutunursan akış sayacı artar. 0,45 sn'den uzun asılı kalmak, yere basmak ya da 1,1 sn tutunmadan havada kalmak akışı bitirir.
- **Tehlike:** Bazı bölümlerde ve sonsuz modda su aşağıdan yükselir.

## Modlar
### Bölümler
- İlk 6 bölüm elle tasarlandı ve her biri bir şey öğretir: halka, ahşap duvarlar, zikzak, kutu ve düğme, yükselen su, hepsi bir arada.
- 7. bölümden sonrası **sınırsız**: `js/gen.js` her bölümü numarasından üretir; aynı numara her zaman aynı bölümü verir.
- **Bütün bölümler açık.** Menüde istediğin bölüme dokun ya da numarasını yaz. Oyun sırasında **Atla** düğmesi sınırsız ve ücretsizdir.
- Doğrudan bağlantı: adresin sonuna `?bolum=25` ekle.
- Her bölümde üç hedef:
  - **Ateşböceği:** üçünü de topla. Biri genelde ipi erken bırakıp fırlayarak alınır.
  - **Kusursuz:** bölümü en fazla `par` atışla bitir (boşa atış yok).
  - **Akış:** bölümde en az `flow` uzunluğunda bir akış zinciri kur.

### Sonsuz Kuyu
- Bölüm yok; kuyu tırmandıkça yukarı doğru üretilir. Su durmadan yükselir ve tırmandıkça hızlanır.
- **Puan** = tırmanılan metre + akış bonusu + ateşböcekleri (25'er).
- Akışlı her tutunma `min(akış, 12) × 3` puan verir. Asılıp bekleyerek de çıkılabilir, ama su bir noktadan sonra bekleyen oyuncuyu yakalar. Az tutunup zincir kuran oyuncu hem daha uzun yaşar hem çok daha fazla puan toplar.
- Doğrudan bağlantı: `?mod=sonsuz`

## Denge değerleri
Hepsi `js/engine.js` başındaki `CFG` içinde, sonsuz modun suyu `js/gen.js` içinde `waterSpeed`.

| Değer | Şu an | Ne yapar |
|---|---|---|
| `GRIP` | 2,2 sn (bölüm 1–2: 3,0; üretilen bölümler: 1,8; sonsuz: 1,4) | Asılı kalınabilecek süre |
| `EARLY` | 0,25 sn | Bundan kısa asılıp bırakmak akışı sürdürür |
| `COMBO_HANG` | 0,45 sn | Bundan uzun asılı kalmak akışı bitirir |
| `COMBO_AIR` | 1,1 sn | Havada bundan uzun tutunmadan kalmak akışı bitirir |
| `COMBO_PTS` × `COMBO_CAP` | 3 × 12 | Akış bonusu (tutunma başına en çok 36) |
| Sonsuz su hızı | 38 + metre × 0,3, en çok 300 birim/sn, 3 sn sonra başlar | Önce çok yavaş, tırmandıkça hızlanır |
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

Tek el denetimleri:
```bash
node tools/nisan.js
node tools/tekel.js
```
- `nisan.js`: Rotadaki her adımda istenen hedef sol ya da sağ işaretle gösteriliyor mu? Şu an 945/945.
- `tekel.js`: Bot hedef koordinatını bilmeden, yalnızca ekrandaki işaretlere bakıp sola ya da sağa dokunarak oynar. El yapımı 6 bölümün hepsi ve üretilen 54 bölümün 53'ü geçiliyor. Kalan 1 bölümde nişan yardımı bir halkayı atlayıp daha yüksektekine tutturuyor, bot ise rotasındaki aşağıdaki halkada ısrar ediyor.

## Proje yapısı
| Dosya | İçerik |
|---|---|
| `index.html` | Sayfa: oyun, açılış, giriş, tanıtım, ana menü, bölümler, ayarlar |
| `css/kuyu.css` | Oyun ekranının görünümü |
| `css/ekranlar.css` | Açılış, giriş, tanıtım ve menü görünümü |
| `js/engine.js` | Kanca fiziği, tutunma gücü, akış ve puan (tarayıcı + Node) |
| `js/levels.js` | El yapımı 6 bölüm |
| `js/gen.js` | Bölüm 7+ ve sonsuz kuyu üretici |
| `js/game.js` | Oyun ekranı: çizim, ses, girdi, kayıt |
| `js/screens.js` | Açılış, giriş, tanıtım, ana menü, bölümler, ayarlar ve arka plan sahnesi |
| `assets/funday-morning-logo.webp` | Şirket logosu (Pofi ile aynı) |
| `tools/bot.js` | Doğrulama botu (koordinatla oynar) |
| `tools/tekel.js` | Tek el botu (yalnızca sol/sağ dokunur) |
| `tools/nisan.js` | Nişan yardımı denetimi |

Düz JavaScript, derleme adımı yok. Kayıt tarayıcıda `kuyu.v2` anahtarıyla tutulur.
