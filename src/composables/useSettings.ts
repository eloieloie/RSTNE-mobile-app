import { reactive, watch } from 'vue';

interface Settings {
  showEnglish: boolean;
  showTelugu: boolean;
  showNotes: boolean;
  showCrossReferences: boolean;
  fontSize: number;
  keepScreenOn: boolean;
}

const STORAGE_KEY = 'rstne-settings';

const defaults: Settings = {
  showEnglish: true,
  showTelugu: false,
  showNotes: false,
  showCrossReferences: false,
  fontSize: 16,
  keepScreenOn: false,
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
