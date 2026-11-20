import { Linking, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { Header } from "../components/Header";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/Button";
import { contactItems } from "../data/site";
import { callSupport, whatsappSupport } from "../lib/contact";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

export default function Contact() {
  return (
    <Screen bottomPad={40}>
      <Header eyebrow="GET IN TOUCH" title="Contact us" />
      <View style={{ gap: 10 }}>
        <Button label="Call now" variant="taxi" icon="call" onPress={callSupport} />
        <Button label="Chat on WhatsApp" variant="outline" icon="logo-whatsapp" onPress={() => whatsappSupport()} />
      </View>
      <View style={{ gap: 12, marginTop: 20 }}>
        {contactItems.map((c) => (
          <GlassCard key={c.id} r={18} style={{ padding: 16, gap: 4 }}>
            <Text style={s.title}>{c.title}</Text>
            {c.lines.map((l) => <Text key={l} style={s.line}>{l}</Text>)}
            {c.href ? <Button label={c.id === "email" ? "Send email" : "Open"} variant="outline" onPress={() => Linking.openURL(c.href!)} style={{ marginTop: 10 }} /> : null}
          </GlassCard>
        ))}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: fonts.heading, fontSize: 18, color: colors.heading },
  line: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.body },
});
