# BSH Taxi Services: Web to Mobile (Expo) Migration

Source of truth: `BSH_webpage.zip` (newer than `src.zip`; last git commit "update the code").
Target: Android + iOS app, React Native + Expo + TypeScript.
Design: 15-screen glass-theme mockups (see the BSH Taxi App Mockups artifact).

## 1. Backend (already live, reuse as is)

- Base URL (production): `https://accountsdatabase.in` (health check returns "NRK Travels Backend API is running")
- Shared by NRK and BSH. Every request body must include `company_key: "BSH"`.
- The website `.env` currently has `VITE_API_URL` set to localhost (dev). The app must use the production URL via `EXPO_PUBLIC_API_URL`.

| Action | Endpoint | Notes |
|---|---|---|
| Send enquiry | `POST /api/enquiries` | returns `enquiry.enquiry_number` |
| Pay Now | `POST /api/payments/booking-now` | Local Taxi + Tour Package only. Server computes the amount from `planA` + `vehicle_key`. Returns `checkoutUrl` / `redirectUrl` |
| Payment status | `GET /api/payments/status/:ref` | returns status, amount, invoice number + pdf_url |

Airport and Outstation bookings: enquiry only (no online payment), same as the website.
WhatsApp: the website opens `wa.me` with a prefilled message (incl. Terms & Conditions). Not yet confirmed whether the server also sends an automatic WhatsApp message.

## 2. Website routes -> app screens

| Website route | App screen | Phase |
|---|---|---|
| `/` Home | Home | 1 |
| `/fleet` | Our Fleet | 1 |
| `/services`, `/services/:slug` | Services + Service details | 1 |
| `/services/local-taxi` | Hourly / Local rental | 1 |
| `/outstation/:slug`, `/destinations`, `/destinations/:slug` | Routes + Tour Packages | 1 |
| `/contact`, `/about` | Contact, About (inside Profile) | 1 |
| `/google-reviews` | Reviews + FAQs | done |
| `/payment/result` | Payment result | 1 |
| `/privacy-policy`, `/terms` | Legal | 2 |

Not on the website, needs new backend work (shown as "coming soon" in v1): OTP login, live trip tracking, driver details, rating, wallet, offers/referral.

## 3. What can be reused

- `lib/api.ts` (fetch client, `submitEnquiry`, `startPayNow`, `getPaymentStatus`): swap `import.meta.env` for `process.env.EXPO_PUBLIC_*`, `window.setTimeout` for `setTimeout`.
- `hooks/useFareCalculator.ts`, `data/fixedPrices.ts`, `data/bookingConfig.ts` (VEHICLES, rates), `data/fleetData.ts`, `data/Outstationprices.ts`, `data/servicesData.ts`, `data/contactInfoData.ts`: mostly pure TypeScript, copy with small changes (image imports).
- Fleet rates in current code: Dzire 14, Ertiga 17, Innova 20, Tempo Traveller 30 (₹/km). Seats/bags: Dzire 4/2, Ertiga 6/3, Innova 7/4, Tempo 17/8.
- Location autocomplete uses `photon.komoot.io` (plain fetch, reusable).

## 4. Needs rewriting for mobile

| Web | Mobile |
|---|---|
| React Router | Expo Router |
| Tailwind CSS | StyleSheet + shared theme (glass theme tokens) |
| framer-motion | react-native-reanimated |
| leaflet map (`Routemappreview`) | react-native-maps (or static route preview) |
| react-helmet SEO, sitemap | not needed |
| `window.open(wa.me...)` | `Linking.openURL` |
| Pay Now redirect to gateway page | `expo-web-browser` / WebView + deep link back, then status check |
| `BookingWizard.tsx` (1,967 lines) | split into steps + one booking store |

## 5. Phases and status

Status key: [ ] not started, [~] in progress, [x] done and tested

### Phase 0: Setup
- [x] Expo project (SDK 58, TypeScript, Expo Router). Typecheck clean, Android and iOS JS bundles build
- [x] Theme (navy `#060F24`, blue `#155EEF`, amber `#F5A200`, Fraunces + Public Sans, GlassCard / Button / Screen)
- [x] API client + env config (`EXPO_PUBLIC_API_URL`, `company_key = BSH`), not yet called against the live server
- [~] Data files: `bookingConfig`, `fixedPrices`, `fleetData` copied (car photos bundled). Still to copy: `Outstationprices`, outstation/destination content

### Phase 1: Core booking
- [x] Home (service chips, route box and popular routes open the booking screen; call and WhatsApp work)
- [x] Location input: live suggestions (Photon, Vizag-biased) + popular places, shown directly below the field
- [x] Choose car with fixed fares (local + tour) or "fare on call" (outstation + airport), same rules as the website
- [x] Local rental packages (8hr/80km, 10hr/100km)
- [x] Send Enquiry (`/api/enquiries`) + WhatsApp message with terms. Built and typechecked, NOT yet tested against the live server
- [x] Pay Now (Local, Tour): in-app browser, then status polling + invoice link. Built, NOT yet tested with a real payment
- [x] Fleet, Services (+detail), Destinations (+detail), Outstation routes (+detail with fares), all from website data
- [x] My Bookings (enquiries saved on this phone)
- [x] Profile, Contact, About

### Phase 2: Polish
- [x] Reviews + FAQs, Privacy and Terms (text from the website)
- [ ] Offline/error states, loading states
- [ ] App icon, splash, store listing assets

### Phase 3: Needs backend work
- [~] Login: email + password and Google (Firebase) built, needs your Firebase keys (see SETUP_ACCOUNTS.md). Phone OTP not built (needs SMS provider)
- [ ] Live trip + driver details
- [ ] Rating + receipts
- [ ] Wallet, offers, referral

