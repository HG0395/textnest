import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stats, clean, replaceLiteral } from '../src/core.mjs';
test('Korean, emoji and decomposed characters count as visible graphemes', () => {
  assert.deepEqual(stats('한 글👨‍👩‍👧‍👦'), { characters: 4, noSpaces: 3, words: 2, bytes: 32, lines: 1 });
  assert.equal(stats('e\u0301').characters, 1);
  assert.equal(stats('').lines, 0);
  assert.equal(stats('하나\r\n둘').lines, 2);
});
test('cleanup preserves paragraphs, and joins only when explicitly requested', () => {
  assert.equal(clean('  안녕\t  세상  \r\n 다음  줄 ', 'spaces'), '안녕 세상\n다음 줄');
  assert.equal(clean('하나\n \n\n\n둘', 'blank'), '하나\n\n둘');
  assert.equal(clean('하나\n\n둘', 'join'), '하나 둘');
});
test('replacement is literal including regex and dollar syntax', () => {
  assert.deepEqual(replaceLiteral('a.*a.*', '.*', '$&'), { text: 'a$&a$&', count: 2 });
  assert.deepEqual(replaceLiteral('abc', '', 'x'), { text: 'abc', count: 0 });
});
