# Voyager Tour OS

A premium **Tourist Management System** prototype. Pure frontend — no backend and no
external services. All data lives in the browser's `localStorage`, written and read through a
simulated API layer at `src/lib/api.ts`.

## Stack

- React 19 + Vite 7 (TanStack Start v1)
- Tailwind CSS v4 (`src/styles.css`)
- shadcn/ui + Lucide React icons
- Vitest for the seat-limit and routing checks

## Run it

```sh
npm install
npm run dev
```

Then open the URL the dev server prints (usually http://localhost:8080).

To run the checks:

```sh
npm test
```

## Sign in

No passwords. The sign-in screen lists four demo profiles — click one to enter:

| Profile | Name | Sees |
| --- | --- | --- |
| Admin | Vishal Chauhan | Read-only tables of destinations and packages |
| Manager | Ronak Singh | Revenue, bookings and seats-sold KPIs plus active tours |
| Guide | Aditya Kumar Tiwari | Bookings assigned to the tours he leads |
| Tourist | Yug Jain | Tour cards with a seat picker, Book button, invoices |

Logging out uses the button beside your name at the bottom of the left menu.

## Data

On first load the app seeds 4 users, 4 destinations, 4 tour packages and 2 bookings into
`localStorage`, then flags the browser as seeded (`tms_seeded_v3`). Bumping that flag in
`src/lib/api.ts` forces a fresh reseed; clearing site data does the same.

Because storage is per-browser, bookings you make stay after a refresh but are not visible to
anyone else.

## Layout

```text
src/
  lib/api.ts          simulated API: seed data, users, packages, bookings, seat validation
  routes/
    index.tsx         sign-in with the four demo profiles
    tourist.tsx       browse tours, book seats, view bookings
    manager.tsx       KPI cards and active tours
    guide.tsx         assigned bookings table
    admin.tsx         destinations and packages tables
    invoice.$id.tsx   printable booking invoice
  components/
    AppShell.tsx      sidebar, page header, reusable data table with empty states
    ui/               shadcn/ui primitives
```
