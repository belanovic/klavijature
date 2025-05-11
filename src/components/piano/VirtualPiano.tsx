
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { pianoNotesConfig, whiteKeysConfig, blackKeysConfig, blackKeyOffsets } from '@/config/pianoNotes';
import type { PianoKeyConfig } from '@/config/pianoNotes';
import PianoKey from './PianoKey';
import usePianoSynth from '@/hooks/usePianoSynth';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

const VirtualPiano: React.FC = () => {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const { playNote, stopNote, ensureAudioContextStarted } = usePianoSynth();
  const [isAudioContextReady, setIsAudioContextReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const pianoContainerRef = useRef<HTMLDivElement>(null);

  const WHITE_KEY_WIDTH_PERCENT = 100 / whiteKeysConfig.length;
  const BLACK_KEY_HEIGHT_PERCENT = 60; // % of white key height
  const BLACK_KEY_WIDTH_PERCENT = WHITE_KEY_WIDTH_PERCENT * 0.6;


  const handleInteractionStart = useCallback((note: string) => {
    if (isMuted) return;
    setActiveNotes(prev => new Set(prev).add(note));
    playNote(note);
  }, [playNote, isMuted]);

  const handleInteractionEnd = useCallback((note: string) => {
    if (isMuted) return; // Ensure note release even if muted after press? Current behavior: no release if muted.
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
    stopNote(note);
  }, [stopNote, isMuted]);
  
  useEffect(() => {
    const keyMap: { [key: string]: string } = {};
    pianoNotesConfig.forEach(k => {
      if (k.keyboardKey) {
        keyMap[k.keyboardKey.toLowerCase()] = k.note;
      }
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return; // Prevent repeated notes from holding key
      const note = keyMap[event.key.toLowerCase()];
      if (note && !activeNotes.has(note)) {
        handleInteractionStart(note);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const note = keyMap[event.key.toLowerCase()];
      if (note && activeNotes.has(note)) {
        handleInteractionEnd(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeNotes, handleInteractionStart, handleInteractionEnd]);


  const handleInitAudio = async () => {
    await ensureAudioContextStarted();
    setIsAudioContextReady(true);
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    // If unmuting and some keys are visually pressed but sound was off, this won't replay them.
    // If muting, active sounds will continue until released. This is standard synth behavior.
  };

  if (!isAudioContextReady) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg shadow-xl border border-border">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Welcome to Virtual Virtuoso!</h2>
        <p className="text-muted-foreground mb-6 text-center">
          Click the button below to enable audio and start playing.
        </p>
        <Button onClick={handleInitAudio} size="lg">
          Start Piano
        </Button>
      </div>
    );
  }
  
  let blackKeyRenderIndex = 0;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-neutral-200 dark:bg-neutral-900 rounded-lg shadow-2xl">
      <div className="flex justify-end mb-2">
        <Button onClick={toggleMute} variant="ghost" size="icon" aria-label={isMuted ? "Unmute" : "Mute"}>
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>
      <div ref={pianoContainerRef} className="relative flex h-64 md:h-80 w-full rounded-md overflow-hidden border-2 border-neutral-400 dark:border-neutral-700 shadow-inner bg-white dark:bg-neutral-800">
        {/* Render White Keys */}
        {whiteKeysConfig.map((keyConfig) => (
          <PianoKey
            key={keyConfig.note}
            config={keyConfig}
            isPressed={activeNotes.has(keyConfig.note)}
            onInteractionStart={handleInteractionStart}
            onInteractionEnd={handleInteractionEnd}
            className="h-full"
            style={{ width: `${WHITE_KEY_WIDTH_PERCENT}%` }}
          />
        ))}
        {/* Render Black Keys - absolutely positioned */}
        {blackKeysConfig.map((keyConfig) => {
          const keyOctave = keyConfig.octave;
          const keyName = keyConfig.name; // e.g. C#
          
          // Find the white key that this black key is associated with (the one just before it in musical sequence)
          let precedingWhiteKeyIndexInOctave = blackKeyOffsets[keyName];
          
          // Count white keys from previous octaves
          let whiteKeysInPreviousOctaves = 0;
          for(let i = 0; i < whiteKeysConfig.length; i++) {
            if(whiteKeysConfig[i].octave < keyOctave) {
              whiteKeysInPreviousOctaves++;
            } else if (whiteKeysConfig[i].octave === keyOctave && whiteKeysConfig[i].name.length === 1 && blackKeyOffsets[keyName] > blackKeyOffsets[whiteKeysConfig[i].name]) {
              // This logic is getting complicated, need a simpler way or ensure blackKeyOffsets is global index of white keys
            }
          }
          
          // A simpler approach for positioning black keys:
          // Iterate through all notes. If current note is black, find its position relative to the start of the keyboard.
          let cumulativeOffsetFactor = 0;
          let foundBlackKey = false;
          for (const note of pianoNotesConfig) {
            if (note.note === keyConfig.note) {
              foundBlackKey = true;
              break;
            }
            if (note.type === 'white') {
                 if (note.name !== 'E' && note.name !== 'B') { // White keys that are followed by a black key effectively contribute less to the offset of next black key
                    cumulativeOffsetFactor += 1;
                 } else {
                    cumulativeOffsetFactor += 1; 
                 }
            }
          }
          // This is still not quite right. Black key positions are standard.
          // Let's use a more direct calculation based on white key index.
          // Find the index of the white key that this black key "leans on" (the one immediately to its left).
          let targetWhiteKeyGlobalIndex = -1;
          if (keyName === 'C#') targetWhiteKeyGlobalIndex = whiteKeysConfig.findIndex(wk => wk.name === 'C' && wk.octave === keyOctave);
          else if (keyName === 'D#') targetWhiteKeyGlobalIndex = whiteKeysConfig.findIndex(wk => wk.name === 'D' && wk.octave === keyOctave);
          else if (keyName === 'F#') targetWhiteKeyGlobalIndex = whiteKeysConfig.findIndex(wk => wk.name === 'F' && wk.octave === keyOctave);
          else if (keyName === 'G#') targetWhiteKeyGlobalIndex = whiteKeysConfig.findIndex(wk => wk.name === 'G' && wk.octave === keyOctave);
          else if (keyName === 'A#') targetWhiteKeyGlobalIndex = whiteKeysConfig.findIndex(wk => wk.name === 'A' && wk.octave === keyOctave);

          if (targetWhiteKeyGlobalIndex === -1) return null; // Should not happen with correct config

          const leftPosition = `calc(${(targetWhiteKeyGlobalIndex + 1) * WHITE_KEY_WIDTH_PERCENT}% - ${BLACK_KEY_WIDTH_PERCENT / 2}%)`;
          
          blackKeyRenderIndex++; // used for unique key prop if needed, but note is better

          return (
            <PianoKey
              key={keyConfig.note}
              config={keyConfig}
              isPressed={activeNotes.has(keyConfig.note)}
              onInteractionStart={handleInteractionStart}
              onInteractionEnd={handleInteractionEnd}
              className="absolute top-0"
              style={{
                left: leftPosition,
                width: `${BLACK_KEY_WIDTH_PERCENT}%`,
                height: `${BLACK_KEY_HEIGHT_PERCENT}%`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default VirtualPiano;