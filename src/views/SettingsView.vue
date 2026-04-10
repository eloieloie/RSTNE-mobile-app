<template>
  <div class="settings-view">
    <header class="settings-header">
      <h1 class="settings-title">Settings</h1>
    </header>

    <div class="settings-body">
      <!-- Book Names Language -->
      <section class="settings-section">
        <h2 class="section-title">Book Names Language</h2>
        <div class="settings-group">
          <div class="lang-options">
            <button
              v-for="opt in langOptions"
              :key="opt.value"
              :class="['lang-option-btn', { active: bookNameLanguage === opt.value }]"
              @click="bookNameLanguage = opt.value"
            >{{ opt.label }}</button>
          </div>
        </div>
      </section>

      <!-- Display Options -->
      <section class="settings-section">
        <h2 class="section-title">Display Options</h2>
        <div class="settings-group">
          <label class="setting-item">
            <div class="setting-label">
              <span class="setting-name">Show English Verse</span>
              <span class="setting-desc">Display the English verse text while reading</span>
            </div>
            <button
              class="toggle-switch"
              :class="{ active: settings.showEnglish }"
              @click="settings.showEnglish = !settings.showEnglish"
            >
              <span class="toggle-slider"></span>
            </button>
          </label>

          <label class="setting-item">
            <div class="setting-label">
              <span class="setting-name">Show Telugu Verse</span>
              <span class="setting-desc">Display Telugu translation below each verse</span>
            </div>
            <button
              class="toggle-switch"
              :class="{ active: settings.showTelugu }"
              @click="settings.showTelugu = !settings.showTelugu"
            >
              <span class="toggle-slider"></span>
            </button>
          </label>

          <label class="setting-item">
            <div class="setting-label">
              <span class="setting-name">Show Notes</span>
              <span class="setting-desc">Display study notes attached to verses</span>
            </div>
            <button
              class="toggle-switch"
              :class="{ active: settings.showNotes }"
              @click="settings.showNotes = !settings.showNotes"
            >
              <span class="toggle-slider"></span>
            </button>
          </label>

          <label class="setting-item">
            <div class="setting-label">
              <span class="setting-name">Show Cross References</span>
              <span class="setting-desc">Display linked verses below each verse</span>
            </div>
            <button
              class="toggle-switch"
              :class="{ active: settings.showCrossReferences }"
              @click="settings.showCrossReferences = !settings.showCrossReferences"
            >
              <span class="toggle-slider"></span>
            </button>
          </label>
          <label class="setting-item">
            <div class="setting-label">
              <span class="setting-name">Keep Screen On</span>
              <span class="setting-desc">Prevent the screen from sleeping while reading</span>
            </div>
            <button
              class="toggle-switch"
              :class="{ active: settings.keepScreenOn }"
              @click="settings.keepScreenOn = !settings.keepScreenOn"
            >
              <span class="toggle-slider"></span>
            </button>
          </label>
        </div>
      </section>

      <!-- Font Size -->
      <section class="settings-section">
        <h2 class="section-title">Font Size</h2>
        <div class="settings-group">
          <div class="font-size-row">
            <span class="font-preview" :style="{ fontSize: settings.fontSize + 'px' }">Aa</span>
            <div class="font-controls">
              <button
                class="font-btn"
                :disabled="settings.fontSize <= 12"
                @click="settings.fontSize -= 1"
              >A−</button>
              <span class="font-size-label">{{ settings.fontSize }}px</span>
              <button
                class="font-btn"
                :disabled="settings.fontSize >= 26"
                @click="settings.fontSize += 1"
              >A+</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettings } from '@/composables/useSettings';
import { useBookLanguage, type BookNameLanguage } from '@/composables/useBookLanguage';

const settings = useSettings();
const { bookNameLanguage } = useBookLanguage();

const langOptions: { value: BookNameLanguage; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'hebrew', label: 'Hebrew' },
  { value: 'telugu', label: 'Telugu' },
];
</script>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f3f4f6;
  overflow: hidden;
}

.settings-header {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 20px;
  flex-shrink: 0;
}

.settings-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.settings-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-section {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 14px 16px 8px;
  margin: 0;
}

.settings-group {
  padding: 0 16px 8px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.setting-name {
  font-size: 16px;
  color: #1a1a2e;
  font-weight: 500;
}

.setting-desc {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.4;
}

/* Toggle switch */
.toggle-switch {
  position: relative;
  width: 50px;
  height: 28px;
  background: #d1d5db;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: background 0.25s;
  padding: 0;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}

.toggle-switch.active {
  background: #1E40AF;
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  background: #fff;
  border-radius: 50%;
  transition: left 0.25s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}

.toggle-switch.active .toggle-slider {
  left: 25px;
}

/* Font size */
.font-size-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}

.font-preview {
  color: #1a1a2e;
  font-weight: 600;
  transition: font-size 0.2s;
  min-width: 48px;
}

.font-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.font-btn {
  background: #1E40AF;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  min-width: 52px;
  min-height: 44px;
  -webkit-tap-highlight-color: transparent;
}

.font-btn:disabled {
  background: #d1d5db;
  color: #9ca3af;
  cursor: not-allowed;
}

.font-size-label {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  min-width: 44px;
  text-align: center;
}

.lang-options {
  display: flex;
  gap: 8px;
  padding: 10px 0 6px;
}

.lang-option-btn {
  flex: 1;
  padding: 10px 8px;
  border-radius: 10px;
  border: 1.5px solid #d1d5db;
  background: #f3f4f6;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: #6b7280;
  min-height: 44px;
  -webkit-tap-highlight-color: transparent;
}

.lang-option-btn:active {
  opacity: 0.7;
}

.lang-option-btn.active {
  background: #1E40AF;
  border-color: #1E40AF;
  color: #fff;
}
</style>
