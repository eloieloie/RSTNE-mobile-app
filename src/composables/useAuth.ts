import { ref } from 'vue';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { auth } from '@/firebase';
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

// The Capacitor Firebase plugin drives native sign-in (Google) and keeps the
// underlying JS SDK auth state in sync — onAuthStateChanged is the single
// source of truth for reactive state on both web preview and native builds.
onAuthStateChanged(auth, async (firebaseUser) => {
  user.value = firebaseUser;
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
