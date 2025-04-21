type Note = string;
type Key = string;
type RomanNumeral = string;
type Mode = 'major' | 'minor'

function pitchIndex(note: Note): number {
  const chromatic: string[] = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  const enharmonics: Record<string, string>  = {
    'C♭': 'B', 'D♭': 'C♯', 'E♭': 'D♯', 'F♭': 'E', 'G♭': 'F♯', 'A♭': 'G♯', 'B♭': 'A♯',
    'E♯': 'F', '♭♯': 'C'
  };
  return chromatic.indexOf(enharmonics[note] ?? note);
}

function romanize(note:Note, key:Key) {
  const tonicIndex = pitchIndex(key);
  const noteIndex = pitchIndex(note);
  const interval = (noteIndex - tonicIndex + 12) % 12;
  const roughDegree: RomanNumeral[] = ['I', '♭II', 'II', '♭III', 'III', 'IV', '♯IV', 'V', '♭VI', 'VI', '♭VII', 'VII'];
  return roughDegree[interval];
}

export function formatKeyName(key: string):string {
  return key.replace('#', '\u266F').replace('♭', '\u266D');
}

export function convertToRomanInKey(chord:string, key:Key, mode:Mode):string {
  // ルート音を抽出
  const rootMatch = chord.match(/^[A-G](♯|♭)?/);
  if (!rootMatch) return chord;
  const rootNote = rootMatch[0];
  const rootRoman = romanize(rootNote, key);

  // ベース音を抽出（on表記 or /表記）
  const onMatch = chord.match(/(?:on\s*|\/\s*)([A-G](♯|♭)?)/);
  let bassRoman: RomanNumeral | null = null;
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
