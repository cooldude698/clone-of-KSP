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

  // Clap detection
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const clapMicStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const clapStateRef = useRef({ lastClapTime: 0, count: 0, isSpiking: false, spikeStart: 0, history: [] });

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
    rec.continuous = true;       // Keep listening while PTT held
    rec.interimResults = true;   // Show live transcript
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      let newFinal = '';
      let newInterim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) newFinal += r[0].transcript;
        else newInterim += r[0].transcript;
      }
      if (newFinal) accumulatedFinalRef.current += ' ' + newFinal;
      lastInterimRef.current = newInterim;
      // Show live preview
      const display = (accumulatedFinalRef.current + ' ' + newInterim).trim();
      setLiveTranscript(display);
    };

    rec.onerror = (e) => {
      const err = e.error;
      if (['aborted', 'no-speech', 'network'].includes(err)) return;
      if (['not-allowed', 'service-not-allowed'].includes(err)) {
        setMicPermission('denied');
        setIsListening(false);
        return;
      }
      console.warn('[Drishti] Recognition error:', err);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    return () => { try { rec.abort(); } catch (_) {} };
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
    // Reset accumulators
    accumulatedFinalRef.current = '';
    lastInterimRef.current = '';
    setLiveTranscript('');
    try {
      recognitionRef.current.lang = lang;
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      if (e.name === 'InvalidStateError') { setIsListening(true); return; }
      console.error('[Drishti] start failed:', e);
    }
  }, [micPermission, requestMicPermission]);

  // Stop PTT session — returns whatever was captured
  const stopListeningAndGetTranscript = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    setIsListening(false);
    // Return best available transcript
    const final = (accumulatedFinalRef.current + ' ' + lastInterimRef.current).trim();
    accumulatedFinalRef.current = '';
    lastInterimRef.current = '';
    return final;
  }, []);

  // Best TTS voice
  const findBestVoice = useCallback((lang) => {
    const voices = voicesCacheRef.current;
    if (!voices.length) return null;
    const prefix = lang.split('-')[0];
    for (const brand of ['google', 'microsoft', 'apple']) {
      const v = voices.find(v => v.lang === lang && v.name.toLowerCase().includes(brand));
      if (v) return v;
    }
    return voices.find(v => v.lang === lang) || voices.find(v => v.lang.startsWith(prefix)) || null;
  }, []);

  const speak = useCallback((text, lang = 'en-IN') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = 0.95;
    utt.pitch = 1.0;
    const v = findBestVoice(lang);
    if (v) utt.voice = v;
    utt.onstart = () => { setIsSpeaking(true); callbacksRef.current.onSpeakStart?.(); };
    utt.onend = () => { setIsSpeaking(false); callbacksRef.current.onSpeakEnd?.(); };
    utt.onerror = (e) => {
      setIsSpeaking(false);
      // Gracefully swallow all TTS errors — never show synthesis-failed to console
      const silent = ['interrupted', 'canceled', 'synthesis-failed', 'synthesis-unavailable'];
      if (silent.includes(e.error)) { callbacksRef.current.onSpeakEnd?.(); return; }
      callbacksRef.current.onError?.(e.error);
    };
    window.speechSynthesis.speak(utt);
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
  };
};

export default useDrishtiVoice;