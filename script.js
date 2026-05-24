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

document.querySelectorAll(".btn-cotizar-catering").forEach((button) => {
  button.addEventListener("click", () => {
    const producto = button.dataset.producto;
    void producto;
    // TODO: Aquí se acoplará el sistema de cotización interactivo en el futuro.
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
