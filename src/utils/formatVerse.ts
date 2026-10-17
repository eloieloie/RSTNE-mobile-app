const PALEOBORA_PATTERNS = [
  /HWHY/g,
  /hwhy/g,
  /OSWHY/g,
  /oswhy/g,
  /MYHLA/g,
  /Myhla/g,
  /myhla/g,
];

export function formatVerseWithPaleoBora(
  text: string | null | undefined,
  bookAbbreviations?: Record<string, number>,
  getDisplayAbbr?: (bookId: number, originalAbbr: string) => string,
): string {
  if (!text) return '';

  let result = text;

  for (const pattern of PALEOBORA_PATTERNS) {
    result = result.replace(pattern, (match) => `<span class="paleobora-text">${match}</span>`);
  }

  if (bookAbbreviations) {
    result = result.replace(/#([a-z]{4})(\d+)\s+(\d+)/gi, (match, abbr, chapter, verse) => {
      const bookId = bookAbbreviations[abbr.toLowerCase()];
      if (bookId) {
        const displayAbbr = getDisplayAbbr ? getDisplayAbbr(bookId, abbr) : abbr;
        const label = `#${displayAbbr}${chapter} ${verse}`;
        return `<a href="#" class="inline-verse-ref" data-book-id="${bookId}" data-chapter="${chapter}" data-verse="${verse}">${label}</a>`;
      }
      return match;
    });
  }

  // Same-chapter forward/back references like "(→ v.2)" or "(→ v.10-21)" — scroll
  // to that verse within the current chapter. Only the first verse of a range is
  // used as the scroll target, unlike the #BookAbbr links above which cross into
  // a different book/chapter.
  result = result.replace(/\(→\s*v\.(\d+)(?:-\d+)?\)/gi, (match, verseIndex) => {
    return `<a href="#" class="inline-same-chapter-ref" data-target-verse-index="${verseIndex}">${match}</a>`;
  });

  return result;
}
