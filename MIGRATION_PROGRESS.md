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
| `/google-reviews` | Reviews | 2 |
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
- [~] Location input: plain text fields for now (website autocomplete via Photon not ported yet)
- [x] Choose car with fixed fares (local + tour) or "fare on call" (outstation + airport), same rules as the website
- [x] Local rental packages (8hr/80km, 10hr/100km)
- [x] Send Enquiry (`/api/enquiries`) + WhatsApp message with terms. Built and typechecked, NOT yet tested against the live server
- [x] Pay Now (Local, Tour): in-app browser, then status polling + invoice link. Built, NOT yet tested with a real payment
- [~] Tours are bookable from the booking screen; separate Fleet / Routes / Destination detail screens not built yet
- [x] My Bookings (enquiries saved on this phone)
- [ ] Profile, Contact, About

### Phase 2: Polish
- [ ] Reviews, Legal
- [ ] Offline/error states, loading states
- [ ] App icon, splash, store listing assets

### Phase 3: Needs backend work
- [ ] OTP login
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
