<template>
  <div class="weekly-view">
    <!-- Header -->
    <header class="page-header">
      <button class="back-btn" @click="router.push({ name: 'books' })">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="header-center">
        <div class="header-badge">52 Weeks · 12 Months · 364 Days</div>
        <h1>Turah Reading Plan</h1>
        <p class="subtitle">Dead Sea Scroll Solar Calendar</p>
        <div class="dss-pill">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          DSS Today: {{ dssToday.month }}M / {{ ordinal(dssToday.day) }} · Week {{ currentWeek }}
        </div>
        <div class="am-pill">
          AM {{ currentDSSYear }} · {{ currentJubileeRef }}
        </div>
      </div>
    </header>

    <!-- Tabs -->
    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'weekly' }" @click="activeTab = 'weekly'">52 Weeks</button>
      <button class="tab" :class="{ active: activeTab === 'byMonth' }" @click="activeTab = 'byMonth'">By Month</button>
      <button class="tab tab--purple" :class="{ active: activeTab === 'roshChodesh' }" @click="activeTab = 'roshChodesh'">Rosh Chodesh</button>
    </div>

    <!-- 52-Week grid -->
    <div v-if="activeTab === 'weekly'" class="scroll-area">
      <div
        v-for="parasha in WEEKLY_PARASHOT"
        :key="parasha.week"
        :ref="(el) => { if (parasha.week === currentWeek) currentCardEl = el as HTMLElement }"
        class="parasha-card"
        :class="{ 'current-week': parasha.week === currentWeek }"
      >
        <div class="card-meta">
          <span class="week-badge">Week {{ parasha.week }}/52</span>
          <span class="dss-date">{{ parasha.dssMonth }}M / {{ ordinal(parasha.dssDay) }}</span>
          <span v-if="parasha.week === currentWeek" class="this-week-tag">This Week</span>
        </div>
        <div class="card-name">{{ parasha.hebrewName }}</div>
        <div v-if="parasha.meaning" class="card-meaning">{{ parasha.meaning }}</div>
        <div v-if="parasha.note" class="card-note">{{ parasha.note }}</div>
        <div class="readings">
          <div class="reading torah">
            <span class="reading-label">Turah</span>
            <span class="reading-text">{{ parasha.torah.displayText }}</span>
          </div>
          <div class="reading nc">
            <span class="reading-label">Brit Chadasha</span>
            <span class="reading-text">{{ parasha.newCovenant.displayText }}</span>
          </div>
        </div>
        <div class="card-btns">
          <button class="read-btn torah-btn" :disabled="navLoading" @click="navigate(parasha, 'torah')">Read Turah</button>
          <button class="read-btn nc-btn" :disabled="navLoading" @click="navigate(parasha, 'nc')">Read BC</button>
          <button class="read-btn share-btn" :disabled="shareLoading" @click="shareParasha(parasha)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- By Month -->
    <div v-if="activeTab === 'byMonth'" class="scroll-area">
      <div
        v-for="month in 12"
        :key="month"
        class="month-section"
        :class="{ 'current-month': month === dssToday.month }"
      >
        <div class="month-header">
          <span class="month-num">{{ month }}M</span>
          <span class="month-name">{{ DSS_MONTH_NAMES[month] }}</span>
          <span v-if="month === dssToday.month" class="this-month-tag">This Month</span>
        </div>
        <div
          v-for="parasha in parshasByMonth.get(month) || []"
          :key="parasha.week"
          class="parasha-card"
          :class="{ 'current-week': parasha.week === currentWeek }"
        >
          <div class="card-meta">
            <span class="week-badge">Week {{ parasha.week }}/52</span>
            <span class="dss-date">{{ parasha.dssMonth }}M / {{ ordinal(parasha.dssDay) }}</span>
            <span v-if="parasha.week === currentWeek" class="this-week-tag">This Week</span>
          </div>
          <div class="card-name">{{ parasha.hebrewName }}</div>
          <div v-if="parasha.meaning" class="card-meaning">{{ parasha.meaning }}</div>
          <div v-if="parasha.note" class="card-note">{{ parasha.note }}</div>
          <div class="readings">
            <div class="reading torah">
              <span class="reading-label">Turah</span>
              <span class="reading-text">{{ parasha.torah.displayText }}</span>
            </div>
            <div class="reading nc">
              <span class="reading-label">Brit Chadasha</span>
              <span class="reading-text">{{ parasha.newCovenant.displayText }}</span>
            </div>
          </div>
          <div class="card-btns">
            <button class="read-btn torah-btn" :disabled="navLoading" @click="navigate(parasha, 'torah')">Read Turah</button>
            <button class="read-btn nc-btn" :disabled="navLoading" @click="navigate(parasha, 'nc')">Read BC</button>
            <button class="read-btn share-btn" :disabled="shareLoading" @click="shareParasha(parasha)">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Rosh Chodesh -->
    <div v-if="activeTab === 'roshChodesh'" class="scroll-area">
      <div class="rc-intro">
        Chodesh · New Month Yom Haftarah — Monthly Prophetic Readings
      </div>
      <div class="rc-list">
        <div
          v-for="entry in MONTHLY_HAFTARAH"
          :key="entry.month"
          class="rc-item"
          :class="{ 'rc-item--current': entry.month === dssToday.month, 'rc-item--open': expandedRCMonth === entry.month }"
        >
          <!-- Tap row -->
          <button class="rc-row" @click="expandedRCMonth = expandedRCMonth === entry.month ? null : entry.month">
            <span class="rc-badge">{{ entry.month }}M</span>
            <span class="rc-label">{{ DSS_MONTH_NAMES[entry.month] }}</span>
            <span v-if="entry.month === dssToday.month" class="rc-now-tag">This Month</span>
            <svg class="rc-chevron" :class="{ open: expandedRCMonth === entry.month }"
              xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <!-- Expanded refs -->
          <div v-if="expandedRCMonth === entry.month" class="rc-refs">
            <button
              v-for="(ref, i) in entry.refs"
              :key="i"
              class="rc-ref-btn"
              :disabled="navLoading"
              @click="navigateRef(ref)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              {{ ref.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { getAllBooks } from '@/api/books';
