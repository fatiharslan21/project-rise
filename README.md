# PROJECT RISE — Football Life

Açık kaynaklı mobil öncelikli futbolcu kariyer prototipi. Amaç: NSS'nin eğlenceli anlık maç oynanışını daha uzun ve derin bir kariyer simülasyonu ile aşmak.

## v0.4: Gerçek zamanlı saha beta
- Phaser 3.90 ile 6'ya 6 küçük saha görünümü, oyuncu ve top animasyonları.
- Aktif futbolcuyu klavye (WASD/oklar) veya telefonda sahaya dokunup sürükleyerek kontrol et.
- Q ile pas, Space ile şut, E ile top kapma; mobilde ekrandaki düğmeler.
- Paslar, rakip baskısı, kaleciler, takım arkadaşı/rakip hareketleri, gol çizgileri ve 75 saniyelik maç.
- Kaleci dahil 20 mevki ile sahaya çıkma; mevkiye özgü istatistiklerin kariyere yazılması.
- Klasik maç modunu seçebilirsin: v0.3 mini taktik görevleri ve v0.1 sürüklemeli şut bozulmadan korunur.
- Mevcut v0.1-v0.3 tarayıcı kariyer kaydı saklanır, beta sırasında yedek dışa aktarımı kullanılabilir.

**Bu gerçek zamanlı 6v6 beta**, henüz 11v11, gelişmiş taktik/animasyon ve gerçek maç motoru dengesi değildir.

## Bağımlılık
Phaser 3.90.0 CDN üzerinden yüklenir. İnternet/CDN erişimi kesilirse uygulama klasik moda geçer.
Gelecekte sürüm sabitleme ve yerel paketleme/Vite yapılacaktır.

## Test
Node.js: node --test tests/*.test.cjs
GitHub Actions: JS söz dizimi ve oyun kuralları testleri.
Netlify Deploy Previews: gerçek mobil/dokunmatik ve PC oynanış testi.

## Modüller
- index.html — kariyer ve maç ekranlarının kabuğu
- engine/league.js — lig, fikstür, puanlama
- engine/roles.js — mevkiler, rating ve beceriler
- arena/engine.js — Phaser'dan bağımsız maç simülasyonu kuralları
- arena/view.js — Phaser ile oyun sahası ve input
- v02.js / v03.js / v04.js — kariyer ve ek özelliklerin entegrasyonu
- ROADMAP.md — proje kapsamı ve teknik borçlar

## Bilinen sınırlar
Gerçek takım lisansları yoktur. Maç verileri cihazdaki localStorage'da tutulur. Maç ortasında kapatılırsa tamamlanmayan maç kaydedilmez. Transfer, sözleşme, çoklu lig, ses, fizik bazlı çalım, gerçek 11v11 ve tam mobil mağaza sürümü henüz yoktur.
