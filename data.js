// ============================================================
//  Sitedeki tüm yazılar burada. Sadece bu dosyayı düzenlemen yeterli.
//  Fotoğrafları "foto" klasörüne koy ve dosya adını aşağıya yaz.
//  Fotoğraf yoksa yerine şirin bir boş kart görünür, site bozulmaz.
// ============================================================

window.SITE = {
  // Sevgilinin adı (başlıkta görünür)
  isim: "Ezgi",

  // Senin adın (mektubun altına imza olarak yazılır)
  imza: "Seni çok seven ben",

  // Tanıştığınız an (YYYY-AA-GGTSS:DD). Sayaç buradan başlar.
  tanismaTarihi: "2024-10-23T00:00",

  // Açılış zarfının üstündeki yazı
  zarfYazisi: "Sana küçük bir sürprizim var",

  // Başlığın altındaki kısa cümle
  altBaslik: "İki yıl önce bugün, hayatımın en güzel tesadüfü oldun.",

  // Hikayemiz: istediğin kadar ekleyip çıkarabilirsin
  anilar: [
    {
      tarih: "23 Ekim 2024",
      baslik: "İlk tanıştığımız gün",
      yazi: "O gün seni ilk gördüğümde ne olacağını bilmiyordum ama bir şeylerin değişeceğini hissetmiştim.",
      foto: "foto/1.jpg",
    },
    {
      tarih: "Kasım 2024",
      baslik: "İlk buluşmamız",
      yazi: "Heyecandan ne konuştuğumu hatırlamıyorum, sadece senin gülüşünü hatırlıyorum.",
      foto: "foto/2.jpg",
    },
    {
      tarih: "2025",
      baslik: "Birlikte ilk yolculuğumuz",
      yazi: "Yol ne kadar uzun olursa olsun, yanımda sen varken hep kısa geldi.",
      foto: "foto/3.jpg",
    },
    {
      tarih: "Bugün",
      baslik: "Tam iki yıl",
      yazi: "730 gün, sayısız kahkaha, birkaç küslük ve her seferinde daha çok sevmek.",
      foto: "foto/4.jpg",
    },
  ],

  // "Seni sevmemin sebepleri" kartları
  sebepler: [
    "Gülünce gözlerinin de gülmesi",
    "Kötü günümde ne diyeceğini hep bilmen",
    "Benimle birlikte saçmalayabilmen",
    "Bana kendimi evimde gibi hissettirmen",
    "Küçük şeyleri bile hatırlaman",
    "Sesin, en çok da gece telefonda",
    "Bana inanman, ben inanmadığımda bile",
    "Sadece sen olman",
  ],

  // Mektup: her satır ayrı bir paragraf olur
  mektup: [
    "Sevgilim,",
    "İki yıl önce bugün hayatıma girdiğinde, her şeyin bu kadar güzel olabileceğini bilmiyordum. Seninle geçen her gün, bir öncekinden biraz daha değerli.",
    "Birlikte güldüğümüz, bazen tartıştığımız, ama her seferinde birbirimize daha sıkı sarıldığımız bu iki yıl için teşekkür ederim.",
    "Daha gidecek çok yerimiz, yaşayacak çok anımız var. Hepsini seninle yaşamak istiyorum.",
    "İyi ki varsın, iyi ki benimlesin.",
  ],

  // Son bölüm
  final: "Nice yıllara, nice ikimize",

  // İstersen bir şarkı ekle: dosyayı klasöre koy ve adını yaz (ör. "sarki.mp3").
  // Boş bırakırsan müzik düğmesi görünmez.
  muzik: "",
};
