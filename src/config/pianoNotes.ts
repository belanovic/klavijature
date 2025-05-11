
export interface PianoKeyConfig {
  note: string; // e.g., "C3", "C#3"
  name: string; // e.g. "C", "C#"
  octave: number;
  type: 'white' | 'black';
  keyboardKey?: string; // Physical keyboard key
  label: string; // Label to display on the key (maps to keyboardKey or empty)
  ariaLabel: string; // For accessibility, e.g. "C sharp 3"
}

// Configuration for C3 to E6
// Keyboard mapping for C3-E4:
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
  { note: 'F4', name: 'F', octave: 4, type: 'white', label: '', ariaLabel: 'F 4' },
  { note: 'F#4', name: 'F#', octave: 4, type: 'black', label: '', ariaLabel: 'F sharp 4' },
  { note: 'G4', name: 'G', octave: 4, type: 'white', label: '', ariaLabel: 'G 4' },
  { note: 'G#4', name: 'G#', octave: 4, type: 'black', label: '', ariaLabel: 'G sharp 4' },
  { note: 'A4', name: 'A', octave: 4, type: 'white', label: '', ariaLabel: 'A 4' },
  { note: 'A#4', name: 'A#', octave: 4, type: 'black', label: '', ariaLabel: 'A sharp 4' },
  { note: 'B4', name: 'B', octave: 4, type: 'white', label: '', ariaLabel: 'B 4' },

  // Octave 5
  { note: 'C5', name: 'C', octave: 5, type: 'white', label: '', ariaLabel: 'C 5' },
  { note: 'C#5', name: 'C#', octave: 5, type: 'black', label: '', ariaLabel: 'C sharp 5' },
  { note: 'D5', name: 'D', octave: 5, type: 'white', label: '', ariaLabel: 'D 5' },
  { note: 'D#5', name: 'D#', octave: 5, type: 'black', label: '', ariaLabel: 'D sharp 5' },
  { note: 'E5', name: 'E', octave: 5, type: 'white', label: '', ariaLabel: 'E 5' },
  { note: 'F5', name: 'F', octave: 5, type: 'white', label: '', ariaLabel: 'F 5' },
  { note: 'F#5', name: 'F#', octave: 5, type: 'black', label: '', ariaLabel: 'F sharp 5' },
  { note: 'G5', name: 'G', octave: 5, type: 'white', label: '', ariaLabel: 'G 5' },
  { note: 'G#5', name: 'G#', octave: 5, type: 'black', label: '', ariaLabel: 'G sharp 5' },
  { note: 'A5', name: 'A', octave: 5, type: 'white', label: '', ariaLabel: 'A 5' },
  { note: 'A#5', name: 'A#', octave: 5, type: 'black', label: '', ariaLabel: 'A sharp 5' },
  { note: 'B5', name: 'B', octave: 5, type: 'white', label: '', ariaLabel: 'B 5' },

  // Octave 6 (Partial)
  { note: 'C6', name: 'C', octave: 6, type: 'white', label: '', ariaLabel: 'C 6' },
  { note: 'C#6', name: 'C#', octave: 6, type: 'black', label: '', ariaLabel: 'C sharp 6' },
  { note: 'D6', name: 'D', octave: 6, type: 'white', label: '', ariaLabel: 'D 6' },
  { note: 'D#6', name: 'D#', octave: 6, type: 'black', label: '', ariaLabel: 'D sharp 6' },
  { note: 'E6', name: 'E', octave: 6, type: 'white', label: '', ariaLabel: 'E 6' },
];

export const whiteKeysConfig = pianoNotesConfig.filter(key => key.type === 'white');
export const blackKeysConfig = pianoNotesConfig.filter(key => key.type === 'black');

// This mapping helps position black keys relative to white keys in their octave.
// The values are not used directly as indices but as identifiers for positioning logic in VirtualPiano.tsx
export const blackKeyOffsets: { [keyName: string]: number } = {
  'C#': 0, 
  'D#': 1, 
  'F#': 3, 
  'G#': 4, 
  'A#': 5, 
};
