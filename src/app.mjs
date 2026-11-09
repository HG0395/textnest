import { stats, clean, replaceLiteral, characters, analyze, removeZeroWidthSpaces } from './core.mjs';
const $ = id => document.getElementById(id);
const editor = $('editor');
let undo = [];
let redo = [];
let lastValue = '';
const number = n => n.toLocaleString('ko-KR');
function announce(text) { $('status').textContent = text; }
function update() {
  const s = stats(editor.value);
  for (const [key, value] of Object.entries(s)) $(key).textContent = number(value);
  const limit = Number($('limit').value) || 0;
  $('limit-status').textContent = limit ? `${number(s.characters)} / ${number(limit)}자 · ${s.characters > limit ? number(s.characters - limit) + '자 초과' : number(limit - s.characters) + '자 남음'}` : '목표 글자 수를 설정할 수 있어요';
  $('meter').max = limit || 1000;
  $('meter').value = limit ? Math.min(s.characters, limit) : 0;
  $('limit-status').classList.toggle('over', Boolean(limit && s.characters > limit));
  $('undo').disabled = !undo.length;
  $('redo').disabled = !redo.length;
  $('clear').disabled = !editor.value;
  $('download').disabled = !editor.value;
  $('copy').disabled = !editor.value;
  const selected = characters(editor.value.slice(editor.selectionStart, editor.selectionEnd));
  $('selection').textContent = selected ? `선택 ${number(selected)}자 / 전체 ${number(s.characters)}자` : `${number(s.characters)}자`;
  updateInspection();
}
function remember(previous) { undo.push(previous); if (undo.length > 60) undo.shift(); redo = []; }
function change(next, message) {
  if (next !== editor.value) { remember(editor.value); editor.value = next; lastValue = next; }
  update(); announce(message);
}
editor.addEventListener('input', e => {
  if (e.isComposing) { update(); return; }
  if (editor.value !== lastValue) { remember(lastValue); lastValue = editor.value; }
  update();
});
editor.addEventListener('compositionend', () => { if (editor.value !== lastValue) { remember(lastValue); lastValue = editor.value; } update(); });
editor.addEventListener('select', update);
$('limit').addEventListener('input', update);
document.querySelectorAll('[data-clean]').forEach(button => button.addEventListener('click', () => change(clean(editor.value, button.dataset.clean), `${button.textContent.trim()} 완료. 되돌리기로 복원할 수 있어요.`)));
$('replace').addEventListener('click', () => {
  if (!$('find').value) { announce('찾을 내용을 먼저 입력해 주세요.'); $('find').focus(); return; }
  const result = replaceLiteral(editor.value, $('find').value, $('replacement').value);
  change(result.text, `${number(result.count)}곳을 바꿨어요. 대소문자를 구분합니다.`);
});
$('undo').addEventListener('click', () => { if (!undo.length) return; redo.push(editor.value); editor.value = undo.pop(); lastValue = editor.value; update(); announce('이전 내용으로 되돌렸어요.'); });
$('redo').addEventListener('click', () => { if (!redo.length) return; undo.push(editor.value); editor.value = redo.pop(); lastValue = editor.value; update(); announce('다시 적용했어요.'); });
$('clear').addEventListener('click', () => change('', '입력 내용을 비웠어요. 되돌리기로 복원할 수 있어요.'));
$('sample').addEventListener('click', () => change('오늘의 작은 기록\n\n생각을  편하게 적고, 필요한 만큼 다듬어 보세요.\n글자 수는 바로 확인할 수 있어요. 🌿', '예시를 넣었어요. 기존 글은 되돌리기로 복원할 수 있어요.'));
$('copy').addEventListener('click', async () => { try { await navigator.clipboard.writeText(editor.value); announce('클립보드에 복사했어요.'); } catch { editor.focus(); editor.select(); announce('자동 복사가 제한되어 글을 선택했어요. Ctrl+C 또는 ⌘C로 복사해 주세요.'); } });
$('download').addEventListener('click', () => {
  const blob = new Blob([editor.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'TextNest-글.txt'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000); announce('TXT 파일 저장을 요청했어요. 브라우저 다운로드를 확인해 주세요.');
});
editor.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.isComposing) { e.preventDefault(); $(e.shiftKey ? 'redo' : 'undo').click(); }
});
function updateInspection() {
  const report = analyze(editor.value, Number($('line-limit').value));
  for (const key of ['graphemes', 'codePoints', 'utf16', 'bytes']) $('inspect-' + key).textContent = number(report[key]);
  $('normalization-note').textContent = report.needsNormalization ? 'NFC 변환 시 문자 구성이 달라집니다. 원문을 저장한 뒤 필요할 때만 적용하세요.' : 'NFC 기준으로 이미 정규화되어 있습니다.';
  $('normalize').disabled = !report.needsNormalization;
  $('remove-zero').disabled = !editor.value.includes('\u200b');
  const findings = $('findings'); findings.replaceChildren();
  if (!report.findings.length) { const p = document.createElement('p'); p.textContent = editor.value ? '검사 대상 특수 문자는 발견되지 않았습니다. 모든 유니코드 문자를 검사하는 것은 아닙니다.' : '글을 입력하면 보이지 않는 문자와 탭을 확인합니다.'; findings.append(p); }
  for (const item of report.findings) { const p = document.createElement('p'); const strong = document.createElement('strong'); strong.textContent = `${item.name} (${item.code}) ${number(item.count)}개 — `; p.append(strong, document.createTextNode(item.explanation)); findings.append(p); }
  $('line-summary').textContent = report.lineCount ? `총 ${number(report.lineCount)}줄${report.lineCount > 40 ? ' 중 첫 40줄 표시' : ''}${Number($('line-limit').value) > 0 ? ` · 제한 초과 ${number(report.overLimit)}줄` : ''}. 화면상 자동 줄바꿈은 제외합니다.` : '실제 줄바꿈을 기준으로 줄별 길이를 비교합니다.';
  const body = $('line-rows'); body.replaceChildren();
  for (const row of report.rows) { const tr = document.createElement('tr'); const limit = Number($('line-limit').value); for (const value of [row.number, row.characters, row.bytes, limit > 0 ? (row.characters > limit ? '초과' : '이내') : '—']) { const td = document.createElement('td'); td.textContent = typeof value === 'number' ? number(value) : value; tr.append(td); } if (limit > 0 && row.characters > limit) tr.className = 'over'; body.append(tr); }
  $('duplicates').textContent = report.duplicates.length ? '앞뒤 공백을 제외하고 같은 줄: ' + report.duplicates.map(positions => positions.slice(0,10).join('·') + '행' + (positions.length > 10 ? ` 외 ${number(positions.length - 10)}행` : '')).join(' / ') + '. 최대 10그룹 표시. 반복이 의도된 것인지 확인하세요.' : '같은 줄의 반복은 발견되지 않았습니다. 빈 줄은 비교에서 제외합니다.';
}
$('line-limit').addEventListener('input', updateInspection);
$('normalize').addEventListener('click', () => change(editor.value.normalize('NFC'), 'NFC 정규화를 적용했어요. 되돌리기로 복원할 수 있어요.'));
$('remove-zero').addEventListener('click', () => change(removeZeroWidthSpaces(editor.value), 'U+200B만 제거했어요. 이모지 결합자와 방향 제어 문자는 유지합니다.'));
document.querySelectorAll('[data-fixture]').forEach(button => button.addEventListener('click', () => { const fixtures = { unicode: '한 글👨‍👩‍👧‍👦\ne\u0301\né', invisible: '신청\u200b안내\n신청 안내\n신청\u00a0안내\n신청 안내', lines: '제목: 글쓰기 모임\n일시: 토요일 오후 2시\n장소: 2층 열람실\n장소: 2층 열람실' }; change(fixtures[button.dataset.fixture], '점검 예시를 불러왔어요. 기존 글은 되돌리기로 복원할 수 있어요.'); $('inspection').scrollIntoView({block:'start',behavior:'auto'}); }));
update();
