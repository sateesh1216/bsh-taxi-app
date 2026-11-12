import { StyleSheet, Text } from "react-native";
import { GlassCard } from "./GlassCard";
import { Screen } from "./Screen";
import { Button } from "./Button";
import { whatsappSupport } from "../lib/contact";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

type Props = { title: string; body: string; cta?: string };

export function ComingSoon({ title, body, cta = "Chat on WhatsApp" }: Props) {
  return (
    <Screen>
      <Text style={styles.title}>{title}</Text>
      <GlassCard style={styles.card}>
        <Text style={styles.body}>{body}</Text>
        <Button label={cta} variant="glass" onPress={() => whatsappSupport()} />
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.heading, fontSize: 28, color: colors.white, marginBottom: 16 },
  card: { padding: 20, gap: 16 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.textMuted },
});
