# Kuyu · Mustafa'ya devir (11/11/2026)

> Törehan + Claude → Mustafa + Claude. Bu belge tek giriş noktası: oyun nedir, depoya nasıl erişilir, nasıl çalışılır, nasıl geri devredilir.
> Kurallar `CLAUDE.md`'de (Claude her oturumda kendiliğinden okur), kalınan nokta `docs/DURUM.md`'de.

## 1 · Kuyu nedir (2 dakikada)

Tek elle oynanan dikey bir tırmanma oyunu. Çıra küçük bir kor; fenerinden kuyunun dibine düşmüş, ip atarak yukarı tırmanıyor, alttan su geliyor. Ekranın sol yarısına basınca kanca soldaki halkaya, sağ yarısına basınca sağdakine atılır. Basılı tutunca halkaya çekilirsin, bırakınca savrulursun. Ustalık, ipi doğru anda bırakıp havada bir sonraki halkaya zincir kurmaktır (akış).

- **Modlar:**
  - **Sonsuz Kuyu** (ana mod, menüde ortaya dokununca başlar)
  - **Günlük Kuyu** (herkese aynı kuyu, günün kuralıyla)
  - **Hikâye** (bölümler)
- **Sonsuz'da yanmak** yanlış karardan gelir: su, tutunduğun en yüksek noktanın biraz altında seni takip eder. Yalnız düşersen ya da oyalanırsan yakalar.
- **Ekonomi:** Ateşböceği toplanır. Dolap'ta (kozmetik) ve devam hakkında harcanır. Görevler, günlük giriş ve başarımlar da ateşböceği verir.
- **Teknik:** Düz HTML + JavaScript, derleme yok. Fizik deterministik, bu sayede botlar her değişikliği otomatik sınar.

Ayrıntılar `README.md`'de, hikâye `docs/hikaye.md`'de.

## 2 · Depoya erişim

Depo: https://github.com/Thorehan/kuyu (herkese açık; okumak ve klonlamak için erişim gerekmez, **push için gerekir**).

**Törehan yapar (bir kez):**
1. github.com/Thorehan/kuyu → **Settings** → **Collaborators** → **Add people**.
2. Mustafa'nın GitHub kullanıcı adını yaz → **Add to repository**. GitHub parola ya da iki adımlı doğrulama isteyebilir.

