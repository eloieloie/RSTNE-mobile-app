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
  api/
    books.ts              # GET /books, GET /books/:id
    chapters.ts           # GET /books/:id/chapters
    verses.ts             # GET /chapters/:id/verses, verse search; VerseWithLinks type
    crossReferences.ts    # GET /cross-references?bookId=&chapter=&verse=; CrossReferenceData type
    appVersion.ts         # GET /app-version; AppVersionInfo type; compareSemver() utility
  composables/
    useSettings.ts        # Reactive settings singleton with localStorage persistence
    useSearchState.ts     # Module-level reactive state for SearchView (persists across tab switches)
  router/                 # Vue Router (hash-based for Capacitor)
  assets/
    fonts/
      PaleoBora.ttf           # PaleoBora font file (sacred name rendering)
      fonts.css               # @font-face declaration, imported in main.ts
  utils/
    collectionReferences.ts  # Shared TS interfaces: Book, Chapter, Verse
    formatVerse.ts           # formatVerseWithPaleoBora() — wraps sacred name patterns in .paleobora-text spans
  views/
    BooksView.vue         # Book library, categorised grid
    ReadingView.vue       # Chapter reader (see Reading Features below)
    SearchView.vue        # Full-text verse search; results + query persist across tab switches via useSearchState; shows English + Telugu; PaleoBora formatting applied; tapping a result navigates to reading with ?verse= query param to scroll/highlight the exact verse
    SettingsView.vue      # User settings page
  App.vue                 # Root: 4-tab bottom navigation (Books / Search / Reading / Settings)
  main.ts
  style.css               # Global reset + CSS custom properties
capacitor.config.ts       # App ID: com.rstne.app
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
- `GET /chapters/:id/verses` — verses for a chapter; returns `VerseWithLinks[]` with `telugu_verse`, `notes[]`, `links[]`
- `GET /verses/text-search?q=` — full-text verse search; returns `{ results: VerseSearchResult[] }` (unwrap `.results`)
- `GET /cross-references?bookId=&chapter=&verse=` — cross references for a verse; returns `CrossReferenceData[]`
- `GET /app-version` — returns `{ min_version, max_version }` from `app_version_tbl`; called once on app mount in `App.vue` to enforce forced-update check

## App Version Check (App.vue)

On mount, `App.vue` calls `getAppVersion()` from `src/api/appVersion.ts` and compares the result's `min_version` against the hardcoded `APP_VERSION` constant (set to the current `package.json` version). If the current version is below `min_version`, a full-screen blocking modal is shown telling the user to update. The modal cannot be dismissed. If the API call fails, the app proceeds normally (fail-open).

**When bumping the app version:** update `APP_VERSION` in `App.vue` to match the new `package.json` version.

## Reading Features (ReadingView.vue)

- **English verse** — always shown, font size from settings
- **Telugu verse** — shown below English when `settings.showTelugu` is on; same style as English (no border/size difference)
- **Notes** — shown below verse in a yellow callout card (`background: #fefce8`, amber left border) when `settings.showNotes` is on
- **Cross references** — lazy-loaded per verse in the background after chapter loads via `/cross-references` endpoint; shown as tappable blue pill chips when `settings.showCrossReferences` is on; tapping opens a bottom-sheet preview with the target verse text (fetches verse on the fly); ↗ button navigates to the chapter
- **Wake lock** — `navigator.wakeLock.request('screen')` acquired on mount when `settings.keepScreenOn` is on; re-acquired on `visibilitychange`; released on `onUnmounted`
- **Chapter picker** — bottom sheet triggered from nav title
- **Prev/next chapter navigation** — row at bottom of verse list

## Settings (SettingsView.vue + useSettings.ts)

All settings are persisted to `localStorage` under key `rstne-settings` via the `useSettings()` composable. The composable returns a single reactive object shared across all views.

| Setting | Type | Default | Effect |
|---|---|---|---|
| `showTelugu` | boolean | false | Show Telugu verse in ReadingView |
| `showNotes` | boolean | false | Show study notes in ReadingView |
| `showCrossReferences` | boolean | false | Show cross-reference chips in ReadingView |
| `keepScreenOn` | boolean | false | Acquire screen wake lock in ReadingView |
| `fontSize` | number | 16 | Font size (px) for verse text; range 12–26 |

## Capacitor

- **App ID:** `com.rstne.app`
- **Web dir:** `dist`
- Platforms: `ios/` and `android/`
- Hash routing is intentional — Capacitor loads files directly, no server rewrites
- Wake Lock API (`navigator.wakeLock`) works natively in Capacitor WebView

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
Cross references live in `cross_references_tbl` (separate from `verse_links_tbl`).

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
- Cross references use `/cross-references` API — **not** `verse.links` (that is a different internal system)
- Settings are always read from `useSettings()` composable, never stored as local component state
- All `v-html` verse content must be passed through `formatVerseWithPaleoBora(text, bookAbbreviations)` from `@/utils/formatVerse.ts`:
  - Wraps `HWHY`, `hwhy`, `OSWHY`, `oswhy`, `MYHLA`, `Myhla`, `myhla` in `<span class="paleobora-text">` for PaleoBora font rendering
  - Converts inline verse references (`#abbr## ##`) to `<a class="inline-verse-ref">` links using the book abbreviation map
- `bookAbbreviations` is a `ref<Record<string, number>>` built from `getAllBooks()` in `onMounted` (non-blocking, uses the same sessionStorage cache as BooksView)
- Inline ref clicks are handled via `document` event delegation (`handleInlineVerseClick`) — registered in `onMounted`, removed in `onUnmounted` — opens the same cross-ref bottom sheet (`crossRefSheet`) with the target verse
- `.paleobora-text` is a global style in `style.css`; the font is loaded via `src/assets/fonts/fonts.css` imported in `main.ts`
