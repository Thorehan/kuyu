# Kuyu

**Funday Morning Games** · 2D mobil oyun · prototip v0.50

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
4. **Ana menü (v0.9):** Arka planda kuyunun içinde ipte sallanan kahraman ve ateşböcekleri. Üstte profil (avatar ve ad), toplam ödül puanı ve ateşböceği. Başparmak bölgesinde görev şeridi (v0.24: "Görevler 1/3", ilerleme çubukları, tamamlanmaya en yakın görev ya da "Ödül hazır"; dokununca Görevler), Oyna kartı (kalınan bölümün adı ve hedefleri), Sonsuz Kuyu (rekor) ve Günlük Kuyu (günün en iyisi ve seri) kartları. En altta gezinme çubuğu: Ana sayfa, Bölümler, Görevler, Dolap, Ayarlar (Profil: üstteki "Merhaba" düğmesi). Ayarlar: müzik ve ses efektleri (v0.32), büyük yazı (v0.27), oyun istatistikleri (v0.28), titreşim, tam ekran, oyuncu adı, nasıl oynanır, tanıtımı yeniden izle.

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
Yeni bir şey ilk kez karşına çıktığında oyun kısa süre durur, ekranın altında bir kart açılır (simge, başlık, bir iki cümle, "Anladım"; karta dokunmak da kapatır). Kartlar: ateşböceği halkası, hız halkası, rüzgâr şeridi, yay halkası, geçit, sarkaç halka, ahşap, kutu ve düğme, su yükseliyor, akış, boş atış, kurtarma kancası, el yorulur (Sonsuz Kuyu). Her biri bir kez gösterilir; Ayarlar → "Tanıtım kartlarını yeniden göster" ile sıfırlanır. El yapımı 1–6. bölümler dışında bir koşuda en çok bir yeni öğe kartı çıkar (halka türleri, ahşap, kutu); kalanı sonraki bölümlerde gelir, böylece yeni oyuncu art arda kartlarla kesilmez. Boş atış, kurtarma kancası, su, akış ve el yorulması kartları her zaman çıkar.

## Ateşböceği halkaları
- Ateşböcekleri artık serbest durmuyor; **halkanın içinde**. O halkaya tutunmak ya da içinden geçmek yeter.
- Halkalar **karar noktalarında**: ana yoldaki bir halkanın karşı tarafında, aynı yükseklik civarında. Oradan sıradaki halkaya da ulaşılabilir. İstemeyen ana halkaya gidip es geçer.
- İşaret ateşböceği halkasını gösteriyorsa o yana dokunmak yeter. Gerçek oyuncu gibi oynayan bot ateşböceklerinin 215/221'ini yalnızca işaretlere bakarak topluyor.
- El yapımı bölümlerde 3 (Kutu bölümünde 2), üretilen bölümlerin 73/74'ünde 3, sonsuz kuyuda ara ara.

## Sarkaç halka (v0.21)
Tepedeki pimden zincirle asılı bakır halka; sağa sola sallanır (±55 birim, bir tam salınım 2,6 sn; `CFG.SARKAC_L`, `SARKAC_AMP`, `SARKAC_T`).
- Hangi taraftaysa o tarafın işareti onu gösterir; tam tepedeyken iki taraftan da alınır. Uzak uçtayken menzil dışında kalabilir: biraz bekle.
- Tutununca ip onunla gider, seni de sallar; doğru anda bırakırsan savrulursun.
- Kanca hareketli halkayı daha geniş yakalar (yarıçap +12). Sarkaç uçan kancanın üstüne kayarsa kanca doğrudan tutunur (çizgi testi içeriden başlayanı saymadığı için önce ıskalıyordu).
- Faz halkanın konumundan türetilir: aynı bölüm ve aynı Günlük Kuyu herkes için aynı sallanır.
- Üretici: ana yolda, duvara değmesin diye ortadaki (x 100–260), karar noktası, yay ve geçit olmayan halkalar, en az 5 adım arayla (74 üretilen bölümde 154). El yapımı 1–6. bölümlerde yok.
- Rota botu (`tools/bot.js`) sarkaca o anki yerinden atar ve sarkaçla ilgili adımlarda hedef menzile girene kadar ipi bırakmadan bekler (gerçek oyuncu gibi).

