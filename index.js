import { convertToRomanInKey, formatKeyName } from './romanizer.js';
import { getKeySignatureAccidentals, getFifthsIndex } from './keydata.js';


const chordInput = document.getElementById('chordInput');
const romanOutput = document.getElementById('romanOutput');
const sortRadios = document.querySelectorAll('input[name="sort"]');

chordInput.addEventListener('input', updateOutput);
sortRadios.forEach(radio => radio.addEventListener('change', updateOutput));

function normalizeAccidentals(input) {
  return input
    .replace(/[＃♯]/g, '#')  // 全角/音楽記号シャープ → #
    .replace(/[ｂ♭]/g, 'b'); // 全角/音楽記号フラット → b
}

function updateOutput() {
  const rawChords = chordInput.value.trim()
  const normalized = normalizeAccidentals(rawChords);
  const chords = normalized.split(/\s+/);
  const sortMode = document.querySelector('input[name="sort"]:checked').value;
  const romanizedByKey = generateAllRomanNumerals(chords, sortMode);
  romanOutput.textContent = romanizedByKey;
}

function countAccidentalsInRoman(romanized) {
  const matches = romanized.match(/[♯#♭]/g);
  console.log(matches)
  return matches ? matches.length : 0;
}

function generateAllRomanNumerals(chords, sortMode) {
  const tonics = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const accidentals = ['', '#', 'b'];
  const modes = ['major', /*'minor'*/];

  const keyData = [];

  for (const tonic of tonics) {
    for (const acc of accidentals) {
      for (const mode of modes) {
        const key = tonic + acc;
        const displayKey = formatKeyName(key) + ' ' + mode;
        const fifthsIndex = getFifthsIndex(key, mode);
        const romanized = chords.map(chord => convertToRomanInKey(chord, key, mode)).join(' ');
        const accidentalCountInRomanized = countAccidentalsInRoman(romanized);
        keyData.push({ displayKey, romanized, accidentalCountInRomanized, key, mode, fifthsIndex });
      }
    }
  }

  if (sortMode === 'score') {
    keyData.sort((a, b) => a.accidentalCountInRomanized - b.accidentalCountInRomanized);
  } else if (sortMode === 'fifths') {
    keyData.sort((a, b) => a.fifthsIndex - b.fifthsIndex);
  } else if (sortMode === 'alphabetical') {
    keyData.sort((a, b) => a.key.localeCompare(b.key) || a.mode.localeCompare(b.mode));
  }

  return keyData.map(({ displayKey, romanized }) => `${displayKey}:\n  ${romanized}`).join('\n\n');
}
