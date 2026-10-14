// Image Gallery

const images = [
  { title: "Sunset at Sea", category: "Sunsets", src: "images/img1.jpg", colors: ["#f97316", "#7c3aed"] },
  { title: "Team Workspace", category: "Coding", src: "images/img2.jpg", colors: ["#0f766e", "#2563eb"] },
  { title: "Alpenglow Peak", category: "Mountains", src: "images/img3.jpg", colors: ["#fb7185", "#4f46e5"] },
  { title: "Mountain View", category: "Mountains", src: "images/img4.jpg", colors: ["#0ea5e9", "#14532d"] },
  { title: "Late Night Coding", category: "Coding", src: "images/img5.jpg", colors: ["#312e81", "#0f766e"] },
  { title: "Code Review", category: "Coding", src: "images/img6.jpg", colors: ["#7c3aed", "#db2777"] },
  { title: "Stormy Summit", category: "Mountains", src: "images/img7.jpg", colors: ["#334155", "#0f766e"] },
  { title: "City Sunset", category: "Sunsets", src: "images/img8.jpg", colors: ["#f59e0b", "#be123c"] },
  { title: "Rocky Shore at Dusk", category: "Sunsets", src: "images/img9.jpg", colors: ["#0891b2", "#1e1b4b"] }
];

const categories = ["All", ...new Set(images.map((image) => image.category))];
const grid = document.getElementById("grid");
const filters = document.getElementById("filters");
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lb-img");
const lbTitle = document.getElementById("lb-title");
const lbCount = document.getElementById("lb-count");
const closeButton = lightbox.querySelector(".close");
const previousButton = lightbox.querySelector(".prev");
const nextButton = lightbox.querySelector(".next");

let visible = [...images];
let current = 0;
let opener = null;
let touchStartX = null;
let touchStartY = null;
let previousBodyOverflow = "";

function makePlaceholder(image) {
  const [c1, c2] = image.colors;
  const title = image.title.replace(/[&<>"']/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/><circle cx="470" cy="95" r="45" fill="#fff" opacity=".75"/><path d="M0 340 145 155 255 275 365 125 600 345V400H0Z" fill="#080a19" opacity=".38"/><text x="30" y="365" font-family="Arial,sans-serif" font-size="24" fill="#fff">${title}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function renderFilters(activeCategory = "All") {
  filters.replaceChildren();
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `filter${category === activeCategory ? " active" : ""}`;
    button.dataset.category = category;
    button.textContent = category;
    button.setAttribute("aria-pressed", String(category === activeCategory));
    filters.append(button);
  });
}

function renderGrid() {
  grid.replaceChildren();
  if (visible.length === 0) {
    const message = document.createElement("p");
    message.className = "empty-state";
    message.textContent = "No images found in this category.";
    grid.append(message);
    return;
  }

  visible.forEach((image, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "thumb";
    button.dataset.index = String(index);
    button.setAttribute("aria-label", `Open ${image.title}`);

    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.title;
    img.loading = "lazy";
    img.addEventListener("error", () => {
      if (!img.dataset.fallback) {
        img.dataset.fallback = "true";
        img.src = makePlaceholder(image);
      }
    }, { once: true });

    const caption = document.createElement("span");
    caption.className = "caption";
    caption.textContent = image.title;
    button.append(img, caption);
    grid.append(button);
  });
}

filters.addEventListener("click", (event) => {
  const button = event.target.closest(".filter");
  if (!button) return;

  const category = button.dataset.category;
  visible = category === "All" ? [...images] : images.filter((image) => image.category === category);
  filters.querySelectorAll(".filter").forEach((filterButton) => {
    const isActive = filterButton.dataset.category === category;
    filterButton.classList.toggle("active", isActive);
    filterButton.setAttribute("aria-pressed", String(isActive));
  });
  renderGrid();
});

grid.addEventListener("click", (event) => {
  const thumb = event.target.closest(".thumb");
  if (thumb) openLightbox(Number(thumb.dataset.index));
});

function showImage(index) {
  if (!visible.length) return;
  current = (index + visible.length) % visible.length;
  const image = visible[current];
  lbImg.dataset.fallback = "";
  lbImg.src = image.src;
  lbImg.alt = image.title;
  lbImg.onerror = () => {
    if (lbImg.dataset.fallback !== "true") {
      lbImg.dataset.fallback = "true";
      lbImg.src = makePlaceholder(image);
    }
  };
  lbTitle.textContent = image.title;
  lbCount.textContent = `${current + 1} / ${visible.length}`;
  previousButton.disabled = visible.length < 2;
  nextButton.disabled = visible.length < 2;
  lbImg.classList.remove("in");
  void lbImg.offsetWidth;
  lbImg.classList.add("in");
}

function openLightbox(index) {
  if (!visible.length) return;
  opener = document.activeElement;
  showImage(index);
  lightbox.hidden = false;
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  closeButton.focus();
}

function closeLightbox() {
  if (lightbox.hidden) return;
  lightbox.hidden = true;
  document.body.style.overflow = previousBodyOverflow;
  if (opener && typeof opener.focus === "function") opener.focus();
}

lightbox.addEventListener("click", (event) => {
  if (event.target.closest(".close") || event.target === lightbox) closeLightbox();
  else if (event.target.closest(".prev")) showImage(current - 1);
  else if (event.target.closest(".next")) showImage(current + 1);
});

document.addEventListener("keydown", (event) => {
  if (lightbox.hidden) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeLightbox();
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    showImage(current - 1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    showImage(current + 1);
  } else if (event.key === "Tab") {
    const focusable = [closeButton, previousButton, nextButton].filter((element) => !element.disabled);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

lightbox.addEventListener("touchstart", (event) => {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

lightbox.addEventListener("touchend", (event) => {
  if (touchStartX === null || touchStartY === null) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) showImage(dx < 0 ? current + 1 : current - 1);
  touchStartX = null;
  touchStartY = null;
}, { passive: true });

renderFilters();
renderGrid();
