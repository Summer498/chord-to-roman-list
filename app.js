const chordInput = document.getElementById('chordInput');
const romanOutput = document.getElementById('romanOutput');

chordInput.addEventListener('input', () => {
  const chords = chordInput.value.trim().split(/\s+/);
  const romanized = chords.map(chord => convertToRoman(chord)).join(' ');
  romanOutput.textContent = romanized;
});

// 仮の簡易変換関数（トニック=Cメジャー前提）
function convertToRoman(chord) {
  const mapping = {
    'C': 'I', 'Cm': 'i',
    'D': 'II', 'Dm': 'ii',
    'E': 'III', 'Em': 'iii',
    'F': 'IV', 'Fm': 'iv',
    'G': 'V', 'G7': 'V7', 'Gm': 'v',
    'A': 'VI', 'Am': 'vi',
    'B': 'VII', 'Bm': 'vii'
  };
  return mapping[chord] || '?';
}