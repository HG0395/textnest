import { analyze } from './core.mjs';
const samples = ['한 글', '👨‍👩‍👧‍👦', 'e\u0301', 'é', '신청\u200b안내', '가\n나'];
const input = document.getElementById('lab-input');
function update() {
  const report = analyze(input.value);
  document.getElementById('lab-output').textContent = `글자 묶음 ${report.graphemes} · 코드 포인트 ${report.codePoints} · UTF-16 ${report.utf16} · UTF-8 ${report.bytes} B`;
  document.getElementById('lab-codes').textContent = Array.from(input.value).slice(0,32).map(c => 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')).join(' · ') + (report.codePoints > 32 ? ' … 처음 32개만 표시' : '');
}
document.getElementById('lab-sample').addEventListener('change', e => { if (e.target.value !== '') { input.value = samples[Number(e.target.value)]; update(); } });
input.addEventListener('input', update);
update();
