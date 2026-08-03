import { reactive, watch } from 'vue';

interface Settings {
  showEnglish: boolean;
  showTelugu: boolean;
  showAdminNotes: boolean;
  showMyNotes: boolean;
  showCrossReferences: boolean;
  fontSize: number;
  keepScreenOn: boolean;
  hasSeenOnboarding: boolean;
  chaptersRead: number;
  hasRequestedReview: boolean;
  lastReadingRoute: string | null;
}

const STORAGE_KEY = 'rstne-settings';

const defaults: Settings = {
  showEnglish: true,
  showTelugu: false,
  showAdminNotes: false,
  showMyNotes: false,
  showCrossReferences: false,
  fontSize: 16,
  keepScreenOn: false,
  hasSeenOnboarding: false,
  chaptersRead: 0,
  hasRequestedReview: false,
  lastReadingRoute: null,
};

function loadFromStorage(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {}
  return { ...defaults };
}

const settings = reactive<Settings>(loadFromStorage());

watch(settings, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
}, { deep: true });

export function useSettings() {
  return settings;
}