import { getChaptersByBookId } from '@/api/chapters';
import { WEEKLY_PARASHOT, DSS_MONTH_NAMES, type Parasha } from '@/data/weeklyParashot';
import { generateReadingPlanCardImage } from '@/utils/paleoBora';
import type { Book, Chapter } from '@/utils/collectionReferences';

const router = useRouter();
const activeTab = ref<'weekly' | 'byMonth' | 'roshChodesh'>('weekly');
const currentCardEl = ref<HTMLElement | null>(null);
const navLoading = ref(false);
const shareLoading = ref(false);
const expandedRCMonth = ref<number | null>(null);

// ── Navigation helpers ──────────────────────────────────────────────────────
const booksCache = ref<Book[]>([]);
const chaptersCache = new Map<number, Chapter[]>();

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function navigateBySlug(bookSlug: string, chapterNum: number) {
  navLoading.value = true;
  try {
    if (!booksCache.value.length) {
      booksCache.value = await getAllBooks();
    }
    const book = booksCache.value.find(b => toSlug(b.book_name) === bookSlug);
    if (!book) return;

    let chapters = chaptersCache.get(book.book_id);
    if (!chapters) {
      chapters = await getChaptersByBookId(book.book_id);
      chaptersCache.set(book.book_id, chapters);
    }
    const chapter = chapters.find(c => parseInt(c.chapter_number) === chapterNum);
    if (!chapter) return;

    router.push({ name: 'reading', params: { bookId: book.book_id, chapterId: chapter.chapter_id } });
  } finally {
    navLoading.value = false;
  }
}

