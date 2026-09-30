import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

export const API_URL = 'https://rstne.eloi.in/api';

export const API_HEADERS: Record<string, string> = {
  'X-API-Key': '789ccdbc5dd6e360769994ea1648ce7f3b0b8549218c4efe1a09a0d26c0d46e3',
};

// Same as API_HEADERS, plus a Firebase bearer token when the user is signed in.
// Goes through the Capacitor plugin (not the JS SDK's `auth.currentUser`) since
// native sign-ins never populate the JS SDK's local state — see useAuth.ts.
export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    // getIdToken() throws when no user is signed in (logged natively as a
    // RuntimeError), so check first to avoid that on every signed-out request.
    const { user } = await FirebaseAuthentication.getCurrentUser();
    if (!user) return { ...API_HEADERS };
    const { token } = await FirebaseAuthentication.getIdToken();
    if (!token) return { ...API_HEADERS };
    return { ...API_HEADERS, Authorization: `Bearer ${token}` };
  } catch {
    return { ...API_HEADERS };
  }
}
