/* ============================================================
   AQUA TOUCH — main.js v2 (bağımlılıksız)
   ============================================================ */

/* ---------- Mobil menü ---------- */
(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open);
  });

  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      nav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
})();

/* ---------- Toast ---------- */
const Toast = (function () {
  let container = null;
  const ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
  };

  function getContainer() {
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      container.setAttribute("aria-live", "polite");
      document.body.appendChild(container);
    }
    return container;
  }

  function dismiss(el) {
    el.classList.add("is-hiding");
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }

  function show(message, opts = {}) {
    const { type = "info", title = "", duration = 4000 } = opts;
    const el = document.createElement("div");
    el.className = "toast toast--" + type;
    el.setAttribute("role", "status");
    el.innerHTML =
      '<span class="toast__icon">' + (ICONS[type] || ICONS.info) + "</span>" +
      '<div class="toast__msg">' + (title ? "<strong></strong>" : "") + "<span></span></div>" +
      '<button class="toast__close" aria-label="Kapat">' + ICONS.close + "</button>";
    if (title) el.querySelector("strong").textContent = title;
    el.querySelector(".toast__msg span").textContent = message;
    el.querySelector(".toast__close").addEventListener("click", () => dismiss(el));
    getContainer().appendChild(el);
    if (duration > 0) setTimeout(() => el.isConnected && dismiss(el), duration);
    return el;
  }

  return { show };
})();

/* ---------- Form validasyonu ---------- */
(function () {
  const RULES = {
    required: (v) => v.trim().length > 0,
    email: (v) => v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    phone: (v) => v.replace(/\D/g, "").length === 11,
    checked: (v, el) => el.checked
  };

  document.querySelectorAll("form[data-validate]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault(); // statik demo: submit yok
      let ok = true;

      form.querySelectorAll("[data-rule]").forEach((el) => {
        const valid = el.dataset.rule.split("|")
          .every((r) => (RULES[r] ? RULES[r](el.value, el) : true));
        const group = el.closest(".form-group") || el.closest(".form-check-group");
        if (group) group.classList.toggle("has-error", !valid);
        el.classList.toggle("is-invalid", !valid);
        if (!valid) ok = false;
      });

      if (!ok) {
        Toast.show("Lütfen işaretli alanları kontrol edin.", { type: "error", title: "Form eksik" });
        const first = form.querySelector(".is-invalid");
        if (first) first.focus();
        return;
      }

      // Demo başarı akışı (PHP bağlanınca burası kalkacak)
      Toast.show("Talebiniz alındı. Uzman ekibimiz en kısa sürede sizinle iletişime geçecek.", {
        type: "success",
        title: "Teşekkürler!"
      });
      form.reset();
    });

    form.addEventListener("input", (e) => {
      const el = e.target;
      if (!el.dataset.rule) return;
      el.classList.remove("is-invalid");
      const group = el.closest(".form-group") || el.closest(".form-check-group");
      if (group) group.classList.remove("has-error");
    });
  });
})();

/* ---------- Ürün kategori filtresi (tabs) ---------- */
(function () {
  const tabs = document.querySelector("[data-tabs]");
  if (!tabs) return;
  const cards = document.querySelectorAll("[data-cat]");

  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-filter]");
    if (!btn) return;
    tabs.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
    const f = btn.dataset.filter;
    cards.forEach((c) => {
      c.style.display = f === "all" || c.dataset.cat === f ? "" : "none";
    });
  });

  // ?kategori=... ile gelindiyse ilgili tabı aç
  const params = new URLSearchParams(location.search);
  const cat = params.get("kategori");
  if (cat) {
    const btn = tabs.querySelector('[data-filter="' + cat + '"]');
    if (btn) btn.click();
  }
})();

/* ---------- Sayaç animasyonu (stats) ---------- */
(function () {
  const nums = document.querySelectorAll("[data-count]");
  if (!nums.length || !("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      io.unobserve(el);

      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || "";
      const dur = 1400;
      const t0 = performance.now();

      function tick(t) {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.firstChild.textContent = Math.round(target * eased).toLocaleString("tr-TR");
        if (p < 1) requestAnimationFrame(tick);
        else el.firstChild.textContent = target.toLocaleString("tr-TR");
      }
      el.innerHTML = "0<em>" + suffix + "</em>";
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });

  nums.forEach((n) => io.observe(n));
})();