function navigate(parasha: Parasha, side: 'torah' | 'nc') {
  const reading = side === 'torah' ? parasha.torah : parasha.newCovenant;
  navigateBySlug(reading.bookSlug, reading.startChapter);
}

interface HaftarahRef { label: string; bookSlug: string; chapter: number; verse: number; }
function navigateRef(ref: HaftarahRef) {
  navigateBySlug(ref.bookSlug, ref.chapter);
}

async function shareParasha(parasha: Parasha) {
  shareLoading.value = true;
  try {
    const cardFile = await generateReadingPlanCardImage({
      week: parasha.week,
      hebrewName: parasha.hebrewName,
      meaning: parasha.meaning,
      dssMonth: parasha.dssMonth,
      dssDay: parasha.dssDay,
      torahText: parasha.torah.displayText,
      newCovenantText: parasha.newCovenant.displayText,
      note: parasha.note,
      isCurrentWeek: parasha.week === currentWeek,
    });
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(cardFile);
    });
    const base64 = dataUrl.split(',')[1];
    await Filesystem.writeFile({ path: 'reading-plan-share.png', data: base64, directory: Directory.Cache });
    const { uri } = await Filesystem.getUri({ path: 'reading-plan-share.png', directory: Directory.Cache });
    await Share.share({ title: `Week ${parasha.week} — ${parasha.hebrewName}`, files: [uri], dialogTitle: 'Share reading plan' });
  } catch {
    // user cancelled or share failed
  } finally {
    shareLoading.value = false;
  }
}

// ── DSS Calendar ────────────────────────────────────────────────────────────
const DSS_YEAR_OFFSET = 3925;

function getDSSYearStart(gregorianYear: number): Date {
  const equinox = new Date(gregorianYear, 2, 20);
  const dow = equinox.getDay();
  const forward = ((3 - dow) + 7) % 7;
  const backward = (dow - 3 + 7) % 7;
  const d = new Date(equinox);
  d.setDate(d.getDate() + (backward <= forward ? -backward : forward));
  return d;
}

function utcDay(d: Date): number {
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
}

