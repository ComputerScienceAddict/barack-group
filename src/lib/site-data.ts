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

export const heroImage = {
  src: "https://barakservices.com/wp-content/uploads/2023/10/cheerful-cleaner-moving-cart-with-cleaning-supplie.jpg",
  alt: "Barak Group cleaning professional with equipment",
};

export const heroPanelImage = {
  src: "https://barakservices.com/wp-content/uploads/2023/12/80d07e6c-a735-47e3-9fae-c3f2298a8245.jpeg",
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
  "https://barakservices.com/wp-content/uploads/2023/12/97bf00b2-1ed0-4f1d-a283-7d2c28811d29.jpeg",
  "https://barakservices.com/wp-content/uploads/2023/12/67c4776c-40bf-4fbe-81da-02d5f116b5c7.jpeg",
  "https://barakservices.com/wp-content/uploads/2023/12/52593a0b-2517-415a-9cd0-93bbe678ce60-2.jpg",
  "https://barakservices.com/wp-content/uploads/2023/12/80d07e6c-a735-47e3-9fae-c3f2298a8245.jpeg",
  "https://barakservices.com/wp-content/uploads/2023/12/IMG_5682-scaled.jpeg",
  "https://barakservices.com/wp-content/uploads/2023/12/FullSizeRender-scaled.jpeg",
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
    description: "Nightly or weekly janitorial while your team is off the clock.",
    bullets: [
      "Kitchens and restrooms",
      "Floors and carpet",
      "Trash and windows",
    ],
    image:
      "https://barakservices.com/wp-content/uploads/2023/10/cheerful-cleaner-moving-cart-with-cleaning-supplie.jpg",
    imageAlt: "Cleaner pushing supply cart in a hallway",
  },
  {
    title: "Construction & turnover",
    description: "Final cleans for new builds and tenant move-ins.",
    bullets: [
      "Post-construction top-down cleans",
      "Move-in / move-out work",
      "Photo documentation",
    ],
    image: "https://barakservices.com/wp-content/uploads/2023/12/3d09cb4d-5f17-49fe-90e7-14588ef86253.jpeg",
    imageAlt: "Crew preparing a property for turnover",
  },
  {
    title: "Events & large venues",
    description: "Stadiums, fairs, and race weekends — restrooms, trash, and resets.",
    bullets: [
      "Restroom and waste runs",
      "Grounds and common areas",
      "Extra staff when you need it",
    ],
    image: "/event-venue.png",
    imageAlt: "Event venue with active cleaning support",
  },
  {
    title: "Exterior & specialty",
    description: "Pressure washing, windows, floors, and winter ice melt.",
    bullets: [
      "Pressure washing",
      "Exterior windows",
      "Carpet and water extraction",
    ],
    image: "https://barakservices.com/wp-content/uploads/2023/12/6e92e5b4-b82c-46a0-8426-50b49ba178d1.jpg",
    imageAlt: "Exterior cleaning and maintenance crew",
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
    image: "https://barakservices.com/wp-content/uploads/2023/12/3d09cb4d-5f17-49fe-90e7-14588ef86253.jpeg",
  },
  {
    name: "Stadiums & Universities",
    summary: "High-traffic venue maintenance at scale.",
    image: "https://barakservices.com/wp-content/uploads/2023/12/80d07e6c-a735-47e3-9fae-c3f2298a8245.jpeg",
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
    image: "https://barakservices.com/wp-content/uploads/2023/12/80d07e6c-a735-47e3-9fae-c3f2298a8245.jpeg",
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
    image: "https://barakservices.com/wp-content/uploads/2023/12/67c4776c-40bf-4fbe-81da-02d5f116b5c7.jpeg",
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
    image: "https://barakservices.com/wp-content/uploads/2023/12/52593a0b-2517-415a-9cd0-93bbe678ce60-2.jpg",
    imageAlt: "Crew member supporting Indy race operations",
  },
];
