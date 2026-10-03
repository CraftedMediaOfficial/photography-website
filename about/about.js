(() => {
  const content = window.CRAFTED_MEDIA_ABOUT;
  if (!content) return;

  const founderName = document.querySelector("[data-founder-name]");
  const founderRole = document.querySelector("[data-founder-role]");
  const founderIntroduction = document.querySelector("[data-founder-introduction]");
  if (founderName) founderName.textContent = content.founder.name;
  if (founderRole) founderRole.textContent = content.founder.role;
  if (founderIntroduction) founderIntroduction.textContent = content.founder.introduction;

  const teamList = document.querySelector("[data-team-list]");
  if (!teamList) return;
  const fragment = document.createDocumentFragment();
  content.team.forEach((member, index) => {
    const article = document.createElement("article");
    article.className = "team-card";
    const number = document.createElement("span");
    number.className = "team-card__number";
    number.textContent = String(index + 1).padStart(2, "0");
    const name = document.createElement("h3");
    name.textContent = member.name;
    const role = document.createElement("p");
    role.className = "team-card__role";
    role.textContent = member.role;
    const description = document.createElement("p");
    description.textContent = member.description;
    article.append(number, name, role, description);
    fragment.append(article);
  });
  teamList.replaceChildren(fragment);
  document.dispatchEvent(new CustomEvent("crafted:content-rendered"));
})();
