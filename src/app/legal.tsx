import { useLocalSearchParams } from "expo-router";
import { Screen } from "../components/Screen";
import { Header } from "../components/Header";
import { Body } from "../components/Content";
import { legal } from "../data/site";

export default function Legal() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const page = legal[type === "terms" ? "/terms" : "/privacy-policy"];
  return (
    <Screen bottomPad={40}>
      <Header eyebrow="LEGAL" title={page.heading} />
      <Body>{page.body}</Body>
    </Screen>
  );
}
