<template>
  <div class="feasts-view">
    <!-- Header -->
    <header class="page-header">
      <button class="back-btn" @click="router.push({ name: 'books' })">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="header-text">
        <h1>Annual Feasts · Moadeem</h1>
        <p>YaHUaH's Appointed Times — Leviticus 23</p>
      </div>
    </header>

    <!-- Feast content -->
    <div class="scroll-area">
      <div v-for="season in SEASONS" :key="season.id" class="season-section">
        <div class="season-header" :style="{ '--sc': season.color }">
          <span class="season-icon">{{ season.icon }}</span>
          <span class="season-name">{{ season.name }}</span>
          <span class="season-months">{{ season.months }}</span>
        </div>

        <div class="feast-cards">
          <div
            v-for="feast in feastsBySeason(season.id)"
            :key="feast.id"
            class="feast-card"
            :style="{ '--fc': feast.color }"
          >
            <div class="card-head">
              <div class="date-badge">
                <span class="date-month">{{ feast.monthLabel }}</span>
                <span class="date-day">{{ feast.dayLabel }}</span>
              </div>
              <div class="feast-names">
                <h2 class="feast-title">{{ feast.name }}</h2>
                <p class="feast-hebrew">{{ feast.hebrewName }}</p>
              </div>
            </div>

            <p class="feast-desc">{{ feast.description }}</p>

            <div v-if="feast.refs.length" class="refs-section">
              <div class="refs-label">Readings</div>
              <div class="refs-list">
                <template v-for="ref in feast.refs" :key="ref.label">
                  <button
                    v-if="ref.book"
                    class="ref-pill linked"
                    :disabled="navLoading"
                    @click="navigateRef(ref)"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    {{ ref.label }}
                  </button>
                  <span v-else class="ref-pill unlinked">{{ ref.label }}</span>
                </template>
              </div>
            </div>

            <div v-if="feast.note" class="feast-note">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              {{ feast.note }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getAllBooks } from '@/api/books';
import { getChaptersByBookId } from '@/api/chapters';
import type { Book, Chapter } from '@/utils/collectionReferences';

const router = useRouter();
const navLoading = ref(false);
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

interface VerseRef { label: string; book?: string; chapter?: number; verse?: number; }
function navigateRef(ref: VerseRef) {
  if (!ref.book || !ref.chapter) return;
  navigateBySlug(ref.book, ref.chapter);
}

interface Feast {
  id: string; season: string; name: string; hebrewName: string;
  monthLabel: string; dayLabel: string; color: string;
  description: string; refs: VerseRef[]; note?: string;
}

const SEASONS = [
  { id: 'spring', name: 'Spring Feasts',     icon: '🌿', months: 'Month 1 · Aviv',      color: '#059669' },
  { id: 'summer', name: 'Summer Feasts',     icon: '☀️', months: 'Month 3 · Mid-Year',   color: '#d97706' },
  { id: 'fall',   name: 'Fall Feasts',       icon: '🍂', months: 'Month 7 · Ethanim',    color: '#be123c' },
  { id: 'other',  name: 'Additional Feasts', icon: '✡️', months: 'Purim · Chanukah',     color: '#1d4ed8' },
];

