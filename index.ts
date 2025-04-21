import { convertToRomanInKey, formatKeyName } from './src/romanizer';
import { getKeySignatureAccidentals, getFifthsIndex } from './src/keydata';


const chordInput = document.getElementById('chordInput') as HTMLTextAreaElement;
const romanOutput = document.getElementById('romanOutput') as HTMLDivElement;
const sortRadios = document.querySelectorAll<HTMLInputElement>('input[name="sort"]');

type SortMode = 'alphabetical' | 'fifths' | 'score';
type Mode = 'major' | 'minor'; // minor は一時的に無効化してるっぽいけど型には残す

chordInput.addEventListener('input', updateOutput);
sortRadios.forEach(radio => radio.addEventListener('change', updateOutput));

function normalizeAccidentals(input: string): string {
  return input
    .replace(/[＃♯]/g, '#')  // 全角/音楽記号シャープ → #
    .replace(/[ｂ♭]/g, 'b'); // 全角/音楽記号フラット → b
}

const sort_button = document.querySelector('input[name="sort"]:checked') as HTMLInputElement
const sortMode = sort_button.value as SortMode;

function getRomanOutput(normalized: string): string {
  const chords = normalized.split(/\s+/);
  const romanizedByKey = generateAllRomanNumerals(chords, sortMode);
  return romanizedByKey
}

function updateOutput(): void {
  const rawChords = chordInput.value.trim()
  const normalized = normalizeAccidentals(rawChords);
  const lines = normalized.split('\n');

  const romanizedByKey = lines.map(e => getRomanOutput(e)).join("\n")
  console.log(romanizedByKey)
  romanOutput.textContent = romanizedByKey;
}

function countAccidentalsInRoman(romanized: string): number {
  const matches = romanized.match(/[♯#♭]/g);
  return matches ? matches.length : 0;
}

interface KeyDataEntry {
  displayKey: string;
  romanized: string;
  accidentalCountInRomanized: number;
  key: string;
  mode: Mode;
  fifthsIndex: number;
}

function generateAllRomanNumerals(chords: string[], sortMode: SortMode): string {
  const tonics = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const accidentals = ['', '#', 'b'];
  const modes:Mode[] = ['major', /*'minor'*/];

  const keyData: KeyDataEntry[] = [];

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
