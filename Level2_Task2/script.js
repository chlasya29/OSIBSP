
const paintings = [
  {
    title: "Shakuntala",
    year: "1898",
    desc: "The heroine of Kalidasa's epic, pausing mid-step to pull a thorn from her foot — a glance disguised as a wince.",
    src: "images/shakunthala.jpg"
  },
  {
    title: "Damayanti & the Swan",
    year: "c. 1899",
    desc: "Princess Damayanti hears the golden swan whisper of Nala's love — a moment of myth caught in oil.",
    src: "images/Damayanthi.jpg"
  },
  {
    title: "Goddess Lakshmi",
    year: "c. 1896",
    desc: "An oleograph that travelled to a million homes and altered, forever, the face of Indian devotion.",
    src: "images/Lakshmi.jpg"
  },
  {
    title: "Goddess Saraswati",
    year: "c. 1896",
    desc: "The goddess of learning, painted with the calm and command of a queen of music.",
    src: "images/saraswati.jpg"
  },
  {
    title: "Lady in the Moonlight",
    year: "1889",
    desc: "An intimate study in stillness; the moon, the marble, the woman — each pretending not to notice the other.",
    src: "images/lady-in-moonlight.jpg"
  },
  {
    title: "There Comes Papa",
    year: "1893",
    desc: "A young mother, her child, a dog — and the soft thunder of a footstep at the door. Tender, modern, alive.",
    src: "images/there-comes-papa.jpg"
  },
  {
    title: "Galaxy of Musicians",
    year: "1889",
    desc: "Eleven women from across India, each with her instrument — a portrait of the nation, sung in many tongues.",
    src: "images/Galaxy-of-Musician.jpg"
  },
  {
    title: "Krishna as Envoy",
    year: "c. 1906",
    desc: "Krishna in the Kaurava court, calm as monsoon clouds, refusing war and yet drawing the storm closer.",
    src: "images/krishna.jpg"
  }
];

/* ----- Build gallery ----- */
const galleryGrid = document.getElementById("galleryGrid");
paintings.forEach((p, i) => {
  const card = document.createElement("article");
  card.className = "painting reveal";
  card.dataset.index = i;
  card.innerHTML = `
    <div class="painting__img-wrap">
      <img class="painting__img" src="${p.src}" alt="${p.title} by Raja Ravi Varma" loading="lazy" />
    </div>
    <div class="painting__info">
      <h3 class="painting__title">${p.title}</h3>
      <span class="painting__year">${p.year}</span>
    </div>
  `;
  card.addEventListener("click", () => openLightbox(i));
  galleryGrid.appendChild(card);
});

/* ----- Lightbox ----- */
const lightbox    = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lbTitle     = document.getElementById("lightboxTitle");
const lbYear      = document.getElementById("lightboxYear");
const lbDesc      = document.getElementById("lightboxDesc");
const lbClose     = document.getElementById("lightboxClose");
const lbPrev      = document.getElementById("lightboxPrev");
const lbNext      = document.getElementById("lightboxNext");
let   lbIndex     = 0;

function openLightbox(i) {
  lbIndex = i;
  renderLightbox();
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
function renderLightbox() {
  const p = paintings[lbIndex];
  lightboxImg.src = p.src;
  lightboxImg.alt = p.title;
  lbTitle.textContent = p.title;
  lbYear.textContent  = p.year;
  lbDesc.textContent  = p.desc;
}
function step(dir) {
  lbIndex = (lbIndex + dir + paintings.length) % paintings.length;
  renderLightbox();
}

lbClose.addEventListener("click", closeLightbox);
lbPrev .addEventListener("click", () => step(-1));
lbNext .addEventListener("click", () => step( 1));
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("is-open")) return;
  if (e.key === "Escape")    closeLightbox();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight")step( 1);
});

/* ----- Mobile nav toggle ----- */
const navToggle = document.getElementById("navToggle");
const navLinks  = document.getElementById("navLinks");
navToggle.addEventListener("click", () => {
  navLinks.classList.toggle("is-open");
});
navLinks.querySelectorAll("a").forEach(a =>
  a.addEventListener("click", () => navLinks.classList.remove("is-open"))
);

/* ----- Reveal on scroll ----- */
const revealEls = document.querySelectorAll(
  ".section, .hero__content, .hero__frame, .painting, .timeline__item, .quote, .legacy__card"
);
revealEls.forEach(el => el.classList.add("reveal"));

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

revealEls.forEach(el => io.observe(el));

/* ----- Year easter egg in footer (optional) ----- */
console.log("%cIn memory of Raja Ravi Varma (1848–1906)", "color:#c8a45c;font-size:14px;font-family:serif;");
