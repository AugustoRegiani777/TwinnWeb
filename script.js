const viandaSlides = Array.from(document.querySelectorAll(".vianda-slide"));
const categoryButtons = Array.from(document.querySelectorAll(".btn-vianda-categoria"));
const carouselButtons = document.querySelectorAll("[data-carousel-direction]");
const carouselStage = document.querySelector(".viandas-carousel-stage");
const viandaOrder = viandaSlides.map((slide) => slide.dataset.categoria);
let activeViandaIndex = Math.max(0, viandaOrder.indexOf("premium"));
let touchStartX = 0;

function updateViandaCarousel(index) {
  if (!viandaSlides.length) return;

  activeViandaIndex = (index + viandaSlides.length) % viandaSlides.length;
  const prevIndex = (activeViandaIndex - 1 + viandaSlides.length) % viandaSlides.length;
  const nextIndex = (activeViandaIndex + 1) % viandaSlides.length;

  viandaSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === activeViandaIndex);
    slide.classList.toggle("is-prev", slideIndex === prevIndex);
    slide.classList.toggle("is-next", slideIndex === nextIndex);
    slide.classList.toggle("is-hidden", slideIndex !== activeViandaIndex && slideIndex !== prevIndex && slideIndex !== nextIndex);
  });

  const activeCategory = viandaSlides[activeViandaIndex].dataset.categoria;
  categoryButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.categoria === activeCategory);
  });
}

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const categoryIndex = viandaOrder.indexOf(button.dataset.categoria);
    if (categoryIndex < 0) return;
    updateViandaCarousel(categoryIndex);
  });
});

carouselButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.carouselDirection;
    updateViandaCarousel(activeViandaIndex + (direction === "next" ? 1 : -1));
  });
});

if (carouselStage) {
  carouselStage.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  carouselStage.addEventListener("touchend", (event) => {
    const touchEndX = event.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) < 45) return;
    updateViandaCarousel(activeViandaIndex + (deltaX < 0 ? 1 : -1));
  }, { passive: true });
}

updateViandaCarousel(activeViandaIndex);

// ── Modal pedido de viandas ──
const VIANDA_LABELS = { premium: "Especiales", light: "Light", classic: "Classic" };

const VIANDA_SABORES = {
  premium: [
    "Lasagna de carne",
    "Colita de cuadril al horno",
    "Milanesa napolitana",
    "Pollo relleno al horno",
    "Cerdo agridulce con arroz",
    "Ravioles caseros con salsa",
  ],
  light: [
    "Pechuga al limón con ensalada",
    "Berenjenas asadas con mozzarella",
    "Medallón de zapallito relleno",
    "Bowl de quinoa con vegetales",
    "Salmón al vapor con ensalada",
    "Wrap de pollo con verduras",
  ],
  classic: [
    "Milanesa con papas fritas",
    "Pastel de papas",
    "Arroz con pollo",
    "Ñoquis con tuco",
    "Guiso de lentejas",
    "Tapa de asado con papas",
  ],
};

// quantities[tipo].base = porciones sin especificar
// quantities[tipo].sabores = { "nombre sabor": cantidad }
const quantities = {
  premium: { base: 0, sabores: {} },
  light:   { base: 0, sabores: {} },
  classic: { base: 0, sabores: {} },
};

function categoryTotal(tipo) {
  const saborSum = Object.values(quantities[tipo].sabores).reduce((a, b) => a + b, 0);
  return quantities[tipo].base + saborSum;
}

function grandTotal() {
  return ["premium", "light", "classic"].reduce((sum, t) => sum + categoryTotal(t), 0);
}

function refreshModal() {
  const total = grandTotal();

  ["premium", "light", "classic"].forEach((tipo) => {
    const block = viandaModal.querySelector(`.vianda-category-block[data-tipo="${tipo}"]`);
    if (!block) return;
    const catTotal = categoryTotal(tipo);
    block.querySelector(".vianda-qty-value").textContent = catTotal;
    block.querySelector("[data-action='minus']").disabled = quantities[tipo].base <= 0;

    // Actualizar contadores de sabores en el panel expandido
    const panel = block.querySelector(".vianda-expand-panel");
    if (panel && !panel.hidden) {
      panel.querySelectorAll(".vianda-sabor-row").forEach((row) => {
        const sabor = row.dataset.sabor;
        const qty = quantities[tipo].sabores[sabor] || 0;
        row.querySelector(".vianda-qty-value-sm").textContent = qty;
        row.querySelector("[data-action='minus']").disabled = qty <= 0;
      });
    }
  });

  viandaTotalEl.textContent = total + (total === 1 ? " vianda" : " viandas");
  const valid = total >= 5;
  viandaMinNote.classList.toggle("is-hidden", valid);
  viandaConfirmarBtn.disabled = !valid;
}

