// Copied from the website BookingWizard (same ids, names and fixed fares).
// Local + tour fares are fixed; outstation and airport fares are confirmed on call.


export const CAR_TYPES = [
  {
    id: "sedan",
    name: "Dzire, Etios",
    subtitle: "Comfortable city rides",
    image: require("../../assets/cars/Dzire-taxi-services-in-visakhapatnam-bshtaxiservices.webp"),
    seats: 4,
    ac: true,
  },
  {
    id: "suv",
    name: "SUV (Ertiga, Innova)",
    subtitle: "Spacious for families & groups",
    image: require("../../assets/cars/ertiga-taxi-services-in-visakhapatnam-bshtaxiservices.webp"),
    seats: 7,
    ac: true,
  },
  {
    id: "innova_crysta",
    name: "Innova Crysta",
    subtitle: "Premium long-distance travel",
    image: require("../../assets/cars/innova-crysta-in-vizag-bshtaxiservices.webp"),
    seats: 7,
    ac: true,
  },
  {
    id: "tempo_traveller",
    name: "17-Seater Tempo Traveller",
    subtitle: "Best for large groups & outings",
    image: require("../../assets/cars/17-seater-tempo-traveller-bshtaxiservices.webp"),
    seats: 17,
    ac: true,
  },
] as const;

export type CarId = (typeof CAR_TYPES)[number]["id"];

// ---- LOCAL package definitions (label/description only — prices live below) ----
export const LOCAL_PACKAGES = [
  { id: "pkg8_80", label: "8 Hours / 80 KM", description: "Ideal for local city travel" },
  { id: "pkg10_100", label: "10 Hours / 100 KM", description: "More time, more places" },
] as const;

export type LocalPackageId = (typeof LOCAL_PACKAGES)[number]["id"];

// ---- FIXED local fares: [carId][packageId] -> price. Edit freely. ----
export const LOCAL_FARES: Record<CarId, Record<LocalPackageId, number>> = {
  sedan: { pkg8_80: 2500, pkg10_100: 3000 },
  suv: { pkg8_80: 3200, pkg10_100: 3800 },
  innova_crysta: { pkg8_80: 3500, pkg10_100: 4000 },
  tempo_traveller: { pkg8_80: 5500, pkg10_100: 6500 },
};

