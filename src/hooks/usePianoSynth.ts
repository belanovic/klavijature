
"use client";

import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

const usePianoSynth = () => {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const isToneStartedRef = useRef<boolean>(false);

  useEffect(() => {
    // Initialize PolySynth with a configuration aiming for a piano-like sound.
    // For truly "realistic" sounds, Tone.Sampler with high-quality piano samples is preferred,
    // but PolySynth is used here to keep the app size small and avoid managing audio assets.
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        // fmtriangle can offer a bit more complexity than a simple sine/triangle.
        // Experimentation with 'fat' types or slightly detuned oscillators could also be considered.
        type: 'fmtriangle', 
        harmonicity: 1.2, // Adds some metallic quality, can be adjusted
        modulationType: "sine",
      },
      envelope: {
        attack: 0.01,    // Fast attack for percussive feel
        decay: 0.4,      // Moderate decay
        sustain: 0.1,    // Low sustain, typical for piano
        release: 1.2,    // Relatively long release for resonance
      },
      volume: -10 // Adjust volume to prevent clipping and balance with other sounds if any
    }).toDestination();

    // Add a simple reverb for a bit more space
    const reverb = new Tone.Reverb({
      decay: 1.5,
      wet: 0.3
    }).toDestination();
    synthRef.current.connect(reverb);


    return () => {
      synthRef.current?.dispose();
      reverb.dispose();
    };
  }, []);

  const ensureAudioContextStarted = useCallback(async () => {
    if (!isToneStartedRef.current && Tone.context.state !== 'running') {
      try {
        await Tone.start();
        isToneStartedRef.current = true;
        console.log('AudioContext started successfully.');
      } catch (error) {
        console.error("Error starting AudioContext:", error);
        // Potentially show a message to the user here
      }
    }
  }, []);

  const playNote = useCallback((note: string) => {
    // Ensure audio context is running, then play
    ensureAudioContextStarted().then(() => {
       if (synthRef.current) {
        // Play with a velocity for slight dynamics. Could be randomized or based on key press strength if available.
        synthRef.current.triggerAttack(note, Tone.now(), 0.8);
      }
    });
  }, [ensureAudioContextStarted]);

  const stopNote = useCallback((note: string) => {
    if (synthRef.current) {
      synthRef.current.triggerRelease(note, Tone.now() + 0.05); // Slight delay to avoid abrupt cutoff
    }
  }, []);

  return { playNote, stopNote, ensureAudioContextStarted };
};

export default usePianoSynth;
