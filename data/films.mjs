export const films = [
  {
    title: "Editorial Motion Study",
    type: "Showreel Study",
    thumbnail: "assets/images/gallery/mandap-at-dusk-1536.webp",
    description: "A lightweight demonstration of pacing, transitions and full-width film presentation using illustrative imagery. Approved Crafted Media footage will replace this study when supplied.",
    videoUrl: "assets/videos/editorial-motion-study.mp4",
    destinationUrl: null,
    embedUrl: null,
    duration: "00:10",
    displayOrder: 1,
    visibility: "published"
  },
  {
    title: "Wedding Films",
    type: "Wedding Film · Highlight",
    thumbnail: "assets/images/home-hero.webp",
    description: "Long-form stories and concise highlights shaped around voice, movement, ritual and the atmosphere between moments.",
    videoUrl: null,
    destinationUrl: null,
    embedUrl: null,
    duration: null,
    displayOrder: 2,
    visibility: "published"
  },
  {
    title: "Events & Brand Stories",
    type: "Event Highlight · Brand Film",
    thumbnail: "assets/images/gallery/ceremony-details-1536.webp",
    description: "Purposeful films for gatherings, teams, launches and products—clear enough to communicate and human enough to remember.",
    videoUrl: null,
    destinationUrl: null,
    embedUrl: null,
    duration: null,
    displayOrder: 3,
    visibility: "published"
  },
  {
    title: "Short-Form Reels",
    type: "Reels · Social Cutdowns",
    thumbnail: "assets/images/gallery/courtyard-arrival-1122.webp",
    description: "Vertical and short-form edits designed around a strong opening, natural rhythm and platform-ready delivery.",
    videoUrl: null,
    destinationUrl: null,
    embedUrl: null,
    duration: null,
    displayOrder: 4,
    visibility: "published"
  },
  {
    title: "Unreleased Client Film",
    type: "Wedding Film",
    thumbnail: "assets/images/featured-story.webp",
    description: "A private fixture used to verify that unpublished films never appear publicly.",
    videoUrl: null,
    destinationUrl: null,
    embedUrl: null,
    duration: null,
    displayOrder: 99,
    visibility: "hidden"
  }
];

export const publishedFilms = films
  .filter((film) => film.visibility === "published")
  .sort((a, b) => a.displayOrder - b.displayOrder);

