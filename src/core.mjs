const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' });
export const characters = text => [...segmenter.segment(text)].length;
export function stats(text) {
  return {
    characters: characters(text),
    noSpaces: characters(text.replace(/\s/gu, '')),
    words: text.trim() ? text.trim().split(/\s+/u).length : 0,
    bytes: new TextEncoder().encode(text).length,
    lines: text ? text.split(/\r\n|\r|\n/u).length : 0
  };
}
export function clean(text, mode) {
  const normalized = text.replace(/\r\n|\r/gu, '\n');
  if (mode === 'spaces') return normalized.split('\n').map(line => line.replace(/[\t \u00a0]+/gu, ' ').trim()).join('\n');
  if (mode === 'blank') return normalized.replace(/\n[\t ]*\n(?:[\t ]*\n)*/gu, '\n\n').trim();
  if (mode === 'join') return normalized.replace(/\s+/gu, ' ').trim();
  return text;
}
export function replaceLiteral(text, find, replacement) {
  if (!find) return { text, count: 0 };
  const parts = text.split(find);
  return { text: parts.join(replacement), count: parts.length - 1 };
}
