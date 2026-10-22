"""foto/ klasöründeki fotoğrafları siteye hazırlar.

HEIC, PNG ve büyük JPG dosyalarını en fazla 1600 px'lik JPG'ye çevirir,
sonra fotoğrafları çekilme tarihine göre sıralayıp foto/liste.js'e yazar.
"""
import json
from pathlib import Path

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

register_heif_opener()

KLASOR = Path("foto")
UZANTILAR = {".heic", ".heif", ".jpg", ".jpeg", ".png", ".webp"}
EN_BUYUK = 1600


def cekilme_tarihi(exif):
    tarih = exif.get_ifd(0x8769).get(36867) or exif.get(306)
    return str(tarih) if tarih else None


def hazirla(yol):
    with Image.open(yol) as im:
        tarih = cekilme_tarihi(im.getexif())
        if yol.suffix == ".jpg" and max(im.size) <= EN_BUYUK:
            return yol, tarih
        hedef = yol.with_suffix(".jpg")
        if hedef.exists() and hedef != yol:
            hedef = yol.with_name(f"{yol.stem}-{yol.suffix[1:].lower()}.jpg")
        im = ImageOps.exif_transpose(im)
        im.thumbnail((EN_BUYUK, EN_BUYUK))
        im.convert("RGB").save(hedef, "JPEG", quality=85, optimize=True, exif=im.getexif())
    if hedef != yol:
        yol.unlink()
    print(f"{yol.name} -> {hedef.name}")
    return hedef, tarih


kayitlar = []
for yol in sorted(KLASOR.iterdir(), key=lambda p: p.name.lower()):
    if yol.suffix.lower() not in UZANTILAR:
        continue
    try:
        hedef, tarih = hazirla(yol)
    except Exception as hata:
        print(f"Atlandı: {yol.name} ({hata})")
        continue
    kayitlar.append((tarih or "9999", hedef.name.lower(), hedef.as_posix()))

kayitlar.sort()
liste = [yol for _, _, yol in kayitlar]
(KLASOR / "liste.js").write_text(
    "// Bu dosya otomatik oluşturulur, elle düzenleme.\n"
    f"window.FOTOLAR = {json.dumps(liste, ensure_ascii=False, indent=2)};\n",
    encoding="utf-8",
)
print(f"{len(liste)} fotoğraf listelendi.")
