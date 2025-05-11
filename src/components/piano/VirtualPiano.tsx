"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { pianoNotesConfig, whiteKeysConfig, blackKeysConfig } from '@/config/pianoNotes';
import { princeIgorMelodySnippet, type MelodyNote } from '@/config/melodies';
import PianoKey from './PianoKey';
import usePianoSynth from '@/hooks/usePianoSynth';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Disc3, PlayCircle, StopCircle, Music2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";


const VirtualPiano: React.FC = () => {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const { playNote, stopNote, initPiano, isLoading, isReady, sampler } = usePianoSynth(); // sampler exposed from hook for stopMelody
  const [isMuted, setIsMuted] = useState(false);
  const [isActivatingAudio, setIsActivatingAudio] = useState(false);
  const [isPlayingMelody, setIsPlayingMelody] = useState(false);
  
  const pianoContainerRef = useRef<HTMLDivElement>(null);
  const melodyPartRef = useRef<Tone.Part<MelodyNote> | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const WHITE_KEY_WIDTH_PERCENT = 100 / whiteKeysConfig.length;
  const BLACK_KEY_HEIGHT_PERCENT = 60; 
  const BLACK_KEY_WIDTH_PERCENT = WHITE_KEY_WIDTH_PERCENT * 0.6;

  const handleInteractionStart = useCallback((note: string) => {
    if (isMuted || !isReady || isPlayingMelody) return;
    setActiveNotes(prev => new Set(prev).add(note));
    playNote(note);
  }, [playNote, isMuted, isReady, isPlayingMelody]);

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
      if (!isReady || event.repeat || isPlayingMelody) return;
      const note = keyMap[event.key.toLowerCase()];
      if (note && !activeNotes.has(note)) {
        handleInteractionStart(note);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!isReady || isPlayingMelody) return;
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
      if (melodyPartRef.current) {
        melodyPartRef.current.stop(0);
        melodyPartRef.current.dispose();
      }
      if (Tone.Transport.state === "started") {
        Tone.Transport.stop();
      }
      Tone.Transport.cancel(0);
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, [activeNotes, handleInteractionStart, handleInteractionEnd, isReady, isPlayingMelody]);

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
  

  const calculateMelodyDuration = (melody: MelodyNote[]): number => {
    if (!melody.length) return 0;
    let maxEndTime = 0;
    melody.forEach(event => {
        const startTimeSeconds = Tone.Time(event.time).toSeconds();
        const durationSeconds = Tone.Time(event.duration).toSeconds();
        const endTimeSeconds = startTimeSeconds + durationSeconds;
        if (endTimeSeconds > maxEndTime) {
            maxEndTime = endTimeSeconds;
        }
    });
    return maxEndTime;
  };

  const playMelody = useCallback(async () => {
    if (isPlayingMelody || !isReady || isLoading) return;
  
    setIsPlayingMelody(true);
    toast({ title: "Playing Melody", description: "Prince Igor snippet started." });
  
    // 1. Ensure AudioContext is running and Tone.Transport is started
    if (Tone.context.state !== 'running') {
      try {
        await Tone.start(); 
        console.log('AudioContext started for melody playback.');
      } catch (e) {
        console.error("Failed to start AudioContext for melody", e);
        setIsPlayingMelody(false);
        toast({ variant: "destructive", title: "Playback Error", description: "Could not start audio." });
        return;
      }
    }
  
    if (Tone.Transport.state !== "started") {
        try {
            await Tone.Transport.start();
            console.log('Tone.Transport started for melody playback.');
        } catch (e) {
            console.error("Failed to start Tone.Transport for melody", e);
            setIsPlayingMelody(false);
            toast({ variant: "destructive", title: "Playback Error", description: "Could not start audio transport." });
            return;
        }
    }
  
    // 2. Cleanup previous part and transport events
    if (melodyPartRef.current) {
      melodyPartRef.current.stop(0);
      melodyPartRef.current.dispose();
    }
    Tone.Transport.cancel(0); 
    if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current);
    setActiveNotes(new Set());
  
    // 3. Prepare and schedule the new part
    const partEvents = princeIgorMelodySnippet.map(event => ({
      time: event.time,
      note: event.note,
      duration: event.duration,
      value: event 
    }));
  
    melodyPartRef.current = new Tone.Part<MelodyNote>((time, value) => {
      console.log(`[MELODY PART CALLBACK] Time: ${time}, Note: ${value.note}, Duration: ${value.duration}`);
      const noteToPlay = value.note;
      
      Tone.Draw.schedule(() => {
        setActiveNotes(prev => new Set(prev).add(noteToPlay));
      }, time);
  
      playNote(noteToPlay, time); 
  
      Tone.Transport.scheduleOnce(() => {
        stopNote(noteToPlay); 
        Tone.Draw.schedule(() => {
          setActiveNotes(prev => {
            const newSet = new Set(prev);
            newSet.delete(noteToPlay);
            return newSet;
          });
        }, Tone.now());
      }, time + Tone.Time(value.duration).toSeconds());
    }, partEvents);
    
    melodyPartRef.current.loop = false;
    
    // 4. Set transport position and start the part
    Tone.Transport.position = 0;
    melodyPartRef.current.start(0); 
  
    // 5. Schedule cleanup
    const totalDurationSeconds = calculateMelodyDuration(princeIgorMelodySnippet);
    cleanupTimeoutRef.current = setTimeout(() => {
      setIsPlayingMelody(false);
      setActiveNotes(new Set());
      toast({ title: "Melody Finished" });
      // Tone.Transport.stop(); // Optionally stop transport if not needed for other things
      // Tone.Transport.position = 0;
    }, (totalDurationSeconds + 0.8) * 1000); // Increased buffer slightly
  
  }, [isPlayingMelody, isReady, isLoading, playNote, stopNote, toast]);

  const stopMelody = useCallback(() => {
    if (!isPlayingMelody) return;

    if (melodyPartRef.current) {
        melodyPartRef.current.stop(0);
        melodyPartRef.current.dispose();
        melodyPartRef.current = null;
    }
    // Stop the transport and cancel scheduled events
    if (Tone.Transport.state === "started") {
        Tone.Transport.stop();
    }
    Tone.Transport.cancel(0);
    Tone.Transport.position = 0;

    if (cleanupTimeoutRef.current) clearTimeout(cleanupTimeoutRef.current);
    
    // Explicitly stop any lingering notes from the synth and clear visual state
    // Use the sampler instance from the hook to release all notes.
    if (sampler && typeof sampler.releaseAll === 'function') {
        sampler.releaseAll(); // More robust way to stop all sounding notes from the sampler
    } else { // Fallback if releaseAll is not available or sampler is null
        activeNotes.forEach(note => {
            stopNote(note); 
        });
    }
    
    setActiveNotes(new Set());
    setIsPlayingMelody(false);
    toast({ title: "Melody Stopped" });
  }, [isPlayingMelody, activeNotes, stopNote, toast, sampler]);


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
        <Button 
          onClick={isPlayingMelody ? stopMelody : playMelody} 
          variant="outline" 
          size="icon" 
          aria-label={isPlayingMelody ? "Stop Melody" : "Play Prince Igor Snippet"}
          disabled={!isReady || isLoading}
        >
          {isPlayingMelody ? <StopCircle className="h-5 w-5" /> : <Music2 className="h-5 w-5" />}
        </Button>
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
