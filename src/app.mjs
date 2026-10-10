import { stats, clean, replaceLiteral, characters } from './core.mjs';
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
  $('selection').textContent = `${number(characters(editor.value.slice(editor.selectionStart, editor.selectionEnd)))}자 선택`;
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
update();