function buildExpandPanel(panel, tipo) {
  if (panel.dataset.built) return;
  panel.dataset.built = "1";
  VIANDA_SABORES[tipo].forEach((sabor) => {
    const row = document.createElement("div");
    row.className = "vianda-sabor-row";
    row.dataset.sabor = sabor;
    row.innerHTML =
      `<span class="vianda-sabor-name">${sabor}</span>` +
      `<div class="vianda-qty-controls-sm">` +
      `<button class="vianda-qty-btn-sm" type="button" data-action="minus" aria-label="Restar ${sabor}">&#x2212;</button>` +
      `<span class="vianda-qty-value-sm">0</span>` +
      `<button class="vianda-qty-btn-sm" type="button" data-action="plus" aria-label="Sumar ${sabor}">&#x2B;</button>` +
      `</div>`;

    row.querySelector("[data-action='plus']").addEventListener("click", () => {
      quantities[tipo].sabores[sabor] = (quantities[tipo].sabores[sabor] || 0) + 1;
      refreshModal();
    });
    row.querySelector("[data-action='minus']").addEventListener("click", () => {
      if ((quantities[tipo].sabores[sabor] || 0) > 0) {
        quantities[tipo].sabores[sabor]--;
        refreshModal();
      }
    });
    panel.appendChild(row);
  });
}

function buildWhatsAppMsg() {
  const total = grandTotal();
  const partes = ["premium", "light", "classic"]
    .filter((tipo) => categoryTotal(tipo) > 0)
    .map((tipo) => {
      const catTotal = categoryTotal(tipo);
      const especificados = Object.entries(quantities[tipo].sabores)
        .filter(([, q]) => q > 0)
        .map(([sabor, q]) => `${sabor} ×${q}`);
      const base = quantities[tipo].base;
      if (base > 0) especificados.push(`sin especificar ×${base}`);
      const detalle = especificados.length ? ` (${especificados.join(", ")})` : "";
      return `${VIANDA_LABELS[tipo]}: ${catTotal}${detalle}`;
    });
  return `Hola Twins, quiero hacer un pedido de viandas semanales: ${partes.join("; ")}. Total: ${total} viandas.`;
}

const viandaModal = document.getElementById("viandaModal");
const viandaTotalEl = viandaModal ? viandaModal.querySelector(".vianda-total-value") : null;
const viandaMinNote = document.getElementById("viandaMinNote");
const viandaConfirmarBtn = document.getElementById("viandaConfirmar");

function openViandaModal(tipoDestacado) {
  ["premium", "light", "classic"].forEach((t) => {
    quantities[t].base = 0;
    quantities[t].sabores = {};
  });
  viandaModal.querySelectorAll(".vianda-category-block").forEach((block) => {
    block.classList.toggle("is-destacado", block.dataset.tipo === tipoDestacado);
  });
  refreshModal();
  viandaModal.removeAttribute("aria-hidden");
  viandaModal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeViandaModal() {
  viandaModal.setAttribute("aria-hidden", "true");
  viandaModal.classList.remove("is-open");
  document.body.style.overflow = "";
}

if (viandaModal) {
  document.querySelectorAll(".btn-vianda-wa").forEach((btn) => {
    btn.addEventListener("click", () => openViandaModal(btn.dataset.vianda));
  });

  viandaModal.querySelector(".vianda-modal-close").addEventListener("click", closeViandaModal);
  viandaModal.addEventListener("click", (e) => { if (e.target === viandaModal) closeViandaModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && viandaModal.classList.contains("is-open")) closeViandaModal();
  });

  // Controles principales de cada categoría (base)
  viandaModal.querySelectorAll(".vianda-category-block").forEach((block) => {
    const tipo = block.dataset.tipo;

    block.querySelector("[data-action='plus']").addEventListener("click", () => {
      quantities[tipo].base++;
      refreshModal();
    });
    block.querySelector("[data-action='minus']").addEventListener("click", () => {
      if (quantities[tipo].base > 0) { quantities[tipo].base--; refreshModal(); }
    });

    // Expand/colapsar sabores
    const expandBtn = block.querySelector(".vianda-expand-btn");
    const panel = block.querySelector(".vianda-expand-panel");
    expandBtn.addEventListener("click", () => {
      const open = !panel.hidden;
      panel.hidden = open;
      expandBtn.setAttribute("aria-expanded", String(!open));
      expandBtn.classList.toggle("is-open", !open);
      if (!open) buildExpandPanel(panel, tipo);
    });
  });

  viandaConfirmarBtn.addEventListener("click", () => {
    const msg = buildWhatsAppMsg();
    window.open(`https://wa.me/541159478705?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    closeViandaModal();
  });
}

document.querySelectorAll(".btn-cotizar-catering").forEach((button) => {
  button.addEventListener("click", () => {
    const producto = button.dataset.producto;
    void producto;
  });
});

const heroSlides = document.querySelectorAll(".hero-slide");
let heroSlideIndex = 0;

function setActiveHeroSlide(index) {
  heroSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === index);
  });
}

if (heroSlides.length > 1) {
  window.setInterval(() => {
    heroSlideIndex = (heroSlideIndex + 1) % heroSlides.length;
    setActiveHeroSlide(heroSlideIndex);
  }, 3500);
}
