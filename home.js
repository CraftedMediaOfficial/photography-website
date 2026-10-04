import { homepageFeatured, testimonials } from "./data/editorial.mjs";
import { publishedPortfolioCategories } from "./data/portfolio-data.mjs";

const categoryBySlug = new Map(publishedPortfolioCategories.map((category) => [category.slug, category]));
const workGrid = document.querySelector("[data-home-featured]");

if (workGrid) {
  const featured = homepageFeatured.map((slug) => categoryBySlug.get(slug)).filter(Boolean).slice(0, 3);
  if (featured.length) {
    workGrid.replaceChildren(...featured.map((category, index) => {
      const link = document.createElement("a");
      link.className = "work-card";
      link.href = `portfolio/${category.slug}/`;
      link.dataset.reveal = "";
      const number = document.createElement("span");
      number.className = "work-card__number";
      number.textContent = String(index + 1).padStart(2, "0");
      const title = document.createElement("span");
      title.className = "work-card__title";
      title.textContent = category.name;
      const description = document.createElement("span");
      description.className = "work-card__description";
      description.textContent = category.description;
      link.append(number, title, description);
      return link;
    }));
  }
}

const testimonialPanel = document.querySelector("[data-home-testimonials]");
const publishedTestimonials = testimonials
  .filter((testimonial) => testimonial.visibility === "published")
  .sort((a, b) => a.displayOrder - b.displayOrder);

if (testimonialPanel && publishedTestimonials.length) {
  testimonialPanel.replaceChildren(...publishedTestimonials.slice(0, 3).map((testimonial) => {
    const quote = document.createElement("blockquote");
    const words = document.createElement("p");
    words.textContent = `“${testimonial.quote}”`;
    const credit = document.createElement("footer");
    credit.textContent = [testimonial.name, testimonial.context].filter(Boolean).join(" · ");
    quote.append(words, credit);
    return quote;
  }));
}

document.dispatchEvent(new CustomEvent("crafted:content-rendered"));
