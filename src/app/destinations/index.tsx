import { View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../components/Screen";
import { Header } from "../../components/Header";
import { ImageCard } from "../../components/Content";
import { destinations } from "../../data/site";

export default function Destinations() {
  return (
    <Screen bottomPad={40}>
      <Header eyebrow="TOUR PACKAGES" title="Destinations from Vizag" />
      <View style={{ gap: 12 }}>
        {destinations.map((d) => (
          <ImageCard key={d.slug} title={d.name} subtitle={[d.category, d.distanceKm ? `${d.distanceKm} km` : null, d.driveTime].filter(Boolean).join(" · ")} image={d.image} height={170} onPress={() => router.push(`/destinations/${d.slug}`)} />
        ))}
      </View>
    </Screen>
  );
}