const FEASTS: Feast[] = [
  {
    id: 'passover', season: 'spring', name: 'Passover Night', hebrewName: 'Pesach',
    monthLabel: 'Aviv', dayLabel: '14', color: '#be123c',
    description: 'The memorial of YaHUaH delivering Israel from Egypt. Observed on the night of Aviv 14, always on a Tuesday night. The lamb is slain and its blood applied to the doorposts. Follow the Passover Booklet for the full observance.',
    refs: [],
    note: 'Use the Passover Booklet for the full Seder observance.',
  },
  {
    id: 'unleavened-bread', season: 'spring', name: 'Feast of Unleavened Bread', hebrewName: 'Chag HaMatzoth',
    monthLabel: 'Aviv', dayLabel: '15–21', color: '#d97706',
    description: 'Seven days of eating unleavened bread, commemorating the haste of the Exodus. The first and seventh days are High Sabbaths. Remove all leaven from your dwellings.',
    refs: [
      { label: 'Leviticus 23:4–14',  book: 'leviticus',  chapter: 23, verse: 4  },
      { label: 'Exodus 12',          book: 'exodus',     chapter: 12              },
      { label: 'Exodus 13',          book: 'exodus',     chapter: 13              },
      { label: 'Jubilees 49',        book: 'jubilees',   chapter: 49              },
    ],
  },
  {
    id: 'firstfruit-singular', season: 'spring', name: 'Resurrection Shabbat · First Fruit', hebrewName: 'Yom HaBikkur — Singular',
    monthLabel: 'Aviv', dayLabel: '18', color: '#059669',
    description: 'The day YaHUShA rose from the dead as the First Fruit of the resurrection — the singular First Fruit wave-sheaf offered on the third day after Passover, Aviv 18, which always falls on the weekly Shabbat within Unleavened Bread.',
    refs: [
      { label: 'Matthew 28',             book: 'matthew',           chapter: 28 },
      { label: 'Mark 16',                book: 'mark',              chapter: 16 },
      { label: 'Luke 24',                book: 'luke',              chapter: 24 },
      { label: 'John 20',                book: 'john',              chapter: 20 },
      { label: 'John 21',                book: 'john',              chapter: 21 },
      { label: '1 Corinthians 15',       book: 'first-corinthians', chapter: 15 },
    ],
  },
  {
    id: 'firstfruits-plural', season: 'spring', name: 'First Fruits — Barley', hebrewName: 'Yom HaBikkur — Plural',
    monthLabel: 'Aviv', dayLabel: '26', color: '#16a34a',
    description: "The plural first fruits — the barley harvest offering brought to YaHUaH on Aviv 26. Connected to the many saints who were resurrected at Messiah's death, representing the broader first fruits harvest.",
    refs: [
      { label: '1 Corinthians 15',       book: 'first-corinthians', chapter: 15         },
      { label: 'Matthew 27:45–54',       book: 'matthew',           chapter: 27, verse: 45 },
    ],
  },
  {
    id: 'shavuot', season: 'summer', name: 'Feast of Weeks', hebrewName: 'Shavuot',
    monthLabel: 'Month 3', dayLabel: 'Day 15', color: '#1d4ed8',
    description: 'Fifty days from the First Fruit wave-sheaf. YaHUaH gave the Torah at Sinai and the Ruach HaKodesh was poured out at Jerusalem. A High Sabbath with wheat harvest offerings. Read the Book of Ruth.',
    refs: [
      { label: 'Exodus 19',              book: 'exodus',            chapter: 19         },
      { label: 'Exodus 20',              book: 'exodus',            chapter: 20         },
      { label: 'Jubilees 1',             book: 'jubilees',          chapter: 1          },
      { label: 'Leviticus 23:15–22',     book: 'leviticus',         chapter: 23, verse: 15 },
      { label: 'Ruth 1–4',               book: 'ruth',              chapter: 1          },
      { label: 'Acts 2:1–47',            book: 'acts',              chapter: 2,  verse: 1  },
    ],
  },
  {
    id: 'mid-year', season: 'summer', name: 'Mid-Year Firstfruit Feasts', hebrewName: 'Tirosh · Shemen · Eytzeem',
    monthLabel: 'Months 4–6', dayLabel: 'New Wine · Oil · Wood', color: '#b45309',
    description: 'Three mid-year feasts of new wine (Tirosh Chadash), new oil (Shemen Chadash), and new wood (Eytzeem Chadashem). These offerings mark the successive harvests of wine, olive oil, and wood for the altar throughout the summer months.',
    refs: [
      { label: 'Exodus 34:1–23',         book: 'exodus',    chapter: 34, verse: 1  },
      { label: 'Nehemiah 10',            book: 'nehemiah',  chapter: 10              },
      { label: 'Jubilees 7:36',          book: 'jubilees',  chapter: 7,  verse: 36 },
      { label: 'Jubilees 13:26',         book: 'jubilees',  chapter: 13, verse: 26 },
      { label: 'Jubilees 21:12–14',      book: 'jubilees',  chapter: 21, verse: 12 },
    ],
  },
  {
    id: 'trumpets', season: 'fall', name: 'Feast of Trumpets', hebrewName: 'Yom Terumah',
    monthLabel: 'Month 7', dayLabel: 'Day 1', color: '#7c3aed',
    description: 'The blowing of trumpets on the first day of the seventh month. A High Sabbath of memorial. Prophetically points to the resurrection of the dead, the return of Messiah, and the ingathering of Israel.',
    refs: [
      { label: 'Genesis 22',             book: 'genesis',              chapter: 22         },
      { label: 'Numbers 29:1–6',         book: 'numbers',              chapter: 29, verse: 1  },
      { label: 'Jubilees 18:1–17',       book: 'jubilees',             chapter: 18, verse: 1  },
      { label: 'Jeremiah 31',            book: 'jeremiah',             chapter: 31         },
      { label: 'Matthew 24:26–51',       book: 'matthew',              chapter: 24, verse: 26 },
      { label: 'Revelation 19:1–21',     book: 'revelation',           chapter: 19, verse: 1  },
      { label: '1 Thessalonians 4:13–18',book: 'first-thessalonians',  chapter: 4,  verse: 13 },
    ],
  },
  {
    id: 'atonement', season: 'fall', name: 'Day of Atonements', hebrewName: 'Yom HaKippurim',
    monthLabel: 'Month 7', dayLabel: 'Day 10', color: '#991b1b',
    description: 'The most solemn day of the year — a complete fast, a Sabbath of Sabbaths. The High Priest entered the Most Set-Apart Place with the blood of atonement. Prophetically fulfilled by YaHUShA as our eternal High Priest.',
    refs: [
      { label: 'Leviticus 16',           book: 'leviticus', chapter: 16         },
      { label: 'Numbers 29:7–11',        book: 'numbers',   chapter: 29, verse: 7  },
      { label: 'Isaiah 52:13',           book: 'isaiah',    chapter: 52, verse: 13 },
      { label: 'Isaiah 53',              book: 'isaiah',    chapter: 53         },
      { label: 'Hebrews 7',              book: 'hebrews',   chapter: 7          },
      { label: 'Hebrews 9',              book: 'hebrews',   chapter: 9          },
      { label: 'Hebrews 10',             book: 'hebrews',   chapter: 10         },
    ],
  },
  {
    id: 'sukkot', season: 'fall', name: 'Feast of Tents · Tabernacles', hebrewName: 'Sukkot',
    monthLabel: 'Month 7', dayLabel: 'Days 15–21', color: '#ea580c',
    description: "Seven days of dwelling in booths, commemorating Israel's wilderness journey and pointing to YaHUaH tabernacling with His people in the Millennial Kingdom. The first and last days are High Sabbaths. Rejoice before YaHUaH!",
    refs: [
      { label: 'Leviticus 23:34–44',     book: 'leviticus', chapter: 23, verse: 34 },
      { label: 'Jubilees 16',            book: 'jubilees',  chapter: 16          },
      { label: 'Zechariah 14:16–21',     book: 'zechariah', chapter: 14, verse: 16 },
      { label: 'Nehemiah 8:1–18',        book: 'nehemiah',  chapter: 8,  verse: 1  },
      { label: 'Matthew 17:1–23',        book: 'matthew',   chapter: 17, verse: 1  },
    ],
  },
  {
    id: 'eighth-day', season: 'fall', name: 'Closing Assembly · Eighth Day', hebrewName: 'Shemenee Atzereth',
    monthLabel: 'Month 7', dayLabel: 'Day 22', color: '#1e40af',
    description: "The eighth day following Sukkot — a separate High Sabbath assembly. Prophetically pictures eternity, the new heavens and new earth, and the final chapter of YaHUaH's redemptive plan when all things are made new.",
    refs: [
      { label: 'Leviticus 23:36–44',     book: 'leviticus',  chapter: 23, verse: 36 },
      { label: 'Numbers 29:35–39',       book: 'numbers',    chapter: 29, verse: 35 },
      { label: 'Jubilees 32:17–29',      book: 'jubilees',   chapter: 32, verse: 17 },
      { label: 'Isaiah 66:1–24',         book: 'isaiah',     chapter: 66, verse: 1  },
      { label: 'Revelation 22:1–21',     book: 'revelation', chapter: 22, verse: 1  },
    ],
  },
  {
    id: 'purim', season: 'other', name: 'Feast of Lots', hebrewName: 'Purim',
    monthLabel: 'Month 12', dayLabel: 'Days 14–15', color: '#0891b2',
    description: "Commemorates YaHUaH's deliverance of the Jewish people through Esther and Mordecai from Haman's plot. A day of feasting, joy, and giving gifts. Read the complete Scroll of Esther.",
    refs: [
      { label: 'Exodus 17:8–16',         book: 'exodus',  chapter: 17, verse: 8 },
      { label: 'Esther 1',               book: 'esther',  chapter: 1            },
    ],
    note: 'Read all chapters of the Scroll of Esther.',
  },
  {
    id: 'chanukah', season: 'other', name: 'Feast of Rededication', hebrewName: 'Chanukah',
    monthLabel: 'Month 9', dayLabel: 'Days 25–', color: '#0369a1',
    description: "Eight-day feast of rededication celebrating the rededication of the Temple by the Maccabees after its defilement by Antiochus IV Epiphanes. YaHUShA walked in Solomon's Porch during this feast (John 10). Light increases each night.",
    refs: [
      { label: 'John 10',    book: 'john', chapter: 10 },
      { label: '1 Maccabees' },
      { label: '2 Maccabees' },
    ],
    note: '1st and 2nd Maccabees are not yet available in the RSTNE database.',
  },
];

