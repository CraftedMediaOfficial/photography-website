(() => {
  const page = document.body.dataset.page;
  const base = document.body.dataset.base || "./";
  const pages = [
    ["home", "Home", ""],
    ["about", "About", "about/"],
    ["portfolio", "Portfolio", "portfolio/"],
    ["films", "Films", "films/"],
    ["services", "Services", "services/"],
    ["contact", "Contact", "contact/"]
  ];
  const navigation = pages.map(([id, label, path]) =>
    `<li><a href="${base}${path}"${page === id ? ' aria-current="page"' : ""}>${label}</a></li>`
  ).join("");
  const brand = `<span>Crafted Media</span><small>Photography · Film</small>`;
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `<div class="site-header__inner"><a class="brand" href="${base}" aria-label="Crafted Media home">${brand}</a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation"><span data-menu-label>Menu</span></button><nav class="site-navigation" id="site-navigation" aria-label="Primary navigation"><ul>${navigation}<li><a class="button button--primary" href="${base}contact/">Check availability</a></li></ul></nav></div>`;
  document.body.prepend(header);
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `<div class="site-footer__inner"><div><a class="brand" href="${base}">${brand}</a><p>Stories, emotions and moments—preserved with intention.</p><p class="site-footer__note">© <span data-year></span> Crafted Media. All rights reserved.</p></div><ul class="site-footer__links" aria-label="Footer navigation"><li><a href="${base}portfolio/">Portfolio</a></li><li><a href="${base}films/">Films</a></li><li><a href="${base}contact/">Contact</a></li></ul></div>`;
  document.body.append(footer);
  footer.querySelector("[data-year]").textContent = new Date().getFullYear();

  const toggle = header.querySelector(".menu-toggle");
  const label = header.querySelector("[data-menu-label]");
  const nav = header.querySelector(".site-navigation");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    label.textContent = open ? "Close" : "Menu";
    nav.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (event) => { if (event.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      toggle.focus();
    }
  });
  window.addEventListener("resize", () => { if (window.matchMedia("(min-width: 48rem)").matches) setMenu(false); });

  const reveals = [...document.querySelectorAll("[data-reveal]")];
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    reveals.forEach((element) => element.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    reveals.forEach((element) => observer.observe(element));
  }
  document.querySelectorAll("[data-demo-form]").forEach((form) => {
    form.addEventListener("submit", (event) => event.preventDefault());
  });
})();