## Geçit çifti (v0.20)
Mor giriş halkasında dönen girdap, yukarıdaki mor çıkış halkasında dışa yayılan halka; aralarında soluk noktalı çizgi çıkışı gösterir.
- Girişe kanca at: ip seni her zamanki hızla çeker. **4 m'ye yaklaşınca** (`CFG.GECIT_LEN` 80) çıkış halkasına taşınırsın ve orada **asılı kalırsın**. Düşme yok, akış sürer. Akışla erken basan oyuncu da girer.
- Giriş, ana yoldaki bir düğümün alternatifidir; çıkış iki düğüm yukarıdaki düğümün alternatifi (en az 250 birim yukarıda). Girmek kestirmedir, girmemek de olur.
- Üretici: giriş ve çıkış düğümünde başka alternatif yoksa ve aradaki düğümün ateşböceği alternatifi yoksa (geçit ateşböceğini atlatmasın). Bölüm başına bir çift (74 üretilen bölümün 27'sinde), Sonsuz'da 1 km'de 4–5 çift. Rastgele sayı kullanmaz. El yapımı 1–6. bölümlerde yok.
- Botlarla: bütün tarzlar 74/74, tek taraf 0/74; botlar geçitli bölümlerin yaklaşık yarısında girer (seçim). Su temposu: ortalama oyuncu 1 dk 14 sn (öncesi 1 dk 18 sn, tohumlar arası fark içinde), aynı yükseklik.

## Yay halkası (v0.19)
Yeşil halka; çevresinde sıkışmış yay ve fırlatacağı yönü gösteren ok.
- Kancayı at: ip seni her zamanki hızla çeker (çekme hızı değişmez). **Halkaya ulaştığın an** seni okun yönüne 820 birim/sn ile fırlatır; ip kendiliğinden bırakılır, bırakmak gerekmez.
- Asılı kalma süresi sıfır sayılır: akış zinciri sürer. Havadayken sıradakine dokun.
- **Tepede 1 sn süzülürsün** (en çok 70 birim/sn alçalarak): yavaş oyuncunun dokunacak zamanı olsun, düşüp suya yakalanmasın. Süzülme kanca atınca biter.
- Ok sıradaki hedefe bakar (dikeyden en çok 40°). Üretici ana yoldaki halkalardan karar noktası olmayanları en az 4 adım arayla yay yapar; rastgele sayı kullanmaz. El yapımı 1–6. bölümlerde yay yok.
- Ayarlar: `CFG.YAY_V`, `CFG.YAY_FLOAT`, `CFG.YAY_FALL`; üreticide `YAY_GAP`.
- Botlarla: asılarak oynayan her yayda fırlayıp akışa girer (en uzun akış x4,2 → x5,4, rüzgâr şeridi 67 → 105/164). Akışla oynayan halkaya varmadan sıradakine geçtiği için yay neredeyse hiç tetiklenmez. Fırlatma hızı serbest uçuş sayıldığı için asılarak oynayanın hız çarpanı da yükselir (ort. x1,22 → x1,34), hız halkası gibi.

## Rüzgâr şeridi (v0.18)
Yolun üstünde, bir halkadan sıradakine giden hatta duran yatay şerit (112 birim genişlik). Tutunulmaz, kancayı durdurmaz.
- **Akış x2 ve üstündeyken** şeridi aşağıdan yukarı geçersen akış +1 olur ve havada kalma süresi tazelenir; Sonsuz Kuyu'da akış puanı gelir. Şerit o anda altın renginde yanar.
- Akış yokken şerit soluk ve kesiklidir, geçmek bir şey vermez. Ceza yok.
- Üretici şeridi yalnızca karar noktası olmayan adımlara koyar (yol tek), en az bir adım arayla; rastgele sayı kullanmaz, mevcut bölümler ve Günlük Kuyu tohumları değişmez. El yapımı 1–6. bölümlerde şerit yok.
- Botlarla (74 üretilen bölümde 164 şerit): akışla oynayan %79'unu, asılarak oynayan ~%40'ını, tek tarafa basan hiçbirini almaz.

## Kuyunun ışığı (v0.40)
Ömür boyu kazanılan ateşböceği (`cuzdan.kazanilan`; harcamak söndürmez) 10 ışık seviyesine bölünür: 25, 60, 120, 200, 320, 480, 700, 1000, 1400, 2000. Ana menüdeki kuyuda ateşböceği sayısı (8 + 3 × seviye) ve sıcak parıltı artar, 3. seviyeden sonra duvar fenerleri birer birer yanar. Seviye atlanınca menüde kısa bir bildirim çıkar; Profil'de ilerleme çubuğu. Tanıtım sahnesi değişmez.

## Hayalet (v0.38)
En iyi koşunun soluk bir kopyası seninle aynı zamanlamayla tırmanır: bölümde en kısa süreli geçişin, Sonsuz Kuyu'da rekor koşun, Günlük Kuyu'da günün en iyisi. Sonsuz her koşuda farklı olduğundan orada bir yükseklik yarışıdır. Hayalet ekranın dışındaysa üst ya da alt kenarda küçük bir işaret görünür. Yalnızca görüntüdür; nişan, puan ve fizik etkilenmez. Ayarlar → Hayalet ile kapatılır.

Kayıt `js/hayalet.js`: kahramanın yeri sim zamanına göre saniyede 15 kez alınır, farklarla yazılır (~60 bayt/sn) ve ana kayıttan ayrı `kuyu.hayalet` anahtarında durur. Test: `node tools/hayalet-test.js`.

## Güçlendirmeler (v0.50, İstişare 2)
Sonsuz ve Günlük Kuyu'da (Günlük'te herkes için aynı yerde); yolun üstünde, bir halkadan sıradakine giden kanca hattında süzülen küreler (~her 22 halkada bir, sırayla kalkan → fener → kanat; 2 km'de ~9 tane). Az ve öngörülebilir; tanıtım kartı ilk alışta çıkar.
- **Kalkan** (mavi): bir sonraki düşüşü affeder. Suya değince en yüksek güvenli halkaya sıçrarsın (devam hakkı gibi, ama ücretsiz ve kendiliğinden). Bir tane taşınır. İstişaredeki "su kapağı" ayrı bir güç olmadı, kalkanla birleşti (ikisi de aynı hatayı affediyordu).
- **Fener** (sarı): 8 sn boyunca 150 birim içindeki ateşböceklerini çeker. Zincir ve fırlatma yolu ateşböcekleri hariç: onlar beceri ister.
- **Kanat** (beyaz): 3 sn kancasız, sabit hızla yukarı süzülürsün; kuyunun ortasına doğru kayarsın, sonunda yukarı hızla serbest kalırsın. Uçarken dokunuşlar yok sayılır.
- Etkin güçler oyun alanının sol üst köşesinde simge ve kalan süre halkasıyla görünür. Çıra'nın çevresinde kalkan baloncuğu ya da fener parıltısı olur.
- Fırlatma yolu güçlendirmenin yanına, kanadın üstündeki 9 halkaya konmaz (kanat yolu atlatırdı); 1500 m'de fırlatma yolu ~18 → ~14.
- Uçuş ve çekme hızı değişmez; kanat ayrı bir itiştir. Kod: `engine.js` → `gucAl`, `kalkanKullan`; `gen.js` → `sonsuzGuc`; `game.js` → `drawGucler`, `drawGucEtki`, `drawGucHud`.

## Devam hakkı (v0.49, İstişare 2)
Yalnız Sonsuz Kuyu'da (Günlük Kuyu'da yok, herkes için eşit). Su yakalayınca ortada 5 saniyelik bir teklif çıkar: geri sayım halkası, **▶ Video izle** (yalnız ilk devamda, oyuncu seçerse), **ateşböceği ile devam** ve **Geç**. Bir koşuda en çok 3 devam; bedel 25 → 50 → 100 ateşböceği (`ekonomi.js` → `DEVAM_BEDEL`, `devamOde`). Bakiye yetmezse düğmede kaç eksik olduğu yazar. Süre dolarsa ya da menü düğmesine basılırsa "Geç" sayılır, koşu kaydedilir. Devam edince Çıra en yüksek güvenli halkaya (yay ve geçit değil) asılı döner, su güvenli mesafeye çekilir, akış sıfırlanır (`engine.js` → `dirilt`). Sonuç kartında devam sayısı görünür. Web sürümünde video 3 sn'lik yer tutucu; Unity'de ödüllü reklam bağlanacak.

