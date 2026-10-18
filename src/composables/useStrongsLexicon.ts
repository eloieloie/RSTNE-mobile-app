// Strong's lexicon lookup for the reading view's Strong's sheet. Each language
// file is a separate lazy chunk, fetched on first use and cached afterwards.
// Data comes from OpenScriptures (CC-BY-SA), built by the web app's
// mjs-scripts/build-strongs-lexicon.mjs.

export interface StrongsEntry {
  l?: string; // lemma (original-language word)
  x?: string; // transliteration
  p?: string; // pronunciation
  d?: string; // derivation
  s?: string; // Strong's definition
  k?: string; // KJV usage
}

type Kind = 'H' | 'G';

const loaders: Record<Kind, () => Promise<{ default: Record<string, StrongsEntry> }>> = {
  H: () => import('@/data/strongs/hebrew.json') as Promise<{ default: Record<string, StrongsEntry> }>,
  G: () => import('@/data/strongs/greek.json') as Promise<{ default: Record<string, StrongsEntry> }>,
};
const cache: Partial<Record<Kind, Record<string, StrongsEntry>>> = {};

// Codes may carry a trailing sense letter (H6086a); the lexicon keys on the number alone.
export async function lookupStrongs(code: string): Promise<StrongsEntry | null> {
  const kind = code[0] as Kind;
  if (!loaders[kind]) return null;
  if (!cache[kind]) cache[kind] = (await loaders[kind]()).default;
  return cache[kind]![String(parseInt(code.slice(1), 10))] ?? null;
}
