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

  const callbacksRef = useRef({ onSpeakStart, onSpeakEnd, onError, onWake });
  useEffect(() => {
    callbacksRef.current = { onSpeakStart, onSpeakEnd, onError, onWake };
  });

  const recognitionRef = useRef(null);
  const voicesCacheRef = useRef([]);
  const langRef = useRef('en-IN');

  // PTT transcript accumulation
  const accumulatedFinalRef = useRef('');
  const lastInterimRef = useRef('');

  // Fix 1: retry counter for network errors
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 2;

  // Clap detection
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const clapMicStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const clapStateRef = useRef({ lastClapTime: 0, count: 0, isSpiking: false, spikeStart: 0, history: [] });

  // Volume detection refs (separate stream from clap detection)
  const volumeAnalyserRef = useRef(null);
  const volumeContextRef = useRef(null);
  const volumeStreamRef = useRef(null);
  const volumeFrameRef = useRef(null);
  const volumeSourceRef = useRef(null);

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

    rec.onresult = (event) => {
      let newFinal = '';
      let newInterim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        // With maxAlternatives=3, pick the first (highest confidence) alternative
        if (r.isFinal) newFinal += r[0].transcript;
        else newInterim += r[0].transcript;
      }
      if (newFinal) accumulatedFinalRef.current += ' ' + newFinal;
      lastInterimRef.current = newInterim;
      // Show live preview
      const display = (accumulatedFinalRef.current + ' ' + newInterim).trim();
      setLiveTranscript(display);
    };

    // Fix 1: improved error handling with network retry using en-US fallback
    rec.onerror = (e) => {
      const err = e.error;
      if (err === 'aborted') return;
      if (err === 'no-speech') {
        // No speech detected — this is fine, just stop
        setIsListening(false);
        return;
      }
      if (err === 'network') {
        // Retry with en-US instead of en-IN
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          try {
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.start();
            return;
          } catch (_) {}
        }
        retryCountRef.current = 0;
        setIsListening(false);
        return;
      }
      if (['not-allowed', 'service-not-allowed'].includes(err)) {
        setMicPermission('denied');
        setIsListening(false);
        return;
      }
      console.warn('[Drishti] Recognition error:', err);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    return () => { try { rec.abort(); } catch (_) {} };
  }, []);

  // Change 2: volume detection — runs while listening (separate from clap stream)
  const startVolumeDetection = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      volumeContextRef.current = ctx;
      volumeAnalyserRef.current = analyser;
      volumeStreamRef.current = stream;
      volumeSourceRef.current = source;

      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(buf);
        // Average of first 30 frequency bins (voice range)
        let sum = 0;
        for (let i = 0; i < 30; i++) sum += buf[i];
        const avg = sum / 30;
        // Normalize to 0–1, clamp
        const level = Math.min(1, Math.max(0, (avg - 10) / 80));
        setAudioLevel(level);
        volumeFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.warn('[Drishti] Volume detection failed:', e.message);
    }
  }, []);

  const stopVolumeDetection = useCallback(() => {
    if (volumeFrameRef.current) cancelAnimationFrame(volumeFrameRef.current);
    volumeStreamRef.current?.getTracks().forEach(t => t.stop());
    if (volumeContextRef.current?.state !== 'closed') volumeContextRef.current?.close();
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

  // Start PTT session
  const startListening = useCallback(async (lang = 'en-IN') => {
    if (!recognitionRef.current) return;
    if (micPermission !== 'granted') {
      const ok = await requestMicPermission();
      if (!ok) return;
    }
    langRef.current = lang;
    // Fix 1: reset retry counter on each new PTT session
    retryCountRef.current = 0;
    // Reset accumulators
    accumulatedFinalRef.current = '';
    lastInterimRef.current = '';
    setLiveTranscript('');
    try {
      recognitionRef.current.lang = lang;
      recognitionRef.current.start();
      setIsListening(true);
      // Start volume detection on a separate stream
      startVolumeDetection();
    } catch (e) {
      if (e.name === 'InvalidStateError') { setIsListening(true); return; }
      console.error('[Drishti] start failed:', e);
    }
  }, [micPermission, requestMicPermission, startVolumeDetection]);

  // Stop PTT session — returns whatever was captured
  const stopListeningAndGetTranscript = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    // Change 2: stop volume detection before returning
    stopVolumeDetection();
    setIsListening(false);
    // Return best available transcript
    const final = (accumulatedFinalRef.current + ' ' + lastInterimRef.current).trim();
    accumulatedFinalRef.current = '';
    lastInterimRef.current = '';
    return final;
  }, [stopVolumeDetection]);

  // Change 6: improved voice selection — neural/natural voices first
  const findBestVoice = useCallback((lang) => {
    const voices = voicesCacheRef.current;
    if (!voices.length) return null;

    const prefix = lang.split('-')[0];

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

  // Fix 2: race-condition-safe speak() — waits for voices, Chrome keep-alive workaround
  const speak = useCallback((text, lang = 'en-IN') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const doSpeak = () => {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = lang;
      utt.rate = 0.92;
      utt.pitch = 1.05;
      utt.volume = 1.0;

      // Try to find best voice, fall back gracefully
      const voices = window.speechSynthesis.getVoices();
      voicesCacheRef.current = voices; // keep cache fresh

      if (voices.length > 0) {
        const v = findBestVoice(lang);
        if (v) utt.voice = v;
      }

      // Chrome bug workaround: speechSynthesis sometimes stops mid-sentence.
      // Keep it alive by pausing/resuming every 10s.
      let keepAliveInterval = null;
      keepAliveInterval = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          clearInterval(keepAliveInterval);
        }
      }, 10000);

      utt.onstart = () => {
        setIsSpeaking(true);
        callbacksRef.current.onSpeakStart?.();
      };
      utt.onend = () => {
        clearInterval(keepAliveInterval);
        setIsSpeaking(false);
        callbacksRef.current.onSpeakEnd?.();
      };
      utt.onerror = (e) => {
        clearInterval(keepAliveInterval);
        setIsSpeaking(false);
        const silent = ['interrupted', 'canceled', 'synthesis-failed', 'synthesis-unavailable'];
        if (silent.includes(e.error)) {
          callbacksRef.current.onSpeakEnd?.();
          return;
        }
        callbacksRef.current.onError?.(e.error);
      };

      // ACTUALLY SPEAK
      window.speechSynthesis.speak(utt);
    };

    // If voices are already loaded, speak immediately
    if (window.speechSynthesis.getVoices().length > 0) {
      doSpeak();
    } else {
      // Wait for voices to load then speak
      const handler = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handler);
        doSpeak();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handler);
      // Timeout fallback — speak anyway after 1 second even if voices don't load
      setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', handler);
        if (!window.speechSynthesis.speaking) doSpeak();
      }, 1000);
    }
  }, [findBestVoice]);

  const stopSpeaking = useCallback(() => {
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
  };
};

export default useDrishtiVoice;