## Takip eden su (v0.48, İstişare 2)
Sonsuz Kuyu'da yanmak zamandan değil yanlış karardan gelir. Su artık zamanla yükselmez:
- Tutunduğun en yüksek noktanın **30 m** altında bekler; tırmandıkça bu mesafe 1500 m'de **18 m**'ye daralır (`suTakip` → `bas`, `son`, `daralma`). Yalnız düşersen yakalar.
- Tutunma noktası halkanın asılma yeridir (sarkacın tepesi sayılmaz). Su hedefine uzaklığıyla orantılı hızla yetişir; hızlı tırmanışta geride kalmaz (v0.50 düzeltmesi: önceden 200–300 m geride kalıyor, düşüş 15 sn sürüyordu).
- **4 sn** (1500 m'de 2 sn) yükselmezsen (asılı bekleme ya da bir yerde dönüp durma) su sürünür (7,5 m/sn; asılı bekleyen ~7 sn'de yakalanır); ekranda "su yükseliyor" çıkar.
- El kayması yok (asılı kalınca ani düşüş olmaz); kurtarma kancası yok (düşüş gerçek).
- Asılıyken yanlış tarafa (× gösteren yana) basmak ipi bırakır; bırakılan halka hemen yeniden yakalanabilir. Boş atıştan sonra kanca 0,4 sn kilitli (sürekli yanlış basan düşüşleri biriktirir).
- Su ekranın altındaysa alt kenarda yakınlığa göre güçlenen mavi parıltı görünür.
- Bölümlerde su eskisi gibi (zamanla yükselir), kurtarma kancası ve boş atışta ip kalır (öğretici).

