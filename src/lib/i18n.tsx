import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const en = {
  tab_home: "Home", tab_bookings: "Bookings", tab_explore: "Explore", tab_profile: "Profile",
  home_eyebrow: "VISAKHAPATNAM", home_title: "Where are we\ngoing today?", open247: "Open 24/7",
  svc_local: "Local", svc_outstation: "Outstation", svc_airport: "Airport", svc_tours: "Tours",
  home_services: "Our services", see_all: "See all", home_destinations: "Popular destinations",
  home_outstation_btn: "Taxi to any city: see all outstation fares", home_why: "Why choose BSH",
  home_reviews: "What travellers say", all_reviews: "All reviews", help_title: "Need help? Talk to us 24/7",
  call_now: "Call now", whatsapp: "WhatsApp", search_ph: "Search Araku, Tirupati, airport…", sign_in_short: "Sign in",
  book_eyebrow: "BOOK A RIDE", kind_local: "Local", kind_outstation: "Outstation", kind_airport: "Airport", kind_tour: "Tours",
  title_local: "Local Taxi", title_outstation: "Outstation Cab", title_airport: "Airport Taxi", title_tour: "Tour Packages",
  lbl_pickup_address: "Pickup address", ph_pickup_area: "Search your pickup area", lbl_package: "Package",
  lbl_pickup: "Pickup", ph_pickup: "Search pickup location", lbl_drop: "Drop", ph_drop: "Where are you going?",
  one_way: "One Way", round_trip: "Round Trip", from_airport: "From airport", to_airport: "To airport",
  lbl_drop_loc: "Drop location", lbl_pickup_loc: "Pickup location", ph_airport_loc: "Search hotel, area or address",
  choose_package: "Choose a package", covers: "Covers", lbl_date: "Date", lbl_time: "Time", choose_car: "Choose your car",
  on_call: "On call", lbl_name: "Your name", ph_name: "Full name", lbl_mobile: "Mobile number", ph_mobile: "10-digit mobile number",
  lbl_email: "Email (optional)", fare_fixed: "Fixed fare", fare_label: "Fare", fare_on_call: "Confirmed on call / WhatsApp",
  pay_now: "Pay Now", send_enquiry: "Send Enquiry", quick_whatsapp: "Quick WhatsApp",
  v_pickup_addr: "Please enter your pickup address.", v_pickup_drop: "Please enter pickup and drop locations.",
  v_airport_drop: "Please enter where we should drop you.", v_airport_pickup: "Please enter your pickup location.",
  v_name: "Please enter your name.", v_mobile: "Please enter a valid 10-digit mobile number.", v_email: "Please enter a valid email address.",
  enq_sent: "Enquiry sent", enq_no: "Enquiry no.", enq_contact: "Our team will contact you shortly to confirm your booking.",
  continue_wa: "Continue on WhatsApp", call_us: "Call us", back_home: "Back to Home",
  login_title: "Welcome", login_sub: "Sign in to book faster and keep your trips and saved places.",
  sign_in: "Sign in", create_account: "Create account", lbl_password: "Password", lbl_fullname: "Full name",
  forgot_pw: "Forgot password?", continue_google: "Continue with Google", continue_guest: "Continue as guest",
  not_configured: "Accounts will be available soon. You can book as a guest now.", reset_sent: "Password reset link sent to your email.",
  enter_email: "Enter your email first.", need_fields: "Enter your email and password.", need_name: "Enter your name.",
  profile_title: "Profile", sign_out: "Sign out", delete_account: "Delete account", delete_title: "Delete your account?",
  delete_body: "Your account will be deleted permanently. This cannot be undone.", cancel: "Cancel", delete: "Delete",
  saved_places: "Saved places", place_home: "Home", place_office: "Office", ph_place: "Search address", save: "Save", saved: "Saved",
  language: "Language", sign_in_cta: "Sign in to keep your bookings and saved places in one account.", support_247: "24/7 SUPPORT",
  step_trip: "Trip", step_car: "Car", step_confirm: "Confirm", step_word: "Step", next: "Next", back: "Back",
  next_car: "Choose car", next_confirm: "Review and confirm", your_trip: "Your trip", your_details: "Your details", fare_total: "Total",
  where_to: "Where to?", plan_trip: "Plan your trip", popular_trips: "Popular trips", last_booking: "Your last booking", rebook: "Book again",
  explore_more: "Explore more", hi: "Hi", saved_account: "Saved in your account", saved_phone: "Saved on this phone",
  signin_keep: "Sign in to keep your bookings in your account on any phone.", more_ways: "Or send an enquiry",
  my_bookings: "My Bookings", no_bookings: "No bookings yet. Your enquiries and payments from this phone will appear here.", book_ride: "Book a ride",
};

