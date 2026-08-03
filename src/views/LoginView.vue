<template>
  <div class="auth-view">
    <header class="auth-header">
      <button class="back-btn" aria-label="Back" @click="router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h1 class="auth-title">Sign In</h1>
    </header>

    <div class="auth-body">
      <p class="auth-subtitle">Sign in to sync your personal notes across devices.</p>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="form-field">
          <label for="login-email">Email</label>
          <input id="login-email" v-model="email" type="email" autocomplete="email" required :disabled="submitting" />
        </div>

        <div class="form-field">
          <label for="login-password">Password</label>
          <div class="password-input">
            <input
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              :disabled="submitting"
            />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

        <button type="submit" class="submit-btn" :disabled="submitting">
          {{ submitting ? 'Signing in…' : 'Sign In' }}
        </button>
      </form>

      <div class="auth-divider"><span>or</span></div>

      <button type="button" class="google-btn" :disabled="submitting" @click="handleGoogle">
        <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/>
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
        </svg>
        Continue with Google
      </button>

      <p class="auth-switch">
        Don't have an account? <RouterLink to="/register">Register</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { signInEmail, signInGoogle } = useAuth();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const submitting = ref(false);
const errorMessage = ref('');

function friendlyError(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return 'Incorrect email or password.';
  }
  if (code.includes('too-many-requests')) {
    return 'Too many attempts. Please try again later.';
  }
  if (code.includes('canceled') || code.includes('cancelled')) {
    return '';
  }
  return 'Something went wrong. Please try again.';
}

async function handleSubmit() {
  errorMessage.value = '';
  submitting.value = true;
  try {
    await signInEmail(email.value, password.value);
    router.replace('/settings');
  } catch (err) {
    errorMessage.value = friendlyError(err);
  } finally {
    submitting.value = false;
  }
}

async function handleGoogle() {
  errorMessage.value = '';
  submitting.value = true;
  try {
    await signInGoogle();
    router.replace('/settings');
  } catch (err) {
    const message = friendlyError(err);
    if (message) errorMessage.value = message;
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.auth-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #f3f4f6;
  overflow: hidden;
}

.auth-header {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 12px;
  flex-shrink: 0;
}

.back-btn {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #1a1a2e;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.auth-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.auth-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 20px 20px calc(24px + var(--safe-area-bottom));
}

.auth-subtitle {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 20px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.form-field input {
  min-height: 46px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1.5px solid #d1d5db;
  font-size: 16px;
  color: #111827;
  background: #f9fafb;
  font-family: inherit;
}

.form-field input:focus {
  outline: none;
  border-color: #1E40AF;
}

.password-input {
  position: relative;
  display: flex;
}

.password-input input {
  flex: 1;
  padding-right: 64px;
}

.password-toggle {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  min-height: 38px;
  padding: 0 10px;
  background: none;
  border: none;
  color: #1E40AF;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.form-error {
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  margin: 0;
}

.submit-btn {
  min-height: 48px;
  border: none;
  border-radius: 12px;
  background: #1E40AF;
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}

.submit-btn:disabled {
  opacity: 0.6;
}

.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
  margin: 20px 0;
}
.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e5e7eb;
}
.auth-divider span {
  padding: 0 12px;
}

.google-btn {
  width: 100%;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1.5px solid #d1d5db;
  border-radius: 12px;
  background: #fff;
  color: #374151;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}

.auth-switch {
  text-align: center;
  margin: 24px 0 0;
  font-size: 14px;
  color: #6b7280;
}

.auth-switch a {
  color: #1E40AF;
  font-weight: 600;
  text-decoration: none;
}
</style>
