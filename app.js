import { convertToRomanInKey, formatKeyName } from './romanizer.js';
import { getKeySignatureAccidentals, getFifthsIndex } from './keydata.js';


const chordInput = document.getElementById('chordInput');
const romanOutput = document.getElementById('romanOutput');
const sortRadios = document.querySelectorAll('input[name="sort"]');

chordInput.addEventListener('input', updateOutput);
sortRadios.forEach(radio => radio.addEventListener('change', updateOutput));

function updateOutput() {
  const chords = chordInput.value.trim().split(/\s+/);
  const sortMode = document.querySelector('input[name="sort"]:checked').value;
  const romanizedByKey = generateAllRomanNumerals(chords, sortMode);
  romanOutput.textContent = romanizedByKey;
}

function generateAllRomanNumerals(chords, sortMode) {
  const tonics = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const accidentals = ['', '#', 'b'];
  const modes = ['major', 'minor'];

  const keyData = [];

  for (const tonic of tonics) {
    for (const acc of accidentals) {
      for (const mode of modes) {
        const key = tonic + acc;
        const displayKey = formatKeyName(key) + ' ' + mode;
        const romanized = chords.map(chord => convertToRomanInKey(chord, key, mode)).join(' ');
        const accidentalsCount = getKeySignatureAccidentals(key, mode);
        const fifthsIndex = getFifthsIndex(key, mode);
        keyData.push({ displayKey, romanized, accidentalsCount, key, mode, fifthsIndex });
      }
    }
  }

  if (sortMode === 'score') {
    keyData.sort((a, b) => a.accidentalsCount - b.accidentalsCount);
  } else if (sortMode === 'fifths') {
    keyData.sort((a, b) => a.fifthsIndex - b.fifthsIndex);
  } else if (sortMode === 'alphabetical') {
    keyData.sort((a, b) => a.key.localeCompare(b.key) || a.mode.localeCompare(b.mode));
  }

  return keyData.map(({ displayKey, romanized }) => `${displayKey}:\n  ${romanized}`).join('\n\n');
}
