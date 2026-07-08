export type Service = {
  title: string;
  description: string;
  bullets: string[];
  image: string;
  imageAlt: string;
};

export type Industry = {
  name: string;
  summary: string;
  image: string;
};

export type Testimonial = {
  author: string;
  role: string;
  company?: string;
  quote: string;
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string[];
  image: string;
  imageAlt: string;
};

const siteAsset = (path: string) => `https://www.barakservices.com${path}`;

export const heroImage = {
  src: siteAsset("/event-venue.png"),
  alt: "Barak Group cleaning professional with equipment",
};

export const heroCarouselSlides = [
  {
    src: siteAsset("/event-venue.png"),
    alt: "Barak Group crew supporting a large event venue",
  },
  {
    src: siteAsset("/office-building.png"),
    alt: "Office building janitorial service by Barak Group",
  },
  {
    src: siteAsset("/hero-after.png"),
    alt: "Floor refinishing results after Barak Group service",
  },
  {
    src: siteAsset("/hero-before.png"),
    alt: "Specialty cleaning and surface prep by Barak Group",
  },
];

export const heroPanelImage = {
  src: "/event-venue.png",
  alt: "Barak Group crew at Timbers Stadium",
};

export const heroBeforeAfter = {
  before: {
    src: "/hero-before.png",
    alt: "Concrete floor before strip and refinish",
  },
  after: {
    src: "/hero-after.png",
    alt: "Concrete floor after strip and refinish",
  },
};

export const galleryImages = [
  "/event-venue.png",
  "/office-building.png",
  "/hero-after.png",
  "/hero-before.png",
  "/event-venue.png",
  "/office-building.png",
];

export const phoneNumbers = [
  { state: "Oregon", phone: "(503) 850-7111", href: "tel:+15038507111" },
  { state: "Utah", phone: "(801) 901-7111", href: "tel:+18019017111" },
  { state: "Idaho", phone: "(208) 315-6111", href: "tel:+12083156111" },
];

export const locations = [
  {
    state: "Oregon - Barak Group, LLC. DBA Jani King",
    address: "11585 SE 172nd Ave, Happy Valley, OR 97086",
    phone: "(503) 850-7111",
    href: "tel:+15038507111",
  },
  {
    state: "Utah - Barak Group, LLC. DBA Cover All",
    address: "12180 South 300 East #1203, Draper, UT 84020",
    phone: "(801) 901-7111",
    href: "tel:+18019017111",
  },
  {
    state: "Idaho - Barak Group, LLC. DBA Jani King",
    address: "784 S. Clearwater Loop, Postfalls, ID 83854",
    phone: "(208) 315-6111",
    href: "tel:+12083156111",
  },
];

export const serviceHighlights: Service[] = [
  {
    title: "Office cleaning",
    description: "Daily, nightly, or weekly janitorial service based on your building schedule.",
    bullets: [
      "Restrooms and breakrooms",
      "Floors, carpet, and touchpoints",
      "Trash, liners, and interior glass",
    ],
    image: "https://www.barakservices.com/office-building.png",
    imageAlt: "Cleaner pushing supply cart in a hallway",
  },
  {
    title: "Construction & turnover",
    description: "Move-in ready cleaning for new construction, remodels, and turnovers.",
    bullets: [
      "Post-construction detail cleaning",
      "Turnover and move-out resets",
      "Photo verification on request",
    ],
    image: "https://www.barakservices.com/hero-after.png",
    imageAlt: "Crew preparing a property for turnover",
  },
  {
    title: "Events & large venues",
    description: "Cleaning support for game days, festivals, and high-traffic event windows.",
    bullets: [
      "Restroom and waste routes",
      "Concourse and common-area resets",
      "Flexible staffing by attendance",
    ],
    image: "https://www.barakservices.com/event-venue.png",
    imageAlt: "Event venue with active cleaning support",
  },
  {
    title: "Exterior & specialty",
    description: "Exterior maintenance and specialty cleaning for difficult surfaces.",
    bullets: [
      "Pressure washing",
      "Exterior window cleaning",
      "Carpet spotting and extraction",
    ],
    image: "https://www.barakservices.com/hero-before.png",
    imageAlt: "Professional cleaner performing specialty cleaning work",
  },
];

export const industries: Industry[] = [
  {
    name: "Apartment Communities",
    summary: "Shared spaces and turnover support.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Office Buildings",
    summary: "Consistent cleaning that protects productivity.",
    image: "/office-building.png",
  },
  {
    name: "Construction",
    summary: "Post-build cleaning and quality walkthrough prep.",
    image: "/hero-after.png",
  },
  {
    name: "Stadiums & Universities",
    summary: "High-traffic venue maintenance at scale.",
    image: "/event-venue.png",
  },
  {
    name: "Restaurant Kitchens",
    summary: "Detailed cleaning and sanitation support.",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Airbnb & Vacation Rentals",
    summary: "Fast turnarounds and reliable quality.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
];

export const testimonials: Testimonial[] = [
  {
    author: "Matt Hammar",
    role: "Director of Purchasing and Administrative Services",
    quote:
      "Barak Group has supported our campus for over four years and consistently delivers professional, punctual, and thorough service.",
  },
  {
    author: "Kat Collins",
    role: "Facilities Operations Manager",
    company: "New Seasons Market",
    quote:
      "Their attention to detail and communication stand out. The team adapts quickly and always does what is right for the customer.",
  },
  {
    author: "Jason Thompson",
    role: "Facilities Manager",
    company: "Dov Lewis Veterinary Hospital",
    quote:
      "From changing schedules to high-demand support, Barak Group has remained flexible and dependable every step of the way.",
  },
];

export const posts: Post[] = [
  {
    slug: "2023-dahli-at-timbers-stadium",
    title: "Dahli at Timbers Stadium",
    date: "January 19, 2024",
    excerpt: "Pre-match cleanup at Providence Park with Dahli on the crew.",
    content: [
      "Dahli posted up while the rest of the team ran the pre-match plan at Providence Park.",
      "Lots of restrooms, lots of foot traffic, tight turnaround before gates open.",
      "Same crew, same checklist every match — in and out before kickoff.",
    ],
    image: "/event-venue.png",
    imageAlt: "Team member at Timbers Stadium",
  },
  {
    slug: "2023-chucho-at-nascar",
    title: "Chucho at NASCAR",
    date: "January 19, 2024",
    excerpt: "Race weekend in Utah — long shifts, quick resets between events.",
    content: [
      "Chucho between shifts at the track after another full race day.",
      "Restrooms, concourses, and trash pick-up on a loop until the last car leaves.",
      "Event work is mostly timing — hit your zones, reset, move on.",
    ],
    image: "/office-building.png",
    imageAlt: "Barak team member at a race event",
  },
  {
    slug: "2023-indy-car-races",
    title: "Indy car weekend",
    date: "January 19, 2024",
    excerpt: "Hector's crew on cleaning and small fixes during Indy weekend.",
    content: [
      "Hector and the crew split time between cleaning runs and whatever broke on site.",
      "When something goes wrong mid-event, it helps to have people who can actually fix it.",
      "Back on the floor before the next session — that was the whole weekend.",
    ],
    image: "/hero-before.png",
    imageAlt: "Crew member supporting Indy race operations",
  },
];
