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
    client.ts             # API_URL + API_HEADERS (static X-API-Key) + getAuthHeaders() (adds Firebase bearer token when signed in)
    books.ts              # GET /books, GET /books/:id
    chapters.ts           # GET /books/:id/chapters
    verses.ts             # GET /chapters/:id/verses (returns my_notes[] per verse when signed in), verse search; VerseWithLinks type
    crossReferences.ts    # GET /cross-references?bookId=&chapter=&verse=; CrossReferenceData type
    notes.ts              # Admin/study notes CRUD — create/update/link/unlink require an admin-authenticated bearer token
    personalNotes.ts      # Personal notes CRUD — create/update/delete/link/unlink a note against a verse for the signed-in user
    feedback.ts           # POST /feedback — in-app "Send Feedback" form submissions
    appVersion.ts         # GET /app-version; AppVersionInfo type; compareSemver() utility
  composables/
    useSettings.ts        # Reactive settings singleton with localStorage persistence
    useSearchState.ts     # Module-level reactive state for SearchView (persists across tab switches)
    useAuth.ts             # Optional Firebase auth (email/password + Google) via @capacitor-firebase/authentication; exposes user, isAdmin, canClaimAdmin
    useBookLanguage.ts     # Book name display language setting (english/hebrew/telugu)
    useTheme.ts            # Light/dark/system theme picker, persisted
    useMotionPresets.ts    # Shared motion-v spring/transition presets (reduced-motion aware)
    usePushNotifications.ts
  router/                 # Vue Router (hash-based for Capacitor)
  assets/
    fonts/
      PaleoBora.ttf           # PaleoBora font file (sacred name rendering)
      fonts.css               # @font-face declaration, imported in main.ts
  utils/
    collectionReferences.ts  # Shared TS interfaces: Book, Chapter, Verse, PersonalNote, PersonalVerseNote
    formatVerse.ts           # formatVerseWithPaleoBora() — wraps sacred name patterns in .paleobora-text spans
  views/
    BooksView.vue         # Book library, categorised grid
    ReadingView.vue       # Chapter reader (see Reading Features below)
    SearchView.vue        # Full-text verse search; results + query persist across tab switches via useSearchState; shows English + Telugu; PaleoBora formatting applied; tapping a result navigates to reading with ?verse= query param to scroll/highlight the exact verse
    SettingsView.vue      # User settings page (see Settings below); also houses Account (sign in/out), Feedback, Rate this App, Legal links
    LoginView.vue          # Firebase sign-in (email/password + Google) — reached from Settings → Sign In / Register
    RegisterView.vue       # Firebase account creation
    FeastsView.vue         # Annual feast dates
    WeeklyReadingView.vue  # DSS weekly reading plan
  App.vue                 # Root: bottom tab navigation
  main.ts
  style.css               # Global reset + CSS custom properties
