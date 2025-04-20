function pitchIndex(note) {
  const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const enharmonics = {
    'Cb': 'B', 'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
    'E#': 'F', 'B#': 'C'
  };
  return chromatic.indexOf(enharmonics[note] || note);
}

function romanize(note, key) {
  const tonicIndex = pitchIndex(key);
  const noteIndex = pitchIndex(note);
  const interval = (noteIndex - tonicIndex + 12) % 12;
  const roughDegree = ['I', '♭II', 'II', '♭III', 'III', 'IV', '#IV', 'V', '♭VI', 'VI', '♭VII', 'VII'];
  return roughDegree[interval];
}

export function formatKeyName(key) {
  return key.replace('#', '\u266F').replace('b', '\u266D');
}

export function convertToRomanInKey(chord, key, mode) {
  // ルート音を抽出
  const rootMatch = chord.match(/^[A-G](#|b)?/);
  if (!rootMatch) return chord;
  const rootNote = rootMatch[0];
  const rootRoman = romanize(rootNote, key);

  // ベース音を抽出（on表記 or /表記）
  const onMatch = chord.match(/(?:on\s*|\/\s*)([A-G](#|b)?)/);
  let bassRoman = null;
  if (onMatch) {
    const bassNote = onMatch[1];
    bassRoman = romanize(bassNote, key);
  }

  // クオリティ部分（ルート音・on記法以外）を取り出す
  const qualityStart = rootNote.length;
  const qualityEnd = onMatch ? onMatch.index : chord.length;
  const quality = chord.slice(qualityStart, qualityEnd).trim();

  // 組み立て
  return bassRoman
    ? `${rootRoman}${quality}/${bassRoman}`
    : `${rootRoman}${quality}`;
}
