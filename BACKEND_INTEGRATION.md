# App <-> backend (accounts, bookings, payments)

Everything goes through the BSH backend (`EXPO_PUBLIC_API_URL`). Firebase is no longer used.
Every request carries `X-Company-Key: BSH`, so customers, enquiries and payments belong to BSH Taxi Services and show up for the BSH owner.

## What the app does now

| In the app | Backend call |
|---|---|
| Create account (name, mobile, email, password + confirm) | `POST /api/auth/signup` |
| Sign in with email **or** mobile + password | `POST /api/auth/signin` |
| Stay signed in (token renewed automatically, stored in secure storage) | `POST /api/auth/refresh` |
| Forgot password: 6-digit code by email, then new password | `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |
| Delete account (asks for password; bookings are kept for the business) | `DELETE /api/auth/me` |
| Send Enquiry (linked to the account, marked `mobile_app` for the owner) | `POST /api/enquiries` |
| Pay Now (Local, Tour: fare calculated on the server) | `POST /api/payments/booking-now` |
| My Bookings (live: refreshes every 20 s) | `GET /api/enquiries/my` |
| Booking details: status, driver + vehicle, fare, paid, balance, invoices | `GET /api/enquiries/my/:id` |
| Pay advance / balance once the owner confirms the booking | `POST /api/payments/enquiries/:id/pay` |
| Payment result + invoice | `GET /api/payments/status/:ref` |

Password rules (same on app and server): 8-72 characters, at least one letter and one number.

## Owner side (nothing new to learn)

1. Customer sends an enquiry or pays in the app.
2. The enquiry appears in the BSH owner/admin dashboard (source `mobile_app`, or `pay_now` for online payments) and the owner gets the usual WhatsApp + email alert.
3. Owner calls the customer, then confirms the booking with final price, advance, vehicle and driver.
4. The customer sees the status, driver and vehicle in the app and can pay advance/balance online. Payments and invoices appear in the owner dashboard.

## Settings

`.env`:
```
EXPO_PUBLIC_API_URL=https://accountsdatabase.in     # your deployed backend (a phone cannot reach http://localhost)
EXPO_PUBLIC_COMPANY_KEY=BSH
EXPO_PUBLIC_REQUIRE_LOGIN=true                      # false = guests may book without an account
```
Restart with `npx expo start -c` after changing `.env`.

## Before this works on the live server

Deploy the backend changes (see `MOBILE_APP_CHANGES.md` in the backend patch) and run the one new migration.
Without them: sign-up would register app customers under NRK instead of BSH, and "Forgot password" and "Delete account" would not exist.
