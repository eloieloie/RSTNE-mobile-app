const API_URL = 'https://us-central1-rstne-app-2025.cloudfunctions.net/api/api';

export interface AppVersionInfo {
  min_version: string;
  max_version: string;
}

export async function getAppVersion(): Promise<AppVersionInfo> {
  const response = await fetch(`${API_URL}/app-version`);
  if (!response.ok) throw new Error('Failed to fetch app version');
  return response.json();
}

/** Compare two semver strings. Returns negative if a < b, 0 if equal, positive if a > b. */
export function compareSemver(a: string, b: string): number {
  const parse = (v: string) => v.split('.').map(Number);
  const [aMajor, aMinor, aPatch] = parse(a);
  const [bMajor, bMinor, bPatch] = parse(b);
  return aMajor !== bMajor ? aMajor - bMajor
    : aMinor !== bMinor ? aMinor - bMinor
    : aPatch - bPatch;
}
