
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { pianoNotesConfig, whiteKeysConfig, blackKeysConfig } from '@/config/pianoNotes';
// Removed MelodyNote and princeIgorMelodySnippet import
import PianoKey from './PianoKey';
import usePianoSynth from '@/hooks/usePianoSynth';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Disc3 } from 'lucide-react'; // Removed Music2, PlayCircle, StopCircle
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";


const VirtualPiano: React.FC = () => {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const { playNote, stopNote, initPiano, isLoading, isReady } = usePianoSynth(); // Removed sampler as it's not directly used now
  const [isMuted, setIsMuted] = useState(false);
  const [isActivatingAudio, setIsActivatingAudio] = useState(false);
  // Removed isPlayingMelody state
  
  const pianoContainerRef = useRef<HTMLDivElement>(null);
  // Removed melodyPartRef and cleanupTimeoutRef
  const { toast } = useToast();

  const WHITE_KEY_WIDTH_PERCENT = 100 / whiteKeysConfig.length;
  const BLACK_KEY_HEIGHT_PERCENT = 60; 
  const BLACK_KEY_WIDTH_PERCENT = WHITE_KEY_WIDTH_PERCENT * 0.6;

  const handleInteractionStart = useCallback((note: string) => {
    if (isMuted || !isReady) return; // Removed isPlayingMelody condition
    setActiveNotes(prev => new Set(prev).add(note));
    playNote(note);
  }, [playNote, isMuted, isReady]);

  const handleInteractionEnd = useCallback((note: string) => {
    if (isMuted || !isReady) return; 
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
    stopNote(note);
  }, [stopNote, isMuted, isReady]);
  
  useEffect(() => {
    const keyMap: { [key: string]: string } = {};
    pianoNotesConfig.forEach(k => {
      if (k.keyboardKey) {
        keyMap[k.keyboardKey.toLowerCase()] = k.note;
      }
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isReady || event.repeat) return; // Removed isPlayingMelody condition
      const note = keyMap[event.key.toLowerCase()];
      if (note && !activeNotes.has(note)) {
        handleInteractionStart(note);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!isReady) return; // Removed isPlayingMelody condition
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
      // Removed melody related cleanup
    };
  }, [activeNotes, handleInteractionStart, handleInteractionEnd, isReady]);

  const handleInitPiano = async () => {
    setIsActivatingAudio(true);
    try {
      await initPiano();
      toast({ title: "Piano Ready", description: "Audio initialized and samples loaded." });
    } catch (error) {
      console.error("Error initializing piano:", error);
      toast({ variant: "destructive", title: "Audio Error", description: "Could not initialize audio." });
    }
    setIsActivatingAudio(false); 
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    Tone.Destination.mute = newMutedState;
    toast({ title: newMutedState ? "Sound Muted" : "Sound On" });
  };
  
  // Removed calculateMelodyDuration, playMelody, and stopMelody functions

  if (!isReady && !isLoading && !isActivatingAudio) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg shadow-xl border border-border">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Welcome to Virtual Virtuoso!</h2>
        <p className="text-muted-foreground mb-6 text-center">
          Click the button below to enable audio and load piano samples.
        </p>
        <Button onClick={handleInitPiano} size="lg" disabled={isActivatingAudio}>
          {isActivatingAudio ? (
            <>
              <Disc3 className="mr-2 h-5 w-5 animate-spin" />
              Starting Audio...
            </>
          ) : (
            "Start Piano"
          )}
        </Button>
      </div>
    );
  }
  
  if (isLoading) {
     return (
      <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg shadow-xl border border-border">
        <Disc3 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-primary">Loading Piano Samples</h2>
        <p className="text-muted-foreground mb-4">This may take a few moments...</p>
        <Progress value={isReady ? 100 : 50} className="w-3/4" />
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 bg-neutral-200 dark:bg-neutral-900 rounded-lg shadow-2xl">
      <div className="flex justify-end items-center mb-2 space-x-2">
        {/* Removed Play/Stop Melody button */}
        <Button onClick={toggleMute} variant="ghost" size="icon" aria-label={isMuted ? "Unmute" : "Mute"} disabled={!isReady || isLoading}>
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>
      <div ref={pianoContainerRef} className="relative flex h-56 sm:h-64 md:h-80 w-full rounded-md overflow-hidden border-2 border-neutral-400 dark:border-neutral-700 shadow-inner bg-white dark:bg-neutral-800">
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
        {blackKeysConfig.map((keyConfig) => {
          const { name: keyName, octave: keyOctave } = keyConfig;
          
          let targetWhiteKeyGlobalIndex = -1;
          if (keyName === 'C#') targetWhiteKeyGlobalIndex = whiteKeysConfig.findIndex(wk => wk.name === 'C' && wk.octave === keyOctave);
          else if (keyName === 'D#') targetWhiteKeyGlobalIndex = whiteKeysConfig.findIndex(wk => wk.name === 'D' && wk.octave === keyOctave);
          else if (keyName === 'F#') targetWhiteKeyGlobalIndex = whiteKeysConfig.findIndex(wk => wk.name === 'F' && wk.octave === keyOctave);
          else if (keyName === 'G#') targetWhiteKeyGlobalIndex = whiteKeysConfig.findIndex(wk => wk.name === 'G' && wk.octave === keyOctave);
          else if (keyName === 'A#') targetWhiteKeyGlobalIndex = whiteKeysConfig.findIndex(wk => wk.name === 'A' && wk.octave === keyOctave);

          if (targetWhiteKeyGlobalIndex === -1) return null; 

          const leftPosition = `calc(${(targetWhiteKeyGlobalIndex + 1) * WHITE_KEY_WIDTH_PERCENT}% - ${BLACK_KEY_WIDTH_PERCENT / 2}%)`;
          
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
