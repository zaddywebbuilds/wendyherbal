/**
 * Brand photography registry.
 *
 * Alt text is written from what each photograph actually shows, checked image
 * by image, because it is read aloud by screen readers and indexed by search
 * engines. It describes the picture; it never describes an effect or a use.
 *
 * Scope note: the client's media library also contains patient treatment
 * photographs, a named patient's hospital radiology report, customer
 * testimonials naming conditions, and a poster claiming treatment of HIV and
 * Hepatitis C. None of that is published here, and none of it should be:
 * it would contradict the Medical Disclaimer and the Privacy Policy, and the
 * patient material is third-party health data nobody has consented to publish.
 * Only the photographs below were cleared. See HANDOFF.md.
 */

export interface BrandImage {
  src: string;
  alt: string;
  /** Short caption used where the layout shows one. */
  caption?: string;
}

const B = "/media/brand";

export const BRAND_IMAGES = {
  driedHerbs: {
    src: `${B}/dried-herbs-and-hibiscus-bowls.jpg`,
    alt: "Steel and glass bowls of dried hibiscus, cinnamon bark and chopped dried herbs on a work surface",
    caption: "Dried botanicals, weighed out before blending",
  },
  herbPowders: {
    src: `${B}/ground-herb-powders.jpg`,
    alt: "Ground herb powders in red, turmeric yellow and green arranged in a steel mixing bowl",
    caption: "Ground preparations, ready to be combined",
  },
  scentLeaf: {
    src: `${B}/scent-leaf-plant.jpg`,
    alt: "Scent leaf, known in Nigeria as efirin, growing in full green leaf",
    caption: "Scent leaf (efirin), grown for the kitchen and the herb bench",
  },
  spicedDish: {
    src: `${B}/spiced-noodle-dish.jpg`,
    alt: "A plated noodle dish with diced vegetables and boiled eggs, cooked with Wendy Herbals spices",
    caption: "Everyday cooking with the food spice range",
  },
  productionDrums: {
    src: `${B}/production-drums.jpg`,
    alt: "Large blue production drums filled with a pale herbal preparation at the Wendy Herbals factory",
    caption: "Production drums at the factory",
  },
  measuring: {
    src: `${B}/measuring-herbal-preparation.jpg`,
    alt: "Wendy holding a jerrycan of herbal preparation and a measuring cup at her desk",
    caption: "Measuring out a batch",
  },
  filling: {
    src: `${B}/filling-herbal-preparation.jpg`,
    alt: "Wendy pouring herbal preparation from a jerrycan into a measuring cup",
    caption: "Filling by hand, one order at a time",
  },
  founderStudio: {
    src: `${B}/founder-studio-portrait.jpg`,
    alt: "Studio portrait of Wendy, founder of Wendy Herbals, in a green outfit",
  },
  founderOutdoors: {
    src: `${B}/founder-outdoors.jpg`,
    alt: "Wendy, founder of Wendy Herbals, photographed outdoors in a patterned orange dress",
  },
} as const satisfies Record<string, BrandImage>;

/** Category card artwork. Chosen for what the picture shows, not at random. */
export const CATEGORY_IMAGE: Record<string, BrandImage> = {
  "womens-wellness": BRAND_IMAGES.driedHerbs,
  "mens-wellness": BRAND_IMAGES.herbPowders,
  "herbal-collections": BRAND_IMAGES.scentLeaf,
  "body-care": BRAND_IMAGES.productionDrums,
  "food-spices": BRAND_IMAGES.spicedDish,
};

/** Open Graph / social preview image for pages that do not set their own. */
export const OG_IMAGE = BRAND_IMAGES.driedHerbs;

export interface BrandClip {
  src: string;
  poster: string;
  /** Describes the footage; used as the accessible label. */
  alt: string;
  caption: string;
}

/**
 * Short silent loops of the preparation work.
 *
 * Audio is stripped deliberately: the source reels carry licensed background
 * music from a social editing app, which the shop has no licence to use on a
 * commercial site. Each is cut to 12 seconds and re-encoded for the web; the
 * originals are the 706MB set under public/media/videos, which is gitignored.
 */
/**
 * The homepage hero clip, supplied by the client on 30 Oct 2026.
 *
 * Like the product packshots it is an AI-rendered showcase rather than
 * filmed stock, and its labels carry claims the site itself does not make,
 * "Safe & Effective" among them. See HANDOFF.md.
 */
export const HERO_CLIP: BrandClip = {
  src: "/media/clips/hero-product-range.mp4",
  poster: "/media/clips/hero-product-range.jpg",
  alt: "Wendy Herbals products arranged on freshly dug earth beside harvested roots and a clay pot",
  caption: "From the ground to your door",
};

export const BRAND_CLIPS: BrandClip[] = [
  {
    src: "/media/clips/cooking-over-open-fire.mp4",
    poster: "/media/clips/cooking-over-open-fire.jpg",
    alt: "A large iron pot of herbal preparation cooking over an open wood fire outdoors",
    caption: "Cooked outdoors in an iron pot",
  },
  {
    src: "/media/clips/sorting-dried-herbs.mp4",
    poster: "/media/clips/sorting-dried-herbs.jpg",
    alt: "Gloved hands turning over a tray of mixed dried herbs, bark and leaves",
    caption: "Dried botanicals, sorted by hand",
  },
  {
    src: "/media/clips/native-spices.mp4",
    poster: "/media/clips/native-spices.jpg",
    alt: "A hand running through a tray of pale ground native spice",
    caption: "Native spices, milled fine",
  },
];
