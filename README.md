# PROJECT RISE — Football Life

Hedef: New Star Soccer'un kısa mobil aksiyon döngüsünü, daha derin futbolcu RPG ve kariyer simülasyonuyla aşmak. **Henüz tamamlanmış bir oyun değil; çalışan geliştirme prototipi.**

## v0.3 (tüm mevkilerin temeli)
- Seçilebilir 20 futbol pozisyonu (GK, CB, kanat bek, CDM, CAM, kanatlar, forvetler vb.).
- Mevkiye özel rating ve antrenman öncelikleri; 11 oyuncu özelliği.
- Beta mevki değişimi: Gelişim ekranında istediğin mevkiyi dene.
- Santrfor / forvet: önceki sürükleyerek şut prototipi.
- Kaleci: kurtarış yönü seçimi, savunmacı: müdahale yönü, orta saha: pas, kanat: orta açma görevleri.
- Her görevin başarısı, oyuncu becerisi/enerji/moral ve kararın doğruluğuna bağlıdır.
- Kurtarış, müdahale, kilit pas, başarılı orta, asist ve şut istatistikleri; son maç puanı.
- v0.1 ve v0.2 kayıtları korunur; yeni alanlar otomatik eklenir.

Bu görevler *oynanabilir mini-olaylar* olup tam animasyonlu kaleci/defans/pas motoru henüz değildir.

## v0.2
- 8 kulüp, çift devreli 14 haftalık lig, puan tablosu, simüle edilen rakip maçları, sezon arşivi ve ödüller.
- Yeni kariyer (isim/mevki), kondisyon/moral, dinlenme, JSON dışa/içe aktarma.
- Kayıtlar tarayıcı localStorage içinde; farklı cihazlara otomatik senkronize olmaz.

## v0.1
- Dokunarak/sürükleyerek şut, kaleci kurtarışı, 3 pozisyonluk maç, XP, kredi ve özellik yükseltme.

## Çalıştırma
Kurulumsuz: index.html dosyasını Chrome/Edge'de aç.
Netlify: GitHub ana dalındaki commitler otomatik yayınlanır.
Test (Node.js 22): node --test tests/*.test.cjs

## Dosya düzeni
- index.html: temel ekran ve şut prototipi
- engine/league.js: fikstür/puanlama/maç simülasyonu
- engine/roles.js: futbol pozisyonları ve rol görev kuralları
- v02.js, v02.css: lig & kariyer arayüzü
- v03.js, v03.css: mevkiye özel antrenman & görev arayüzü
- tests/: saf iş kurallarının otomatik testleri
- ROADMAP.md: kapsam, eksikler, yapılacaklar

## Kalite ilkeleri
- Çalışan sürümleri bozmadan PR + CI + Netlify önizleme.
- Başka cihazda kayıt için JSON yedek alma.
- Gerçek kulüp adları/armaları/oyuncu görselleri lisans kontrolü olmadan kullanılmaz.
- Pas/çalım/kaleci/defans AI, taktik, transfer, çoklu lig, lisans ve mobil mağaza sürümü ileride geliştirilecektir.
