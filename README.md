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
- `EXPO_PUBLIC_FIREBASE_API_KEY` and Google client IDs: accounts, see `SETUP_ACCOUNTS.md` (empty = guest only)

## Structure
- `src/app`         screens (Expo Router). `(tabs)` = Home, Bookings, Offers, Profile
- `src/theme`       colours, fonts (Fraunces + Public Sans)
- `src/components`  Screen, GlassCard, Button, ComingSoon
- `src/lib/api.ts`  `submitEnquiry`, `startPayNow`, `getPaymentStatus` (same endpoints as the website)
- `src/data`        booking config, fixed prices, fleet (copied from the website)

Progress and plan: see `MIGRATION_PROGRESS.md`.
