
"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import * as Tone from 'tone';

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
  
  const [toneStarted, setToneStarted] = useState(false);
  const [samplesLoading, setSamplesLoading] = useState(false);
  const [samplesLoaded, setSamplesLoaded] = useState(false);

  useEffect(() => {
    const newReverb = new Tone.Reverb({
      decay: 2.2, // Povećan decay za duži odjek
      wet: 0.35   // Malo povećan wet za izraženiji reverb
    }).toDestination();
    reverbRef.current = newReverb;

    const newSampler = new Tone.Sampler({
      urls: PIANO_SAMPLES,
      baseUrl: PIANO_BASE_URL,
      release: 1.8, // Povećan release za duže trajanje note nakon otpuštanja dirke
      onload: () => {
        setSamplesLoaded(true);
        setSamplesLoading(false);
        console.log('Piano samples loaded.');
      },
      onerror: (error) => {
        console.error("Error loading piano samples:", error);
        setSamplesLoading(false);
      }
    }).connect(newReverb);
    
    samplerRef.current = newSampler;

    return () => {
      samplerRef.current?.dispose();
      reverbRef.current?.dispose();
      // Transport is managed by VirtualPiano component if used for melodies
    };
  }, []);

  const initPiano = useCallback(async () => {
    if (Tone.context.state !== 'running') {
      try {
        await Tone.start();
        console.log('AudioContext started successfully.');
        setToneStarted(true);
      } catch (error) {
        console.error("Error starting AudioContext:", error);
        setToneStarted(false);
        throw error; 
      }
    } else {
      setToneStarted(true);
    }

    if (samplerRef.current && !samplesLoading && !samplesLoaded) {
        setSamplesLoading(true);
        // Sampler loads on instantiation, onload callback handles state updates.
    }
  }, [samplesLoading, samplesLoaded]);

  const playNote = useCallback((note: string, time?: Tone.Unit.Time, velocity?: Tone.Unit.NormalRange) => {
    if (toneStarted && samplesLoaded && samplerRef.current) {
      // If 'time' is provided (e.g., from Tone.Part), use it for precise scheduling.
      // Otherwise (manual play), play immediately.
      samplerRef.current.triggerAttack(note, time, velocity);
    }
  }, [toneStarted, samplesLoaded]);

  const stopNote = useCallback((note: string, time?: Tone.Unit.Time) => {
    if (toneStarted && samplesLoaded && samplerRef.current) {
      // If 'time' is provided, schedule release at that specific transport time.
      // Otherwise (manual key release or scheduled stop without specific time), release now-ish.
      samplerRef.current.triggerRelease(note, time ?? (Tone.now() + 0.05));
    }
  }, [toneStarted, samplesLoaded]);

  return { 
    playNote, 
    stopNote, 
    initPiano,
    isLoading: toneStarted && (samplesLoading || !samplesLoaded), 
    isReady: toneStarted && samplesLoaded,
    sampler: samplerRef.current 
  };
};

export default usePianoSynth;
