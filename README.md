# BSH Taxi Services: mobile app (Expo)

React Native + Expo SDK 58 + TypeScript + Expo Router. Talks to the same backend as the website.

## Run
```
npm install
npx expo start        # scan the QR code with Expo Go, or press a / i
npm run typecheck
```
(`.npmrc` sets `legacy-peer-deps=true` because one icon package has an optional peer conflict.)

## Config (.env, see .env.example)
- `EXPO_PUBLIC_API_URL`      backend base URL (no trailing /api)
- `EXPO_PUBLIC_COMPANY_KEY`  `BSH`
- `EXPO_PUBLIC_REQUIRE_LOGIN`  `true` = customers must sign in to book/pay (default), `false` = guests allowed

Accounts, bookings and payments all use the BSH backend, see `BACKEND_INTEGRATION.md`.

## Structure
- `src/app`         screens (Expo Router). `(tabs)` = Home, Bookings, Offers, Profile
- `src/theme`       colours, fonts (Fraunces + Public Sans)
- `src/components`  Screen, GlassCard, Button, ComingSoon
- `src/lib/api.ts`  `submitEnquiry`, `startPayNow`, `getPaymentStatus` (same endpoints as the website)
- `src/data`        booking config, fixed prices, fleet (copied from the website)

Progress and plan: see `MIGRATION_PROGRESS.md`.


## Latest UI fixes (Nov 2026)
- Popular outstation route cards display fixed fares when available and a visible **Book Now** action.
- Fixed-price route vehicle cards on the outstation detail page include a vehicle-specific Book Now action that preselects the matching vehicle in the booking flow.
- Pickup search includes **Use my current location** with permission handling and reverse-geocoded address; manual search remains available.
- Offers popup stays disabled when `ACTIVE_OFFERS` is empty and is only shown when a valid active offer is configured.

Install/update dependencies with `npm install` after this update (the new location feature uses `expo-location`), then rebuild the native app to include location permissions.
