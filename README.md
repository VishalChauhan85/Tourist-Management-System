# Tourist Management System (TMS)

A pure-frontend React (Vite) + Tailwind CSS + React Router prototype. There is no backend and no database:
`src/api.js` simulates a REST API on top of `localStorage` (with artificial network latency).

## Frictionless demo login
There are **no passwords**. The login page is a "Demo Portal":
- Click one of the 4 profile cards (Admin, Manager, Guide, Tourist) to sign in instantly, or
- type a username (`admin_user`, `manager_user`, `guide_user`, `tourist_user`) with no password.

The session is stored in `localStorage`, and routes are protected by role.
Demo data (users, 4 destinations, 4 packages, 3 bookings) is seeded on first load.
Use "Reset demo data" on the login page to restore it.

## Run locally
```bash
npm install
npm run dev
```

## Deploy to Vercel
1. Push this folder to a GitHub repository.
2. In Vercel: **Add New Project** -> import the repo (Framework preset: Vite).
3. Deploy. HashRouter is used, so no rewrite rules are needed.

## Roles
- **Admin**: create users, destinations and packages.
- **Tourist**: browse packages, book (seat validation), view itinerary, print an HTML invoice.
- **Manager**: revenue, bookings, occupancy charts and all bookings.
- **Guide**: bookings for packages assigned to them.

> Demo only: data lives in the browser and there is intentionally no real authentication.
