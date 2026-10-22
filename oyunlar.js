(function () {
  const $ = (sel, kok = document) => kok.querySelector(sel);
  const renkler = ["#f6b8c2", "#e8768a", "#d4485f", "#c9435a", "#b5677d", "#9c5a8a", "#7d4f8f"];

  // ---------- Ortak yardımcılar ----------
  function tuvalKur(sahne) {
    const c = document.createElement("canvas");
    sahne.appendChild(c);
    const w = sahne.clientWidth;
    const h = sahne.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    c.width = w * dpr;
    c.height = h * dpr;
    c.style.width = w + "px";
    c.style.height = h + "px";
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { c, ctx, w, h };
  }

  // adim(dt) false dönerse döngü durur; dt 60 fps'te 1 olur
  function dongu(adim) {
    let id;
    let onceki = performance.now();
    function kare(t) {
      const dt = Math.min(2, (t - onceki) / 16.67);
      onceki = t;
      if (adim(dt) !== false) id = requestAnimationFrame(kare);
    }
    id = requestAnimationFrame(kare);
    return () => cancelAnimationFrame(id);
  }

  function kalpCiz(ctx, x, y, r, renk) {
    ctx.save();
    ctx.fillStyle = renk;
    ctx.translate(x, y - r * 0.7);
    ctx.beginPath();
    ctx.moveTo(0, r * 0.3);
    ctx.bezierCurveTo(0, 0, -r, 0, -r, r * 0.3);
    ctx.bezierCurveTo(-r, r * 0.8, 0, r * 1.1, 0, r * 1.4);
    ctx.bezierCurveTo(0, r * 1.1, r, r * 0.8, r, r * 0.3);
    ctx.bezierCurveTo(r, 0, 0, 0, 0, r * 0.3);
    ctx.fill();
    ctx.restore();
  }

  function yaziCiz(ctx, metin, x, y, boyut, renk = "#fbf3ea") {
    ctx.save();
    ctx.fillStyle = renk;
    ctx.font = `700 ${boyut}px Caveat, cursive`;
    ctx.textAlign = "center";
    ctx.fillText(metin, x, y);
    ctx.restore();
  }

  function dokunma(el, fn) {
    const f = (e) => { e.preventDefault(); fn(); };
    el.addEventListener("pointerdown", f);
    const tus = (e) => { if (e.key === " " || e.key === "ArrowUp") { e.preventDefault(); fn(); } };
    addEventListener("keydown", tus);
    return () => removeEventListener("keydown", tus);
  }

  // ---------- Kule ----------
  function kule(sahne, api) {
    const { c, ctx, w, h } = tuvalKur(sahne);
    const bh = Math.round(Math.min(34, h / 18));
    const zemin = h - 40;
    const kule = [{ x: w * 0.2, w: w * 0.6 }];
    const dusen = [];
    let hareketli, yon, hiz, kamera = 0, bitti = false, mukemmel = 0, yazi = null, zamanlayici;

    function yeniBlok() {
      const ust = kule[kule.length - 1];
      yon = kule.length % 2 ? 1 : -1;
      hiz = Math.min(7, 2.2 + kule.length * 0.12);
      hareketli = { x: yon > 0 ? 0 : w - ust.w, w: ust.w };
    }
    yeniBlok();

    function birak() {
      if (bitti) return;
      const ust = kule[kule.length - 1];
      if (Math.abs(hareketli.x - ust.x) < 5) {
        hareketli.x = ust.x;
        mukemmel++;
        yazi = { metin: mukemmel > 1 ? `Mükemmel ×${mukemmel}` : "Mükemmel!", omur: 1 };
      } else {
        mukemmel = 0;
      }
      const sol = Math.max(hareketli.x, ust.x);
      const sag = Math.min(hareketli.x + hareketli.w, ust.x + ust.w);
      const y = zemin - (kule.length + 1) * bh;
      if (sag <= sol) {
        dusen.push({ ...hareketli, y, vy: 0 });
        bitti = true;
        zamanlayici = setTimeout(() => api.bitti(kule.length - 1), 700);
        return;
      }
      if (hareketli.x < sol) dusen.push({ x: hareketli.x, w: sol - hareketli.x, y, vy: 0 });
      if (hareketli.x + hareketli.w > sag) dusen.push({ x: sag, w: hareketli.x + hareketli.w - sag, y, vy: 0 });
      kule.push({ x: sol, w: sag - sol });
      api.skor(kule.length - 1);
      yeniBlok();
    }

    const renk = (i) => `hsl(${(340 + i * 7) % 360}, 65%, ${62 + (i % 2) * 6}%)`;

    const tusBirak = dokunma(c, birak);
    const dur = dongu((dt) => {
      if (!bitti) {
        hareketli.x += yon * hiz * dt;
        if (hareketli.x < 0) { hareketli.x = 0; yon = 1; }
        if (hareketli.x + hareketli.w > w) { hareketli.x = w - hareketli.w; yon = -1; }
      }
      const hedef = Math.max(0, (kule.length + 2) * bh - h * 0.55);
      kamera += (hedef - kamera) * 0.1 * dt;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(0, kamera);
      kule.forEach((b, i) => {
        ctx.fillStyle = renk(i);
        ctx.fillRect(b.x, zemin - (i + 1) * bh, b.w, bh - 2);
      });
      if (!bitti) {
        ctx.fillStyle = renk(kule.length);
        ctx.fillRect(hareketli.x, zemin - (kule.length + 1) * bh, hareketli.w, bh - 2);
      }
      dusen.forEach((d) => {
        d.vy += 0.5 * dt;
        d.y += d.vy * dt;
        ctx.fillStyle = "rgba(246, 184, 194, 0.6)";
        ctx.fillRect(d.x, d.y, d.w, bh - 2);
      });
      ctx.restore();

      if (yazi) {
        yazi.omur -= 0.02 * dt;
        ctx.globalAlpha = Math.max(0, yazi.omur);
        yaziCiz(ctx, yazi.metin, w / 2, h * 0.22, 34, "#f6b8c2");
        ctx.globalAlpha = 1;
        if (yazi.omur <= 0) yazi = null;
      }
      if (kule.length === 1 && !bitti) yaziCiz(ctx, "Bloğu bırakmak için dokun", w / 2, h * 0.3, 26);
    });
    return () => { dur(); tusBirak(); clearTimeout(zamanlayici); };
  }

  // ---------- Uçan Kalp ----------
  function ucanKalp(sahne, api) {
    const { c, ctx, w, h } = tuvalKur(sahne);
    const kalp = { x: w * 0.3, y: h * 0.45, vy: 0, r: 15 };
    const genislik = 58;
    const bosluk = Math.max(150, Math.min(210, h * 0.27));
    const aralik = Math.max(200, w * 0.6);
    let borular = [], durum = "bekle", skor = 0, hiz = 2.6, salinim = 0, zamanlayici;

    function boruEkle(x) {
      const ust = 60 + Math.random() * (h - bosluk - 120);
      borular.push({ x, ust, gecti: false });
    }

    function zipla() {
      if (durum === "bitti") return;
      if (durum === "bekle") {
        durum = "oyna";
        boruEkle(w + 40);
      }
      kalp.vy = -6.6;
    }

    function carpti() {
      durum = "bitti";
      zamanlayici = setTimeout(() => api.bitti(skor), 600);
    }

    const tusZipla = dokunma(c, zipla);
    const dur = dongu((dt) => {
      if (durum === "bekle") {
        salinim += 0.08 * dt;
        kalp.y = h * 0.45 + Math.sin(salinim) * 8;
      } else {
        kalp.vy += 0.38 * dt;
        kalp.y += kalp.vy * dt;
      }
      if (durum === "oyna") {
        borular.forEach((b) => {
          b.x -= hiz * dt;
          if (!b.gecti && b.x + genislik < kalp.x) {
            b.gecti = true;
            api.skor(++skor);
            hiz = Math.min(4.5, hiz + 0.05);
          }
          const icinde = kalp.x + kalp.r * 0.8 > b.x && kalp.x - kalp.r * 0.8 < b.x + genislik;
          if (icinde && (kalp.y - kalp.r * 0.7 < b.ust || kalp.y + kalp.r * 0.7 > b.ust + bosluk)) carpti();
        });
        borular = borular.filter((b) => b.x > -genislik);
        const son = borular[borular.length - 1];
        if (son && son.x < w - aralik) boruEkle(w + 20);
        if (kalp.y + kalp.r > h || kalp.y - kalp.r < 0) carpti();
      }
      if (durum === "bitti" && kalp.y > h + 40) return false;

      ctx.clearRect(0, 0, w, h);
      borular.forEach((b) => {
        ctx.fillStyle = "#fbf3ea";
        ctx.beginPath();
        const kutu = ctx.roundRect ? ctx.roundRect.bind(ctx) : ctx.rect.bind(ctx);
        kutu(b.x, -10, genislik, b.ust + 10, 10);
        kutu(b.x, b.ust + bosluk, genislik, h - b.ust - bosluk + 10, 10);
        ctx.fill();
        ctx.fillStyle = "#e8768a";
        ctx.fillRect(b.x, b.ust - 14, genislik, 6);
        ctx.fillRect(b.x, b.ust + bosluk + 8, genislik, 6);
      });
      ctx.save();
      ctx.translate(kalp.x, kalp.y);
      ctx.rotate(Math.max(-0.4, Math.min(0.6, kalp.vy * 0.06)));
      kalpCiz(ctx, 0, 0, kalp.r, "#e8768a");
      ctx.restore();
      if (durum === "oyna" || durum === "bitti") yaziCiz(ctx, String(skor), w / 2, 70, 56);
      if (durum === "bekle") yaziCiz(ctx, "Uçmak için dokun", w / 2, h * 0.3, 30);
    });
    return () => { dur(); tusZipla(); clearTimeout(zamanlayici); };
  }

  // ---------- 2048 ----------
  function oyun2048(sahne, api) {
    const kutu = document.createElement("div");
    kutu.className = "t2048";
    sahne.appendChild(kutu);
    const uyari = document.createElement("p");
    uyari.className = "t2048-uyari";
    uyari.textContent = "Kaydırarak sayıları birleştir";
    sahne.appendChild(uyari);

    let tahta = new Array(16).fill(0);
    let skor = 0, kazandi = false, yeni = -1, birlesen = [], zamanlayici;

    function rastgeleEkle() {
      const bos = tahta.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
      if (!bos.length) return;
      yeni = bos[(Math.random() * bos.length) | 0];
      tahta[yeni] = Math.random() < 0.9 ? 2 : 4;
    }

    function ciz() {
      kutu.innerHTML = "";
      tahta.forEach((v, i) => {
        const hucre = document.createElement("div");
        hucre.className = "t2048-hucre";
        if (v) {
          const us = Math.min(11, Math.log2(v));
          hucre.classList.add("dolu");
          hucre.style.setProperty("--us", us);
          hucre.textContent = v === 2048 ? "❤" : v;
          if (v >= 1024) hucre.classList.add("kucuk");
          if (us >= 4) hucre.classList.add("koyu");
          if (i === yeni) hucre.classList.add("yeni");
          if (birlesen.includes(i)) hucre.classList.add("birlesti");
        }
        kutu.appendChild(hucre);
      });
    }

    // yon: 0 sol, 1 sağ, 2 yukarı, 3 aşağı
    function satirlar(yon) {
      const s = [];
      for (let a = 0; a < 4; a++) {
        const satir = [];
        for (let b = 0; b < 4; b++) {
          const i = yon < 2 ? a * 4 + b : b * 4 + a;
          satir.push(i);
        }
        if (yon === 1 || yon === 3) satir.reverse();
        s.push(satir);
      }
      return s;
    }

    function hareket(yon) {
      let oynadi = false;
      birlesen = [];
      satirlar(yon).forEach((satir) => {
        const degerler = satir.map((i) => tahta[i]).filter(Boolean);
        const sonuc = [];
        for (let k = 0; k < degerler.length; k++) {
          if (degerler[k] === degerler[k + 1]) {
            const t = degerler[k] * 2;
            skor += t;
            if (t === 2048 && !kazandi) {
              kazandi = true;
              uyari.textContent = "2048! Sen bir dahisin ❤ Devam edebilirsin";
            }
            birlesen.push(satir[sonuc.length]);
            sonuc.push(t);
            k++;
          } else {
            sonuc.push(degerler[k]);
          }
        }
        satir.forEach((i, k) => {
          const v = sonuc[k] || 0;
          if (tahta[i] !== v) oynadi = true;
          tahta[i] = v;
        });
      });
      if (!oynadi) return;
      rastgeleEkle();
      api.skor(skor);
      ciz();
      if (!hamleVar()) zamanlayici = setTimeout(() => api.bitti(skor), 500);
    }

    function hamleVar() {
      for (let i = 0; i < 16; i++) {
        if (!tahta[i]) return true;
        if (i % 4 < 3 && tahta[i] === tahta[i + 1]) return true;
        if (i < 12 && tahta[i] === tahta[i + 4]) return true;
      }
      return false;
    }

    let baslangic = null;
    const dokunBasla = (e) => { baslangic = { x: e.clientX, y: e.clientY }; };
    const dokunBit = (e) => {
      if (!baslangic) return;
      const dx = e.clientX - baslangic.x;
      const dy = e.clientY - baslangic.y;
      baslangic = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 25) return;
      if (Math.abs(dx) > Math.abs(dy)) hareket(dx < 0 ? 0 : 1);
      else hareket(dy < 0 ? 2 : 3);
    };
    const tus = (e) => {
      const yon = { ArrowLeft: 0, ArrowRight: 1, ArrowUp: 2, ArrowDown: 3 }[e.key];
      if (yon !== undefined) { e.preventDefault(); hareket(yon); }
    };
    sahne.addEventListener("pointerdown", dokunBasla);
    sahne.addEventListener("pointerup", dokunBit);
    addEventListener("keydown", tus);

    rastgeleEkle();
    rastgeleEkle();
    ciz();
    return () => {
      sahne.removeEventListener("pointerdown", dokunBasla);
      sahne.removeEventListener("pointerup", dokunBit);
      removeEventListener("keydown", tus);
      clearTimeout(zamanlayici);
    };
  }

  // ---------- Hafıza ----------
  function hafiza(sahne, api) {
    const yedek = ["❤️", "🌹", "💌", "🍓", "🌙", "⭐", "🧸", "☕"];
    const fotolar = [...(window.FOTOLAR || [])]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);
    const resimler = [...fotolar, ...yedek.slice(0, 8 - fotolar.length)];
    const deste = [...resimler, ...resimler]
      .map((r, i) => ({ r, cift: i % 8, s: Math.random() }))
      .sort((a, b) => a.s - b.s);

    const kutu = document.createElement("div");
    kutu.className = "hafiza";
    sahne.appendChild(kutu);

    let acik = [], bulunan = 0, hamle = 0, kilit = false, zamanlayici;

    deste.forEach((kart) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "hafiza-kart";
      el.innerHTML = `<div class="kart-ic"><div class="kart-yuz kart-on">❤</div><div class="kart-yuz kart-arka"></div></div>`;
      const arka = $(".kart-arka", el);
      if (kart.r.length > 4) {
        const img = new Image();
        img.src = kart.r;
        img.alt = "";
        arka.appendChild(img);
      } else {
        arka.textContent = kart.r;
        arka.classList.add("emoji");
      }
      el.addEventListener("click", () => {
        if (kilit || el.classList.contains("dondu")) return;
        el.classList.add("dondu");
        acik.push({ el, kart });
        if (acik.length < 2) return;
        api.skor(++hamle);
        const [a, b] = acik;
        acik = [];
        if (a.kart.cift === b.kart.cift) {
          a.el.classList.add("eslesti");
          b.el.classList.add("eslesti");
          if (++bulunan === 8) zamanlayici = setTimeout(() => api.bitti(hamle), 600);
        } else {
          kilit = true;
          zamanlayici = setTimeout(() => {
            a.el.classList.remove("dondu");
            b.el.classList.remove("dondu");
            kilit = false;
          }, 800);
        }
      });
      kutu.appendChild(el);
    });
    return () => clearTimeout(zamanlayici);
  }

  // ---------- Oyun listesi ----------
  const OYUNLAR = {
    kule: { ad: "Kule", ikon: "🧱", aciklama: "Blokları üst üste diz", baslat: kule },
    kalp: { ad: "Uçan Kalp", ikon: "💗", aciklama: "Kalbi engellere çarptırma", baslat: ucanKalp },
    t2048: { ad: "2048", ikon: "🔢", aciklama: "Sayıları birleştir, kalbe ulaş", baslat: oyun2048 },
    hafiza: { ad: "Hafıza", ikon: "🃏", aciklama: "Fotoğraf çiftlerini bul", baslat: hafiza, skorAdi: "Hamle", azIyi: true },
  };

  const MESAJLAR = [
    "Benden iyi oynuyorsun, kabul",
    "Bir el daha?",
    "Bu oyunu bile senin kadar sevemedim",
    "Yenersen bir öpücük",
    "Pes etmek yok sevgilim",
  ];

  function rekorOku(id) {
    try { return JSON.parse(localStorage.getItem("ezo-rekor-" + id)); } catch (e) { return null; }
  }
  function rekorYaz(id, v) {
    try { localStorage.setItem("ezo-rekor-" + id, JSON.stringify(v)); } catch (e) { /* kayıt şart değil */ }
  }

  const ekran = $("#oyun");
  const sahne = $(".oyun-sahne", ekran);
  const son = $(".oyun-son", ekran);
  const liste = $("#oyun-listesi");
  let aktifId = null, durdur = null;

  function listeyiCiz() {
    liste.innerHTML = "";
    Object.entries(OYUNLAR).forEach(([id, o]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "oyun-kart gorun gorundu";
      const rekor = rekorOku(id);
      b.innerHTML = `<span class="oyun-ikon"></span><strong></strong><small></small><em></em>`;
      $(".oyun-ikon", b).textContent = o.ikon;
      $("strong", b).textContent = o.ad;
      $("small", b).textContent = o.aciklama;
      $("em", b).textContent = rekor === null ? "Hiç oynanmadı" : `Rekor: ${rekor}`;
      b.addEventListener("click", () => ac(id));
      liste.appendChild(b);
    });
  }

  function basla() {
    if (durdur) durdur();
    sahne.innerHTML = "";
    son.hidden = true;
    const o = OYUNLAR[aktifId];
    $(".oyun-skor-adi", ekran).textContent = o.skorAdi || "Skor";
    $(".oyun-skor", ekran).textContent = 0;
    const rekor = rekorOku(aktifId);
    $(".oyun-rekor", ekran).textContent = rekor === null ? "–" : rekor;
    durdur = o.baslat(sahne, {
      skor: (n) => { $(".oyun-skor", ekran).textContent = n; },
      bitti,
    });
  }

  function bitti(skor) {
    if (!aktifId || !son.hidden) return;
    const o = OYUNLAR[aktifId];
    const rekor = rekorOku(aktifId);
    const yeniRekor = (o.azIyi || skor > 0) && (rekor === null || (o.azIyi ? skor < rekor : skor > rekor));
    if (yeniRekor) rekorYaz(aktifId, skor);
    $(".oyun-rekor", ekran).textContent = yeniRekor ? skor : rekor;
    $(".oyun-son-baslik", ekran).textContent = yeniRekor ? "Yeni rekor! 🎉" : `${o.skorAdi || "Skor"}: ${skor}`;
    $(".oyun-son-mesaj", ekran).textContent = MESAJLAR[(Math.random() * MESAJLAR.length) | 0];
    son.hidden = false;
  }

  function ac(id) {
    aktifId = id;
    ekran.hidden = false;
    document.body.classList.add("kilitli");
    $(".oyun-baslik", ekran).textContent = OYUNLAR[id].ad;
    basla();
  }

  function kapat() {
    if (durdur) durdur();
    durdur = null;
    aktifId = null;
    sahne.innerHTML = "";
    ekran.hidden = true;
    document.body.classList.remove("kilitli");
    listeyiCiz();
  }

  $(".oyun-kapat", ekran).addEventListener("click", kapat);
  $(".oyun-tekrar", ekran).addEventListener("click", basla);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !ekran.hidden) kapat(); });
  listeyiCiz();
})();
