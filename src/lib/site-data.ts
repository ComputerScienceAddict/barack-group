export type Service = {
  title: string;
  heroLine: string;
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
  src: "/hero-on-site-supplies.png",
  alt: "Barak Group on-site supply and equipment staging area",
};

export const heroCarouselSlides = [
  {
    src: "/hero-on-site-supplies.png",
    alt: "Barak Group crew supply room with cleaning equipment and PPE",
  },
  {
    src: "/hero-on-site-mopping.png",
    alt: "Barak Group crew member mopping a facility floor on site",
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
    heroLine: "Office janitorial on nights, weekends, or a daily schedule.",
    description: "Janitorial for offices on a schedule that fits the building.",
    bullets: [
      "Restrooms and break rooms",
      "Vacuum, mop, and carpet",
      "Trash out, liners replaced, interior windows",
    ],
    image: "https://www.barakservices.com/office-building.png",
    imageAlt: "Cleaner pushing supply cart in a hallway",
  },
  {
    title: "Construction & turnover",
    heroLine: "Construction cleanup and apartment turnovers.",
    description: "Clean up after the job or get a unit ready for move-in.",
    bullets: [
      "Dust, debris, and construction mess cleared",
      "Units ready before move-in",
      "Walkthrough photos if you need them",
    ],
    image: "https://www.barakservices.com/hero-after.png",
    imageAlt: "Crew preparing a property for turnover",
  },
  {
    title: "Events & large venues",
    heroLine: "Stadium and event work. Timbers, NASCAR, Indy, and similar.",
    description: "Restrooms, trash, and resets when thousands of people show up.",
    bullets: [
      "Restrooms and trash on a loop",
      "Concourses and seating areas reset",
      "Extra crew when the crowd shows up",
    ],
    image: "https://www.barakservices.com/event-venue.png",
    imageAlt: "Event venue with active cleaning support",
  },
  {
    title: "Exterior & specialty",
    heroLine: "Power washing, outside windows, and carpet extraction.",
    description: "Outside work and deep carpet when standard cleaning is not enough.",
    bullets: [
      "Sidewalks, parking lots, and building exteriors",
      "Outside windows",
      "Carpet stains and extraction",
    ],
    image: "https://www.barakservices.com/hero-before.png",
    imageAlt: "Professional cleaner performing specialty cleaning work",
  },
];

export const industries: Industry[] = [
  {
    name: "Apartment Communities",
    summary: "Clubhouses, halls, and unit turnovers.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Office Buildings",
    summary: "Nights and weekends, around your schedule.",
    image: "/office-building.png",
  },
  {
    name: "Construction",
    summary: "Final cleans before the walkthrough.",
    image: "/hero-after.png",
  },
  {
    name: "Stadiums & Universities",
    summary: "Match days and busy campus events.",
    image: "/event-venue.png",
  },
  {
    name: "Restaurant Kitchens",
    summary: "Deep cleans and hood work with partner crews.",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Airbnb & Vacation Rentals",
    summary: "Quick turnarounds between guests.",
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
    excerpt: "Dahli at Providence Park before a Timbers match.",
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
    excerpt: "Chucho at the NASCAR track in Utah.",
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
    excerpt: "Hector's crew at Indy — cleaning and fixing what broke.",
    content: [
      "Hector and the crew split time between cleaning runs and whatever broke on site.",
      "When something goes wrong mid-event, it helps to have people who can actually fix it.",
      "Back on the floor before the next session — that was the whole weekend.",
    ],
    image: "/hero-before.png",
    imageAlt: "Crew member supporting Indy race operations",
  },
];
