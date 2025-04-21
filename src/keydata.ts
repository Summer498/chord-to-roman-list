export type Mode = "major" | "minor";

const majorSharps = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'] as const;
const majorFlats = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'] as const;
const minorSharps = ['A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#'] as const;
const minorFlats = ['A', 'D', 'G', 'C', 'F', 'Bb', 'Eb', 'Ab'] as const;

export function getKeySignatureAccidentals(key: string, mode: Mode): number {
  const useList:string[] = mode === 'major'
    ? [...majorSharps, ...majorFlats]
    : [...minorSharps, ...minorFlats];

  const index = useList.indexOf(key);
  if (index === -1) return 99;
  return index < 8 ? index : (index - 7);
}

export function getFifthsIndex(key: string, mode: Mode) {
  const order = [
    'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#',
    'Cb', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'
  ];
  const refKey = mode === 'major' ? key : getRelativeMajor(key);
  const index = order.indexOf(refKey);
  return index === -1 ? 99 : index;
}

function getRelativeMajor(minorKey: string): string {
  const table: Record<string, string> = {
    'A': 'C', 'E': 'G', 'B': 'D', 'F#': 'A', 'C#': 'E', 'G#': 'B', 'D#': 'F#', 'A#': 'C#',
    'D': 'F', 'G': 'Bb', 'C': 'Eb', 'F': 'Ab', 'Bb': 'Db', 'Eb': 'Gb', 'Ab': 'Cb'
  };
  return table[minorKey] ?? minorKey;
}
