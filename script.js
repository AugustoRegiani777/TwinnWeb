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
const viandaModal = document.getElementById("viandaModal");
const viandaQtyRows = viandaModal ? Array.from(viandaModal.querySelectorAll(".vianda-qty-row")) : [];
const viandaTotalEl = viandaModal ? viandaModal.querySelector(".vianda-total-value") : null;
const viandaMinNote = document.getElementById("viandaMinNote");
const viandaConfirmarBtn = document.getElementById("viandaConfirmar");

const VIANDA_LABELS = { premium: "Especiales", light: "Light", classic: "Classic" };
const quantities = { premium: 0, light: 0, classic: 0 };

function updateViandaModal() {
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
  if (viandaConfirmarBtn) viandaConfirmarBtn.disabled = !valid;
}

function openViandaModal(tipoDestacado) {
  Object.keys(quantities).forEach((k) => (quantities[k] = 0));
  viandaQtyRows.forEach((row) => {
    row.classList.toggle("is-destacado", row.dataset.tipo === tipoDestacado);
  });
  updateViandaModal();
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
        updateViandaModal();
      });
    });
  });

  if (viandaConfirmarBtn) {
    viandaConfirmarBtn.addEventListener("click", () => {
      const total = Object.values(quantities).reduce((a, b) => a + b, 0);
      if (total < 5) return;
      const detalle = Object.entries(quantities)
        .filter(([, q]) => q > 0)
        .map(([tipo, q]) => `${VIANDA_LABELS[tipo]}: ${q}`)
        .join(", ");
      const msg = `Hola Twins, quiero hacer un pedido de viandas semanales: ${detalle}. Total: ${total} viandas.`;
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