export const TOUR_PACKAGES = [
  {
    id: "araku_1d",
    name: "Araku Valley 1Day Trip",
    days: 1,
    nights: 0,
    description: "Coffee plantations, Borra Caves & scenic ghats",
    highlights: [
      "damuku view point",
      "Borra Caves",
      "Katika waterfalls (Only car parking)",
      "Galikonda viewponit",
      "Coffee Plantation",
      "Coffee Museum",
      "Tribal Museum",
      "Coffee House",
      "padmapuram gardens",
    ],
  },
  {
    id: "araku_2d",
    name: "Araku Valley 2D/1N",
    days: 2,
    nights: 1,
    description: "Overnight stay with sunrise viewpoint",
    highlights: [
      "damuku view point",
      "Borra Caves",
      "Katika waterfalls (Only car parking)",
      "Galikonda viewponit",
      "Coffee Plantation",
      "Coffee Museum",
      "Tribal Museum",
      "Coffee House",
      "padmapuram gardens",
      "madagada view point",
      "chaparai waterfalls",
      "Ranajilleda waterfalls",
    ],
  },
  {
    id: "araku & lambasingi_2d",
    name: "Araku & Lambasingi 2D/1N",
    days: 2,
    nights: 1,
    description: "'Kashmir of Andhra' — misty hills getaway",
    highlights: [
      "damuku view point",
      "Borra Caves",
      "Katika waterfalls (Only car parking)",
      "Galikonda viewponit",
      "Coffee Plantation",
      "Coffee Museum",
      "Tribal Museum",
      "Coffee House",
      "padmapuram gardens",
      "madagada view point",
      "chaparai waterfalls",
      "Kothapalli waterfalls",
      "strawberry plantation",
      "Lambasingi",
    ],
  },
  {
    id: "vizag_local_tour_package",
    name: "Vizag City 1 Day",
    days: 1,
    nights: 0,
    description: "Beaches, temples & submarine museum",
    highlights: [
      "RK Beach",
      "Visakha museum",
      "Vuda park",
      "Fishing harbour",
      "Simhachalam Temple",
      "Kailasagiri",
      "Zoo park",
      "TTD temple",
      "Rushikonda beach",
      "Thotla konda",
      "Ramanaidu studioes",
      "Submarine(INS Kurusura Museum)",
      "Aircraft museum",
    ],
  },
  {
    id: "vizag_araku_3d",
    name: "Vizag 2D/1N + Araku 1D",
    days: 3,
    nights: 2,
    description: "Full city & valley combo package",
    highlights: [
      "RK Beach",
      "Visakha museum",
      "Vuda park",
      "Fishing harbour",
      "Fishing harbour",
      "Simhachalam Temple",
      "Kailasagiri",
      "Zoo park",
      "TTD temple",
      "Rushikonda beach",
      "Thotla konda",
      "Ramanaidu studioes",
      "Submarine(INS Kurusura Museum)",
      "Aircraft museum",
      "yarada beach",
      "light house",
      "damuku view point",
      "Borra Caves",
      "Katika waterfalls (Only car parking)",
      "Galikonda viewponit",
      "Coffee Plantation",
      "Coffee Museum",
      "Tribal Museum",
      "Coffee House",
      "padmapuram gardens",
    ],
  },
  {
    id: "vizag_araku_4d",
    name: "Vizag 2D/1N + Araku 1D/1N + Lambasingi 1D",
    days: 3,
    nights: 2,
    description: "Full city & valley combo package",
    highlights: [
      "RK Beach",
      "Visakha museum",
      "Vuda park",
      "Fishing harbour",
      "Fishing harbour",
      "Simhachalam Temple",
      "Kailasagiri",
      "Zoo park",
      "TTD temple",
      "Rushikonda beach",
      "Thotla konda",
      "Ramanaidu studioes",
      "Submarine(INS Kurusura Museum)",
      "Aircraft museum",
      "yarada beach",
      "light house",
      "damuku view point",
      "Borra Caves",
      "Katika waterfalls (Only car parking)",
      "Galikonda viewponit",
      "Coffee Plantation",
      "Coffee Museum",
      "Tribal Museum",
      "Coffee House",
      "padmapuram gardens",
      "madagada view point",
      "chaparai waterfalls",
      "Kothapalli waterfalls",
      "strawberry plantation",
      "Lambasingi",
    ],
  },
] as const;

export type TourId = (typeof TOUR_PACKAGES)[number]["id"];

// ---- FIXED tour fares: [tourId][carId] -> price. Edit freely. ----
export const TOUR_FARES: Record<TourId, Record<CarId, number>> = {
  araku_1d: { sedan: 5000, suv: 6500, innova_crysta: 8000, tempo_traveller: 12000 },
  araku_2d: { sedan: 10000, suv: 12000, innova_crysta: 15000, tempo_traveller: 18999 },
  "araku & lambasingi_2d": { sedan: 10000, suv: 12000, innova_crysta: 15000, tempo_traveller: 18999 },
  vizag_local_tour_package: { sedan: 3000, suv: 3500, innova_crysta: 4000, tempo_traveller: 6500 },
  vizag_araku_3d: { sedan: 11000, suv: 14000, innova_crysta: 16000, tempo_traveller: 25000 },
  vizag_araku_4d: { sedan: 15000, suv: 18000, innova_crysta: 20000, tempo_traveller: 30000 },
};

// ---- Terms & Conditions — shown in the confirm modal and appended to every

export const TERMS_AND_CONDITIONS = [
  "Toll charges and parking fees and Driver food and entry fees are not included.",
  "Driver Batta is optional.",
  "During standby and ghat roads, AC will be switched off.",
];
