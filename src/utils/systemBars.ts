import { registerPlugin } from '@capacitor/core';

/**
 * Android-only native plugin (android/app/.../SystemBarColorPlugin.java).
 * Paints the area behind the transparent system bars with the active theme's colour.
 * Icon contrast is handled by Capacitor's core SystemBars plugin.
 */
export interface SystemBarColorPlugin {
  setBackgroundColor(options: { color: string }): Promise<void>;
}

export const SystemBarColor = registerPlugin<SystemBarColorPlugin>('SystemBarColor');
