# Push Notifications Implementation Plan

## Overview

Use **Firebase Cloud Messaging (FCM)** to handle push notifications on both iOS (via APNs) and Android.
The Firebase project `rstne-app-2025` already exists — it just needs to be wired up to the native apps.

---

## Phase 1 — Firebase Project Setup (Console)

### Android
1. Firebase Console → Project Settings → Your Apps → **Add Android app**
   - Package name: `com.rstne.app`
   - Download `google-services.json` → place in `android/app/`

### iOS
1. Firebase Console → Add iOS app
   - Bundle ID: `com.rstne.app`
   - Download `GoogleService-Info.plist` → place in `ios/App/App/`
2. Upload your **APNs Auth Key** (p8 file):
   - Firebase Console → Project Settings → Cloud Messaging → iOS app config
   - Generate the key at Apple Developer Portal if you don't have one yet

### Apple Developer Portal
- Enable **Push Notifications** capability for App ID `com.rstne.app`
- Create an **APNs Auth Key** (p8 — one key works for all apps, recommended over certificates)

---

## Phase 2 — Native Project Config

### Android

`android/app/build.gradle`:
```gradle
// Add inside dependencies block:
implementation 'com.google.firebase:firebase-messaging'

// Add at the bottom of the file:
apply plugin: 'com.google.gms.google-services'
```

`android/build.gradle` (project-level):
```gradle
// Add to dependencies block:
classpath 'com.google.gms:google-services:4.4.0'
```

### iOS (Xcode)
1. Open Xcode → select the `App` target → **Signing & Capabilities** tab
2. Add **Push Notifications** capability
3. Add **Background Modes** capability → check "Remote notifications"

---

## Phase 3 — Capacitor Plugin + App Code

### Install
```bash
npm install @capacitor/push-notifications
npx cap sync
```

### `capacitor.config.ts`
Add plugin config:
```ts
plugins: {
  PushNotifications: {
    presentationOptions: ["badge", "sound", "alert"],
  },
}
```

### Create `src/composables/usePushNotifications.ts`
```ts
import { PushNotifications } from '@capacitor/push-notifications'

export async function initPushNotifications() {
  const permission = await PushNotifications.requestPermissions()
  if (permission.receive !== 'granted') return

  await PushNotifications.register()

  PushNotifications.addListener('registration', (token) => {
    // Send FCM token to your backend to store per-device
    console.log('FCM token:', token.value)
    saveTokenToBackend(token.value)
  })

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    // App is in foreground — show in-app banner or handle silently
    console.log('Notification received:', notification)
  })

  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    // User tapped a notification — navigate based on action.notification.data
    const data = action.notification.data
    if (data?.bookId && data?.chapter) {
      // router.push(`/reading?bookId=${data.bookId}&chapter=${data.chapter}&verse=${data.verse}`)
    }
  })
}

async function saveTokenToBackend(token: string) {
  await fetch('https://us-central1-rstne-app-2025.cloudfunctions.net/api/api/fcm-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
}
```

### Call in `App.vue`
```ts
import { initPushNotifications } from '@/composables/usePushNotifications'
import { Capacitor } from '@capacitor/core'

onMounted(() => {
  if (Capacitor.isNativePlatform()) {
    initPushNotifications()
  }
})
```

---

## Phase 4 — Backend (Firebase Cloud Functions)

### Store FCM tokens
Add a Firestore collection `fcm_tokens` to persist device tokens:
```ts
// POST /api/fcm-token
app.post('/fcm-token', async (req, res) => {
  const { token } = req.body
  await db.collection('fcm_tokens').doc(token).set({
    token,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })
  res.json({ ok: true })
})
```

### Send a notification
```ts
import * as admin from 'firebase-admin'

// Send to a single device
await admin.messaging().send({
  token: '<device-fcm-token>',
  notification: {
    title: 'Daily Verse',
    body: 'In the beginning Elohim created the heavens and the earth.',
  },
  data: {
    bookId: '1',
    chapter: '1',
    verse: '1',
  },
})

// Send to all devices (multicast)
const tokens = await db.collection('fcm_tokens').get()
const tokenList = tokens.docs.map(d => d.data().token)
await admin.messaging().sendEachForMulticast({
  tokens: tokenList,
  notification: { title: '...', body: '...' },
})
```

### Scheduled daily verse (optional)
Use a Cloud Scheduler + Cloud Function to send a daily verse notification automatically.

---

## Phase 5 — Deep Linking from Notifications

When a user taps a notification, read `notification.data` and navigate:

```ts
PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
  const { bookId, chapter, verse } = action.notification.data ?? {}
  if (bookId && chapter) {
    router.push({
      path: '/reading',
      query: { bookId, chapter, ...(verse ? { verse } : {}) },
    })
  }
})
```

This uses the existing `?verse=` query param that `ReadingView.vue` already supports for scroll/highlight.

---

## Effort Summary

| Phase | Effort | Where |
|-------|--------|-------|
| Firebase Console + APNs key | ~30 min | Firebase Console + Apple Developer Portal |
| Native project config | ~20 min | Xcode + Android Studio |
| Capacitor plugin + Vue code | ~1 hr | This repo (`src/`) |
| Backend token storage + send endpoint | ~1 hr | `RSTNE-app` Cloud Functions |
| Deep link navigation | ~30 min | This repo (`App.vue`) |

---

## Status

- [ ] Phase 1 — Firebase Console setup
- [ ] Phase 2 — Native project config
- [ ] Phase 3 — Capacitor plugin + Vue code
- [ ] Phase 4 — Backend token storage + send
- [ ] Phase 5 — Deep link navigation
