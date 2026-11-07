# PROJECT RISE — Football Life

Mobil odaklı futbolcu kariyeri oyunu. Amaç: New Star Soccer kadar hızlı aksiyon, çok daha derin kariyer sistemi. Bu geliştirme henüz tamamlanmış oyun değildir.

## v0.2 özellikleri
- Mevcut v0.1 sürükle-bırak şut minioyunu, XP/kredi ve beceri gelişimi korunur.
- Yeni kariyer oluşturma: isim ve mevki seçimi.
- 8 kulüp, çift devreli 14 hafta, her hafta tüm takım maçları.
- Puan tablosu, gol averajı, sezon ödülleri ve arşiv.
- Enerji, moral, haftada bir dinlenme ve basın mesajları.
- JSON kayıt yedeğini indirme ve yükleme.
- v0.1 localStorage kariyerleri silinmeden yeni şemaya eklenir. Eski maçlar toplam kariyer istatistiği olarak kalır, lig sıfırdan başlar.

## Çalıştırma
index.html dosyasını Chrome veya Edge ile aç. Kurulum gerektirmez. Netlify ana dalı yayınlıyor; yeni özellik dalı ana dala birleştirilene kadar mevcut site korunur.

## Testler
Node.js kuruluysa: node --test tests/league.test.cjs

## Dosyalar
- index.html: temel şut prototipi ve eski kayıt sistemi
- engine/league.js: bağımsız fikstür / puan / maç simülasyonu kuralları
- v02.js: kariyer ve lig ekranları
- v02.css: yeni görsel bileşenler
- ROADMAP.md: tam oyun kapsamı ve kabul kriterleri

## Sınırlar
v0.2 hâlâ maç motorunun ilk sürümüdür. Pas, çalım, savunma, canlı AI, sözleşmeler, transfer, çoklu ligler ve çevrimiçi kayıt sistemi sonraki aşamalardır. Gerçek kulüp markaları lisanssız kullanılmamalıdır.
