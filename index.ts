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
    .replace(/[#＃♯]/g, '♯')  // 半角/全角/音楽記号シャープ → #
    .replace(/[bｂ♭]/g, '♭'); // 半角/全角/音楽記号フラット → ♭
}

function splitLines(text: string): string[] {
  return text.split('\n');
}

function joinLines(lines: string[]) {
  return lines.join("\n");
}

function splitTokens(text: string): string[] {
  return text.split(/\s+/);
}

function joinTokens(lines: string[]) {
  return lines.join(' ');
}

function createConverterOf<T>(f: (a: T) => number) {
  return function (a: T, b: T) { return f(a) - f(b) }
}

function sortByMode(sortMode: SortMode) {
  return function (keydata: KeyDataEntry[]) {
    if (sortMode === 'score') {
      return keydata.sort(createConverterOf(e => countAccidentalsInRoman(e.romanized)));
    } else if (sortMode === 'fifths') {
      return keydata.sort(createConverterOf(e => e.fifthsIndex));
    } else if (sortMode === 'alphabetical') {
      return keydata.sort((a, b) => a.tonic.localeCompare(b.tonic));
    }
  }
}

function keydataToString(keydata: KeyDataEntry) {
  return `
  ${keydata.displayKey}:
  ${keydata.romanized}
  `
}

function countAccidentalsInRoman(romanized: string): number {
  const matches = romanized.match(/[♯♭]/g);
  return matches ? matches.length : 0;
}

function getAllKeys() {
  const alphabets = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const accidentals = ['', '♯', '♭'];
  const modes: Mode[] = ['major', /*'minor'*/];

  const allKeys: { tonic: string, mode: Mode }[] = [];

  for (const tonic of alphabets) {
    for (const acc of accidentals) {
      for (const mode of modes) {
        allKeys.push({ tonic: tonic + acc, mode });
      }
    }
  }
  return allKeys
}

interface KeyDataEntry {
  displayKey: string;
  romanized: string;
  accidentalCountInRomanized: number;
  tonic: string;
  mode: Mode;
  fifthsIndex: number;
}

function makeKeyDataCreator(tonic: string, mode: Mode) {
  return function (chords: string): KeyDataEntry {
    const displayKey = formatKeyName(tonic) + ' ' + mode;
    const fifthsIndex = getFifthsIndex(tonic, mode);
    const lines = splitLines(chords)
    const converted =
      lines.map(e => {
        const tokens = splitTokens(e)
        const converted = tokens.map(chord => convertToRomanInKey(chord, tonic, mode))
        return joinTokens(converted)
      })
    const romanized = joinLines(converted)
    const accidentalCountInRomanized = countAccidentalsInRoman(romanized);
    return { displayKey, romanized, accidentalCountInRomanized, tonic, mode, fifthsIndex };
  }
}

function updateOutput(): void {
  const sort_button = document.querySelector('input[name="sort"]:checked') as HTMLInputElement
  const sortMode = sort_button.value as SortMode;

  const allKeys = getAllKeys()
  const keyDataCreators = allKeys.map(e => makeKeyDataCreator(e.tonic, e.mode))

  const rawChords = chordInput.value.trim()
  const normalized = normalizeAccidentals(rawChords);
  const keydata = keyDataCreators.map(creator => creator(normalized))
  sortByMode(sortMode)(keydata);
  const romanized = keydata.map(e => keydataToString(e));
  const romanizedByKey = joinLines(romanized)
  romanOutput.textContent = romanizedByKey;
}
