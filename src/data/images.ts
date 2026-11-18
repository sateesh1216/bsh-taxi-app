import type { ImageSourcePropType } from "react-native";

// Generated from the website image paths. Bundled with the app (compressed).
const MAP: Record<string, ImageSourcePropType> = {
  "/assets/About/24-7-bshtaxiservices+91 8886803322.webp": require("../../assets/site/About-24-7-bshtaxiservices-91-8886803322.webp"),
  "/assets/About/about-bshtaxiservices+91 8886803322.webp": require("../../assets/site/About-about-bshtaxiservices-91-8886803322.webp"),
  "/assets/Destinations/Airport-taxi-services-bshtaxiservices.webp": require("../../assets/site/Destinations-Airport-taxi-services-bshtaxiservices.webp"),
  "/assets/Destinations/Annavaram_Temple-taxi-services-bshtaxiservices.webp": require("../../assets/site/Destinations-Annavaram-Temple-taxi-services-bshtaxiservices.webp"),
  "/assets/Destinations/Araku/Araku-Damuku_View_Point-taxi-services-bshtaxiservices.webp": require("../../assets/site/Destinations-Araku-Araku-Damuku-View-Point-taxi-services-bshtaxiservices.webp"),
  "/assets/Destinations/Araku/Araku-Padmapuram_Gardens-taxi-services-bshtaxiservices.webp": require("../../assets/site/Destinations-Araku-Araku-Padmapuram-Gardens-taxi-services-bshtaxiservices.webp"),
  "/assets/Destinations/Araku/Araku-Tribal_Museum-taxi-services-bshtaxiservices.webp": require("../../assets/site/Destinations-Araku-Araku-Tribal-Museum-taxi-services-bshtaxiservices.webp"),
  "/assets/Destinations/Araku/Borra_Caves-taxi-services-bshtaxiservices.webp": require("../../assets/site/Destinations-Araku-Borra-Caves-taxi-services-bshtaxiservices.webp"),
  "/assets/Destinations/Araku/Katika_Waterfalls-taxi-services-bshtaxiservices.webp": require("../../assets/site/Destinations-Araku-Katika-Waterfalls-taxi-services-bshtaxiservices.webp"),
  "/assets/Destinations/Araku/araku-Coffee_Museum-taxi-services-bshtaxiservices.webp": require("../../assets/site/Destinations-Araku-araku-Coffee-Museum-taxi-services-bshtaxiservices.webp"),
  "/assets/Destinations/Araku/araku-Galikonda_Viewpoint-taxi-services-bshtaxiservices.webp": require("../../assets/site/Destinations-Araku-araku-Galikonda-Viewpoint-taxi-services-bshtaxiservices.webp"),
  "/assets/Destinations/Araku/araku-coffee_plantation-wooden_bridge-taxi-services-bshtaxiservices.webp": require("../../assets/site/Destinations-Araku-araku-coffee-plantation-wooden-bridge-taxi-services-bshtaxiservices.webp"),
  "/assets/Destinations/Arasavalli_Temple-taxi-services-bshtaxiservices.webp": require("../../assets/site/Destinations-Arasavalli-Temple-taxi-services-bshtaxiservices.webp"),
  "/assets/Destinations/Lambasingi-taxi-services-bshtaxiservices.webp": require("../../assets/site/Destinations-Lambasingi-taxi-services-bshtaxiservices.webp"),
  "/assets/Destinations/Simhachalam-Temple-taxi-services-bshtaxiservices.webp": require("../../assets/site/Destinations-Simhachalam-Temple-taxi-services-bshtaxiservices.webp"),
  "/assets/Destinations/Tirupati-taxi-service-Packages-bshtaxiservices.webp": require("../../assets/site/Destinations-Tirupati-taxi-service-Packages-bshtaxiservices.webp"),
  "/assets/Destinations/Vanjangi-taxi-services-bshtaxiservices.webp": require("../../assets/site/Destinations-Vanjangi-taxi-services-bshtaxiservices.webp"),
  "/assets/Destinations/Vizag_local-taxi-services-bshtaxiservices.webp": require("../../assets/site/Destinations-Vizag-local-taxi-services-bshtaxiservices.webp"),
  "/assets/Destinations/araku-taxi-services-bshtaxiservices.webp": require("../../assets/site/Destinations-araku-taxi-services-bshtaxiservices.webp"),
  "/assets/Our Services car img's/Corporate- taxi-services-bshtaxiservices.webp": require("../../assets/site/Our-Services-car-img-s-Corporate-taxi-services-bshtaxiservices.webp"),
  "/assets/Our Services car img's/Tourpackages-bshtaxiservices.webp": require("../../assets/site/Our-Services-car-img-s-Tourpackages-bshtaxiservices.webp"),
  "/assets/Our Services car img's/Wedding-Car-Rentals-bshtaxiservices.webp": require("../../assets/site/Our-Services-car-img-s-Wedding-Car-Rentals-bshtaxiservices.webp"),
  "/assets/Our Services car img's/outstation-bshtaxiservices.webp": require("../../assets/site/Our-Services-car-img-s-outstation-bshtaxiservices.webp"),
  "/assets/Our Services car img's/vizag-airport-taxi-services-bshtaxiservices.webp": require("../../assets/site/Our-Services-car-img-s-vizag-airport-taxi-services-bshtaxiservices.webp"),
  "/assets/Our Services car img's/vizag-local-taxi-services-bshtaxiservices.webp": require("../../assets/site/Our-Services-car-img-s-vizag-local-taxi-services-bshtaxiservices.webp"),
  "/assets/cars/17-seater-tempo-traveller-bshtaxiservices.webp": require("../../assets/site/cars-17-seater-tempo-traveller-bshtaxiservices.webp"),
  "/assets/cars/Dzire-taxi-services-in-visakhapatnam-bshtaxiservices.webp": require("../../assets/site/cars-Dzire-taxi-services-in-visakhapatnam-bshtaxiservices.webp"),
  "/assets/cars/ertiga-taxi-services-in-visakhapatnam-bshtaxiservices.webp": require("../../assets/site/cars-ertiga-taxi-services-in-visakhapatnam-bshtaxiservices.webp"),
  "/assets/cars/innova-crysta-in-vizag-bshtaxiservices.webp": require("../../assets/site/cars-innova-crysta-in-vizag-bshtaxiservices.webp"),
};

export const img = (path?: string): ImageSourcePropType | undefined => (path ? MAP[path] : undefined);
