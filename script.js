(function () {
  const S = window.SITE;
  const $ = (sel) => document.querySelector(sel);
  const azHareket = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Metinleri yerleştir ----------
  document.querySelectorAll("[data-alan]").forEach((el) => {
    el.textContent = S[el.dataset.alan] || "";
  });
  document.title = `${S.isim} · Tanışmamızın 2. yılı`;

  // ---------- Albüm ----------
  // foto/1.jpg, foto/2.jpg ... sırayla denenir; olmayanlar sessizce çıkarılır.
  const album = $("#album");
  let bekleyen = S.fotoSayisi;
  let yuklenen = 0;
  function fotoBitti(basarili) {
    if (basarili) yuklenen++;
    if (--bekleyen === 0 && yuklenen === 0) $("#album-bolum").hidden = true;
  }
  for (let i = 1; i <= S.fotoSayisi; i++) {
    const kart = document.createElement("button");
    kart.type = "button";
    kart.className = "foto gorun";
    kart.style.setProperty("--aci", `${((i * 37) % 7) - 3}deg`);
    const img = new Image();
    img.alt = `Fotoğraf ${i}`;
    img.decoding = "async";
    img.onload = () => fotoBitti(true);
    img.onerror = () => { kart.remove(); fotoBitti(false); };
    img.src = `foto/${i}.${S.fotoUzantisi}`;
    kart.appendChild(img);
    kart.addEventListener("click", () => buyut(img));
    album.appendChild(kart);
  }

  // ---------- Fotoğraf büyütme ----------
  const buyutKutu = $("#buyut");
  const buyutImg = buyutKutu.querySelector("img");
  let siradaki = 0;
  const fotolar = () => [...album.querySelectorAll("img")];

  function goster(n) {
    const liste = fotolar();
    siradaki = (n + liste.length) % liste.length;
    buyutImg.src = liste[siradaki].src;
  }
  function buyut(img) {
    goster(fotolar().indexOf(img));
    buyutKutu.hidden = false;
    document.body.classList.add("kilitli");
  }
  function kapat() {
    buyutKutu.hidden = true;
    document.body.classList.remove("kilitli");
  }
  buyutKutu.querySelector(".buyut-kapat").addEventListener("click", kapat);
  buyutKutu.querySelector(".buyut-onceki").addEventListener("click", () => goster(siradaki - 1));
  buyutKutu.querySelector(".buyut-sonraki").addEventListener("click", () => goster(siradaki + 1));
  buyutKutu.addEventListener("click", (e) => { if (e.target === buyutKutu) kapat(); });
  addEventListener("keydown", (e) => {
    if (buyutKutu.hidden) return;
    if (e.key === "Escape") kapat();
    if (e.key === "ArrowLeft") goster(siradaki - 1);
    if (e.key === "ArrowRight") goster(siradaki + 1);
  });
  let dokunX = null;
  buyutKutu.addEventListener("touchstart", (e) => { dokunX = e.touches[0].clientX; }, { passive: true });
  buyutKutu.addEventListener("touchend", (e) => {
    if (dokunX === null) return;
    const dx = e.changedTouches[0].clientX - dokunX;
    if (Math.abs(dx) > 40) goster(siradaki + (dx < 0 ? 1 : -1));
    dokunX = null;
  });

  // ---------- Sebepler ----------
  const sebepler = $("#sebepler");
  S.sebepler.forEach((metin, i) => {
    const kart = document.createElement("button");
    kart.type = "button";
    kart.className = "kart gorun";
    kart.setAttribute("aria-label", `Sebep ${i + 1}`);
    kart.innerHTML = `
      <div class="kart-ic">
        <div class="kart-yuz kart-on">${i + 1}</div>
        <div class="kart-yuz kart-arka"></div>
      </div>`;
    kart.querySelector(".kart-arka").textContent = metin;
    kart.addEventListener("click", (e) => {
      kart.classList.toggle("dondu");
      if (kart.classList.contains("dondu")) patlat(e.clientX, e.clientY, 8);
    });
    sebepler.appendChild(kart);
  });

  // ---------- Mektup ----------
  const mektup = $("#mektup");
  S.mektup.forEach((satir) => {
    const p = document.createElement("p");
    p.textContent = satir;
    mektup.appendChild(p);
  });

  // ---------- Sayaç ----------
  const baslangic = new Date(S.tanismaTarihi);
  function sayacGuncelle() {
    const simdi = new Date();
    let yil = simdi.getFullYear() - baslangic.getFullYear();
    const yildonumu = new Date(baslangic);
    yildonumu.setFullYear(baslangic.getFullYear() + yil);
    if (yildonumu > simdi) {
      yil--;
      yildonumu.setFullYear(baslangic.getFullYear() + yil);
    }
    let fark = Math.max(0, simdi - yildonumu) / 1000;
    const gun = Math.floor(fark / 86400); fark -= gun * 86400;
    const saat = Math.floor(fark / 3600); fark -= saat * 3600;
    const dk = Math.floor(fark / 60);
    const sn = Math.floor(fark - dk * 60);
    $("#s-yil").textContent = Math.max(0, yil);
    $("#s-gun").textContent = gun;
    $("#s-saat").textContent = saat;
    $("#s-dk").textContent = dk;
    $("#s-sn").textContent = sn;
    $("#s-toplam").textContent = Math.max(0, Math.floor((simdi - baslangic) / 86400000)).toLocaleString("tr-TR");
  }
  sayacGuncelle();
  setInterval(sayacGuncelle, 1000);

  // ---------- Kaydırınca belirme ----------
  document.querySelectorAll(".bolum > h2, .sayac, .mektup, .final-yazi").forEach((el) => el.classList.add("gorun"));
  const gozcu = new IntersectionObserver((girdiler) => {
    girdiler.forEach((g) => {
      if (g.isIntersecting) {
        g.target.classList.add("gorundu");
        gozcu.unobserve(g.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".gorun").forEach((el) => gozcu.observe(el));

  // ---------- Kalp parçacıkları ----------
  const tuval = $("#kalpler");
  const ctx = tuval.getContext("2d");
  let parcaciklar = [];
  let dongu = null;

  function boyutla() {
    const dpr = window.devicePixelRatio || 1;
    tuval.width = innerWidth * dpr;
    tuval.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  boyutla();
  addEventListener("resize", boyutla);

  function kalpCiz(x, y, r, renk, alfa) {
    ctx.save();
    ctx.globalAlpha = alfa;
    ctx.fillStyle = renk;
    ctx.translate(x, y);
    ctx.beginPath();
    ctx.moveTo(0, r * 0.3);
    ctx.bezierCurveTo(0, 0, -r, 0, -r, r * 0.3);
    ctx.bezierCurveTo(-r, r * 0.8, 0, r * 1.1, 0, r * 1.4);
    ctx.bezierCurveTo(0, r * 1.1, r, r * 0.8, r, r * 0.3);
    ctx.bezierCurveTo(r, 0, 0, 0, 0, r * 0.3);
    ctx.fill();
    ctx.restore();
  }

  const renkler = ["#e8768a", "#f6b8c2", "#d4485f", "#ffd6dc"];

  function patlat(x, y, adet) {
    if (azHareket) return;
    for (let i = 0; i < adet; i++) {
      const aci = Math.random() * Math.PI * 2;
      const hiz = 2 + Math.random() * 5;
      parcaciklar.push({
        x, y,
        vx: Math.cos(aci) * hiz,
        vy: Math.sin(aci) * hiz - 3,
        r: 5 + Math.random() * 9,
        renk: renkler[(Math.random() * renkler.length) | 0],
        omur: 1,
      });
    }
    if (!dongu) dongu = requestAnimationFrame(ciz);
  }

  function yagdir(adet) {
    if (azHareket) return;
    for (let i = 0; i < adet; i++) {
      parcaciklar.push({
        x: Math.random() * innerWidth,
        y: -20 - Math.random() * innerHeight * 0.6,
        vx: (Math.random() - 0.5) * 1.2,
        vy: 1.5 + Math.random() * 2.5,
        r: 6 + Math.random() * 10,
        renk: renkler[(Math.random() * renkler.length) | 0],
        omur: 1,
        yagmur: true,
      });
    }
    if (!dongu) dongu = requestAnimationFrame(ciz);
  }

  function ciz() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parcaciklar = parcaciklar.filter((p) => p.omur > 0 && p.y < innerHeight + 40);
    parcaciklar.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.yagmur) {
        p.x += Math.sin(p.y / 40) * 0.6;
        if (p.y > innerHeight * 0.75) p.omur -= 0.02;
      } else {
        p.vy += 0.15;
        p.vx *= 0.98;
        p.omur -= 0.015;
      }
      kalpCiz(p.x, p.y, p.r, p.renk, Math.max(0, p.omur));
    });
    dongu = parcaciklar.length ? requestAnimationFrame(ciz) : null;
  }

  $("#kalp-dugme").addEventListener("click", (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    patlat(r.left + r.width / 2, r.top + r.height / 2, 30);
  });

  // ---------- Müzik ----------
  const muzik = $("#muzik");
  const muzikDugme = $("#muzik-dugme");
  if (S.muzik) {
    muzik.src = S.muzik;
    muzikDugme.hidden = false;
    muzik.addEventListener("play", () => muzikDugme.classList.add("caliyor"));
    muzik.addEventListener("pause", () => muzikDugme.classList.remove("caliyor"));
    muzikDugme.addEventListener("click", () => (muzik.paused ? muzik.play() : muzik.pause()));
  }

  // ---------- Zarfı aç ----------
  const zarf = $("#zarf");
  function zarfiAc() {
    if (zarf.classList.contains("acildi")) return;
    zarf.classList.add("acildi");
    document.body.classList.remove("kilitli");
    if (S.muzik) muzik.play().catch(() => {});
    setTimeout(() => yagdir(45), 400);
  }
  zarf.addEventListener("click", zarfiAc);
  zarf.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); zarfiAc(); }
  });
  zarf.focus();
})();
