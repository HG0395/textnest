const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' });
export function characters(text) { let count = 0; for (const _ of segmenter.segment(text)) count++; return count; }
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

// Joiners U+200D and variation selectors are deliberately not removed: emoji use them.
export const specialCharacters = [
  ['\u200b', 'U+200B', '폭 없는 공백', '복사한 단어 사이에 들어가 검색 결과가 달라질 수 있습니다.'],
  ['\ufeff', 'U+FEFF', 'BOM / 폭 없는 줄바꿈 방지 공백', '문서 중간에 있으면 눈에 보이지 않는 문자로 남습니다.'],
  ['\u00a0', 'U+00A0', '줄바꿈 방지 공백', '일반 공백과 다르며 줄바꿈 위치에 영향을 줍니다.'],
  ['\u00ad', 'U+00AD', '소프트 하이픈', '줄 끝에서만 하이픈으로 보일 수 있습니다.'],
  ['\t', 'U+0009', '탭', '정렬에 사용되지만 일반 공백 한 칸과는 다릅니다.'],
  ['\u200e\u200f\u202a\u202b\u202c\u202d\u202e\u2066\u2067\u2068\u2069', 'BIDI', '문자 방향 제어', '다국어 표시에 필요할 수 있으므로 자동 삭제하지 않습니다.']
];
export function analyze(text, lineLimit = 0) {
  const lines = text ? text.replace(/\r\n|\r/gu, '\n').split('\n') : [];
  const findings = specialCharacters.map(([values, code, name, explanation]) => {
    let count = 0; for (const char of text) if (values.includes(char)) count++;
    return { code, name, count, explanation };
  }).filter(item => item.count);
  const repeated = new Map();
  lines.forEach((line, index) => { const key = line.trim(); if (!key) return; const positions = repeated.get(key) || []; positions.push(index + 1); repeated.set(key, positions); });
  const rows = lines.map((line, index) => ({ number: index + 1, characters: characters(line), bytes: new TextEncoder().encode(line).length }));
  const overLimit = lineLimit > 0 ? rows.filter(row => row.characters > lineLimit).length : 0;
  return {
    graphemes: characters(text), codePoints: Array.from(text).length, utf16: text.length,
    bytes: new TextEncoder().encode(text).length,
    needsNormalization: text !== text.normalize('NFC'),
    findings, rows: rows.slice(0, 40), lineCount: rows.length, overLimit,
    duplicates: [...repeated.values()].filter(positions => positions.length > 1).slice(0, 10)
  };
}
export function removeZeroWidthSpaces(text) { return text.replace(/\u200b/gu, ''); }
