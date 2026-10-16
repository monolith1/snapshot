# SnapShot — Toronto street photography spot guide

A curated, map-first guide to Toronto's best street photography spots. Tap a pin to see photos, a description, tags, and the best time to shoot.

Built with **React + Vite + TypeScript**, **Tailwind CSS v4**, and **MapLibre GL JS** (OpenStreetMap data via the free CARTO Dark Matter basemap — no API key).

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

| Route | What it is |
| --- | --- |
| `/` | Public full-screen map (toggle to list view in the top-right) |
| `/?spot=chinatown` | Deep link to a spot (the Share button copies this) |
| `/?view=list` | List view |
| `/admin` | Owner admin: add / edit / delete spots and upload photos (no login in v1) |

> **Windows PowerShell:** if `npm` errors with *"running scripts is disabled"*, use `npm.cmd run dev` or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once.

## Features

**Public**
- Full-screen dark map with a pin per spot; labels appear on hover or when zoomed in.
- Tap a pin → **bottom sheet** on mobile (swipe down to dismiss) or **side panel** on desktop. The camera eases so the pin stays visible beside the panel.
- Photo carousel (swipe / arrows) with a full-screen lightbox.
- Name, neighbourhood, description, tags, and a **Best time to shoot** block (time of day, season, one-line tip).
- Tap the map, press `Esc`, or hit ✕ to close.
- Tag filter chips, list-view toggle, Directions (Google Maps), Share / copy link, and a "locate me" button.

**Admin (`/admin`)**
- Add / edit / delete spots: name, neighbourhood, description, tags, best-time fields.
- Set coordinates by clicking the mini map, dragging the pin, or typing lat/lng.
- Upload multiple photos (click or drag-and-drop), reorder them (the first one is the cover), add captions, remove them.
- Storage usage meter, **Export JSON**, and **Reset to seed data**.

## Project structure

```
src/
  types.ts                     Spot / Photo / BestTime types (shaped like future DB tables)
  data/
    repository.ts              SpotRepository interface  ← the swap point
    localStorageRepository.ts  v1 implementation (localStorage + compressed data URLs)
    index.ts                   picks the active repository
    useSpots.ts                React hook (live updates, cross-tab sync)
    seed.ts                    the 10 seed spots
  components/                  MapView, SpotPanel, SpotDetail, PhotoCarousel, Lightbox, ListView, TagFilter
  components/admin/            SpotForm, CoordinatePicker
  pages/                       MapPage, AdminPage
public/seed/                   placeholder seed photos
```

## Notes on v1 data

- All data lives in this browser's **localStorage** (`snapshot.spots.v1`). Other visitors and devices won't see your edits.
- Uploaded photos are resized to max 1600px and re-encoded as JPEG (~150–400 KB each). localStorage tops out around **5 MB**, so expect room for roughly 15–30 uploaded photos. The admin page shows usage and a clear error if storage fills up.
- Seed photos in `public/seed/` are **AI-generated placeholders**, not real photos of these locations. Replace them with your own via `/admin`.
- Seed coordinates are approximate. A few coordinates from the original brief pointed at the wrong place (e.g. Kensington Market, Yorkville, the Distillery), so the seed uses corrected values. Adjust any pin in `/admin`.

## v2: swap localStorage → Supabase (real photo storage + owner login)

The UI only talks to the `SpotRepository` interface in [`src/data/repository.ts`](src/data/repository.ts), so moving to Supabase means writing one new class and changing one line.

**1. Schema**

```sql
create table spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  neighbourhood text,
  description text not null default '',
  tags text[] not null default '{}',
  lat double precision not null,
  lng double precision not null,
  best_time jsonb not null default '{"timeOfDay":"","season":"","tip":""}',
  photos jsonb not null default '[]',   -- [{id, url, caption}] (or normalise into a spot_photos table)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table spots enable row level security;
create policy "public read"  on spots for select using (true);
create policy "owner write"  on spots for all
  using (auth.uid() = '<OWNER_USER_ID>') with check (auth.uid() = '<OWNER_USER_ID>');
```

Create a public **Storage bucket** called `spot-photos` with a write policy limited to the owner.

**2. Implement the repository**

```ts
// src/data/supabaseRepository.ts
export class SupabaseSpotRepository implements SpotRepository {
  constructor(private sb: SupabaseClient) {}
  async list() { /* sb.from('spots').select('*') → map snake_case to Spot */ }
  async create(input) { /* insert */ }
  async update(id, patch) { /* update */ }
  async remove(id) { /* delete */ }
  async uploadPhoto(file) {
    const path = `${crypto.randomUUID()}.jpg`;
    await this.sb.storage.from('spot-photos').upload(path, file);
    const { data } = this.sb.storage.from('spot-photos').getPublicUrl(path);
    return { id: path, url: data.publicUrl };
  }
  async deletePhoto(photo) { await this.sb.storage.from('spot-photos').remove([photo.id]); }
  subscribe(cb) { /* sb.channel('spots').on('postgres_changes', …, cb).subscribe() */ }
  async reset() { /* optional: re-insert seed rows */ }
}
```

Then in [`src/data/index.ts`](src/data/index.ts):

```ts
export const repo: SpotRepository = new SupabaseSpotRepository(supabase);
```

**3. Owner login.** Add Supabase Auth (magic link or email/password), wrap `/admin` in a guard that redirects if there's no session, and rely on the RLS policies above for real security. Use the **Export JSON** button on `/admin` to bring your local v1 data into Supabase.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Type-check only |