capacitor.config.ts       # App ID: com.rstne.app
```

## Backend API

Despite the platform-level split described in the root `CLAUDE.md`, this mobile app currently calls a **single backend for everything** — the PHP API on GoDaddy, not the Firebase Cloud Functions endpoint:

```
https://rstne.eloi.in/api        (src/api/client.ts → API_URL)
```

Every request sends the static `X-API-Key` header (`API_HEADERS` in `client.ts`); write/personalized requests additionally send `Authorization: Bearer <Firebase ID token>` via `getAuthHeaders()` when a user is signed in. Firebase (`@capacitor-firebase/authentication`) is used only for authentication, not for reading/writing Bible content.

Key endpoints:
- `GET /books` — all 86 books (cached 1 hour in sessionStorage)
- `GET /books/:id` — single book
- `GET /books/:id/chapters` — chapters for a book
- `GET /chapters/:id/verses` — verses for a chapter; returns `VerseWithLinks[]` with `telugu_verse`, `notes[]`, `links[]`, and `my_notes[]` (the signed-in user's personal notes on that verse, via bearer token)
- `GET /verses/text-search?q=` — full-text verse search; returns `{ results: VerseSearchResult[] }` (unwrap `.results`)
- `GET /cross-references?bookId=&chapter=&verse=` — cross references for a verse; returns `CrossReferenceData[]`
- `POST /notes`, `/notes/:id` (+ `X-HTTP-Method-Override: PUT`), `/verse-notes`, `/verse-notes/:id` (+ `DELETE` override) — admin/study notes CRUD; requires an admin bearer token
- `POST /personal-notes`, `/personal-notes/:id` (+ `PUT`/`DELETE` override), `/personal-verse-notes`, `/personal-verse-notes/:id` (+ `DELETE` override) — personal notes CRUD; requires any signed-in bearer token
- `POST /feedback` — in-app feedback submissions
- `GET /auth/me` — returns `{ uid, email, isAdmin, canClaimAdmin }` for the current bearer token
- `POST /auth/claim-admin` — lets an eligible signed-in user claim admin
- `GET /app-version` — returns `{ min_version, max_version }` from `app_version_tbl`; called once on app mount in `App.vue` to enforce forced-update check

GoDaddy IIS does not support `PUT`/`DELETE` natively, so all mutations here use `POST` + `X-HTTP-Method-Override`, same as `RSTNE-apis/` (see root `CLAUDE.md`).

## App Version Check (App.vue)

On mount, `App.vue` calls `getAppVersion()` from `src/api/appVersion.ts` and compares the result's `min_version` against the hardcoded `APP_VERSION` constant (set to the current `package.json` version). If the current version is below `min_version`, a full-screen blocking modal is shown telling the user to update. The modal cannot be dismissed. If the API call fails, the app proceeds normally (fail-open).

**When bumping the app version:** update `APP_VERSION` in `App.vue` to match the new `package.json` version.

## Reading Features (ReadingView.vue)

- **English verse** — shown when `settings.showEnglish` is on, font size from settings
- **Telugu verse** — shown below English when `settings.showTelugu` is on; same style as English (no border/size difference)
- **Admin notes** — study notes added by RSTNE admins; shown below verse in a yellow callout card (`background: #fefce8`, amber left border) when `settings.showAdminNotes` is on
- **Personal notes** — free-text notes the signed-in user attaches to a verse, private to that user and synced across devices via `firebase_uid`; shown when `settings.showMyNotes` is on **and** the user is not an admin (`!isAdmin`, from `useAuth()`); add/edit/delete inline per verse (`startAddPersonalNote` / `startEditPersonalNote` / `deletePersonalNoteFromVerse`), backed by `src/api/personalNotes.ts` (`createPersonalNote` → `linkPersonalNoteToVerse`, `updatePersonalNote`, `unlinkPersonalNoteFromVerse` + `deletePersonalNote`). Sign-in is optional — see Authentication below; there is no local/offline fallback, so a signed-out user simply sees no personal-note UI regardless of the setting.
- **Cross references** — lazy-loaded per verse in the background after chapter loads via `/cross-references` endpoint; shown as tappable blue pill chips when `settings.showCrossReferences` is on; tapping opens a bottom-sheet preview with the target verse text (fetches verse on the fly); ↗ button navigates to the chapter
- **Wake lock** — `navigator.wakeLock.request('screen')` acquired on mount when `settings.keepScreenOn` is on; re-acquired on `visibilitychange`; released on `onUnmounted`
- **Chapter picker** — bottom sheet triggered from nav title
- **Prev/next chapter navigation** — row at bottom of verse list

## Authentication (useAuth.ts, LoginView.vue, RegisterView.vue)

Sign-in is **optional** — the app is fully usable signed out; the only feature gated on it is Personal Notes (syncing them across devices). Reached from Settings → "Sign In / Register".

- Uses `@capacitor-firebase/authentication` (email/password + Google), not the Firebase JS SDK directly — native sign-ins on iOS/Android don't populate the JS SDK's local state, so `useAuth.ts` listens to the plugin's own `authStateChange` event (works uniformly on native and the web fallback) rather than `onAuthStateChanged`.
- `useAuth()` exposes `user`, `isAdmin`, `canClaimAdmin`, `authReady`, plus `registerEmail`, `signInEmail`, `signInGoogle`, `signOutUser`, `claimAdmin`.
- `isAdmin`/`canClaimAdmin` come from `GET /auth/me` (PHP API, via `getAuthHeaders()`'s bearer token), refreshed on every auth state change.
- Admins see Admin Notes management instead of Personal Notes in `ReadingView.vue` (`!isAdmin` gate above).

## Settings (SettingsView.vue + useSettings.ts)

All settings are persisted to `localStorage` under key `rstne-settings` via the `useSettings()` composable. The composable returns a single reactive object shared across all views.

| Setting | Type | Default | Effect |
|---|---|---|---|
| `showEnglish` | boolean | true | Show English verse in ReadingView |
| `showTelugu` | boolean | false | Show Telugu verse in ReadingView |
| `showAdminNotes` | boolean | false | Show admin/study notes in ReadingView |
| `showMyNotes` | boolean | false | Show the signed-in user's personal notes in ReadingView (no effect if signed out or `isAdmin`) |
| `showCrossReferences` | boolean | false | Show cross-reference chips in ReadingView |
| `keepScreenOn` | boolean | false | Acquire screen wake lock in ReadingView |
| `fontSize` | number | 16 | Font size (px) for verse text; range 12–26 |
| `hasSeenOnboarding`, `chaptersRead`, `hasRequestedReview`, `lastReadingRoute` | internal | — | Not user-facing toggles; used for onboarding/review-prompt/deep-link bookkeeping |

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
