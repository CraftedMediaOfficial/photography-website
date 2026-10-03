export const portfolioCategories = [
  {
    name: "Weddings",
    slug: "weddings",
    description: "Complete wedding stories shaped around real emotion, family, ritual and the energy of celebration.",
    coverImage: "assets/images/home-hero.webp",
    displayOrder: 1,
    visibility: "published",
    albums: []
  },
  {
    name: "Pre-Weddings",
    slug: "pre-weddings",
    description: "Relaxed, personal sessions created around a couple’s connection, place and shared rhythm.",
    coverImage: "assets/images/featured-story.webp",
    displayOrder: 2,
    visibility: "published",
    albums: []
  },
  {
    name: "Cultural & Family Events",
    slug: "cultural-family-events",
    description: "Meaningful gatherings, traditions and family milestones documented with attention and warmth.",
    coverImage: null,
    displayOrder: 3,
    visibility: "published",
    albums: []
  },
  {
    name: "Corporate Events",
    slug: "corporate-events",
    description: "Conferences, launches and company occasions covered with clarity, energy and professional restraint.",
    coverImage: null,
    displayOrder: 4,
    visibility: "published",
    albums: []
  },
  {
    name: "Sports Events",
    slug: "sports-events",
    description: "Fast, decisive frames that hold the movement, focus and atmosphere of competition.",
    coverImage: null,
    displayOrder: 5,
    visibility: "published",
    albums: []
  },
  {
    name: "Product Photography",
    slug: "product-photography",
    description: "Thoughtful product images built around form, material, detail and the needs of the brand.",
    coverImage: null,
    displayOrder: 6,
    visibility: "published",
    albums: []
  },
  {
    name: "Food Photography",
    slug: "food-photography",
    description: "Appetite-led imagery for menus, campaigns and social stories with natural texture and colour.",
    coverImage: null,
    displayOrder: 7,
    visibility: "published",
    albums: []
  },
  {
    name: "Kids Photography",
    slug: "kids-photography",
    description: "Playful, patient sessions that leave room for personality, movement and genuine expression.",
    coverImage: null,
    displayOrder: 8,
    visibility: "published",
    albums: []
  },
  {
    name: "Creative Portraits",
    slug: "creative-portraits",
    description: "A future portrait collection prepared in the content model but not yet visible publicly.",
    coverImage: null,
    displayOrder: 9,
    visibility: "hidden",
    albums: []
  }
];

export const publishedPortfolioCategories = portfolioCategories
  .filter((category) => category.visibility === "published")
  .sort((a, b) => a.displayOrder - b.displayOrder);
