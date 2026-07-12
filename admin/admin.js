/* ============================================================
   AQUA TOUCH Admin — admin.js
   Demo etkileşimleri: PHP bağlanınca kaydetme uçları gerçek olacak.
   ============================================================ */

/* ---------- Toast ---------- */
const Toast = (() => {
  let c = null;
  const OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  const ERR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  function show(msg, type = "ok") {
    if (!c) { c = document.createElement("div"); c.className = "toast-container"; document.body.appendChild(c); }
    const el = document.createElement("div");
    el.className = "toast" + (type === "err" ? " err" : "");
    el.innerHTML = (type === "err" ? ERR : OK) + "<span></span>";
    el.querySelector("span").textContent = msg;
    c.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }
  return { show };
})();

/* ---------- Mobil sidebar ---------- */
document.querySelector(".menu-btn")?.addEventListener("click", () =>
  document.body.classList.toggle("nav-open")
);
document.addEventListener("click", (e) => {
  if (document.body.classList.contains("nav-open") &&
      !e.target.closest(".sidebar") && !e.target.closest(".menu-btn")) {
    document.body.classList.remove("nav-open");
  }
});

/* ---------- Sekmeler ---------- */
document.querySelectorAll("[data-tabs]").forEach((tabs) => {
  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-tab]");
    if (!btn) return;
    tabs.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
    document.querySelectorAll(".tab-pane").forEach((p) =>
      p.classList.toggle("active", p.id === btn.dataset.tab)
    );
  });
});

/* ---------- Bölüm kartları: dirty-state + kaydet ---------- */
document.querySelectorAll(".section-card").forEach((card) => {
  card.addEventListener("input", () => card.classList.add("dirty"));
  card.querySelector(".btn-save")?.addEventListener("click", () => {
    // PHP entegrasyonunda: fetch('api/save.php', { body: new FormData(...) })
    card.classList.remove("dirty");
    const name = card.querySelector(".card__head h2")?.textContent || "Bölüm";
    Toast.show(name + " kaydedildi");
  });
});

/* ---------- Görsel slotları: seç → önizle, kaldır ---------- */
document.querySelectorAll(".img-slot").forEach((slot) => {
  const input = slot.querySelector('input[type="file"]');
  if (!input) return;

  input.addEventListener("change", () => {
    const f = input.files && input.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { Toast.show("Lütfen bir görsel dosyası seçin.", "err"); return; }
    if (f.size > 8 * 1024 * 1024) { Toast.show("Görsel 8MB'den küçük olmalı.", "err"); return; }

    slot.querySelector("img.preview")?.remove();
    const img = document.createElement("img");
    img.className = "preview";
    img.alt = "";
    img.src = URL.createObjectURL(f);
    slot.prepend(img);
    slot.classList.add("has-img");
    slot.closest(".section-card")?.classList.add("dirty");
  });

  slot.querySelector(".remove")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    slot.querySelector("img.preview")?.remove();
    slot.classList.remove("has-img");
    input.value = "";
    slot.closest(".section-card")?.classList.add("dirty");
  });
});

/* ---------- Tablo aksiyonları (demo) ---------- */
document.querySelectorAll("[data-toggle-status]").forEach((sw) => {
  sw.addEventListener("change", () => {
    const row = sw.closest("tr");
    const b = row?.querySelector(".badge");
    if (b) {
      const on = sw.checked;
      b.className = "badge " + (on ? "badge--green" : "badge--gray");
      b.textContent = on ? "Aktif" : "Pasif";
    }
    Toast.show("Durum güncellendi");
  });
});

document.querySelectorAll("[data-mark-read]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const row = btn.closest("tr");
    const b = row?.querySelector(".badge");
    if (b) { b.className = "badge badge--gray"; b.textContent = "Okundu"; }
    btn.remove();
    Toast.show("Okundu olarak işaretlendi");
  });
});

/* ---------- Login (demo) ---------- */
document.querySelector("#login-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  window.location.href = "index.html";
});

/* ---------- Sayfadan ayrılırken kaydedilmemiş uyarısı ---------- */
window.addEventListener("beforeunload", (e) => {
  if (document.querySelector(".section-card.dirty")) e.preventDefault();
});
