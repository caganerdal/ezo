# ezo 💌

Tanışmamızın 2. yıl dönümü için hazırlanmış küçük bir site.

## Nasıl kişiselleştirilir?

Tüm yazılar `data.js` dosyasında: isim, tanışma tarihi, sebepler, mektup.

- **Fotoğraflar:** iPhone'dan HEIC ya da JPG, adını değiştirmeden `foto/` klasörüne yükle.
  GitHub Action (`.github/workflows/fotolar.yml`) bir dakika içinde hepsini küçük JPG'ye çevirir
  ve çekilme tarihine göre `foto/liste.js` listesine yazar. Albümde aynı anda 12 kare görünür; daha fazla
  fotoğraf varsa kareler sırayla değişir (`data.js` → `albumdeGorunen`, `degisimSaniyesi`).
  Hafıza oyunu her seferinde rastgele 8 fotoğraf seçer.
- **Oyunlar:** Kule, Uçan Kalp, 2048 ve Hafıza `oyunlar.js` içinde; rekorlar telefonda saklanır.
- **Müzik:** bir `.mp3` dosyasını klasöre koy, `data.js` içinde `muzik: "sarki.mp3"` yaz.
- **Önizleme:** `index.html` dosyasını tarayıcıda açman yeterli.

## Yayınlama (GitHub Pages)

Repo → Settings → Pages → Branch: `main` / root → Save.
Birkaç dakika sonra site `https://<kullanıcı-adın>.github.io/ezo/` adresinde açılır.
