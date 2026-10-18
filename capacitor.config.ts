import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'in.eloi.rstne',
  appName: 'RSTNE',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    // Android 15+ forces edge-to-edge (targetSdk 35+): inset the WebView by the system bars.
    adjustMarginsForEdgeToEdge: 'auto',
    // @capacitor/status-bar is iOS-only here: its Android code uses APIs deprecated in Android 15.
    // Android status bar styling lives in SystemBarsPlugin.java.
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
