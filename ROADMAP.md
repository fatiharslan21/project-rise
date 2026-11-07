# PROJECT RISE — Oyun geliştirme hedefleri

Hedef: New Star Soccer'ın kısa aksiyon döngüsünü, tüm mevkiler için gerçekçi şekilde farklılaşan uzun kariyerle birleştirmek.

## Tamamlanan temeller
- [x] v0.1 klasik şut, XP, antrenman, yerel kayıt
- [x] v0.2 8 takımlı 14 haftalık lig, puanlama, arşiv, yedek
- [x] v0.3 20 mevki, mevkiye özel temel aksiyon ve antrenman
- [x] v0.4 canlı 6v6 saha prototipi, kontrol, pas/şut/top kapma, temel AI ve skor kariyer bağlantısı

## Planlanan yükseltmeler
- [ ] v0.5: Kaleci ve savunma gerçek zamanlı AI, pas/şut/çalım fiziği ve animasyonlar, oyuncu karakteristikleri
- [ ] v0.6: 11v11 takım formasyonları, antrenör taktiği, fauller, duran toplar, sakatlık, 90 dakikalık maç akışı
- [ ] v0.7: Gerçek yaşayan futbol dünyası: birden fazla lig/kupa, sözleşmeler, transfer pencereleri, oyuncu veritabanı, emeklilik
- [ ] v0.8: Medya, menajer, ilişkiler, sponsorluk, gerçek kararların kariyere etkisi
- [ ] v0.9: Erişilebilirlik, ses/efekt, iOS/Android, otomatik maç testleri, kayıt dayanıklılığı
- [ ] v1.0: Tamamlanmış ve mağazaya hazır mobil oyun (lisans ve kalite süreçleri tamamlanmış)

## Test koşulları
- Tüm 20 mevkide canlı maç başlatılmalı.
- 75 saniyelik gerçek zamanlı simülasyon sonunda maç yalnızca bir kez kariyere kaydedilmeli.
- Sezon ve lig puanı korunmalı; kariyer v0.1–v0.3'ten v0.4'e taşınmalı.
- Klasik moda geri dönebilmek mümkün olmalı.
- Basit saha simülasyonu kuralları Node testlerini geçmeli.
- Yeni modda Phaser/CDN hatası klasik modda oynanmayı engellememeli.

## Teknik borç
- Phaser CDN bağımlılığını kilitli npm paketine taşı; dağıtım bundle oluştur.
- Büyük global override zincirini (v01-v04) modüler, olay temelli durum makinesine değiştir.
- Maçta çift kayıt, eşzamanlı input, isabet/AI sapma testlerini genişlet.
- Mobil cihazlarda düşük RAM, yatay ekran ve erişilebilir kontroller için test planı oluştur.
