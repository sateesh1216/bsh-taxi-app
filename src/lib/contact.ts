import { Linking } from "react-native";
import { SUPPORT_PHONE } from "../data/bookingConfig";

export const callSupport = () => Linking.openURL(`tel:+${SUPPORT_PHONE}`);

export const whatsappSupport = (text = "Hi BSH Taxi Services, I need a cab.") =>
  Linking.openURL(`https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(text)}`);