## 6. Open questions

1. Does the backend itself send a WhatsApp message to the business on each enquiry?
2. Is there an endpoint to list a customer's bookings?
3. Payment gateway: owner thinks it is Cashfree (not yet confirmed in backend code or dashboard). v1 plan: open `redirectUrl` in an in-app browser, then poll `GET /api/payments/status/:ref` using `payment.merchant_txn_id` (no backend change). Later option: Cashfree React Native SDK, which needs `payment_session_id` + `order_id` added to the booking-now response, and a development build (not Expo Go).
4. Real driver/car details and offers content for the placeholders in the mockups.

## 7. Findings during Phase 0

- `hooks/useFareCalculator.ts` is a demo stub (flat 15 km). Do not reuse it. Real fares come from `fixedPrices.ts` (known routes) and `Outstationprices.ts`.
- `estimateRoute()` in `bookingConfig.ts` is a placeholder (distance from a text hash, not real routing). The app should show fixed fares where they exist and "enquire for price" otherwise, until a real distance source is added.
- `expo-doctor`: 18 of 20 checks pass; the 2 failures were network lookups blocked in the build sandbox, rerun on your machine.
- Package id `com.bshtaxiservices.app` is a placeholder; confirm before store submission.
- Not tested on a device or emulator yet.

## 8. Phase 1 notes

- Booking rules mirror the website `BookingWizard`: ids `sedan`, `suv`, `innova_crysta`, `tempo_traveller`; local packages `pkg8_80`, `pkg10_100`; tour ids; Pay Now sends `planA` + `vehicle_key`.
- Fixed fares (from website): local sedan 2500/3000, SUV 3200/3800, Innova Crysta 3500/4000, Tempo 5500/6500; tour fares in `src/data/catalog.ts`.
- Booking logic has a scripted check (fares, validation, payloads for all 4 services). Both iOS and Android bundles build.
- To test safely: use an obviously fake name (e.g. "TEST") for the first enquiry so the team can ignore it.
- Website note (not copied into the app): the admin unlock value is hard-coded in the public website JavaScript, so anyone can find it.

## 9. Website content in the app (Phase 1b)

- Exported from the website data files into `src/data/site/*.json` (9 destinations, 28 outstation routes, 6 services with long text, fleet, 6 reviews, 4 FAQs, About, Contact, Privacy/Terms, popular places). Rich-text descriptions were converted to plain text.
- 28 images bundled (compressed, about 2.3 MB total). Path to image map: `src/data/images.ts`.
- Search: Home and Explore tab search destinations, outstation routes and services; results open directly below the box. Address fields use live Photon search.
- Outstation fares follow the website rules: fixed round-trip price for 8 listed routes, otherwise per-km rate + estimate.
- Tabs are now Home, Bookings, Explore, Profile (the Offers tab was replaced, offers are not on the website).

### Website data conflicts to resolve (needs the owner)

Local taxi package fares differ between three places in the website code:

| Source | Dzire 8hr/80km | Ertiga 8hr/80km | Innova 8hr/80km | Tempo 8hr/80km |
|---|---|---|---|---|
| Booking form (`BookingWizard`), used by the app booking screen | 2,500 | 3,200 | 3,500 | 5,500 |
| `fixedPrices.ts` | 2,500 | 3,000 | (see file) | (see file) |
| Service page (`ServiceDetails`) | 2,000 | 2,400 | 2,900 | 4,800 |

Pay Now amounts are calculated by the server, so the server table is the real price. Decide which table is correct, then update the others (app and website).

## 10. Accounts, saved places, Telugu (Phase 1c)

- Accounts via Firebase Authentication REST API (email + password, password reset, Google sign-in, guest mode). Session kept in secure storage, refreshed on launch. In-app account deletion.
- Without `EXPO_PUBLIC_FIREBASE_API_KEY` the app runs as a guest (see section 11 for what the Sign in screen shows).
- Signed-in users: name/email prefilled in the booking form, account email added to the enquiry notes and `customer_email`, bookings kept per account (guest bookings are moved into the account at sign-in; cloud copy is described in section 11).
- Saved places (Home, Office) in Profile, offered first in pickup suggestions.
- Language: English / Telugu toggle in Profile. Telugu covers tabs, Home, booking form and errors, confirmation, login, profile and bookings. Website content (destinations, fares, reviews, About) stays English. Telugu text was written by the assistant, please have a Telugu speaker review it.
- Verified: typecheck, iOS + Android bundles, payload tests. NOT verified: sign-in against a real Firebase project (sandbox could not reach Google), Google sign-in, Telugu rendering on a device.
- Not done: phone OTP, notifications, live trip tracking, rating, wallet.

## 11. Cloud account data and simpler booking flow (Phase 1d)

- Bookings and saved places are saved to the signed-in user's account in Firestore (REST, `users/{uid}`), merged with the phone's copy, pushed again if offline at the time. Security rules in `firestore.rules`.
- Booking is now 3 steps (Trip, Car, Confirm) with a fixed bottom action bar and a progress bar. Home is shorter: Where to, 4 big service tiles, Home/Office shortcuts, last booking, popular trips.
- "Sign in" is always visible. Until the Firebase keys are added, the Sign in screen shows the owner setup steps (Firebase project, Firestore rules, two keys in `.env`) instead of a dead end; Profile always shows the Sign in card.
- Verified: typecheck, iOS + Android bundles, simulated Firestore request and parse tests, booking tests. NOT verified: real Firebase sign-up and sync, how the new screens look on a phone.
- Limits: enquiries from the website or phone are not linked to app accounts; team status updates do not reach the app (needs backend work).
