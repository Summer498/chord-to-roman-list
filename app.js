const chordInput = document.getElementById('chordInput');
const romanOutput = document.getElementById('romanOutput');

chordInput.addEventListener('input', () => {
  const chords = chordInput.value.trim().split(/\s+/);
  const romanizedByKey = generateAllRomanNumerals(chords);
  romanOutput.textContent = romanizedByKey;
});

function generateAllRomanNumerals(chords) {
  const tonics = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const accidentals = ['', '#', 'b'];
  const modes = ['major', 'minor'];

  const results = [];

  for (const tonic of tonics) {
    for (const acc of accidentals) {
      for (const mode of modes) {
        const key = tonic + acc;
        const displayKey = formatKeyName(tonic + acc) + ' ' + mode;
        const romanized = chords.map(chord => convertToRomanInKey(chord, key, mode)).join(' ');
        results.push(displayKey + ': ' + romanized);
      }
    }
  }

  return results.join('\n\n');
}

function formatKeyName(key) {
  return key.replace('#', '\u266F').replace('b', '\u266D');
}

function convertToRomanInKey(chord, key, mode) {
  const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // 音名を半音インデックスに変換
  function pitchIndex(note) {
    const enharmonics = {
      'Cb': 'B', 'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
      'E#': 'F', 'B#': 'C'
    };
    return chromatic.indexOf(enharmonics[note] || note);
  }

  // メジャー／ナチュラルマイナーの度数配列
  const scaleIntervals = mode === 'major'
    ? [0, 2, 4, 5, 7, 9, 11]
    : [0, 2, 3, 5, 7, 8, 10];

  const numeralSymbols = mode === 'major'
    ? ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
    : ['i', 'ii', 'III', 'iv', 'v', 'VI', 'VII'];

  const rootNote = chord.replace(/[^A-G#b]/g, '');
  const isSeventh = /7/.test(chord);
  const tonicIndex = pitchIndex(key);
  const chordIndex = pitchIndex(rootNote);
  if (tonicIndex === -1 || chordIndex === -1) return '?';

  const interval = (chordIndex - tonicIndex + 12) % 12;
  const degree = scaleIntervals.indexOf(interval);

  if (degree === -1) return '?';

  let numeral = numeralSymbols[degree];
  if (isSeventh) numeral += '7';
  return numeral;
}