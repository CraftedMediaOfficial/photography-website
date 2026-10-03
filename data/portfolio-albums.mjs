const editorialPhotos = [
  {
    src: "assets/images/home-hero.webp",
    srcSet: "assets/images/gallery/celebration-768.webp 768w, assets/images/home-hero.webp 1536w",
    width: 1536,
    height: 1024,
    alt: "A couple sharing a quiet moment beneath warm ceremonial lights",
    caption: "Presence before performance.",
    layout: "wide"
  },
  {
    src: "assets/images/gallery/ceremony-details-1536.webp",
    srcSet: "assets/images/gallery/ceremony-details-768.webp 768w, assets/images/gallery/ceremony-details-1536.webp 1536w",
    width: 1536,
    height: 1024,
    alt: "Hands arranging jasmine and rose petals beside brass ceremonial objects",
    caption: "The details that prepare a place for memory.",
    layout: "standard"
  },
  {
    src: "assets/images/gallery/courtyard-arrival-1122.webp",
    srcSet: "assets/images/gallery/courtyard-arrival-640.webp 640w, assets/images/gallery/courtyard-arrival-1122.webp 1122w",
    width: 1122,
    height: 1402,
    alt: "Wedding guests walking through a flower-lit courtyard at dusk",
    caption: "A gathering finding its rhythm.",
    layout: "portrait"
  },
  {
    src: "assets/images/gallery/mandap-at-dusk-1536.webp",
    srcSet: "assets/images/gallery/mandap-at-dusk-768.webp 768w, assets/images/gallery/mandap-at-dusk-1536.webp 1536w",
    width: 1536,
    height: 1024,
    alt: "An ivory and peacock-blue wedding mandap illuminated beside a lake at dusk",
    caption: "The stillness before everyone arrives.",
    layout: "wide"
  },
  {
    src: "assets/images/featured-story.webp",
    srcSet: "assets/images/gallery/quiet-moment-640.webp 640w, assets/images/featured-story.webp 1122w",
    width: 1122,
    height: 1402,
    alt: "A bride in warm window light during a quiet pause",
    caption: "Small pauses hold the shape of the day.",
    layout: "portrait"
  }
];

const stressPhotos = Array.from({ length: 32 }, (_, index) => ({
  ...editorialPhotos[index % editorialPhotos.length],
  caption: `Private stress-test frame ${index + 1}`
}));

export const portfolioAlbums = [
  {
    name: "Before the Celebration",
    slug: "before-the-celebration",
    category: "weddings",
    coverImage: "assets/images/gallery/ceremony-details-1536.webp",
    description: "An editorial demonstration of how Crafted Media can shape a wedding story through atmosphere, detail and human rhythm. The imagery is illustrative and will be replaced as approved client work is supplied.",
    date: "2026-10-03",
    dateLabel: "Editorial study · 2026",
    location: "Crafted Media demonstration",
    photos: editorialPhotos,
    videos: [],
    visibility: "published",
    displayOrder: 1
  },
  {
    name: "Gallery Stress Test",
    slug: "gallery-stress-test",
    category: "weddings",
    coverImage: "assets/images/home-hero.webp",
    description: "A private data fixture used to validate gallery performance with more than thirty images.",
    date: "2026-10-03",
    dateLabel: "Internal test",
    location: "Not public",
    photos: stressPhotos,
    videos: [],
    visibility: "draft",
    displayOrder: 98
  },
  {
    name: "Hidden Story",
    slug: "hidden-story",
    category: "weddings",
    coverImage: "assets/images/featured-story.webp",
    description: "A hidden fixture used to verify that private albums are never generated or listed.",
    date: "2026-10-03",
    dateLabel: "Hidden",
    location: "Not public",
    photos: [editorialPhotos[0]],
    videos: [],
    visibility: "hidden",
    displayOrder: 99
  }
];

export const publishedPortfolioAlbums = portfolioAlbums
  .filter((album) => album.visibility === "published")
  .sort((a, b) => a.displayOrder - b.displayOrder);

export function getPublishedAlbumsForCategory(categorySlug) {
  return publishedPortfolioAlbums.filter((album) => album.category === categorySlug);
}