**Mustafa yapar (bir kez):**
1. Gelen davet e-postasından ya da https://github.com/Thorehan/kuyu/invitations adresinden daveti **kabul et**. Davet 7 gün geçerlidir.
2. Kurulum (Mac):
   - `git --version` çalışmıyorsa `xcode-select --install`
   - **Node.js** 18 ya da üstü (testler için; nodejs.org ya da `brew install node`)
   - Python 3 (Mac'te var; yerel sunucu için)
   - Claude Code
3. Depoyu klonla:
   ```bash
   git clone https://github.com/Thorehan/kuyu.git
   cd kuyu
   ```
4. Git'e kim olduğunu söyle (bu klasör için yeterli):
   ```bash
   git config user.name "Mustafa"
   git config user.email "<kendi GitHub e-postan>"
   ```
5. İlk push'ta GitHub girişi istenir. Tarayıcıyla giriş yap, ya da parola yerine GitHub'da açtığın bir "Personal access token" kullan. Mac anahtar zinciri bunu hatırlar.

Push edilen her şey 1 dakika içinde https://thorehan.github.io/kuyu/ adresinde yayına girer. Telefonda deneme aynı adresten yapılır.

## 3 · İlk oturum

`kuyu` klasöründe Claude Code'u aç ve şunu yaz:

> Kuyu'yu Törehan'dan devralıyorum. CLAUDE.md'deki devir kuralını uygula, docs/DURUM.md ve docs/DEVIR-MUSTAFA.md'yi oku, testleri bir kez çalıştırıp her şeyin yeşil olduğunu doğrula, sonra sıradaki işi benimle konuş.

Claude önce `git pull` yapar, sonra `docs/DURUM.md`'de "Devir kimde: **Mustafa**" yazdığını görür ve çalışmaya başlar.

Yerelde oynamak için:
```bash
python3 -m http.server 8766
```
Sonra tarayıcıda http://localhost:8766 adresini aç. Tarayıcıda telefon boyutunu (375 px) seç; oyun tek el için tasarlandı.

## 4 · Nasıl çalışılır (bir iş paketinin döngüsü)

1. İşi Claude ile konuş. Oyunun hissini ciddi değiştiren kararlar (tempo, zorluk, ekonomi) için önce Törehan'a sor; açık sorular `DURUM.md`'de.
2. Claude değişikliği yapar ve testleri çalıştırır (`CLAUDE.md` §4). Mekanik bir değişiklikte hepsi yeşil olmalı:
   - bot çıkış 0
   - nişanda "kurala aykırı" 0
   - tek tarafa basan oyuncu 0/74
   - hatasız oyuncu yanmıyor
3. Tarayıcıda 375 px'te dene.
4. Sürüm etiketini artır (`index.html`). README'yi ve `docs/gelistirme-sureci.md`'yi güncelle.
5. Commit ("Kuyu v0.52: ...") + push; Pages'te yeni sürümü doğrula.
6. Paket bitince `docs/DURUM.md`'nin "Son durum" ve "Sıradaki iş" bölümlerini güncelle.

Büyük bir değişiklikten önce geri dönüş noktası koymak istersen: `git tag geri-donus-v0.xx && git push origin geri-donus-v0.xx`.

## 5 · Sıradaki iş

`docs/DURUM.md` → "Sıradaki iş". Kısaca:
1. Telefonda deneme (`docs/telefon-testi.md`).
2. Görsel akıcılık (kamera, geçişler, derinlik, su ve ışık).
3. 24 uzun ve öğretici bölüm: en büyük iş, önce Törehan ile planla.

Müzik parçaları senden bekleniyor: `js/muzik.js` → `PARCALAR`, dosyalar `assets/muzik/`.

## 6 · Devir kuralı ve geri devir

**Kural:** Projede aynı anda yalnız devri elinde tutan kişi geliştirir. Devri elinde tutmayan kişi dosya düzenlemez, commit ve push yapmaz; yalnız okur, oynar, not alır. İkimiz aynı anda çalışırsak aynı dosyalarda çakışma çıkar ve yayındaki oyun bozulabilir.

**Devri geri vermek (Mustafa → Törehan):**
1. Yarım iş bırakma: açık paketi bitir ya da geri al. Testler yeşil olmalı.
2. `git status` temiz olmalı (commit'lenmemiş satır kalmasın).
3. `docs/DURUM.md` dosyasını güncelle:
   - "Devir kimde: **Törehan**"
   - devir tarihi
   - son yapılanlar
   - sıradaki iş
   - devir geçmişi tablosuna bir satır
4. Commit ("Devir: Mustafa → Törehan") + push.
5. Törehan'a tek mesaj at: "Devrettim, git pull yap."

**Devralan kişi** her zaman önce `git pull` yapar, sonra `DURUM.md`'de devrin kendisinde olduğunu görür ve başlar. Devir mesajı gelmeden, `DURUM.md` değişmeden çalışmaya başlanmaz.

## 7 · Yapma listesi

- `main`'e zorla push (`git push --force`) yapma; geri dönüş etiketlerini silme.
- Uçuş ve ip çekme hızını değiştirme (`CFG.REEL`). Nişan kuralını bozacak bir değişikliği testsiz gönderme.
- Anahtar, parola ya da e-posta adresini dosyalara ve commit'lere yazma.
- Devir sende değilken geliştirme yapma (Claude da yapmaz; `CLAUDE.md` §1).
