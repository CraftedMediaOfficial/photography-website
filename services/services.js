import { faqs, serviceAreas, serviceGroups } from "../data/services.mjs";

function renderServices() {
  const container = document.querySelector("[data-service-groups]");
  if (!container) return;
  const fragment = document.createDocumentFragment();
  serviceGroups.forEach((group, groupIndex) => {
    const section = document.createElement("section");
    section.className = "service-group";
    section.setAttribute("aria-labelledby", `service-group-${groupIndex}`);
    const heading = document.createElement("div");
    heading.className = "service-group__heading";
    const label = document.createElement("p");
    label.className = "eyebrow";
    label.textContent = `0${groupIndex + 1}`;
    const title = document.createElement("h2");
    title.id = `service-group-${groupIndex}`;
    title.textContent = group.name;
    const introduction = document.createElement("p");
    introduction.textContent = group.introduction;
    heading.append(label, title, introduction);
    const list = document.createElement("div");
    list.className = "service-list";
    group.services.forEach((service, serviceIndex) => {
      const article = document.createElement("article");
      const number = document.createElement("span");
      number.textContent = String(serviceIndex + 1).padStart(2, "0");
      const name = document.createElement("h3");
      name.textContent = service.name;
      const description = document.createElement("p");
      description.textContent = service.description;
      article.append(number, name, description);
      list.append(article);
    });
    section.append(heading, list);
    fragment.append(section);
  });
  container.replaceChildren(fragment);
}

function renderFaqs() {
  const container = document.querySelector("[data-faq-list]");
  if (!container) return;
  const fragment = document.createDocumentFragment();
  faqs.forEach((faq, index) => {
    const details = document.createElement("details");
    details.className = "faq-item";
    const summary = document.createElement("summary");
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    const question = document.createElement("span");
    question.textContent = faq.question;
    summary.append(number, question);
    const answer = document.createElement("p");
    answer.textContent = faq.answer;
    details.append(summary, answer);
    fragment.append(details);
  });
  container.replaceChildren(fragment);
}

function renderLocation() {
  const area = serviceAreas.find((item) => item.visibility === "published");
  if (!area) return;
  document.querySelector("[data-location-name]").textContent = area.name;
  document.querySelector("[data-location-description]").textContent = area.description;
}

renderServices();
renderFaqs();
renderLocation();

