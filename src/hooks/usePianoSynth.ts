"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';

// Using F# (Fs) for consistency with Tone.js documentation examples, though it handles both.
// Updated sample map for clarity and to ensure correct note mapping.
const PIANO_SAMPLES = {
    'A0': 'A0.mp3', 'C1': 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3', 'A1': 'A1.mp3', 
    'C2': 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3', 'A2': 'A2.mp3',
    'C3': 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3', 'A3': 'A3.mp3',
    'C4': 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3', 'A4': 'A4.mp3',
    'C5': 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3', 'A5': 'A5.mp3',
    'C6': 'C6.mp3', 'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3', 'A6': 'A6.mp3',
    'C7': 'C7.mp3', 'D#7': 'Ds7.mp3', 'F#7': 'Fs7.mp3', 'A7': 'A7.mp3',
    'C8': 'C8.mp3'
};
const PIANO_BASE_URL = "https://tonejs.github.io/audio/salamander/";

const usePianoSynth = () => {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  
  const [toneStarted, setToneStarted] = useState(false); // Tracks if Tone.start() has been successfully called
  const [samplesLoading, setSamplesLoading] = useState(false); // Tracks if samples have begun loading
  const [samplesLoaded, setSamplesLoaded] = useState(false); // Tracks if samples have finished loading

  useEffect(() => {
    const newReverb = new Tone.Reverb({
      decay: 1.5,
      wet: 0.3
    }).toDestination();
    reverbRef.current = newReverb;

    const newSampler = new Tone.Sampler({
      urls: PIANO_SAMPLES,
      baseUrl: PIANO_BASE_URL,
      release: 1,
      onload: () => {
        setSamplesLoaded(true);
        setSamplesLoading(false); // Finished loading
        console.log('Piano samples loaded.');
      },
      onerror: (error) => {
        console.error("Error loading piano samples:", error);
        setSamplesLoading(false); // Finished loading (with error)
      }
    });
    
    newSampler.connect(newReverb);
    samplerRef.current = newSampler;

    return () => {
      samplerRef.current?.dispose();
      reverbRef.current?.dispose();
      // If transport was used by this hook's user, it should be managed by them.
      // For safety, we can stop it if it was started implicitly by parts.
      if (Tone.Transport.state === "started") {
        // Tone.Transport.stop(); // Be cautious if other components use Transport
        // Tone.Transport.cancel(0);
      }
    };
  }, []);

  const initPiano = useCallback(async () => {
    if (Tone.context.state !== 'running') {
      try {
        await Tone.start(); // This initializes the AudioContext
        console.log('AudioContext started successfully.');
        setToneStarted(true);
      } catch (error) {
        console.error("Error starting AudioContext:", error);
        setToneStarted(false); // Ensure state reflects failure
        throw error; 
      }
    } else {
      setToneStarted(true); // Already running
    }

    // Trigger sample loading if not already started
    if (samplerRef.current && !samplesLoading && !samplesLoaded) {
        setSamplesLoading(true);
        // Tone.Sampler typically starts loading on instantiation if urls are provided.
        // If it has an explicit load method and hasn't loaded, call it here.
        // For Tone.js Sampler, onload is the primary mechanism.
        // If samplerRef.current.loaded is false, and no explicit load method,
        // it implies loading might be deferred or failed.
        // The `onload` callback in the Sampler constructor handles `setSamplesLoaded`.
    }
  }, [samplesLoading, samplesLoaded]);

  const playNote = useCallback((note: string, time?: Tone.Unit.Time, velocity?: Tone.Unit.NormalRange) => {
    if (toneStarted && samplesLoaded && samplerRef.current) {
      samplerRef.current.triggerAttack(note, time ?? Tone.now(), velocity);
    }
  }, [toneStarted, samplesLoaded]);

  const stopNote = useCallback((note: string, time?: Tone.Unit.Time) => {
    if (toneStarted && samplesLoaded && samplerRef.current) {
      samplerRef.current.triggerRelease(note, time ?? (Tone.now() + 0.05));
    }
  }, [toneStarted, samplesLoaded]);

  return { 
    playNote, 
    stopNote, 
    initPiano,
    // isLoading reflects the sample loading phase AFTER Tone.start() succeeded
    isLoading: toneStarted && (samplesLoading || !samplesLoaded), 
    // isReady means Tone.start() succeeded AND samples are loaded
    isReady: toneStarted && samplesLoaded,
    sampler: samplerRef.current // Expose sampler for more advanced control if needed
  };
};

export default usePianoSynth;