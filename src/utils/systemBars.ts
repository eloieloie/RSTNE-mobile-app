import { registerPlugin } from '@capacitor/core';

/**
 * Android-only native plugin (android/app/.../SystemBarsPlugin.java).
 * Replaces @capacitor/status-bar on Android, which relies on APIs
 * deprecated by Android 15 edge-to-edge.
 */
export interface SystemBarsPlugin {
  /** 'dark' = light icons (dark background); 'light' = dark icons (light background). */
  setStyle(options: { style: 'dark' | 'light' }): Promise<void>;
  setBackgroundColor(options: { color: string }): Promise<void>;
}

export const SystemBars = registerPlugin<SystemBarsPlugin>('SystemBars');
