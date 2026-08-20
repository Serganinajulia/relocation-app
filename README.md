# ReloCalc — find your city for relocation

[🇷🇺 Читать на русском](./README.ru.md)

**[Live demo on Vercel →](https://relocation-app-three.vercel.app)**

A relocation calculator that estimates the real cost of living in cities around the world for a given budget, family composition, and lifestyle — and lets you filter cities by climate, safety, visa conditions, and a dozen other criteria.

---

## Screenshots

![Catalog with filter](./docs/screenshots/catalog-with-filter.png)

![City card](./docs/screenshots/city-card.png)

---

## Features

- **Cost-of-living calculator** — computes a realistic monthly budget for a specific family (adults, children of different ages, infants) and lifestyle tier (Economy / Comfort / Comfort+), broken down by category: rent, groceries, transport, healthcare, education, and more.
- **Custom lifestyle profiles** — start from a system preset and adjust individual spending categories (cafe visits per month, coworking, private kindergarten), then save the result as a standalone profile.
- **Extended catalog filter** — countries and languages, climate and nature (with continuous sliders for safety, pollution, and healthcare quality), political regime, visa requirements and residency options, citizenship timelines, remote-income tax treatment.
- **Live search** — instant city and page suggestions right in the header, no page reload.
- **Catalog sorting and pagination** — by budget, rent, safety, freedom index; cities load in batches.
- All catalog filters and parameters live in the URL — the current view can be copied as a link and shared.

## Stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **Supabase** (PostgreSQL, PostgREST) — cities, countries, visa and residency data
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** (with `persist`) — for client-side custom lifestyle profiles
- Deployed on **Vercel**

## Notable architecture decisions

- **Catalog filter state lives in URL `searchParams`, not in a global store.** The quick filter in the header and the extended sidebar filter read and write the same parameters, so they stay in sync without any manual coordination — and the entire catalog state can be shared as a link.
- **Budget calculation is a pure function**, fully decoupled from the UI and from the database query (`lib/calc/formulas.ts` → `getCityCalcResult`). The formulas are documented separately from the implementation.
- **Inverted and threshold-based metrics** (e.g. a pollution index where lower is better) are normalized at the boundary between the database and the UI, so the filter component itself stays agnostic to the quirks of a given data source.
- Custom lifestyle profiles store a **full snapshot of values**, not a diff on top of the system preset — if the presets change later, previously saved custom profiles remain unaffected.

## Roadmap

- City detail page (`/countries/[countryId]/cities/[cityId]`)
- Favorites and city comparison
- Comparing several lifestyle profiles against a budget, with visual highlighting