Ölçüm (`node tools/hata.js`, 6 dk, v0.50): hatasız temkinli ve akış oyuncusu hiç yanmaz (temkinli ~4,8 km, akış ~15 km); %5 hata çoğunlukla affedilir (2/6 ve 3/6 yanar); %10 hata ~2 dk'da, %20 hata ~45 sn'de yakar. Sıralı sol-sağ spam ~1 dk'da ~1,4 km'de yanar (önce 6 dk'da 7,5 km), rastgele basan ~30 sn'de; düşünen 10 dk'da ~16 km. Günlük kazanç aynı (~96). Eski `tools/tempo.js` zamanlı su içindir.

## Görsellik ve yeni oynanış (v0.47)
- **Çıra artık bir kor:** içi parlak, kenarı isli kabuk; ışıyan çatlaklar, nabız gibi atan sıcak noktalar, tepede titreyen alev ucu, çevresinde hale ve ara ara yükselen kıvılcımlar. Dolap'taki gövde rengi korun tonunu verir. Oyun, menü, Dolap ve bölge finalleri aynı çizimi kullanır (`game.js` → `korCiz`).
- **Paneller ve açılır pencereler:** hepsi aynı aileden; koyu taş zemin, üst kenarda ince kor çizgisi, sıcak iç parıltı, yumuşak giriş, arkası bulanık. Ana düğmeler kor gradyanlı ve basılınca çöker. Hareket azaltma açıksa animasyon yok.
- **Hayalet ve rekor (dikkat dağıtmasın):** hayalet koşunun ilk 3 saniyesinde görünüp söner; sonra yalnızca sana dikeyde yakınken soluk belirir; ekran kenarı işareti kalktı. Bölümde geçince bir kez "hayaletini geçtin". Sonsuz/Günlük'te rekor yüksekliğine 25 m kala ince kesikli bir rekor çizgisi belirir; geçince bir kez "YENİ REKOR!". Ayarlar → Hayalet ve rekor ile kapanır.
- **Ateşböceği zinciri (Sonsuz/Günlük):** ~her 150 m'de art arda üç adımın kanca hattında sıralı, numaralı üç altın ateşböceği. Tek tek alınanlar sayılmaz (herkes ip sarılırken geçer); üçü akış kopmadan alınırsa "ZİNCİR!" ve +3 ateşböceği. Ölçüm: akış oyuncusu 6 koşuda 7, ortalama 3, spam 1 zincir; günlük kazanç değişmedi (~102).
- **TAM kova (bölümler):** kovaya akış sürerken ve son bırakış TAM iken tutunmak "TAM KOVA!" ve ödüle +50. Ölçüm (40 bölüm): akış oyuncusu 26, spam 7, ortalama 0.

## Nişan kuralı (v0.45)
Temel kural: **yukarısı belirli şartlarda önceliklidir; şartlar sağlanmazsa aşağıdaki seçilir.** Kademeler: bu taraftaki dik yukarı hedef → yandaki sığ hedef (v0.17) → aşağıdaki. Bütün yeni mekanikler bu kurala uymalı; `tools/nisan.js` her değişiklikten sonra "kurala aykırı aşağı atış" sayar (0 olmalı).

v0.42'deki itişler ve v0.44'teki fırlatma yolu uçuşları uzattı; havadayken basınca yukarı hedef menzilin hemen ötesinde kaldığında nişan aşağıdaki halkayı seçiyordu (havada basan oyuncuda atışların %14–20'si aşağı, 60 bölümün 10'u kalıyordu). Şartlar:
- **Bekleme:** yükselirken bu taraftaki yukarı hedef, bekleme süresinde (`BEKLE_SN` 0,35 sn; ya da tepe noktasında) varılacak yerden menzile girecekse kanca bekler ve girince ona atılır; işaret o hedefi soluk gösterir. Girmeyecekse ya da düşmeye başlarsan aşağıdakine atılır. Yan halka geçerli seçim olduğundan onun yerine beklenmez.
- **Hattı kesen halka:** yukarıdaki hedefin hattını başka bir halka/ahşap kesiyorsa ve o da bu tarafta dik yukarıdaysa o alınır.
- **Değdiğin halka engel değil:** Çıra'nın içinden geçtiği halka kancayı ve nişanı engellemez.

Sonuç: havada basan oyuncuda aşağı atış %0,4–0,6, bölümler 60/60; nişan testinde kurala aykırı 0, bütün tarzlarda 80/80. Ortalama tempo aynı (1:17). Spam de aşağıya atılmadığı için Sonsuz'da ~1,1'den ~2,2 km'ye çıktı (düşünen 16 km).

## Fırlatma yolu (v0.44)
**v0.46:** ateşböceği yalnız akışla alınır (zincir x2+ ya da pencere içinde erken bırakıp havadayken); akış yokken halka sönük görünür. Sonsuz Kuyu'da da var: her ~10 düğümde bir denenir, çevredeki halkalarla küçük bir motor sahnesinde doğrulanır (`gen.js` → `dalMini`); 8 tohumda 2 km'de ~11 ayrım. `tools/bot.js` Sonsuz'da 1500 m'ye kadar her ayrımı iki yönden denetler.

Üretilen bölümlerin çoğunda (8+, 73'ün 54'ü) gerçek bir yol ayrımı: karar noktasında ana halkanın karşı tarafında **turuncu oklu halka**. Ondan sonraki halka (bir **ateşböceği** halkası) asılıyken menzil dışında; ancak ip halkaya varmak üzereyken bırakıp fırlayınca uçarken menzile girer. Karar: güvenli ana yol mu, zamanlama isteyen ve ateşböceği veren yol mu. Akışı olmayan turuncu halkadan ana yola döner, sıkışmaz.

Üretici (`gen.js` → `dalBul`, `dalDogrula`) adayları motorla gerçek bölümde dener: asılıyken menzil dışı, akış penceresinde bırakınca ulaşılır; geçemeyen aday konmaz. Rastgele sayı kullanmaz, en son eklenir: mevcut halkalar değişmez. Yay ya da sarkaçtan sonra (oyuncu havada gelir), ana ve ateşböceği yollarının hatlarına 40 birimden yakın ve sarkaçlara 150 birimden yakın yerlere konmaz. Bekçinin notları bu ateşböceğine asılmaz. `tools/bot.js` her ayrımı iki yönden denetler (54/54).

Ölçüm: hız ödülü işe yaramadı (akışla ana yol zaten daha hızlı), ödül ateşböceği. Bilerek seçen akış oyuncusu 54 ayrımın 42'sinde ateşböceğini alıyor, sol-sağ spam 29–35'inde (spam ipi hep erken bırakıp fırladığı için bazen denk geliyor). Sonsuz Kuyu'da ayrım henüz yok.

## Karar ve zamanlama (v0.43)
Ölçüm (`node tools/spam.js`): v0.42'de hiç düşünmeden sırayla sol-sağ basmak bölümlerin 74/76'sını geçiyor, Sonsuz'da ~6 km çıkıyor, dokunuşların %98'i alevliydi. Üç neden: yanlış tarafa basmak bedavaydı, iki seçenek çoğu yerde eşitti, akış sabit bir ritimle kendiliğinden oluşuyordu. Düzeltmeler:
- **Boş atışın bedeli:** yanlış tarafa basmak akışı bitirir (alev söner) ve kanca geri dönene kadar (~0,2 sn) yeni atış yapılamaz. İp yine bırakılmaz.
- **Akış zamanlama ister:** ip halkaya 130 birimden (`AKIS_PENCERE`) uzaktayken bırakmak akış sayılmaz ("erken!"). Halkaya varmak üzereyken ya da vardıktan hemen sonra bırakmak sayılır.
- **Alev TAM ile dolar:** akış sayısı değil, akış içindeki TAM bırakışlar alevi yakar.

Sonuç: insan benzeri (ritmi oynayan) spam Sonsuz'da 1,1–7,8 km'den 1,0–2,4 km'ye, en iyi akış x121–943'ten x13–26'ya, alevli dokunuş ~%97'den %6–36'ya indi. Düşünerek oynayan aynı (16 km, 76/76 bölüm); ortalama ve iyi oyuncunun temposu aynı (1:17); her bölümde akış madalyası nişanla alınabiliyor. Seçeneklerin gerçekten farklı olması (yol ayrımları) sıradaki iş.

## Alevlenme ve TAM itişi (v0.42)
Bas-bırak'tan daha etkili hızlanma, ustalıkla gelir. Akış sürerken yapılan **TAM** bırakışlar alev sayacını doldurur: 2 TAM'da Çıra **alevlenir**, 4'te alev büyür, 7'de tam alev olur (v0.43; v0.42'de akış x5/x10/x15 idi). Alevliyken akış bırakışı ek yukarı itiş verir: +150 / +250 / +350 birim/sn (`ALEV_ESIK`, `ALEV_ITIS`). Akış bozulunca alev söner, sayaç sıfırlanır. **TAM** bırakış da +200 iter; art arda her 3. TAM'da +150 daha (`TAM_ITIS`, `TAM_SERI_ITIS`). Asılı kalıp bırakan itiş almaz. Kanca uçuşu ve ip sarma hızı (REEL 760) aynı kalır; hız halkası gibi yalnızca bırakış anında itiş.

Ölçüm (`tools/tempo.js`, `tools/oyuncu.js`): ortalama ve iyi oyuncunun yakalanma süresi aynı (1:17); akışla oynayan bot Sonsuz'da %13 daha yükseğe çıkıyor; bütün bölümler geçiliyor, tek tarafla geçiş yok.

## Tam zamanında bırakma (v0.37)
İp halkaya varmadan hemen önce (son ~0,09 sn, `TAM_PENCERE` 70 birim) bırakılırsa altın bir ışıltı, iki notalı tını ve "TAM!" yazısı gelir; Sonsuz Kuyu'da +10 puan (`TAM_PTS`). Bölüm ödülü değişmez, fizik aynıdır: yalnızca akışı öğreten bir geri bildirim. O tutunuşta ip en az 80 birim sarılmış olmalı (`TAM_SARIM`), yoksa yakın halkada kendiliğinden olurdu. Sonuç kartında kaç kez yapıldığı görünür.

## Hız ve ödül
- **En yüksek hız:** Raunt boyunca ipte değilken, yukarı ya da yana giderken ulaşılan en yüksek hız (m/sn). Kancanın çekme hızı ve düşüş sayılmaz. Bekleyerek oynayan yaklaşık 5–6 m/sn, ipi erken bırakıp zincirleyen 40–57 m/sn.
- **Çarpan** (v0.46): hız payı (10 m/sn'den sonra başlar, 57,5 m/sn'de en yüksek: x1,00 – x1,50, 0,05 adımlarla) + ustalık payı (her TAM bırakış +0,05, en çok +0,50). En çok x2,00; sonuç kartında döküm görünür.
- **Bölüm ödülü** = (100 + 25 × ateşböceği + 50 Kusursuz + 50 Akış) × hız çarpanı.
- **Bölüm sonu kartı** ekranın altından açılır: ödül sayarak gelir ve hesabı yazılır, üç madalya (bu oyunda ilk kez kazanılan "YENİ" etiketiyle), süre ve en yüksek hız (kırılan rekorlar "REKOR" etiketiyle), büyük "Bölüm N ›" düğmesi, Tekrar ve Bölümler. Sonsuz Kuyu sonucu da aynı yapıda.
- **Sonsuz Kuyu puanı** = (metre + akış bonusu + ateşböcekleri) × hız çarpanı.

## Hikâye: Çıra (v0.34)
Köyün fenerinden düşen küçük bir kor olan **Çıra**, kuyunun dibinden fenerine dönmeye çalışır. Su onu söndürebilecek tek şeydir; kancalı ip fenerin fitili, ateşböcekleri düşerken saçılan ışığıdır. Bütün metinler ve kurallar `docs/hikaye.md` içinde.
- **Sözsüz önsöz:** tanıtım sahnesinin başında kuyunun ağzında fener yanar, bir kıvılcım kopup kuyuya düşer, dipte Çıra gözünü açar; ardından kancayı atıp gün ışığına fırlar. Ayarlar → "Tanıtımı yeniden izle" ile tekrar izlenir.
- **Bölge kartları:** yeni bir bölgeye ilk girişte ekranın üstünde, oyunu durdurmayan kısa kart (bölge adı + bir cümle); dokununca ya da 5 sn sonra kapanır.
- **Çıra'nın yolu (Profil):** açılan bölgelerin hikâye sayfaları; açılmayanlar "N. bölümde açılır" diye kilitli. Taş Kuyu baştan açıktır.
- Bekçinin notları (v0.35, `js/notlar.js`): 12 kısa not, bölge başına 3. Her biri belli bir bölümün en üstteki ateşböceği halkasına asılı ("gizli yol" = ateşböceği yolu); halkayı alan notu bulur. Not hemen kaydedilir, metni bölüm sonunda (ya da su yetişirse yeniden başlarken) kartla gösterilir. Profil → Çıra'nın yolu'nda bulunanlar okunur, bulunmayanlar bölüm numarasıyla görünür. Motor ve bölüm düzeni değişmez; `tools/bot.js` her notun ateşböceği rotasıyla alındığını denetler.
- Bölge finalleri (v0.36): 16, 36, 56, 76. bölüm ilk kez geçilince sonuç kartından önce kısa, sözsüz bir sahne (ateşböcekleri yol gösterir, madende fenerler yanar, kristaller çınlar, kulede fener yeniden yanar). Dokununca geçer; bir kez oynar, metni Çıra'nın yolu'nda kalır. Kod: `game.js` → `drawFinal`.
- İkinci yolculuk (v0.41): 77. bölümden sonra her bölgeye ilk girişte kendi kartı (fener yandı, Çıra dağınık ateşböceklerini toplamaya geri iner); metinler Çıra'nın yolu'nda, bölüm listesinde "· ikinci yolculuk".
- Sonra: bekçinin adı.

## Müzik ve ses (v0.32)
- **Ortam müziği** dosyasız, Web Audio ile çalınırken üretilir (`js/muzik.js`). Katmanlar: yumuşak ses halısı (akor), alçak zemin notası, akış sürerken (x2 ve üstü) giderek açılan arpej, bölgeye özel renk.

| Sahne | Tema |
|---|---|
| Menüler | sakin, 60 vuruş, arpej yok |
| Taş Kuyu | La minör, yumuşak üçgen dalga |
| Maden | Re dorian, sıcak tını, ara ara su damlası |
| Kristal Mağara | Mi lidya, yankılı çan |
| Eski Kule | Do minör, org gibi |

- Duraklatınca ve sonuç kartında müzik kısılır; telefon arka plana alınınca ses bağlamı uyur (pil). Notalar ~100 ms aralıkla biraz ileriye planlanır, oyun karesi takılsa da ritim kaymaz.
- **Ayarlar:** Müzik ve Ses efektleri ayrı anahtarlar; duraklatma panelinde "Müzik" ve "Efekt" düğmeleri. Efektler kapalıyken müzik çalabilir.
- **Gerçek müzik gelince:** `js/muzik.js` içindeki `PARCALAR`'a sahne başına bir dosya yazılır (ör. `maden: 'assets/muzik/maden.mp3'`); o sahnede dosya döngüyle çalar, üretilen müzik susar. Dosya yoksa ya da yüklenemezse üretilen müzik çalar.

## Bölgeler (v0.30)
Yalnızca görünüm değişir; oynanış, halkalar, işaretler ve oyun renkleri her bölgede aynıdır (okunabilirlik).

| Bölge | Bölümler | Sonsuz Kuyu | Görünüm |
|---|---|---|---|
| Taş Kuyu | 1–16, 77–96, … | 0–500 m, 2000–2500 m, … | yosunlu yeşil-gri taş |
| Maden | 17–36, 97–116, … | 500–1000 m, … | sıcak kahverengi taş, altın damar benekleri, zincirle asılı fenerler |
| Kristal Mağara | 37–56, … | 1000–1500 m, … | mor-mavi taş, duvar diplerinde parlayan kristaller |
| Eski Kule | 57–76, … | 1500–2000 m, … | açık gri taş, kemerli pencereler ve ay ışığı |

- Bölümlerde bölge bölüm numarasından gelir (`bolgeBolum`), Sonsuz ve Günlük Kuyu'da kuyunun yüksekliğinden (`SONSUZ_BOLGE_M` 500): sınır kuyunun içinde görünür, ekran birden değişmez.
- Duvar dokusu her bölge için ayrı karo olarak bir kez çizilir; süsler arka planda, soluk ve duvara yakın (halkaya ya da ahşaba benzemesin diye).
- Yeni bölgeye ilk girişte oyunu durdurmayan kısa duyuru ("Yeni bölge: Maden", Sonsuz'da "· 504 m"); Sonsuz'da bölge adı kahramanın üstünde de yazar (en yüksek noktaya göre, sınırda inip çıkınca tekrar etmez).
- Bölümler ekranında 10'arlı grupların adı bölge adıdır.

## Oyun istatistikleri (v0.28)
Ayarlar → **Oyun istatistikleri**. Denge kararları için yerel kayıt; hiçbir yere gönderilmez. Mantık `js/istatistik.js`, testi `node tools/istatistik-test.js`.
- Her koşu tek bir sonla kaydedilir: geçiş, ölüm, atlama (Bölümü atla), yarıda bırakma (ana menü, baştan başla, başka bölüm; 1 sn'den kısa denemeler sayılmaz) ya da Sonsuz/Günlük koşusu.
- Bölüm başına: deneme, geçiş, ölüm ve ölümün bölüm yüksekliğinin yüzde kaçında olduğu (son 10), atlama, yarıda bırakma, en iyi süre, boş atış, kurtarma kancası.
- Sonsuz ve Günlük Kuyu: koşu sayısı, süre, son 30 koşunun metresi (ortanca ve en iyi), en uzun akış.
- Ortak: halka kullanımı (hız, rüzgâr şeridi, yay, geçit, sarkaç), boş atış, kurtarma, el kayması, atış, toplam oynama süresi.
- Sayfa: genel sayılar, en çok zorlanılan 8 bölüm (ölüm + 2×atlama + yarıda bırakma), koşu özetleri, halka kullanımı. **Panoya kopyala** özeti JSON olarak kopyalar (pano izni yoksa metni seçili bir kutuda gösterir). **Sıfırla** iki dokunuşla.

## Ekonomi, günlük giriş ve Dolap (v0.22)
Oyunda güçlendirme yok; harcamalar yalnızca kozmetik. Para birimi **ateşböceği**; ana menünün üstündeki ateşböceği sayısı harcanabilir bakiyedir. Mantık `js/ekonomi.js`, testi `node tools/ekonomi-test.js`, kazanç ölçümü `node tools/ekonomi-olcum.js`.

| Kaynak | Miktar |
|---|---|
| Bölüm | bölümde **ilk kez** alınan her ateşböceği (aynı bölümü tekrar oynayarak kasılmaz) |
| Sonsuz ve Günlük Kuyu | koşuda toplanan her ateşböceği |
| Görev | kolay 5, orta 10, zor 15 (▶ video ile ikiye katlanır) |
| Başarım | her kademe: bronz 10, gümüş 25, altın 50 |
| Günlük giriş | 7 günlük takvim 5, 5, 10, 10, 15, 15, 50 (▶ video ile ikiye katlanır) |

- Eski kayıtlarda başlangıç bakiyesi, bölümlerde daha önce toplanan ateşböcekleridir. v0.22'den önce görevlerden gelen ödül puanları toplam ödülde kalır.
- **Günlük giriş:** Ana menüye günün ilk gelişinde takvim açılır; "Sonra" denirse Görevler sekmesinin üstünden açılır. Gün kaçırınca sıfırlanmaz, kaldığın günden devam eder; 7. günden sonra başa döner. Gün sınırı Günlük Kuyu ile aynı (Türkiye saati).
- **Video ile ikiye katla:** Yalnızca oyuncu seçerse (Pofi kuralı). Web sürümünde reklam yok: 3 saniyelik, "deneme sürümünde reklam yok" yazan bir bekleme ekranı çıkar. Unity'de gerçek ödüllü reklam buraya bağlanır.
- **Dolap kısa yolu** (v0.26): bir koşunun kazancıyla Dolap'taki bir ürüne ilk kez yetişince sonuç kartında "Dolap'ta yeni · X alınabilir ›" çıkar (yalnız o koşuda eşik aşıldıysa); dokununca Dolap o ürünün önizlemesiyle açılır.
- **Dolap** (alt menü): üstte bakiye ve kuşanılan görünümle sallanan kahraman; Atkı / İp / Uçuş izi sekmeleri. Sahip olmadığın ürüne dokunmak **önizlemedir** (v0.25): kahraman o renge bürünür, ürün "Önizleme" diye işaretlenir ve önizlemenin altında "Al · fiyat" ile "Vazgeç" çubuğu açılır. Satın alma yalnızca "Al" ile olur (alınca kuşanılır); bakiye yetmezse düğmede kaç eksik olduğu yazar. Sahip olduğun ürüne dokunmak doğrudan kuşanır.
  - Kahraman (v0.31): Turuncu (bedava), Deniz 60, Çimen 60, Lavanta 90, Pembe 90, Gece 120, Altın 150. Oyunda, menü sahnesinde ve önizlemede.
  - Kanca (v0.31): Ok (bedava), Çapa 50, Yıldız 80, Kalp 100. Kanca uçarken görünür; kalp ve yıldız hep dik çizilir.
  - Atkı: Turkuaz (bedava), Kiraz 40, Mor 40, Altın 70, Gece 70, Pembe 100, Gökkuşağı 300 (renk döner).
  - İp: Keten (bedava), Gök 30, Zümrüt 50, Altın 60, Ateş 90.
  - Uçuş izi: Atkı rengi (bedava), Kar 40, Mor 60, Altın 80, Gökkuşağı 250. Akış sürerken iz yine sarı yanar (oyun geri bildirimi).
- Kazanç ölçümü (tipik gün: 10 dk bölüm + 10 dk Sonsuz + 3 görev + giriş): ortalama oyuncu ~100 ateşböceği (videolarla ~145), ateşböceği avcısı ~150 (~195). En ucuz ürün ilk gün, orta ürünler birer günde, gökkuşağı 2–3 günde; bütün dolap (2080, v0.31) 2–3 haftada. Eski kayıtlara yeni türlerin bedava varsayılanları kendiliğinden eklenir.

## Görevler ve başarımlar (v0.16)
Alt menüdeki **Görevler** sekmesinde iki bölüm var. Mantık `js/gorevler.js` içinde, testi `node tools/gorev-test.js`.

**Bugünün görevleri:** Her gün 3 görev gelir: kolay, orta ve zor, üçü de farklı türden. Görevler o gün herkes için aynıdır ve Türkiye saatiyle gece yarısı yenilenir. Ödüller 5, 10 ve 15 ateşböceğidir (v0.22'den önce 50/100/150 ödül puanıydı). Tamamlanan görevde "Al" ve "▶ ×2" (video) düğmeleri çıkar. Alınmamış ödül varsa alt menüdeki Görevler simgesinde turuncu nokta yanar.

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
**Günün kuralı (v0.39):** her gün herkes için aynı tek değişiklik; altı kural gün sırasıyla döner, art arda iki gün aynı gelmez: Yay günü (yay halkaları bol), Rüzgâr günü (şeritler daha sık), Ateşböceği gecesi (karar noktalarında ateşböceği daha sık), Sarkaç günü (sarkaçlar bol), Geçit günü (geçit çiftleri sık), Hız günü (hız halkaları sık). Kural yalnızca halkaların türünü değiştirir: üretici aynı rastgele sayıları aynı sırayla çeker, yerler, su ve zorluk aynı kalır (`gen.js` → `KURALLAR`, `gunKurali`). Menüdeki Günlük kartında ve koşu başında kısa bir kartla gösterilir. `tools/bot.js` her kuralı 4 tohumla dener; tempo: `KURAL=sarkac node tools/tempo.js`.

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
| `js/ekonomi.js` | Cüzdan, günlük giriş, Dolap kataloğu (tarayıcı + Node) |
| `js/istatistik.js` | Yerel oyun istatistiği (tarayıcı + Node) |
| `js/hayalet.js` | Hayalet: koşu kaydı, kodlama, ara değer, saklama (tarayıcı + Node) |
| `js/notlar.js` | Bekçinin notları: 12 metin, hangi bölümde, hangi halkada |
| `js/muzik.js` | Üretilen ortam müziği (bölge ve akışa göre) |
| `js/game.js` | Oyun ekranı: çizim, ses, girdi, kayıt |
| `js/screens.js` | Açılış, giriş, tanıtım, ana menü, bölümler, ayarlar ve arka plan sahnesi |
| `assets/funday-morning-logo.webp` | Şirket logosu (Pofi ile aynı) |
| `tools/bot.js` | Doğrulama botu (koordinatla oynar) |
| `tools/oyuncu.js` | Gerçek oyuncu gibi tek elle oynayan bot (yalnızca işaretlere bakar) |
| `docs/gelistirme-sureci.md` | Geliştirme sırası, kalıcı kararlar, yapılanlar |
| `docs/telefon-testi.md` | Telefonda 10 dakikalık deneme listesi |
| `docs/muzik-brifi.md` | Mustafa için müzik brifi (parçalar, tempo, ton, teslim) |
| `docs/hikaye.md` | Hikâye: Çıra (öncül, karakterler, bölge metinleri, anlatım, metin kuralları) |
| `sw.js`, `manifest.webmanifest` | Ana ekrana kurulum ve internetsiz açılış |
| `tools/kontrol.js` | Duman testi: sözdizimi, sayfa bağlantıları, servis çalışanı listesi, sürüm etiketi |
| `tools/tempo.js` | Sonsuz Kuyu su temposu ölçümü |
| `tools/gorev-test.js` | Görev ve başarım mantığı testi |
| `tools/ekonomi-test.js` | Cüzdan, günlük giriş ve Dolap testi |
| `tools/istatistik-test.js` | Yerel istatistik testi |
| `tools/ekonomi-olcum.js` | Sanal oyuncuların ateşböceği kazancı (fiyatlar buna göre) |
| `tools/nisan.js` | Nişan denetimi: işaret yandaki sığ hedefi mi gösteriyor |
| `tools/simge.py` | Uygulama simgelerini çizer |

Düz JavaScript, derleme adımı yok. Her yayında `index.html` içindeki `?v=` sürüm etiketini artırın ve `node tools/kontrol.js` çalıştırın; yeni bir js/css dosyası eklenirse `sw.js` listesine de yazılmalı; yoksa telefonlar eski CSS/JS'i önbellekten kullanabilir. Kayıt tarayıcıda `kuyu.v2` anahtarıyla tutulur. Servis çalışanı her kod dosyasının önbellekte tek kaydını tutar (?v= atılır, hep en son alınan); internetsiz açılış en son sürümü açar.
