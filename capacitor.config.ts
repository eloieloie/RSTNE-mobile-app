import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'in.eloi.rstne',
  appName: 'RSTNE',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    // @capacitor/status-bar is iOS-only here: its Android code uses APIs deprecated in Android 15.
    // Android status bar styling uses core SystemBars + SystemBarColorPlugin.java.
    includePlugins: [
      '@capacitor-community/in-app-review',
      '@capacitor-firebase/authentication',
      '@capacitor/app',
      '@capacitor/browser',
      '@capacitor/filesystem',
      '@capacitor/haptics',
      '@capacitor/keyboard',
      '@capacitor/push-notifications',
      '@capacitor/share',
    ],
  },
  plugins: {
    StatusBar: {
      style: 'Light',
      backgroundColor: '#ffffff',
    },
    SystemBars: {
      // index.html uses viewport-fit=cover; hint it up front to avoid a layout jump on launch.
      initialViewportFitValueHint: 'cover',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    FirebaseAuthentication: {
      providers: ['apple.com', 'google.com'],
    },
  },
}

export default config
