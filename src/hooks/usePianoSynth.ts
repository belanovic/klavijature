
"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';

const PIANO_SAMPLES = {
    'C3': 'C3.mp3', 'F#3': 'Fs3.mp3',
    'C4': 'C4.mp3', 'F#4': 'Fs4.mp3',
    'C5': 'C5.mp3', 'F#5': 'Fs5.mp3',
    'C6': 'C6.mp3',
    // Octave 7
    'C7': 'C7.mp3', 'F#6': 'Fs6.mp3',
    // Octave 8 (Partial) - C8 is often the highest note on a full piano
    'C8': 'C8.mp3', 'F#7': 'Fs7.mp3'
};
const PIANO_BASE_URL = "https://tonejs.github.io/audio/salamander/";

const usePianoSynth = () => {
  const samplerRef = useRef<Tone.Sampler | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  
  const [toneStarted, setToneStarted] = useState(false);
  const [samplesLoaded, setSamplesLoaded] = useState(false);

  useEffect(() => {
    const newReverb = new Tone.Reverb({
      decay: 1.5,
      wet: 0.3
    }).toDestination();
    reverbRef.current = newReverb;

    const newSampler = new Tone.Sampler({
      urls: PIANO_SAMPLES,
      baseUrl: PIANO_BASE_URL,
      release: 1, // Piano-like release
      onload: () => {
        setSamplesLoaded(true);
        console.log('Piano samples loaded.');
      }
    });
    
    newSampler.connect(newReverb);
    samplerRef.current = newSampler;

    return () => {
      samplerRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, []);

  const initPiano = useCallback(async () => {
    if (Tone.context.state !== 'running') {
      try {
        await Tone.start();
        console.log('AudioContext started successfully.');
      } catch (error) {
        console.error("Error starting AudioContext:", error);
        throw error; // Re-throw to be caught by caller
      }
    }
    setToneStarted(true);
  }, []);

  const playNote = useCallback((note: string) => {
    if (toneStarted && samplesLoaded && samplerRef.current) {
      samplerRef.current.triggerAttack(note, Tone.now());
    } else {
      // console.warn("Piano not ready or note play attempted too early.");
    }
  }, [toneStarted, samplesLoaded]);

  const stopNote = useCallback((note: string) => {
    if (toneStarted && samplesLoaded && samplerRef.current) {
      // Add a slight delay to the release for a more natural sound
      samplerRef.current.triggerRelease(note, Tone.now() + 0.05);
    }
  }, [toneStarted, samplesLoaded]);

  return { 
    playNote, 
    stopNote, 
    initPiano,
    isLoading: toneStarted && !samplesLoaded, // True after initPiano called, until samples are loaded
    isReady: toneStarted && samplesLoaded    // True when all set and ready to play
  };
};

export default usePianoSynth;

