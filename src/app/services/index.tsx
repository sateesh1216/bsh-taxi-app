import { View } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../components/Screen";
import { Header } from "../../components/Header";
import { ImageCard } from "../../components/Content";
import { services } from "../../data/site";

export default function Services() {
  return (
    <Screen bottomPad={40}>
      <Header eyebrow="WHAT WE OFFER" title="Our services" />
      <View style={{ gap: 12 }}>
        {services.map((s) => <ImageCard key={s.slug} title={s.title} subtitle="Tap to view details and book" image={s.image} height={170} onPress={() => router.push(`/services/${s.slug}`)} />)}
      </View>
    </Screen>
  );
}
