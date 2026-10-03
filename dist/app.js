(() => {
  const page = document.body.dataset.page;
  const base = document.body.dataset.base || "./";
  const pages = [["home", "Home", ""], ["about", "About", "about/"], ["portfolio", "Portfolio", "portfolio/"], ["films", "Films", "films/"], ["services", "Services", "services/"], ["contact", "Contact", "contact/"]];
  const navigation = pages.map(([id, label, path]) => `<li><a href="${base}${path}"${page === id ? ' aria-current="page"' : ""}>${label}</a></li>`).join("");
  const header = document.createElement("header"); header.className = "site-header";
  header.innerHTML = `<div class="site-header__inner"><a class="brand" href="${base}" aria-label="Crafted Media home">Crafted Media</a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-navigation">Menu</button><nav class="site-navigation" id="site-navigation" aria-label="Primary navigation"><ul>${navigation}</ul></nav></div>`;
  document.body.prepend(header);
  const footer = document.createElement("footer"); footer.className = "site-footer";
  footer.innerHTML = `<div class="site-footer__inner"><a class="brand" href="${base}">Crafted Media</a><p>Photography &amp; cinematography</p><p class="site-footer__note">© <span data-year></span> Crafted Media. All rights reserved.</p></div>`;
  document.body.append(footer); footer.querySelector("[data-year]").textContent = new Date().getFullYear();
  const toggle = header.querySelector(".menu-toggle"); const nav = header.querySelector(".site-navigation");
  toggle.addEventListener("click", () => { const open = toggle.getAttribute("aria-expanded") === "true"; toggle.setAttribute("aria-expanded", String(!open)); nav.classList.toggle("is-open", !open); });
  nav.addEventListener("click", (event) => { if (event.target.closest("a")) { toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); } });
})();
