# PROJECT RISE — Football Life

Mobil odaklı futbolcu kariyer oyunu prototipi. **Ana oynanış yaklaşımı NSS tarzı:** maç simülasyon/anlatımla akar, kilit anlarda yukarıdan saha açılır, oyuncu aksiyonu seçer ve sürükleyerek yön/güç verir. Sürekli canlı futbolcu kontrolü YOK.

## v0.5 — Pozisyon bazlı maçlar
- Bir maç beş önemli pozisyondan oluşur; dakika, skor, anlatım ve maç günlüğü gösterilir.
- Şut, pas, çalım, orta, top kapma, araya girme, uzaklaştırma, kaleci kurtarışı gibi aksiyonlar.
- Topa veya işaretli oyuncuya basılı tutup hedefe doğru sürükleyerek yön ve güç verilir.
- Hedefleme doğruluğu, şut/pas/savunma/kaleci becerileri, enerji ve moral başarı ihtimalini etkiler.
- Her pozisyondan sonra maç devam eder, sonrasında kariyere ve lige tek seferlik kayıt yapılır.
- Kaleci, stoper, orta saha, kanat ve forvet gibi 20 mevkide farklı anlar.
- Mevcut v0.1–v0.4 kayıtları aynı localStorage anahtarı üzerinden korunur.
- v0.4'ün sürekli canlı 6v6 modu oyunun arayüzünden ve sayfa yüklemelerinden kaldırıldı.

## Önceki sürümlerde korunanlar
- 8 kulüp, 14 haftalık çift devreli lig, rakip maç simülasyonu, puan tablosu, sezon arşivi.
- 20 mevki, mevkiye göre gelişim özellikleri, antrenman ve beta mevki değiştirme.
- Enerji/moral, dinlenme, para/XP, tarayıcı kayıt sistemi, JSON yedekleme.

## Kurulum
index.html dosyasını Chrome/Edge'de açmak yeterli. GitHub → Netlify otomatik yayınlanır.

## Test
Node.js: node --test tests/*.test.cjs

## Mevcut sınırlar
Bu NSS ilhamlı ilk oynanabilir pozisyon prototipidir; henüz NSS'nin tüm pas, falso, rüzgâr, gelişmiş takım arkadaşı ve rakip davranışları, duran toplar, 11v11 simülasyon yoğunluğu yoktur. Transfer/sözleşme, çok lig ve yaşayan kariyer dünyası da geliştirme planında. Gerçek takım adları/görselleri lisans kontrolü gerektirir.

## Mimari
- engine/highlights.js — olay simülasyonu ve vuruş çözümleme
- v05.js / v05.css — çizilen saha, dokunmatik/fare kontrolü, kariyer entegrasyonu
- engine/roles.js — 20 mevki ve becerileri
- engine/league.js — çift devreli lig
- v02.js, v03.js — kariyer ve antrenman
- archive: arena/ ve v04.js kaynakları referans olarak repoda durur ama sayfada yüklenmez.
