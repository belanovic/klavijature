
/**
 * @fileOverview Defines melody data for automated playback.
 *
 * - MelodyNote - Interface for a single note event in a melody.
 * - princeIgorMelodySnippet - An array of MelodyNote objects representing a short theme from Borodin's "Prince Igor".
 */

export interface MelodyNote {
  note: string; // e.g., "C4" (Note name and octave)
  time: string; // Tone.js time string for when the note starts (e.g., "0:0:0" for bars:beats:sixteenths, or seconds)
  duration: string; // Tone.js time string for the note's duration (e.g., "4n" for a quarter note)
}

// A simplified snippet from Borodin's "Prince Igor" - Polovtsian Dances (Stranger in Paradise theme)
// This is a short, recognizable 4-bar phrase.
export const princeIgorMelodySnippet: MelodyNote[] = [
  // Bar 1
  { note: 'A3', time: '0:0:0', duration: '4n' },   // La
  { note: 'C4', time: '0:1:0', duration: '4n' },   // Do
  { note: 'E4', time: '0:2:0', duration: '4n' },   // Mi
  { note: 'D4', time: '0:3:0', duration: '4n' },   // Re
  // Bar 2
  { note: 'C4', time: '1:0:0', duration: '2n' },   // Do (half note)
  { note: 'A3', time: '1:2:0', duration: '2n' },   // La (half note)
  // Bar 3
  { note: 'A3', time: '2:0:0', duration: '4n' },   // La
  { note: 'C4', time: '2:1:0', duration: '4n' },   // Do
  { note: 'E4', time: '2:2:0', duration: '4n' },   // Mi
  { note: 'G4', time: '2:3:0', duration: '4n' },   // Sol
  // Bar 4
  { note: 'F4', time: '3:0:0', duration: '2n' },   // Fa
  { note: 'D4', time: '3:2:0', duration: '2n' },   // Re
];