/* ---------- Scroll reveal ---------- */
(function () {
  const els = document.querySelectorAll(".reveal");
  if (!els.length || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach((el, i) => {
    el.style.transitionDelay = Math.min(i % 6, 3) * 60 + "ms";
    io.observe(el);
  });
})();

/* ---------- Slider ---------- */
(function () {
  const slider = document.querySelector(".slider");
  if (!slider) return;
  const track = slider.querySelector(".slider__track");
  const slides = slider.querySelectorAll(".slider__slide");
  const dots = slider.querySelectorAll(".slider__dots button");
  if (slides.length < 2) return;

  let index = 0, timer = null;

  function go(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = "translateX(-" + index * 100 + "%)";
    dots.forEach((d, n) => d.classList.toggle("active", n === index));
  }
  function play() { timer = setInterval(() => go(index + 1), 6000); }
  function stop() { clearInterval(timer); }

  slider.querySelector(".slider__nav--prev").addEventListener("click", () => { stop(); go(index - 1); play(); });
  slider.querySelector(".slider__nav--next").addEventListener("click", () => { stop(); go(index + 1); play(); });
  dots.forEach((d) => d.addEventListener("click", () => { stop(); go(+d.dataset.slide); play(); }));

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", play);

  let startX = null;
  slider.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; stop(); }, { passive: true });
  slider.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    startX = null; play();
  }, { passive: true });

  play();
})();

/* ---------- Telefon input mask: 0xxx xxx xx xx ---------- */
(function () {
  document.querySelectorAll('input[type="tel"]').forEach((el) => {
    el.setAttribute("maxlength", "14");
    el.setAttribute("placeholder", "05xx xxx xx xx");

    el.addEventListener("input", () => {
      let d = el.value.replace(/\D/g, "");
      if (d && d[0] !== "0") d = "0" + d;     // başa 0 zorunlu
      d = d.slice(0, 11);                      // 11 hane
      const parts = [d.slice(0, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
      el.value = parts.filter(Boolean).join(" ");
    });
  });
})();

/* ---------- YouTube lite embed ----------
   Kullanım: <div class="video-embed" data-yt="VIDEO_ID"></div>
   ID boşsa "yakında" durumu gösterilir; ID gelince tek attribute doldurulur.
   Tıklamada iframe yüklenir (sayfa hızını korur), youtube-nocookie kullanılır. */
(function () {
  document.querySelectorAll(".video-embed").forEach((box) => {
    const id = (box.dataset.yt || "").trim();

    if (!id) {
      box.classList.add("is-empty");
      box.innerHTML =
        '<div class="play"><span class="play-btn">' +
        '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>' +
        '</span><span>Tanıtım videosu yakında</span></div>';
      return;
    }

    box.innerHTML =
      '<img class="thumb" src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="Video önizleme" loading="lazy">' +
      '<div class="play"><span class="play-btn">' +
      '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>' +
      '</span><span>Videoyu izle</span></div>';

    box.addEventListener("click", () => {
      box.innerHTML =
        '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
        '?autoplay=1&rel=0" title="Tanıtım videosu" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    }, { once: true });
  });
})();


/* ---------- Ürün galeri slider'ı ---------- */
(function () {
  const g = document.querySelector("[data-gallery]");
  if (!g) return;
  const main = g.querySelector(".product-gallery__main > img");
  const thumbs = [...g.querySelectorAll(".product-gallery__thumbs button")];
  if (thumbs.length < 2) return;
  const srcs = thumbs.map((b) => b.querySelector("img").src);
  let i = 0;

  function go(n) {
    i = (n + srcs.length) % srcs.length;
    main.classList.add("switching");
    setTimeout(() => {
      main.src = srcs[i];
      main.classList.remove("switching");
    }, 180);
    thumbs.forEach((b, k) => b.classList.toggle("active", k === i));
  }

  thumbs.forEach((b, k) => b.addEventListener("click", () => go(k)));
  g.querySelector(".gallery-nav--prev").addEventListener("click", () => go(i - 1));
  g.querySelector(".gallery-nav--next").addEventListener("click", () => go(i + 1));

  // Dokunmatik kaydırma
  let sx = null;
  main.parentElement.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
  main.parentElement.addEventListener("touchend", (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    sx = null;
  }, { passive: true });
})();
