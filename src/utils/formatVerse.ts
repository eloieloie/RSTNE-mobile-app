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

  return result;
}