function getDSSDate(date: Date): { month: number; day: number; dayOfYear: number } {
  let ys = getDSSYearStart(date.getFullYear());
  if (utcDay(date) < utcDay(ys)) ys = getDSSYearStart(date.getFullYear() - 1);
  const dayOfYear = Math.floor((utcDay(date) - utcDay(ys)) / 86400000) + 1;
  if (dayOfYear > 364) {
    const ys2 = getDSSYearStart(date.getFullYear() + 1);
    if (utcDay(date) >= utcDay(ys2)) {
      const d2 = Math.floor((utcDay(date) - utcDay(ys2)) / 86400000) + 1;
      const m2 = Math.min(12, Math.ceil(d2 / 30));
      return { month: m2, day: Math.min(30, d2 - (m2 - 1) * 30), dayOfYear: d2 };
    }
  }
  const month = Math.min(12, Math.ceil(dayOfYear / 30));
  const day = Math.min(30, dayOfYear - (month - 1) * 30);
  return { month, day, dayOfYear };
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getJubileeRef(amYear: number): string {
  const onah      = Math.ceil(amYear / 500);
  const inOnah    = amYear - (onah - 1) * 500;
  const jubilee   = Math.ceil(inOnah / 50);
  const inJubilee = inOnah - (jubilee - 1) * 50;
  if (inJubilee === 50) return `J${jubilee} O${onah}`;
  const shemittah   = Math.ceil(inJubilee / 7);
  const inShemittah = inJubilee - (shemittah - 1) * 7;
  return `Y${inShemittah} S${shemittah} J${jubilee} O${onah}`;
}

const dssToday = getDSSDate(new Date());
const currentDSSYearStart = (() => {
  const now = new Date();
  let ys = getDSSYearStart(now.getFullYear());
  if (utcDay(now) < utcDay(ys)) ys = getDSSYearStart(now.getFullYear() - 1);
  return ys;
})();
const currentDSSYear = currentDSSYearStart.getFullYear() + DSS_YEAR_OFFSET;
const currentJubileeRef = getJubileeRef(currentDSSYear);

function getCurrentWeek(): number {
  const todayDay = (dssToday.month - 1) * 30 + dssToday.day;
  let week = 1;
  for (const p of WEEKLY_PARASHOT) {
    if ((p.dssMonth - 1) * 30 + p.dssDay <= todayDay) week = p.week;
    else break;
  }
  return week;
}
const currentWeek = getCurrentWeek();

const parshasByMonth = computed(() => {
  const groups = new Map<number, Parasha[]>();
  for (let m = 1; m <= 12; m++) groups.set(m, []);
  for (const p of WEEKLY_PARASHOT) groups.get(p.dssMonth)!.push(p);
  return groups;
});

// ── Monthly Haftarah ────────────────────────────────────────────────────────
interface MonthlyHaftarah { month: number; refs: HaftarahRef[]; }

const MONTHLY_HAFTARAH: MonthlyHaftarah[] = [
  { month: 1,  refs: [
    { label: 'Yeshayahu-Isaiah 42:5–43:10',    bookSlug: 'isaiah',      chapter: 42, verse: 5  },
    { label: 'Yirmeyahu-Jeremiah 46:13–28',     bookSlug: 'jeremiah',    chapter: 46, verse: 13 },
  ]},
  { month: 2,  refs: [
    { label: 'Hoshea-Hosea 12:13–14:10',        bookSlug: 'hosea',       chapter: 12, verse: 13 },
    { label: 'Yeshayahu-Isaiah 9:1–6',          bookSlug: 'isaiah',      chapter: 9,  verse: 1  },
    { label: 'Yeshayahu-Isaiah 49:1–6',         bookSlug: 'isaiah',      chapter: 49, verse: 1  },
  ]},
  { month: 3,  refs: [
    { label: 'Hoshea-Hosea 11:7–12:12',         bookSlug: 'hosea',       chapter: 11, verse: 7  },
    { label: 'Yeshayahu-Isaiah 60:1–22',        bookSlug: 'isaiah',      chapter: 60, verse: 1  },
  ]},
  { month: 4,  refs: [
    { label: 'Yechezkel-Ezekiel 37:15–28',      bookSlug: 'ezekiel',     chapter: 37, verse: 15 },
    { label: 'Yeshayahu-Isaiah 61:1–63:9',      bookSlug: 'isaiah',      chapter: 61, verse: 1  },
  ]},
  { month: 5,  refs: [
    { label: 'Shophtim-Judges 4:4–5:31',        bookSlug: 'judges',      chapter: 4,  verse: 4  },
    { label: 'Hoshea-Hosea 14:2–10',            bookSlug: 'hosea',       chapter: 14, verse: 2  },
  ]},
  { month: 6,  refs: [
    { label: 'Yeshayahu-Isaiah 6:1–7:14',       bookSlug: 'isaiah',      chapter: 6,  verse: 1  },
    { label: 'Yahoshua-Joshua 1:1–18',          bookSlug: 'joshua',      chapter: 1,  verse: 1  },
  ]},
  { month: 7,  refs: [
    { label: 'Yeshayahu-Isaiah 53:1–12',        bookSlug: 'isaiah',      chapter: 53, verse: 1  },
    { label: 'Hoshea-Hosea 2:1–22',             bookSlug: 'hosea',       chapter: 2,  verse: 1  },
  ]},
  { month: 8,  refs: [
    { label: 'Melechim Alef-First Kings 18:1–39', bookSlug: 'first-kings', chapter: 18, verse: 1 },
    { label: 'Yirmeyahu-Jeremiah 16:19–17:14',  bookSlug: 'jeremiah',    chapter: 16, verse: 19 },
  ]},
  { month: 9,  refs: [
    { label: 'Yeshayahu-Isaiah 43:21–44:23',    bookSlug: 'isaiah',      chapter: 43, verse: 21 },
    { label: 'Ahmos-Amos 9:7–15',               bookSlug: 'amos',        chapter: 9,  verse: 7  },
  ]},
  { month: 10, refs: [
    { label: 'Yirmeyahu-Jeremiah 34:8–22',      bookSlug: 'jeremiah',    chapter: 34, verse: 8  },
    { label: 'Yirmeyahu-Jeremiah 31:31–34',     bookSlug: 'jeremiah',    chapter: 31, verse: 31 },
  ]},
  { month: 11, refs: [
    { label: 'Micha-Mika 5:6–6:8',              bookSlug: 'micah',       chapter: 5,  verse: 6  },
    { label: 'Yirmeyahu-Jeremiah 1:1–2:3',      bookSlug: 'jeremiah',    chapter: 1,  verse: 1  },
  ]},
  { month: 12, refs: [
    { label: 'Yeshayahu-Isaiah 1:1–27',         bookSlug: 'isaiah',      chapter: 1,  verse: 1  },
    { label: 'Yeshayahu-Isaiah 40:1–26',        bookSlug: 'isaiah',      chapter: 40, verse: 1  },
  ]},
];

onMounted(() => {
  getAllBooks().then(b => { booksCache.value = b; });
  expandedRCMonth.value = dssToday.month;
  requestAnimationFrame(() => {
    currentCardEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});
</script>

<style scoped>
.weekly-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #f8f9fb;
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px 14px;
  background: linear-gradient(135deg, #3b1200, #8B4513);
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(255,255,255,0.15);
  color: #fff;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  -webkit-tap-highlight-color: transparent;
}

.back-btn:active { opacity: 0.7; }

.header-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.header-badge {
  display: inline-flex;
  align-self: flex-start;
  padding: 3px 10px;
  background: rgba(255,255,255,0.18);
  color: #fff;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.header-center h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
}

.subtitle {
  margin: 0;
  font-size: 12px;
  color: rgba(255,255,255,0.65);
}

.dss-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: rgba(255,255,255,0.15);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  align-self: flex-start;
}

.am-pill {
  display: inline-flex;
  align-self: flex-start;
  padding: 3px 10px;
  background: rgba(0,0,0,0.25);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  color: #ffd79a;
  font-family: monospace;
}

/* Tabs */
.tabs {
  display: flex;
  padding: 10px 12px 0;
  gap: 6px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.tab {
  flex: 1;
  padding: 8px 4px;
  border: none;
  border-bottom: 3px solid transparent;
  background: none;
  font-size: 13px;
  font-weight: 700;
  color: #9ca3af;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.15s, border-color 0.15s;
}

.tab.active {
  color: #8B4513;
  border-bottom-color: #8B4513;
}

.tab--purple:not(.active) { color: #6B21A8; }
.tab--purple.active { color: #6B21A8; border-bottom-color: #6B21A8; }

/* Scroll area */
.scroll-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Parasha card */
.parasha-card {
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.parasha-card.current-week {
  border: 2px solid #8B4513;
  background: linear-gradient(145deg, #fffcf5, #fff8e8);
  box-shadow: 0 0 0 3px rgba(139,69,19,0.1);
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.week-badge {
  font-size: 12px;
  font-weight: 700;
  color: #4b5563;
}

.dss-date {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #1e3a5f, #2563eb);
  padding: 2px 7px;
  border-radius: 10px;
}

.this-week-tag {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #fff;
  background: linear-gradient(135deg, #8B4513, #c0763a);
  padding: 2px 7px;
  border-radius: 20px;
}

.card-name {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

.card-meaning {
  font-size: 12px;
  font-style: italic;
  color: #6b7280;
  line-height: 1.4;
}

.card-note {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
  background: #f3f4f6;
  border-radius: 6px;
  padding: 5px 8px;
}

.readings {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.reading {
  display: flex;
  align-items: baseline;
  gap: 7px;
  border-radius: 8px;
  padding: 7px 10px;
}

.torah {
  background: #FFF8DC;
  border: 1px solid #DEB887;
}

.nc {
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
}

.reading-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  flex-shrink: 0;
}

.torah .reading-label { color: #92400e; }
.nc .reading-label { color: #1e40af; }

.reading-text {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.card-btns {
  display: flex;
  gap: 8px;
}

.read-btn {
  flex: 1;
  padding: 10px 8px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 2px solid transparent;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.1s;
  min-height: 44px;
}

.read-btn:active { opacity: 0.7; }
.read-btn:disabled { opacity: 0.5; }

.torah-btn { background: #FFF8DC; color: #8B4513; border-color: #DEB887; }
.nc-btn { background: #EFF6FF; color: #1E40AF; border-color: #BFDBFE; }

/* Month section */
.month-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.month-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fff;
  border-radius: 12px;
  border: 1.5px solid #e5e7eb;
}

.current-month > .month-header {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-color: #93c5fd;
}

.month-num {
  font-size: 13px;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(135deg, #1e3a5f, #2563eb);
  padding: 3px 8px;
  border-radius: 8px;
}

.month-name {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  flex: 1;
}

.this-month-tag {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  padding: 2px 7px;
  border-radius: 20px;
}

/* Rosh Chodesh accordion */
.rc-intro {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #6B21A8;
  background: #F3E8FF;
  border: 1px solid #D8B4FE;
  border-radius: 50px;
  padding: 8px 16px;
}

.rc-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #fff;
  border: 1.5px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
}

.rc-item {
  border-bottom: 1px solid #f3f4f6;
}

.rc-item:last-child { border-bottom: none; }

.rc-item--current > .rc-row {
  background: #faf5ff;
}

.rc-item--open > .rc-row {
  background: linear-gradient(135deg, #6B21A8, #9333ea);
  color: #fff;
}

.rc-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 13px 14px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
  min-height: 52px;
  color: #111827;
  transition: background 0.15s;
}

.rc-row:active { opacity: 0.8; }

.rc-badge {
  font-size: 12px;
  font-weight: 900;
  color: #fff;
  background: #6B21A8;
  padding: 2px 8px;
  border-radius: 7px;
  flex-shrink: 0;
  min-width: 32px;
  text-align: center;
}

.rc-item--open .rc-badge {
  background: rgba(255,255,255,0.25);
  color: #fff;
}

.rc-label {
  font-size: 14px;
  font-weight: 700;
  flex: 1;
}

.rc-item--open .rc-label { color: #fff; }

.rc-now-tag {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: #6B21A8;
  background: #E9D5FF;
  padding: 2px 7px;
  border-radius: 20px;
  flex-shrink: 0;
}

.rc-item--open .rc-now-tag {
  background: rgba(255,255,255,0.25);
  color: #fff;
}

.rc-chevron {
  flex-shrink: 0;
  color: #9ca3af;
  transition: transform 0.2s ease;
}

.rc-item--open .rc-chevron { color: rgba(255,255,255,0.8); }
.rc-chevron.open { transform: rotate(180deg); }

.rc-refs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 12px 14px;
  background: #faf5ff;
}

.rc-ref-btn {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  text-align: left;
  background: #fff;
  border: 1.5px solid #D8B4FE;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #6B21A8;
  cursor: pointer;
  line-height: 1.4;
  -webkit-tap-highlight-color: transparent;
  min-height: 48px;
  transition: opacity 0.1s;
  font-family: inherit;
  box-shadow: 0 1px 3px rgba(107,33,168,0.07);
}

.rc-ref-btn:active { opacity: 0.7; }
.rc-ref-btn:disabled { opacity: 0.5; }
.rc-ref-btn svg { flex-shrink: 0; color: #9333ea; }
</style>
