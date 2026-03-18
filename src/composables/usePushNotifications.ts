import { PushNotifications } from '@capacitor/push-notifications'
import type { Router } from 'vue-router'

const API_BASE = 'https://us-central1-rstne-app-2025.cloudfunctions.net/api/api'

async function saveTokenToBackend(token: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/fcm-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
  } catch {
    // Non-fatal — token will be re-sent on next launch
  }
}

export async function initPushNotifications(router: Router): Promise<void> {
  let permission = await PushNotifications.checkPermissions()

  if (permission.receive === 'prompt') {
    permission = await PushNotifications.requestPermissions()
  }

  if (permission.receive !== 'granted') return

  await PushNotifications.register()

  PushNotifications.addListener('registration', (token) => {
    saveTokenToBackend(token.value)
  })

  PushNotifications.addListener('registrationError', (err) => {
    console.error('FCM registration error:', err)
  })

  // App is in foreground — notification arrives silently; nothing to do by default
  PushNotifications.addListener('pushNotificationReceived', (_notification) => {
    // Optionally show an in-app banner here
  })

  // On Android, pushNotificationActionPerformed fires BEFORE the WebView finishes
  // resuming (app was backgrounded). Calling router.push immediately is discarded.
  // Waiting 400 ms is enough for the resume lifecycle to complete before navigating.
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const data = action.notification.data ?? {}

    if (!data.bookId || !data.chapterId) return

    setTimeout(() => {
      router.push({
        name: 'reading',
        params: {
          bookId: String(data.bookId),
          chapterId: String(data.chapterId),
        },
        query: {
          ...(data.verse ? { verse: String(data.verse) } : {}),
          _t: String(Date.now()),
        },
      })
    }, 400)
  })
}
