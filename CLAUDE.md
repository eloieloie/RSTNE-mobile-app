# RSTNE Mobile App — Claude Context

## What this project is

Capacitor mobile app for the **Restoration Scriptures True Name Edition (RSTNE)** Bible platform.
Built with Vue 3 + TypeScript + Vite, wrapped in Capacitor for iOS and Android.
Companion to the web app at `/Users/eloielimelech/Developer/RSTNE-app`.

## Tech Stack

- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **Build:** Vite 6
- **Language:** TypeScript (strict mode)
- **Mobile runtime:** Capacitor 7 (iOS + Android)
- **Routing:** Vue Router 4 (hash history — required for Capacitor)
- **Styling:** Scoped CSS per component, no external UI framework

## Project Structure

```
src/
  api/          # Fetch wrappers for the backend (books.ts, chapters.ts, verses.ts)
  router/       # Vue Router (hash-based for Capacitor)
  utils/        # Shared TypeScript interfaces (collectionReferences.ts)
  views/        # Page components
    BooksView.vue     # Book library, categorised grid
    ReadingView.vue   # Chapter reader with bottom-sheet chapter picker
    SearchView.vue    # Full-text verse search
  App.vue       # Root: bottom tab navigation
  main.ts
  style.css     # Global reset + CSS custom properties
capacitor.config.ts   # App ID: com.rstne.app
```

## Backend API

All data comes from the deployed Firebase Cloud Functions endpoint:

```
https://us-central1-rstne-app-2025.cloudfunctions.net/api/api
```

Key endpoints:
- `GET /books` — all 86 books (cached 1 hour in sessionStorage)
- `GET /books/:id` — single book
- `GET /books/:id/chapters` — chapters for a book
- `GET /chapters/:id/verses` — verses for a chapter
- `GET /verses/search?q=` — full-text verse search

## Capacitor

- **App ID:** `com.rstne.app`
- **Web dir:** `dist`
- Platforms: `ios/` and `android/`
- Hash routing is intentional — Capacitor loads files directly, no server rewrites

## Dev Workflow

```bash
npm run dev          # Vite dev server (browser)
npm run build        # TypeScript check + Vite build → dist/
npx cap sync         # Copy dist → iOS & Android native projects
npm run cap:ios      # Open Xcode
npm run cap:android  # Open Android Studio
```

> **iOS note:** If `cap sync` fails with an Xcode plugin error, run:
> `xcodebuild -runFirstLaunch` then retry.

## Database Schema (reference only — via API)

Books (`books_tbl`) → Chapters (`chapters_tbl`) → Verses (`verses_tbl`)

Three book categories:
1. First Covenant (brown theme, `category_id = 1`)
2. New Covenant (blue theme, `category_id = 2`)
3. Restored Apocryphal (purple theme, `category_id = 3`)

## Conventions

- All Vue files use `<script setup lang="ts">` with Composition API
- Route history is `createWebHashHistory()` — do not change to HTML5 history
- Avoid adding Bootstrap or heavy UI libraries — keep the bundle small
- Touch targets should be ≥ 44px; use `-webkit-tap-highlight-color: transparent`
- Safe area insets handled via CSS `env(safe-area-inset-*)` variables in `style.css`