type Key = keyof typeof en;

const te: Record<Key, string> = {
  tab_home: "హోమ్", tab_bookings: "బుకింగ్స్", tab_explore: "అన్వేషించండి", tab_profile: "ప్రొఫైల్",
  home_eyebrow: "విశాఖపట్నం", home_title: "ఈ రోజు ఎక్కడికి\nవెళ్దాం?", open247: "24/7 అందుబాటులో",
  svc_local: "లోకల్", svc_outstation: "ఔట్‌స్టేషన్", svc_airport: "ఎయిర్‌పోర్ట్", svc_tours: "టూర్స్",
  home_services: "మా సేవలు", see_all: "అన్నీ చూడండి", home_destinations: "ప్రసిద్ధ ప్రదేశాలు",
  home_outstation_btn: "ఏ నగరానికైనా టాక్సీ: ఔట్‌స్టేషన్ ఫేర్లు చూడండి", home_why: "BSH ని ఎందుకు ఎంచుకోవాలి",
  home_reviews: "ప్రయాణికులు ఏమంటున్నారు", all_reviews: "అన్ని రివ్యూలు", help_title: "సహాయం కావాలా? 24/7 మాతో మాట్లాడండి",
  call_now: "ఇప్పుడే కాల్ చేయండి", whatsapp: "వాట్సాప్", search_ph: "అరకు, తిరుపతి, ఎయిర్‌పోర్ట్ వెతకండి…", sign_in_short: "సైన్ ఇన్",
  book_eyebrow: "రైడ్ బుక్ చేయండి", kind_local: "లోకల్", kind_outstation: "ఔట్‌స్టేషన్", kind_airport: "ఎయిర్‌పోర్ట్", kind_tour: "టూర్స్",
  title_local: "లోకల్ టాక్సీ", title_outstation: "ఔట్‌స్టేషన్ క్యాబ్", title_airport: "ఎయిర్‌పోర్ట్ టాక్సీ", title_tour: "టూర్ ప్యాకేజీలు",
  lbl_pickup_address: "పికప్ చిరునామా", ph_pickup_area: "మీ పికప్ ప్రాంతం వెతకండి", lbl_package: "ప్యాకేజీ",
  lbl_pickup: "పికప్", ph_pickup: "పికప్ ప్రదేశం వెతకండి", lbl_drop: "డ్రాప్", ph_drop: "ఎక్కడికి వెళ్తున్నారు?",
  one_way: "వన్ వే", round_trip: "రౌండ్ ట్రిప్", from_airport: "ఎయిర్‌పోర్ట్ నుండి", to_airport: "ఎయిర్‌పోర్ట్‌కు",
  lbl_drop_loc: "డ్రాప్ ప్రదేశం", lbl_pickup_loc: "పికప్ ప్రదేశం", ph_airport_loc: "హోటల్, ప్రాంతం లేదా చిరునామా వెతకండి",
  choose_package: "ప్యాకేజీ ఎంచుకోండి", covers: "కవర్ అయ్యేవి", lbl_date: "తేదీ", lbl_time: "సమయం", choose_car: "మీ కారు ఎంచుకోండి",
  on_call: "కాల్‌లో", lbl_name: "మీ పేరు", ph_name: "పూర్తి పేరు", lbl_mobile: "మొబైల్ నంబర్", ph_mobile: "10 అంకెల మొబైల్ నంబర్",
  lbl_email: "ఈమెయిల్ (ఐచ్ఛికం)", fare_fixed: "ఫిక్స్‌డ్ ఫేర్", fare_label: "ఫేర్", fare_on_call: "కాల్ / వాట్సాప్‌లో నిర్ధారిస్తాం",
  pay_now: "ఇప్పుడే చెల్లించండి", send_enquiry: "ఎంక్వైరీ పంపండి", quick_whatsapp: "త్వరగా వాట్సాప్",
  v_pickup_addr: "దయచేసి మీ పికప్ చిరునామా నమోదు చేయండి.", v_pickup_drop: "దయచేసి పికప్, డ్రాప్ ప్రదేశాలు నమోదు చేయండి.",
  v_airport_drop: "దయచేసి మమ్మల్ని ఎక్కడ దింపాలో నమోదు చేయండి.", v_airport_pickup: "దయచేసి మీ పికప్ ప్రదేశం నమోదు చేయండి.",
  v_name: "దయచేసి మీ పేరు నమోదు చేయండి.", v_mobile: "దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి.", v_email: "దయచేసి సరైన ఈమెయిల్ చిరునామా ఇవ్వండి.",
  enq_sent: "ఎంక్వైరీ పంపబడింది", enq_no: "ఎంక్వైరీ నంబర్", enq_contact: "మా బృందం త్వరలో మిమ్మల్ని సంప్రదించి మీ బుకింగ్‌ను నిర్ధారిస్తుంది.",
  continue_wa: "వాట్సాప్‌లో కొనసాగండి", call_us: "మాకు కాల్ చేయండి", back_home: "హోమ్‌కు తిరిగి వెళ్ళండి",
  login_title: "స్వాగతం", login_sub: "వేగంగా బుక్ చేయడానికి, మీ ట్రిప్‌లు, సేవ్ చేసిన ప్రదేశాలు ఉంచుకోవడానికి సైన్ ఇన్ చేయండి.",
  sign_in: "సైన్ ఇన్", create_account: "ఖాతా సృష్టించండి", lbl_password: "పాస్‌వర్డ్", lbl_fullname: "పూర్తి పేరు",
  forgot_pw: "పాస్‌వర్డ్ మర్చిపోయారా?", continue_google: "Google తో కొనసాగండి", continue_guest: "గెస్ట్‌గా కొనసాగండి",
  not_configured: "ఖాతాలు త్వరలో అందుబాటులోకి వస్తాయి. ఇప్పుడు గెస్ట్‌గా బుక్ చేసుకోవచ్చు.", reset_sent: "పాస్‌వర్డ్ రీసెట్ లింక్ మీ ఈమెయిల్‌కు పంపాం.",
  enter_email: "ముందు మీ ఈమెయిల్ నమోదు చేయండి.", need_fields: "ఈమెయిల్, పాస్‌వర్డ్ నమోదు చేయండి.", need_name: "మీ పేరు నమోదు చేయండి.",
  profile_title: "ప్రొఫైల్", sign_out: "సైన్ అవుట్", delete_account: "ఖాతా తొలగించండి", delete_title: "ఖాతా తొలగించాలా?",
  delete_body: "మీ ఖాతా శాశ్వతంగా తొలగించబడుతుంది. దీన్ని తిరిగి మార్చలేము.", cancel: "రద్దు", delete: "తొలగించు",
  saved_places: "సేవ్ చేసిన ప్రదేశాలు", place_home: "ఇల్లు", place_office: "ఆఫీస్", ph_place: "చిరునామా వెతకండి", save: "సేవ్", saved: "సేవ్ అయింది",
  language: "భాష", sign_in_cta: "మీ బుకింగ్‌లు, సేవ్ చేసిన ప్రదేశాలు ఒకే ఖాతాలో ఉంచుకోవడానికి సైన్ ఇన్ చేయండి.", support_247: "24/7 సపోర్ట్",
  step_trip: "ట్రిప్", step_car: "కారు", step_confirm: "నిర్ధారణ", step_word: "దశ", next: "తరువాత", back: "వెనుకకు",
  next_car: "కారు ఎంచుకోండి", next_confirm: "సరిచూసి నిర్ధారించండి", your_trip: "మీ ట్రిప్", your_details: "మీ వివరాలు", fare_total: "మొత్తం",
  where_to: "ఎక్కడికి వెళ్ళాలి?", plan_trip: "మీ ట్రిప్ ప్లాన్ చేయండి", popular_trips: "ప్రసిద్ధ ట్రిప్‌లు", last_booking: "మీ చివరి బుకింగ్", rebook: "మళ్ళీ బుక్ చేయండి",
  explore_more: "మరింత చూడండి", hi: "నమస్తే", saved_account: "మీ ఖాతాలో సేవ్ అయింది", saved_phone: "ఈ ఫోన్‌లో సేవ్ అయింది",
  signin_keep: "ఏ ఫోన్‌లోనైనా మీ బుకింగ్స్ ఖాతాలో ఉండడానికి సైన్ ఇన్ చేయండి.", more_ways: "లేదా ఎంక్వైరీ పంపండి",
  my_bookings: "నా బుకింగ్స్", no_bookings: "ఇంకా బుకింగ్స్ లేవు. ఈ ఫోన్ నుండి మీ ఎంక్వైరీలు, చెల్లింపులు ఇక్కడ కనిపిస్తాయి.", book_ride: "రైడ్ బుక్ చేయండి",
};

export type Lang = "en" | "te";
export type { Key };
const DICT: Record<Lang, Record<Key, string>> = { en, te };
const STORE = "bsh_lang_v1";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string };
const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => en[k] });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => { AsyncStorage.getItem(STORE).then((v) => { if (v === "en" || v === "te") setLangState(v); }).catch(() => {}); }, []);
  const value = useMemo<Ctx>(() => ({
    lang,
    setLang: (l) => { setLangState(l); AsyncStorage.setItem(STORE, l).catch(() => {}); },
    t: (k) => DICT[lang][k] ?? en[k],
  }), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useT = () => useContext(LangContext);
