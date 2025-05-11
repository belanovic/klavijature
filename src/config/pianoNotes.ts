
export interface PianoKeyConfig {
  note: string; // e.g., "C3", "C#3"
  name: string; // e.g. "C", "C#" (used for display on key for some layouts, not used here)
  octave: number;
  type: 'white' | 'black';
  keyboardKey?: string; // Physical keyboard key
  label: string; // Label to display on the key (maps to keyboardKey)
  ariaLabel: string; // For accessibility, e.g. "C sharp 3"
}

// Configuration for ~1.5 octaves (C3 to E4)
// Keyboard mapping:
// White keys: a, s, d, f, g, h, j, k, l, ;
// Black keys: w, e,    t, y, u,    o, p
export const pianoNotesConfig: PianoKeyConfig[] = [
  // Octave 3
  { note: 'C3', name: 'C', octave: 3, type: 'white', keyboardKey: 'a', label: 'A', ariaLabel: 'C 3' },
  { note: 'C#3', name: 'C#', octave: 3, type: 'black', keyboardKey: 'w', label: 'W', ariaLabel: 'C sharp 3' },
  { note: 'D3', name: 'D', octave: 3, type: 'white', keyboardKey: 's', label: 'S', ariaLabel: 'D 3' },
  { note: 'D#3', name: 'D#', octave: 3, type: 'black', keyboardKey: 'e', label: 'E', ariaLabel: 'D sharp 3' },
  { note: 'E3', name: 'E', octave: 3, type: 'white', keyboardKey: 'd', label: 'D', ariaLabel: 'E 3' },
  { note: 'F3', name: 'F', octave: 3, type: 'white', keyboardKey: 'f', label: 'F', ariaLabel: 'F 3' },
  { note: 'F#3', name: 'F#', octave: 3, type: 'black', keyboardKey: 't', label: 'T', ariaLabel: 'F sharp 3' },
  { note: 'G3', name: 'G', octave: 3, type: 'white', keyboardKey: 'g', label: 'G', ariaLabel: 'G 3' },
  { note: 'G#3', name: 'G#', octave: 3, type: 'black', keyboardKey: 'y', label: 'Y', ariaLabel: 'G sharp 3' },
  { note: 'A3', name: 'A', octave: 3, type: 'white', keyboardKey: 'h', label: 'H', ariaLabel: 'A 3' },
  { note: 'A#3', name: 'A#', octave: 3, type: 'black', keyboardKey: 'u', label: 'U', ariaLabel: 'A sharp 3' },
  { note: 'B3', name: 'B', octave: 3, type: 'white', keyboardKey: 'j', label: 'J', ariaLabel: 'B 3' },
  // Octave 4
  { note: 'C4', name: 'C', octave: 4, type: 'white', keyboardKey: 'k', label: 'K', ariaLabel: 'C 4' },
  { note: 'C#4', name: 'C#', octave: 4, type: 'black', keyboardKey: 'o', label: 'O', ariaLabel: 'C sharp 4' },
  { note: 'D4', name: 'D', octave: 4, type: 'white', keyboardKey: 'l', label: 'L', ariaLabel: 'D 4' },
  { note: 'D#4', name: 'D#', octave: 4, type: 'black', keyboardKey: 'p', label: 'P', ariaLabel: 'D sharp 4' },
  { note: 'E4', name: 'E', octave: 4, type: 'white', keyboardKey: ';', label: ';', ariaLabel: 'E 4' },
];

export const whiteKeysConfig = pianoNotesConfig.filter(key => key.type === 'white');
export const blackKeysConfig = pianoNotesConfig.filter(key => key.type === 'black');

// Define relative positions for black keys. 
// Values are % of a white key width, indicating the black key's left edge relative to start of its logical white key slot.
// E.g., C# is X% into the C key's width.
// A common visual pattern: C# is ~65-70% from the left of C. D# is ~65-70% from the left of D. etc.
// We will position them based on the preceding white key index.
// C# is after the 1st white key (index 0). D# after 2nd (index 1). F# after 4th (index 3).
// The left offset for a black key: (index of preceding white key + 1) * whiteKeyWidth - (blackKeyWidth / 2)
export const blackKeyOffsets: { [keyName: string]: number } = {
  'C#': 0, // C# is related to C (index 0 in its octave of white keys)
  'D#': 1, // D# is related to D (index 1)
  'F#': 3, // F# is related to F (index 3)
  'G#': 4, // G# is related to G (index 4)
  'A#': 5, // A# is related to A (index 5)
};