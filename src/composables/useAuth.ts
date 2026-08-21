import { ref } from 'vue';
import { FirebaseAuthentication, type User } from '@capacitor-firebase/authentication';
import '@/firebase'; // ensures the Firebase app is initialized (required by the plugin's web fallback)
import { API_URL, getAuthHeaders } from '@/api/client';

interface AuthMeResponse {
  uid: string;
  email: string | null;
  isAdmin: boolean;
  canClaimAdmin: boolean;
}

const user = ref<User | null>(null);
const isAdmin = ref(false);
const canClaimAdmin = ref(false);
const authReady = ref(false);

async function refreshProfile() {
  if (!user.value) {
    isAdmin.value = false;
    canClaimAdmin.value = false;
    return;
  }
  try {
    const response = await fetch(`${API_URL}/auth/me`, { headers: await getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch profile');
    const data: AuthMeResponse = await response.json();
    isAdmin.value = data.isAdmin;
    canClaimAdmin.value = data.canClaimAdmin;
  } catch (err) {
    console.error('Error loading auth profile:', err);
    isAdmin.value = false;
    canClaimAdmin.value = false;
  }
}

// With native auth (the default — skipNativeAuth is not set), the underlying
// Firebase JS SDK's `onAuthStateChanged` is NOT notified of native sign-ins,
// so it must not be used here. The plugin's own `authStateChange` listener is
// the one API that works uniformly on native (Android/iOS) and the web
// fallback — on web it's internally wired to the JS SDK's `onAuthStateChanged`.
FirebaseAuthentication.getCurrentUser().then(async ({ user: current }) => {
  user.value = current;
  await refreshProfile();
  authReady.value = true;
}).catch(() => {
  authReady.value = true;
});

FirebaseAuthentication.addListener('authStateChange', async (change) => {
  user.value = change.user;
  await refreshProfile();
  authReady.value = true;
});

async function registerEmail(email: string, password: string): Promise<void> {
  await FirebaseAuthentication.createUserWithEmailAndPassword({ email, password });
}

async function signInEmail(email: string, password: string): Promise<void> {
  await FirebaseAuthentication.signInWithEmailAndPassword({ email, password });
}

async function signInGoogle(): Promise<void> {
  await FirebaseAuthentication.signInWithGoogle();
}

async function signOutUser(): Promise<void> {
  await FirebaseAuthentication.signOut();
}

async function claimAdmin(): Promise<void> {
  const response = await fetch(`${API_URL}/auth/claim-admin`, {
    method: 'POST',
    headers: await getAuthHeaders(),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to claim admin');
  }
  await refreshProfile();
}

export function useAuth() {
  return {
    user,
    isAdmin,
    canClaimAdmin,
    authReady,
    registerEmail,
    signInEmail,
    signInGoogle,
    signOutUser,
    claimAdmin,
  };
}
