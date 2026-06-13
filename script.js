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

const viandaModal = document.getElementById("viandaModal");
const viandaQtyRows = viandaModal ? Array.from(viandaModal.querySelectorAll(".vianda-qty-row")) : [];
const viandaTotalEl = viandaModal ? viandaModal.querySelector(".vianda-total-value") : null;
const viandaMinNote = document.getElementById("viandaMinNote");
const viandaContinuarBtn = document.getElementById("viandaContinuar");
const viandaConfirmarBtn = document.getElementById("viandaConfirmar");
const viandaVolverBtn = document.getElementById("viandaVolver");
const viandaStep1 = document.getElementById("viandaStep1");
const viandaStep2 = document.getElementById("viandaStep2");
const viandaSaboresList = document.getElementById("viandaSaboresList");
const stepIndicators = viandaModal ? Array.from(viandaModal.querySelectorAll("[data-step-indicator]")) : [];

const quantities = { premium: 0, light: 0, classic: 0 };

function updateStep1() {
  let total = 0;
  viandaQtyRows.forEach((row) => {
    const tipo = row.dataset.tipo;
    const qty = quantities[tipo];
    row.querySelector(".vianda-qty-value").textContent = qty;
    row.querySelector("[data-action='minus']").disabled = qty <= 0;
    total += qty;
  });
  if (viandaTotalEl) {
    viandaTotalEl.textContent = total + (total === 1 ? " vianda" : " viandas");
  }
  const valid = total >= 5;
  if (viandaMinNote) viandaMinNote.classList.toggle("is-hidden", valid);
  if (viandaContinuarBtn) viandaContinuarBtn.disabled = !valid;
}

function setStep(n) {
  stepIndicators.forEach((el) => {
    el.classList.toggle("is-active", Number(el.dataset.stepIndicator) === n);
  });
  if (n === 1) {
    viandaStep1.hidden = false;
    viandaStep2.hidden = true;
  } else {
    buildSaboresUI();
    viandaStep1.hidden = true;
    viandaStep2.hidden = false;
    viandaModal.querySelector(".vianda-modal").scrollTop = 0;
  }
}

function buildSaboresUI() {
  if (!viandaSaboresList) return;
  viandaSaboresList.innerHTML = "";
  Object.entries(quantities)
    .filter(([, q]) => q > 0)
    .forEach(([tipo, qty]) => {
      const section = document.createElement("div");
      section.className = "vianda-sabores-section";

      const header = document.createElement("div");
      header.className = "vianda-sabores-header";
      header.innerHTML = `<strong>${VIANDA_LABELS[tipo]}</strong><span class="vianda-sabores-badge">${qty} vianda${qty > 1 ? "s" : ""}</span>`;
      section.appendChild(header);

      const items = document.createElement("div");
      items.className = "vianda-sabores-items";

      VIANDA_SABORES[tipo].forEach((sabor, i) => {
        const id = `sabor-${tipo}-${i}`;
        const label = document.createElement("label");
        label.className = "vianda-sabor-item";
        label.htmlFor = id;
        label.innerHTML = `<input type="checkbox" id="${id}" data-tipo="${tipo}" value="${sabor}"><span>${sabor}</span>`;
        items.appendChild(label);
      });

      section.appendChild(items);
      viandaSaboresList.appendChild(section);
    });
}

function buildWhatsAppMsg() {
  const total = Object.values(quantities).reduce((a, b) => a + b, 0);
  const partes = Object.entries(quantities)
    .filter(([, q]) => q > 0)
    .map(([tipo, q]) => {
      const checkboxes = viandaSaboresList
        ? Array.from(viandaSaboresList.querySelectorAll(`input[type="checkbox"][data-tipo="${tipo}"]:checked`))
        : [];
      const saboresStr = checkboxes.length
        ? ` (${checkboxes.map((cb) => cb.value).join(", ")})`
        : "";
      return `${VIANDA_LABELS[tipo]}: ${q}${saboresStr}`;
    });
  return `Hola Twins, quiero hacer un pedido de viandas semanales: ${partes.join("; ")}. Total: ${total} viandas.`;
}

function openViandaModal(tipoDestacado) {
  Object.keys(quantities).forEach((k) => (quantities[k] = 0));
  viandaQtyRows.forEach((row) => {
    row.classList.toggle("is-destacado", row.dataset.tipo === tipoDestacado);
  });
  updateStep1();
  setStep(1);
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

  viandaModal.addEventListener("click", (e) => {
    if (e.target === viandaModal) closeViandaModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && viandaModal.classList.contains("is-open")) closeViandaModal();
  });

  viandaQtyRows.forEach((row) => {
    const tipo = row.dataset.tipo;
    row.querySelectorAll(".vianda-qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.action === "plus") {
          quantities[tipo]++;
        } else if (btn.dataset.action === "minus" && quantities[tipo] > 0) {
          quantities[tipo]--;
        }
        updateStep1();
      });
    });
  });

  if (viandaContinuarBtn) {
    viandaContinuarBtn.addEventListener("click", () => setStep(2));
  }

  if (viandaVolverBtn) {
    viandaVolverBtn.addEventListener("click", () => setStep(1));
  }

  if (viandaConfirmarBtn) {
    viandaConfirmarBtn.addEventListener("click", () => {
      const msg = buildWhatsAppMsg();
      window.open(`https://wa.me/541159478705?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
      closeViandaModal();
    });
  }
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