function feastsBySeason(seasonId: string): Feast[] {
  return FEASTS.filter(f => f.season === seasonId);
}
</script>

<style scoped>
.feasts-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #f8f4ec;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #1a0a00, #3b1a00);
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
  -webkit-tap-highlight-color: transparent;
}

.back-btn:active { opacity: 0.7; }

.header-text { flex: 1; }

.header-text h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
}

.header-text p {
  margin: 2px 0 0;
  font-size: 11px;
  color: rgba(255,255,255,0.55);
}

.scroll-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.season-section { flex-shrink: 0; display: flex; flex-direction: column; gap: 10px; }

.season-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: color-mix(in srgb, var(--sc) 10%, white);
  border-left: 4px solid var(--sc);
  border-radius: 0 10px 10px 0;
}

.season-icon { font-size: 16px; }

.season-name {
  font-size: 12px;
  font-weight: 800;
  color: var(--sc);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.season-months { font-size: 11px; color: #6b7280; font-weight: 500; }

.feast-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feast-card {
  background: #fff;
  border-radius: 14px;
  border: 1.5px solid #e5e7eb;
  border-top: 4px solid var(--fc);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.date-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 56px;
  background: color-mix(in srgb, var(--fc) 10%, white);
  border: 1.5px solid color-mix(in srgb, var(--fc) 25%, white);
  border-radius: 10px;
  padding: 6px 6px;
  flex-shrink: 0;
}

.date-month {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--fc);
  text-align: center;
  line-height: 1.2;
}

.date-day {
  font-size: 15px;
  font-weight: 900;
  color: var(--fc);
  text-align: center;
  line-height: 1.2;
  margin-top: 2px;
}

.feast-names { flex: 1; min-width: 0; }

.feast-title {
  font-size: 15px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 3px;
  line-height: 1.3;
}

.feast-hebrew {
  font-size: 12px;
  color: var(--fc);
  font-weight: 600;
  margin: 0;
  opacity: 0.85;
}

.feast-desc {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.65;
  margin: 0;
}

.refs-section { display: flex; flex-direction: column; gap: 5px; }

.refs-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #9ca3af;
}

.refs-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.ref-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  border: 1.5px solid;
  cursor: pointer;
  transition: opacity 0.1s;
  font-family: inherit;
  -webkit-tap-highlight-color: transparent;
  min-height: 32px;
}

.ref-pill:active { opacity: 0.7; }
.ref-pill:disabled { opacity: 0.5; }

.ref-pill.linked {
  background: color-mix(in srgb, var(--fc) 8%, white);
  border-color: color-mix(in srgb, var(--fc) 35%, white);
  color: var(--fc);
}

.ref-pill.unlinked {
  background: #f3f4f6;
  border-color: #e5e7eb;
  color: #9ca3af;
  cursor: default;
  font-style: italic;
}

.feast-note {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 10px;
  line-height: 1.5;
}

.feast-note svg { flex-shrink: 0; margin-top: 1px; }
</style>
