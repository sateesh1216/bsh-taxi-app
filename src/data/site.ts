// Website content, exported from the BSH website data files (single source of truth).
import destinationsJson from "./site/destinations.json";
import outstationsJson from "./site/outstations.json";
import vehicleOptionsJson from "./site/vehicleOptions.json";
import pricesJson from "./site/outstationPrices.json";
import servicesJson from "./site/services.json";
import vehiclesJson from "./site/vehicles.json";
import reviewsJson from "./site/reviews.json";
import faqsJson from "./site/faqs.json";
import placesJson from "./site/places.json";
import aboutJson from "./site/about.json";
import legalJson from "./site/legal.json";
import contactJson from "./site/contactInfo.json";
import featuresJson from "./site/features.json";
import trustJson from "./site/trustItems.json";
import serviceDetailsJson from "./site/serviceDetails.json";

export type Fact = { label: string; value: string };
export type Place = { name: string; image?: string; imageAlt?: string; tag?: string; description?: string };

export type Destination = {
  slug: string; name: string; image: string; imageAlt?: string; distanceFromVizag?: string; distanceKm?: number; driveTime?: string;
  category: string; description: string; tagline?: string; costPerDay?: number; fleetPriceLabel?: string; fleetPrices?: Record<string, number>;
  history?: string; highlights?: string[]; quickFacts?: Fact[]; bestTimeToVisit?: string; howToReach?: string; funFact?: string; importantNotes?: string[]; places?: Place[];
};
export type Outstation = Omit<Destination, "image" | "fleetPrices" | "fleetPriceLabel">;
export type VehicleOption = { slug: string; name: string; category: string; seats: number; bags: number; basePackageKm: number; basePackagePrice: number; extraKmRate: number; extraHourRate: number; bestFor: string };
export type Service = { slug: string; title: string; description: string; image: string };
export type FleetVehicle = { slug: string; name: string; category: string; image: string; seats: number; hasAC: boolean; bags: number; pricePerKm: number; description: string };
export type Review = { name: string; initial: string; date: string; text: string };
export type PlaceSuggestion = { primary: string; secondary: string; fullLabel: string; lat: string; lon: string };
export type ContactItem = { id: string; title: string; lines: string[]; href?: string };

export const destinations = destinationsJson as unknown as Destination[];
export const outstations = outstationsJson as unknown as Outstation[];
export const vehicleOptions = vehicleOptionsJson as unknown as VehicleOption[];
export const outstationPrices = pricesJson.outstationPrices as Record<string, Record<string, number>>;
export const perKmRates = pricesJson.perKmRates as Record<string, number>;
export const fixedPriceSlugs = pricesJson.FIXED_PRICE_SLUGS as string[];
export const services = servicesJson as unknown as Service[];
export const fleetVehicles = vehiclesJson.vehicles as unknown as FleetVehicle[];
export const fleetCategories = vehiclesJson.vehicleCategories as string[];
export const reviews = reviewsJson as Review[];
export const faqs = faqsJson as { question: string; answer: string }[];
export const popularPickup = placesJson.pickup as PlaceSuggestion[];
export const popularDrop = placesJson.drop as PlaceSuggestion[];
export const about = aboutJson;
export const legal = legalJson as Record<string, { title: string; heading: string; body: string }>;
export const contactItems = contactJson as unknown as ContactItem[];
export const features = featuresJson as { title: string; description: string }[];
export const trustItems = trustJson as { title: string; description: string }[];

export const GOOGLE_REVIEW_URL = "https://g.page/r/CVkY_xSGRSlIEAI/review";
export const INSTAGRAM_URL = "https://www.instagram.com/bshtaxiservices/";

export type ServiceDetail = { tagline: string; longDescription: string; highlights: string[]; notes: string[] };
export const serviceDetails = serviceDetailsJson as unknown as Record<string, ServiceDetail>;
