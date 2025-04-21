"use strict";

// src/romanizer.ts
function pitchIndex(note) {
  const chromatic = ["C", "C\u266F", "D", "D\u266F", "E", "F", "F\u266F", "G", "G\u266F", "A", "A\u266F", "B"];
  const enharmonics = {
    "C\u266D": "B",
    "D\u266D": "C\u266F",
    "E\u266D": "D\u266F",
    "F\u266D": "E",
    "G\u266D": "F\u266F",
    "A\u266D": "G\u266F",
    "B\u266D": "A\u266F",
    "E\u266F": "F",
    "\u266D\u266F": "C"
  };
  return chromatic.indexOf(enharmonics[note] ?? note);
}
function romanize(note, key) {
  const tonicIndex = pitchIndex(key);
  const noteIndex = pitchIndex(note);
  const interval = (noteIndex - tonicIndex + 12) % 12;
  const roughDegree = ["I", "\u266DII", "II", "\u266DIII", "III", "IV", "\u266FIV", "V", "\u266DVI", "VI", "\u266DVII", "VII"];
  return roughDegree[interval];
}
function formatKeyName(key) {
  return key.replace("#", "\u266F").replace("\u266D", "\u266D");
}
function convertToRomanInKey(chord, key, mode) {
  const rootMatch = chord.match(/^[A-G](♯|♭)?/);
  if (!rootMatch) return chord;
  const rootNote = rootMatch[0];
  const rootRoman = romanize(rootNote, key);
  const onMatch = chord.match(/(?:on\s*|\/\s*)([A-G](♯|♭)?)/);
  let bassRoman = null;
  if (onMatch) {
    const bassNote = onMatch[1];
    bassRoman = romanize(bassNote, key);
  }
  const qualityStart = rootNote.length;
  const qualityEnd = onMatch ? onMatch.index : chord.length;
  const quality = chord.slice(qualityStart, qualityEnd).trim();
  return bassRoman ? `${rootRoman}${quality}/${bassRoman}` : `${rootRoman}${quality}`;
}

// src/keydata.ts
function getFifthsIndex(key, mode) {
  const order = [
    "C",
    "G",
    "D",
    "A",
    "E",
    "B",
    "F#",
    "C#",
    "Cb",
    "Gb",
    "Db",
    "Ab",
    "Eb",
    "Bb",
    "F"
  ];
  const refKey = mode === "major" ? key : getRelativeMajor(key);
  const index = order.indexOf(refKey);
  return index === -1 ? 99 : index;
}
function getRelativeMajor(minorKey) {
  const table = {
    "A": "C",
    "E": "G",
    "B": "D",
    "F#": "A",
    "C#": "E",
    "G#": "B",
    "D#": "F#",
    "A#": "C#",
    "D": "F",
    "G": "Bb",
    "C": "Eb",
    "F": "Ab",
    "Bb": "Db",
    "Eb": "Gb",
    "Ab": "Cb"
  };
  return table[minorKey] ?? minorKey;
}

// index.ts
var chordInput = document.getElementById("chordInput");
var romanOutput = document.getElementById("romanOutput");
var sortRadios = document.querySelectorAll('input[name="sort"]');
chordInput.addEventListener("input", updateOutput);
sortRadios.forEach((radio) => radio.addEventListener("change", updateOutput));
function normalizeAccidentals(input) {
  return input.replace(/[#＃♯]/g, "\u266F").replace(/[bｂ♭]/g, "\u266D");
}
function splitLines(text) {
  return text.split("\n");
}
function joinLines(lines) {
  return lines.join("\n");
}
function splitTokens(text) {
  return text.split(/\s+/);
}
function joinTokens(lines) {
  return lines.join(" ");
}
function createConverterOf(f) {
  return function(a, b) {
    return f(a) - f(b);
  };
}
function sortByMode(sortMode) {
  return function(keydata) {
    if (sortMode === "score") {
      return keydata.sort(createConverterOf((e) => countAccidentalsInRoman(e.romanized)));
    } else if (sortMode === "fifths") {
      return keydata.sort(createConverterOf((e) => e.fifthsIndex));
    } else if (sortMode === "alphabetical") {
      return keydata.sort((a, b) => a.tonic.localeCompare(b.tonic));
    }
  };
}
function keydataToString(keydata) {
  return `
  ${keydata.displayKey}:
  ${keydata.romanized}
  `;
}
function countAccidentalsInRoman(romanized) {
  const matches = romanized.match(/[♯♭]/g);
  return matches ? matches.length : 0;
}
function getAllKeys() {
  const alphabets = ["C", "D", "E", "F", "G", "A", "B"];
  const accidentals = ["", "\u266F", "\u266D"];
  const modes = [
    "major"
    /*'minor'*/
  ];
  const allKeys = [];
  for (const tonic of alphabets) {
    for (const acc of accidentals) {
      for (const mode of modes) {
        allKeys.push({ tonic: tonic + acc, mode });
      }
    }
  }
  return allKeys;
}
function makeKeyDataCreator(tonic, mode) {
  return function(chords) {
    const displayKey = formatKeyName(tonic) + " " + mode;
    const fifthsIndex = getFifthsIndex(tonic, mode);
    const lines = splitLines(chords);
    const converted = lines.map((e) => {
      const tokens = splitTokens(e);
      const converted2 = tokens.map((chord) => convertToRomanInKey(chord, tonic, mode));
      return joinTokens(converted2);
    });
    const romanized = joinLines(converted);
    const accidentalCountInRomanized = countAccidentalsInRoman(romanized);
    return { displayKey, romanized, accidentalCountInRomanized, tonic, mode, fifthsIndex };
  };
}
function updateOutput() {
  const sort_button = document.querySelector('input[name="sort"]:checked');
  const sortMode = sort_button.value;
  const allKeys = getAllKeys();
  const keyDataCreators = allKeys.map((e) => makeKeyDataCreator(e.tonic, e.mode));
  const rawChords = chordInput.value.trim();
  const normalized = normalizeAccidentals(rawChords);
  const keydata = keyDataCreators.map((creator) => creator(normalized));
  sortByMode(sortMode)(keydata);
  const romanized = keydata.map((e) => keydataToString(e));
  const romanizedByKey = joinLines(romanized);
  romanOutput.textContent = romanizedByKey;
}
