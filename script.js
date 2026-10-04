// ===== Site settings — update these with the centre's real details =====
const CONFIG = {
  // Phone number with country code, digits only (e.g. "919876543210")
  phone: "918129110905",
  // How the number is shown on the page
  phoneDisplay: "+91 81291 10905",
  email: "psanjaly1988@gmail.com",
  greeting: "Hello Anjaly Tuition Centre! ",
};

const waLink = (text = "") =>
  `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(CONFIG.greeting + text)}`;

// Wire up every call / WhatsApp / SMS link on the page
document.querySelectorAll("[data-call]").forEach((a) => (a.href = `tel:+${CONFIG.phone}`));
document.querySelectorAll("[data-sms]").forEach((a) => (a.href = `sms:+${CONFIG.phone}`));
document.querySelectorAll("[data-whatsapp]").forEach((a) => {
  a.href = waLink("I'd like to know more about your classes.");
  a.target = "_blank";
  a.rel = "noopener";
});
document.querySelectorAll("[data-email]").forEach((a) => {
  a.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Enquiry - Anjaly Tuition Centre")}`;
  if (!a.textContent.trim()) a.textContent = CONFIG.email;
});
document.querySelectorAll("[data-phone-text]").forEach((el) => (el.textContent = CONFIG.phoneDisplay));
document.getElementById("year").textContent = new Date().getFullYear();

// Header shadow on scroll
const header = document.getElementById("header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile menu
const navLinks = document.getElementById("navLinks");
const menuToggle = document.getElementById("menuToggle");
const setMenu = (open) => {
  navLinks.classList.toggle("open", open);
  menuToggle.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};
menuToggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

// Active nav link while scrolling
const sections = [...document.querySelectorAll("section[id]")];
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.querySelectorAll("a").forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`)
      );
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => spy.observe(s));

// Reveal on scroll
const revealEls = document.querySelectorAll(
  ".section-head, .course-card, .why, .about-grid > *, .loc-info, .map-wrap, .contact-grid > *, .cta-inner"
);
revealEls.forEach((el) => el.classList.add("reveal"));
const revealer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => revealer.observe(el));

// Enquiry modal
const modal = document.getElementById("enquiryModal");
let lastFocus = null;
// While the modal is open, everything behind it is inert so focus can't wander off
const setBackgroundInert = (inert) =>
  document.querySelectorAll("body > :not(#enquiryModal):not(script)").forEach((el) => (el.inert = inert));
const openModal = (subject) => {
  const select = modal.querySelector("select[name=subject]");
  if (subject) select.value = subject;
  lastFocus = document.activeElement;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  setBackgroundInert(true);
  setTimeout(() => modal.querySelector("input[name=name]").focus(), 150);
};
const closeModal = () => {
  if (!modal.classList.contains("open")) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  setBackgroundInert(false);
  // If the modal was opened from the (now closed) mobile menu, return focus to the menu button
  const target = lastFocus?.closest?.("#navLinks") && !navLinks.classList.contains("open") ? menuToggle : lastFocus;
  target?.focus?.({ preventScroll: true });
};
document.querySelectorAll("[data-open-enquiry]").forEach((btn) =>
  btn.addEventListener("click", () => {
    setMenu(false);
    openModal(btn.dataset.subject);
  })
);
modal.querySelectorAll("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    chatWidget.classList.remove("open");
  }
});

// Enquiry forms → open WhatsApp with a pre-filled message
document.querySelectorAll("[data-enquiry-form]").forEach((form) =>
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const msg =
      `I'd like to make an enquiry.\n\n` +
      `Student Name: ${d.name}\n` +
      `Phone: ${d.phone}\n` +
      `Subject: ${d.subject}\n` +
      `Class: ${d.level}` +
      (d.message ? `\nMessage: ${d.message}` : "");
    window.open(waLink(msg), "_blank", "noopener");
    form.reset();
    closeModal();
  })
);

// Floating chat widget
const chatWidget = document.getElementById("chatWidget");
const chatPanel = document.getElementById("chatPanel");
const toggleChat = (force) => {
  const open = chatWidget.classList.toggle("open", force);
  chatPanel.setAttribute("aria-hidden", String(!open));
  if (open) setTimeout(() => document.getElementById("chatText").focus(), 200);
};
document.getElementById("chatFab").addEventListener("click", () => toggleChat());
document.getElementById("chatClose").addEventListener("click", () => toggleChat(false));
document.querySelectorAll("[data-chat-msg]").forEach((btn) =>
  btn.addEventListener("click", () => window.open(waLink(btn.dataset.chatMsg), "_blank", "noopener"))
);
document.getElementById("chatForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("chatText");
  const text = input.value.trim();
  window.open(waLink(text), "_blank", "noopener");
  input.value = "";
});
