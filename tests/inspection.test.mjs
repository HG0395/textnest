import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze, removeZeroWidthSpaces } from '../src/core.mjs';
test('same visible accent has different encoding before normalization', () => {
  const decomposed = analyze('e\u0301'); const composed = analyze('é');
  assert.equal(decomposed.graphemes, composed.graphemes);
  assert.equal(decomposed.bytes, 3); assert.equal(composed.bytes, 2);
  assert.equal(decomposed.needsNormalization, true);
  assert.equal(composed.needsNormalization, false);
});
test('only explicit zero-width spaces removed; emoji and bidi are preserved', () => {
  const text = '신청\u200b안내👨‍👩‍👧‍👦\u200f';
  assert.equal(removeZeroWidthSpaces(text), '신청안내👨‍👩‍👧‍👦\u200f');
  assert.deepEqual(analyze(text).findings.map(f => f.code), ['U+200B', 'BIDI']);
  assert.equal(analyze('👨‍👩‍👧‍👦').findings.length, 0);
  assert.equal(analyze('👨‍👩‍👧‍👦').utf16, 11);
});
test('line targets count all rows even when display capped; nonblank duplicate positions retained', () => {
  const report = analyze('  가나  \r\n가나\n\n\nabcdef', 3);
  assert.equal(report.lineCount, 5); assert.equal(report.overLimit, 2);
  assert.deepEqual(report.duplicates, [[1,2]]);
  assert.equal(report.rows[0].characters, 6);
  assert.equal(analyze('x\n'.repeat(45), 1).rows.length, 40);
  assert.equal(analyze('').lineCount, 0);
});
