# Kuyu · Online kurulum (skor tablosu)

Durum (v0.55): istemci hazır ve **kapalı**. Arka uç ayarlanana kadar hiçbir istek atılmaz, arayüzde skor tablosu görünmez. Meydan okuma bağlantısı arka uç istemez, şimdiden çalışır.

## Neden hazır kurulmadı
Ücretsiz arka uçların hepsi bir hesap açmayı gerektirir (Supabase, Firebase, Cloudflare). Hesabı Claude açamaz; hesap sahibinin (Törehan ya da Mustafa) açması gerekir. Arka uç seçimi ayrıca `docs/DURUM.md`'de Törehan'a açık sorudur. Bu yüzden hesap dışındaki her şey hazırlandı: istemci, veritabanı betiği, yerel deneme sunucusu, testler.

## Hesap açmadan deneme (yerelde, bugün)
İki terminal:
```bash
python3 -m http.server 8766
```
```bash
node tools/sahte-sunucu.js 8767 --dolu
```
Tarayıcıda `http://localhost:8766/?online=yerel` adresini aç, Haftalık ya da Günlük Kuyu'yu oyna. Sonuç kartında "Skor tablosu · N. sıradasın" çıkar (`--dolu` adında "örnek" yazan oyuncular ekler). Kapatmak için `?online=kapat`. Otomatik test: `node tools/online-test.js`.

## Gerçek kurulum (Supabase, ücretsiz katman, yaklaşık 5 dakika)
1. supabase.com'da hesap aç, yeni proje oluştur (bölge: Frankfurt). Ücretsiz katman: 500 MB veritabanı, ayda 50 bin kullanıcı; proje bir hafta hiç kullanılmazsa duraklar (panelden yeniden başlatılır).
2. Panelde **SQL Editor** → `docs/online-supabase.sql` içeriğini yapıştır → **Run**.
3. **Project Settings → API**: "Project URL" ve "anon public" anahtarını kopyala.
4. `js/online.js` içindeki `AYAR = { url: '', anahtar: '' }` satırına ikisini yaz. Anon anahtar herkese açık olacak şekilde tasarlanmıştır (yazma yalnız `skor_gonder` işleviyle, satır düzeyi güvenlik açık); gizli **service_role** anahtarı asla dosyalara yazılmaz.
5. Sürümü artır, commit ve push. Canlıda Haftalık Kuyu'yu oyna, sonuç kartında tablo görünmeli.

Bu betik gerçek bir Supabase projesinde henüz çalıştırılmadı; ilk kurulumda 5. adımı mutlaka dene.

## Ne gönderilir
Cihazda üretilen rastgele kimlik (hesap değil), oyuncu adı, puan, metre ve tahta adı (`h-2026-11-09` gibi). Başka hiçbir şey gönderilmez. Mağazaya çıkmadan önce gizlilik metnine bu satır eklenmeli.

## Bilinen sınırlar (bu sürümde)
- **Puan doğrulanmıyor.** İstemci puanı kendi yazar; sunucu yalnız sınır denetimi yapar. Hile önleme için plan: istemci tohum + girdi günlüğü gönderir, sunucu (Supabase Edge Function) `js/engine.js` ile koşuyu yeniden oynatıp puanı kendi hesaplar. Motor deterministik (sabit 1/120 sn) olduğu için bu mümkün; girdi kaydı henüz yazılmadı.
- **Kimlik gizli değil.** Listede her satırın kimliği döner (kendi satırını bulmak için). Kötü niyetli biri başkasının kimliğiyle daha yüksek puan yazabilir. Çözüm girişle (Google/Apple) birlikte gelir.
- **Yalnız ortak tohumlu modlar:** Haftalık ve Günlük Kuyu. Sonsuz Kuyu'nun tohumu her koşuda farklı.

## Meydan okuma bağlantısı
`?meydan=s-<tohum>-<puan>-<ad>` (Sonsuz kuralları) ya da `h-...` (Haftalık kuralları). Sonuç kartındaki **Meydan oku** düğmesi telefonun paylaşım menüsünü açar (yoksa bağlantıyı panoya kopyalar). Açan aynı kuyuyu oynar, devam hakkı yoktur, sonuç iki puanı karşılaştırır; **Karşılık ver** kendi puanınla yeni bağlantı üretir. Puan beyana dayanır (arkadaşlar arası).
