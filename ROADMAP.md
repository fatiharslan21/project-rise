# PROJECT RISE — Nihai oyun kapsamı ve çalışma planı

Hedef, NSS oynanışını daha geniş futbolcu RPG ve kariyer simülasyonuna taşımak; eksiksiz sürüm büyük bir geliştirme programıdır.

| Özellik | Hedef | Mevcut |
|---|---|---|
| Futbolcu kimliği | görünüm, mevki, ayak, geçmiş, potansiyel | isim, mevki |
| Maç mekanikleri | pas, şut, çalım, kaleci, savunma, taktik AI | şut prototipi |
| Lig evreni | ligler, kupalar, yükselme, uluslararası maçlar | 8 takımlı lig |
| Transfer ve sözleşme | menajer, teklif, maaş, pazarlık | eksik |
| Gelişim ve sağlık | antrenman, form, kondisyon, sakatlık | kısmi |
| Sosyal yaşam | taraftar, basın, ilişkiler, kararlar | kısmi |
| Simülasyon | tüm oyuncuların yaşlanması, transferi, emekliliği | eksik |
| İstatistik ve ödüller | sezon ve kariyer kayıtları | kısmi |
| Teknik kalite | testler, erişilebilirlik, performans, bulut kayıt | başlangıç |
| Mobil yayın | Android, iOS, çevrimdışı mod | eksik |

## Öncelik: Oynanabilir maç motoru v0.3
- Kontrol edilebilir pas/şut/çalım ve koordinat tabanlı isabet
- Kaleci, rakip savunması, takım arkadaşı hareketi ve savunma AI
- Pozisyonların oyuncu özelliklerinden ve taktikten üretilmesi
- Kısa maç akışı, istatistikler, tekrar oynanabilirlik

## Sonraki aşama: Kariyer v0.4+
- Birden fazla lig, transfer ve kontrat, gelişen oyuncu havuzu
- Antrenman, sakatlık, disiplin, medya kararları, yaşlanma
- Sezon arşivi, ödüller, kulüp hedefleri, gelişmiş kayıt sistemi

## Kalite kapıları
- 8 takımlı lig her sezon 14 hafta ve 56 maç üretmeli.
- Her karşılaşma için bir iç saha, bir deplasman olmalı.
- Sıralama 3/1/0 puanlama ve averaj kurallarıyla tutarlı olmalı.
- Var olan kullanıcı kayıtları bozulmamalı.
- JSON dışa/içe aktarımı, değişiklik öncesi onay ve doğrulama içermeli.
- Mobil dokunmatik ve PC fare kontrolü test edilmeli.
