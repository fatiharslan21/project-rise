# PROJECT RISE — Football Life | PC Başlangıç (v0.1)

Unity gerektirmeyen, tek HTML dosyasıyla çalışan ilk futbolcu kariyeri ve şut prototipi.

## 1. PC'de çalıştır

- `index.html` dosyasına çift tıklayıp Chrome veya Edge'de aç.
- Kariyer ekranından **Sahaya Çık**'ı seç.
- Fareyle topu sürükleyip bırakarak şut çek.
- Maç sonunda XP kazan; **Gelişim** ekranında futbolcunu geliştir.

> Kayıt, oynadığın tarayıcının `localStorage` alanına yazılır. Farklı tarayıcı/cihazlarda otomatik paylaşılmaz.

## 2. GitHub'a ekle

1. https://github.com/new adresinde `project-rise` adında boş bir depo oluştur (tercihen README ekleme; bu pakette hazır).
2. Depoda **Add file → Upload files** seç.
3. Bu klasördeki **dosyaları** (`index.html`, `README.md`, `netlify.toml`, `.gitignore`) depoya yükle. Klasörün kendisini iç içe atma: `index.html` depo kökünde yer almalı.
4. **Commit changes** ile kaydet.

## 3. Netlify'da GitHub'dan yayınla

1. https://app.netlify.com/ → **Add new project → Import an existing project**.
2. **GitHub** seç ve yeni `project-rise` deposunu bağla.
3. **Build command**: boş bırak. **Publish directory**: `.` (depo kökü).
4. **Deploy / Publish** ile yayınla.
5. Bundan sonra GitHub'a gönderilen değişiklikler Netlify tarafından otomatik yayımlanır.

## 4. Sonraki hedef

v0.2'de `Phaser + TypeScript` tabanına geçip pas, çalım, karakter oluşturma, lig ve sezon simülasyonunu modüler halde geliştireceğiz. v0.1 dosyasını bu geçişte referans olarak koruyacağız.

## Mevcut prototip sınırları

- Tek maçta üç şut fırsatı ve temel şut etkileşimi.
- İlerleme, XP ve gelişim sistemi.
- Henüz tam lig, transfer, taktik veya gelişmiş rakip AI motoru yok.
- Tam PWA değil ve mobil uygulama paketine henüz dönüştürülmedi.
