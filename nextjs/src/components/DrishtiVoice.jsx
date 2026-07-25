import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useDrishtiVoice — Privacy-first PTT voice hook
 *
 * How PTT works:
 * - continuous:true so recognition keeps capturing while held
 * - Accumulates transcript (interim + final) while PTT is held
 * - On PTT release → caller fires the accumulated text as the final query
 * - Does NOT auto-restart, does NOT listen passively
 */
const useDrishtiVoice = ({
  onSpeakStart,
  onSpeakEnd,
  onError,
  enableClapWake = false,
  onWake,
} = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [micPermission, setMicPermission] = useState('prompt');
  // Change 2: real-time audio level
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Voice debug state
  const [error, setError] = useState(null);
  const consecutiveErrorsRef = useRef(0);


  const callbacksRef = useRef({ onSpeakStart, onSpeakEnd, onError, onWake });
  useEffect(() => {
    callbacksRef.current = { onSpeakStart, onSpeakEnd, onError, onWake };
  });

  const recognitionRef = useRef(null);
  const isRecognitionRunningRef = useRef(false);
  const voicesCacheRef = useRef([]);
  const langRef = useRef('en-IN');

  // PTT transcript accumulation
  const accumulatedFinalRef = useRef('');
  const lastInterimRef = useRef('');
  const liveTranscriptRef = useRef('');

  // Fix 1: retry counter for network errors
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 2;

  // Clap detection
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const clapMicStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const clapStateRef = useRef({ lastClapTime: 0, count: 0, isSpiking: false, spikeStart: 0, history: [] });

  // Smoothed audio level — driven by transcript activity, NO second mic stream
  const smoothedLevelRef = useRef(0);
  const audioLevelFrameRef = useRef(null);
  const lastTranscriptLenRef = useRef(0);
  const audioLevelLastUpdateRef = useRef(0);

  // Check mic permission
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    navigator.permissions?.query({ name: 'microphone' }).then(r => {
      setMicPermission(r.state);
      r.onchange = () => setMicPermission(r.state);
    }).catch(() => {});
  }, []);

  // Preload voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const load = () => { voicesCacheRef.current = window.speechSynthesis.getVoices(); };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  // Build recognition once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { console.warn('[Drishti] SpeechRecognition not supported'); return; }

    const rec = new SR();
    rec.continuous = true;       // Fix: MUST be true for hold-to-talk to work properly
    rec.interimResults = true;   // Show live transcript
    rec.maxAlternatives = 3;     // Try more alternatives for better accuracy

    rec.onstart = () => { isRecognitionRunningRef.current = true; };

    rec.onresult = (event) => {
      setError(null);
      consecutiveErrorsRef.current = 0;
      let newFinal = '';
      let newInterim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) newFinal += r[0].transcript;
        else newInterim += r[0].transcript;
      }
      if (newFinal) accumulatedFinalRef.current += ' ' + newFinal;
      lastInterimRef.current = newInterim;
      const display = (accumulatedFinalRef.current + ' ' + newInterim).trim();
      liveTranscriptRef.current = display;
      setLiveTranscript(display);
    };

    // Fix 1: auto-restart recognition if Chrome closes session on silence while user wants mic ON
    rec.onerror = (e) => {
      const err = e.error;
      setError(err);
      if (err !== 'no-speech') {
        consecutiveErrorsRef.current += 1;
      }
      if (err === 'aborted') return;
      if (err === 'no-speech') {
        if (isPttPressedRef.current && !isRecognitionRunningRef.current) {
          try { rec.start(); } catch (_) {}
        } else if (!isPttPressedRef.current) {
          setIsListening(false);
        }
        return;
      }
      if (err === 'language-not-supported' || (err === 'network' && langRef.current?.startsWith('kn'))) {
        console.warn('[Drishti] kn-IN not supported by browser speech engine, falling back to en-IN preview');
        langRef.current = 'en-IN';
        try {
          rec.lang = 'en-IN';
          rec.start();
          return;
        } catch (_) {}
      }
      if (err === 'network') {
        // Retry with en-IN locale
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          try {
            recognitionRef.current.lang = 'en-IN';
            recognitionRef.current.start();
            return;
          } catch (_) {}
        }
        retryCountRef.current = 0;
        if (!isPttPressedRef.current) setIsListening(false);
        return;
      }
      if (['not-allowed', 'service-not-allowed'].includes(err)) {
        setMicPermission('denied');
        setIsListening(false);
        return;
      }
      console.warn('[Drishti] Recognition error:', err);
      if (!isPttPressedRef.current) {
        setIsListening(false);
      }
    };

    rec.onend = () => {
      isRecognitionRunningRef.current = false;
      if (isPttPressedRef.current) {
        // User wants mic to STAY ON continuously — restart recognition!
        try {
          rec.start();
        } catch (_) {
          // If start fails, retry after brief tick
          setTimeout(() => {
            if (isPttPressedRef.current && !isRecognitionRunningRef.current) {
              try { rec.start(); } catch (_) {}
            }
          }, 150);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = rec;
    return () => { try { rec.abort(); } catch (_) {} };
  }, []);

  // Smoothed audio level — driven by transcript character change rate
  // NO second getUserMedia stream — avoids the double-mic conflict that caused cutoffs.
  // The level rises when new speech is being transcribed, decays smoothly when silent.
  const startVolumeDetection = useCallback(() => {
    lastTranscriptLenRef.current = 0;
    const DECAY   = 0.88;  // exponential decay per tick (~20fps)
    const ATTACK  = 0.55;  // how fast level rises when new text arrives
    const FPS     = 50;    // ms per tick ~20fps

    const tick = () => {
      const currentLen = liveTranscriptRef.current?.length || 0;
      const delta = Math.max(0, currentLen - lastTranscriptLenRef.current);
      lastTranscriptLenRef.current = currentLen;

      // Map new characters → target level (1 char = 0.12, capped at 1.0)
      const target = delta > 0 ? Math.min(1, delta * 0.18) : 0;
      smoothedLevelRef.current = smoothedLevelRef.current * DECAY + target * (1 - DECAY) * (1 / ATTACK);
      smoothedLevelRef.current = Math.min(1, Math.max(0, smoothedLevelRef.current));

      // Throttle React state updates to ~20fps
      const now = Date.now();
      if (now - audioLevelLastUpdateRef.current >= FPS) {
        audioLevelLastUpdateRef.current = now;
        setAudioLevel(Math.round(smoothedLevelRef.current * 100) / 100);
      }

      audioLevelFrameRef.current = requestAnimationFrame(tick);
    };
    audioLevelFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const stopVolumeDetection = useCallback(() => {
    if (audioLevelFrameRef.current) cancelAnimationFrame(audioLevelFrameRef.current);
    audioLevelFrameRef.current = null;
    smoothedLevelRef.current = 0;
    setAudioLevel(0);
  }, []);

  // Request mic permission
  const requestMicPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicPermission('granted');
      return true;
    } catch {
      setMicPermission('denied');
      return false;
    }
  }, []);

  // PTT session state tracking
  const isPttPressedRef = useRef(false);

  // Start PTT session
  const startListening = useCallback(async (lang = 'en-IN') => {
    isPttPressedRef.current = true;
    setIsListening(true);
    langRef.current = lang;
    retryCountRef.current = 0;
    accumulatedFinalRef.current = '';
    lastInterimRef.current = '';
    setLiveTranscript('');

    if (micPermission !== 'granted') {
      const ok = await requestMicPermission();
      if (!ok || !isPttPressedRef.current) {
        setIsListening(false);
        isPttPressedRef.current = false;
        setError('not-allowed');
        return;
      }
    }

    if (recognitionRef.current) {
      // Try the requested language first; fall back to en-IN if unsupported
      const preferredLang = lang || 'en-IN';
      recognitionRef.current.lang = preferredLang;
      try {
        recognitionRef.current.start();
      } catch (e) {
        if (e.name !== 'InvalidStateError') {
          // Language failed — fall back to en-IN
          recognitionRef.current.lang = 'en-IN';
          try { recognitionRef.current.start(); } catch (_) {}
        }
      }
    }

    startVolumeDetection();
  }, [micPermission, requestMicPermission, startVolumeDetection]); // startVolumeDetection is now conflict-free

  // Stop PTT session — returns whatever was captured
  const stopListeningAndGetTranscript = useCallback(() => {
    isPttPressedRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    try { stopVolumeDetection(); } catch (_) {}
    setIsListening(false);
    
    const captured = (accumulatedFinalRef.current + ' ' + lastInterimRef.current).trim() || liveTranscriptRef.current?.trim() || '';
    accumulatedFinalRef.current = '';
    lastInterimRef.current = '';
    liveTranscriptRef.current = '';
    setLiveTranscript(''); // clear React state so the live bubble disappears cleanly
    return captured;
  }, [stopVolumeDetection]);

  // Change 6: improved voice selection — neural/natural voices first
  const findBestVoice = useCallback((lang) => {
    const voices = voicesCacheRef.current;
    if (!voices.length) return null;

    const prefix = lang.split('-')[0];

    // Explicit check for Kannada: if native Kannada voice available, use it; else fallback to en-IN
    if (prefix === 'kn') {
      const knVoice = voices.find(v => v.lang === 'kn-IN' || v.lang.startsWith('kn') || v.name.toLowerCase().includes('kannada'));
      if (knVoice) return knVoice;

      const inVoice = voices.find(v => v.lang === 'en-IN' || v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('ravi') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('kalpana'));
      if (inVoice) return inVoice;
    }

    // Priority 1: Neural/natural English voices (sound most human)
    const neuralKeywords = ['neural', 'natural', 'enhanced', 'premium', 'wavenet', 'journey', 'aria', 'guy', 'jenny', 'sonia', 'ryan', 'libby'];
    for (const kw of neuralKeywords) {
      const v = voices.find(v =>
        (v.lang === lang || v.lang.startsWith(prefix)) &&
        v.name.toLowerCase().includes(kw)
      );
      if (v) return v;
    }

    // Priority 2: Google voices (generally best quality)
    const google = voices.find(v => v.lang === lang && v.name.toLowerCase().includes('google'));
    if (google) return google;

    // Priority 3: Microsoft voices
    const ms = voices.find(v => v.lang === lang && v.name.toLowerCase().includes('microsoft'));
    if (ms) return ms;

    // Fallback: any matching language
    return voices.find(v => v.lang === lang) ||
           voices.find(v => v.lang.startsWith(prefix)) ||
           null;
  }, []);

  // Fix 2: race-condition-safe speak() — Neural TTS primary, Zia fallback, then Web Speech API
  const audioRef = useRef(null);

  const speak = useCallback(async (text, lang = 'en-IN') => {
    if (!text || !text.trim()) return;
    const languageCode = lang.startsWith('kn') ? 'kn' : 'en';

    // ALWAYS stop any playing audio or speech synthesis FIRST to prevent audio collision
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch (_) {}
      audioRef.current = null;
    }

    // Helper: play a base64 audio string
    const playBase64Audio = (audioBase64, mimeType, source) => {
      return new Promise((resolve, reject) => {
        try {
          const audio = new Audio();
          audioRef.current = audio;

          audio.oncanplaythrough = () => {
            setIsSpeaking(true);
            callbacksRef.current.onSpeakStart?.();
            audio.play().catch(reject);
          };
          audio.onended = () => {
            setIsSpeaking(false);
            callbacksRef.current.onSpeakEnd?.();
            resolve();
          };
          audio.onerror = (e) => {
            setIsSpeaking(false);
            reject(new Error(`Audio element error: ${e.type}`));
          };

          // Set source AFTER attaching events
          audio.src = `data:${mimeType || 'audio/mpeg'};base64,${audioBase64}`;
          audio.load();
        } catch (e) {
          reject(e);
        }
      });
    };

    // Helper for browser Web Speech API fallback
    const fallbackToBrowserSpeech = () => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      console.warn('[DRISHTI VOICE] Using Browser Web Speech API (Fallback)');

      const doSpeak = () => {
        const utt = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        voicesCacheRef.current = voices;

        const isKannada = lang.startsWith('kn');

        if (isKannada) {
          const indiaVoice = voices.find(v =>
            v.lang === 'en-IN' ||
            v.name.toLowerCase().includes('india') ||
            v.name.toLowerCase().includes('ravi') ||
            v.name.toLowerCase().includes('heera')
          ) || voices.find(v => v.lang.startsWith('en')) || null;

          utt.lang = indiaVoice ? indiaVoice.lang : 'en-IN';
          if (indiaVoice) utt.voice = indiaVoice;
          utt.rate = 0.88;
          utt.pitch = 1.0;
          utt.volume = 1.0;
        } else {
          const v = findBestVoice(lang);
          if (v) utt.voice = v;
          utt.lang = lang;

          const isGoogle = utt.voice?.name?.toLowerCase().includes('google');
          const isMicrosoft = utt.voice?.name?.toLowerCase().includes('microsoft');
          if (isGoogle) {
            utt.rate = 0.95;
            utt.pitch = 1.0;
          } else if (isMicrosoft) {
            utt.rate = 0.9;
            utt.pitch = 1.05;
          } else {
            utt.rate = 0.88;
            utt.pitch = 1.08;
          }
          utt.volume = 1.0;
        }

        utt.onstart = () => {
          setIsSpeaking(true);
          callbacksRef.current.onSpeakStart?.();
        };
        utt.onend = () => {
          setIsSpeaking(false);
          callbacksRef.current.onSpeakEnd?.();
        };
        utt.onerror = (e) => {
          setIsSpeaking(false);
          const silent = ['interrupted', 'canceled', 'synthesis-failed', 'synthesis-unavailable'];
          if (silent.includes(e.error)) {
            callbacksRef.current.onSpeakEnd?.();
            return;
          }
          callbacksRef.current.onError?.(e.error);
        };

        window.speechSynthesis.speak(utt);
      };

      setTimeout(() => {
        if (window.speechSynthesis.getVoices().length > 0) {
          doSpeak();
        } else {
          const handler = () => {
            window.speechSynthesis.removeEventListener('voiceschanged', handler);
            doSpeak();
          };
          window.speechSynthesis.addEventListener('voiceschanged', handler);
          setTimeout(() => {
            window.speechSynthesis.removeEventListener('voiceschanged', handler);
            if (!window.speechSynthesis.speaking) doSpeak();
          }, 1000);
        }
      }, 50);
    };

    // Primary path: Neural TTS / Zia via API
    try {
      console.log('[DRISHTI VOICE] Requesting Neural TTS...');
      const res = await fetch('/api/drishtiVoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'tts', text, lang: languageCode }),
      });

      if (!res.ok) throw new Error(`TTS HTTP error ${res.status}`);
      const data = await res.json();

      if (data.audioBase64 && (data.source === 'zia' || data.source === 'neural_tts')) {
        console.log(`[DRISHTI VOICE] ✅ Got audio from ${data.source}, playing...`);
        try {
          await playBase64Audio(data.audioBase64, data.mimeType || 'audio/mpeg', data.source);
          return; // success — done
        } catch (playErr) {
          console.warn('[DRISHTI VOICE] Audio playback failed, falling back to Web Speech:', playErr.message);
          setIsSpeaking(false);
        }
      } else {
        console.warn('[DRISHTI VOICE] API returned browser_fallback or empty audio, using Web Speech');
      }
    } catch (err) {
      console.warn('[DRISHTI VOICE] TTS API call failed, falling back to Web Speech API:', err.message);
    }

    // Final fallback: browser Web Speech API
    fallbackToBrowserSpeech();
  }, [findBestVoice]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.pause();
  }, []);

  const resumeSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.resume();
  }, []);

  // Double-clap wake word
  useEffect(() => {
    if (!enableClapWake || micPermission !== 'granted') return;
    let cancelled = false;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioContextRef.current = new Ctx();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        audioContextRef.current.createMediaStreamSource(stream).connect(analyserRef.current);
        clapMicStreamRef.current = stream;

        const buf = new Uint8Array(analyserRef.current.frequencyBinCount);
        const tick = () => {
          if (cancelled) return;
          analyserRef.current.getByteFrequencyData(buf);
          let lo = 0; for (let i = 1; i <= 8; i++) lo += buf[i]; lo /= 8;
          let hi = 0; for (let i = 15; i <= 45; i++) hi += buf[i]; hi /= 31;
          const energy = (lo + hi) / 2;
          const s = clapStateRef.current;
          s.history = [...(s.history || []).slice(-39), energy];
          const avg = s.history.reduce((a, v) => a + v, 0) / s.history.length;
          const isClap = energy > 28 && energy > avg * 5 && (hi / (lo + 1)) > 0.6;
          if (isClap && !s.isSpiking) { s.isSpiking = true; s.spikeStart = Date.now(); }
          if (!isClap && s.isSpiking) {
            s.isSpiking = false;
            const dur = Date.now() - s.spikeStart;
            if (dur >= 10 && dur <= 120) {
              const now = Date.now();
              const gap = now - s.lastClapTime;
              if (s.count === 1 && gap > 150 && gap < 800) {
                s.count = 0; s.lastClapTime = 0;
                callbacksRef.current.onWake?.();
              } else {
                s.count = 1; s.lastClapTime = now;
              }
            }
          }
          animFrameRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch (e) { console.warn('[Drishti] Clap init failed:', e.message); }
    };

    init();
    return () => {
      cancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      clapMicStreamRef.current?.getTracks().forEach(t => t.stop());
      if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close();
    };
  }, [enableClapWake, micPermission]);

  return {
    startListening,
    stopListeningAndGetTranscript,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    requestMicPermission,
    isListening,
    isSpeaking,
    liveTranscript,
    micPermission,
    // Change 2: expose audioLevel for the orb
    audioLevel,
    // Voice debug states
    error,
    consecutiveErrors: consecutiveErrorsRef.current,
  };
};

export default useDrishtiVoice;