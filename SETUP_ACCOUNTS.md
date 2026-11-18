# Accounts and cloud data setup (Firebase, about 10 minutes)

With these steps, customers can create an account and their **bookings and saved places are stored in their account** (visible on any phone they sign in on).

## 1. Create the Firebase project
1. Go to https://console.firebase.google.com and create a project (for example "bsh-taxi").
2. Build > **Authentication** > Get started > Sign-in method: enable **Email/Password**.
3. Build > **Firestore Database** > Create database (production mode, region close to India).
4. Firestore > **Rules** tab: paste the contents of `firestore.rules` (in this project) and Publish.
   This makes every user able to read and write only their own data.

## 2. Add the keys to `.env`
- Project settings > General > **Web API key** -> `EXPO_PUBLIC_FIREBASE_API_KEY`
- Project settings > General > **Project ID** -> `EXPO_PUBLIC_FIREBASE_PROJECT_ID`

Then restart: `npx expo start -c`. Create an account in the app, make a test enquiry (use the name "TEST"), then open My Bookings: it should say "Saved in your account". Sign in on another phone with the same email to see it there.

## 3. Google sign-in (optional, needs a development build, not Expo Go)
1. Firebase > Authentication > Sign-in method: enable **Google**.
2. Google Cloud Console (same project) > Credentials: create OAuth client IDs for Web, iOS (bundle id `com.bshtaxiservices.app`) and Android (package + SHA-1).
3. Put them in `.env` as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`.
4. Follow Expo's "Google authentication" guide for the redirect scheme, then build with EAS (`eas build --profile development`).

## What is saved where
- **In the account (Firestore):** bookings made in the app while signed in, saved places (Home, Office), name and email.
- **Still on your main backend:** the enquiry/payment itself (`accountsdatabase.in`), unchanged.
- **Not in the account:** enquiries made on the website or by phone call. They are not linked to app accounts because the main backend has no user accounts. If you want that, the backend needs user ids on enquiries (send me the backend code and I can design it).
- Booking status changes made by your team (driver assigned, completed) do not show in the app yet. Your team would need to update the booking record, or the main backend would need a "my bookings" endpoint.

## Things to know
- Tested here with simulated requests only. I could not reach Google servers from my build environment, so please test sign-up and sync on your phone first.
- Account deletion in the app (Profile > Delete account) removes the sign-in account. The booking records stay in Firestore until you delete them in the console (or add a cleanup function).
- App Store: apps that offer Google sign-in may also be required to offer Sign in with Apple. Check Apple's current review guidelines before submitting.
- Phone OTP login is not included (needs an SMS provider).
- Firebase has a free tier; check Firebase pricing for your expected volume.
