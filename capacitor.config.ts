import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.rstne.app',
  appName: 'RSTNE',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#1a1a2e',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
    },
  },
}

export default config
