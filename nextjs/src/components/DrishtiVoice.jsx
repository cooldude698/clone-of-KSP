import { useState, useEffect, useCallback, useRef } from 'react';

const useDrishtiVoice = ({
  onWake,
  onTranscript,
  onSpeakStart,
  onSpeakEnd,
  onError
} = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');

  const callbacksRef = useRef({ onWake, onTranscript, onSpeakStart, onSpeakEnd, onError });
  useEffect(() => {
    callbacksRef.current = { onWake, onTranscript, onSpeakStart, onSpeakEnd, onError };
  });

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const animationFrameRef = useRef(null);
  const clapContextRef = useRef({ lastClapTime: 0, clapCount: 0, isSpiking: false });
  const recognitionRef = useRef(null);
  const audioInitializedRef = useRef(false); // one-shot guard

  // 1. Double-clap wake detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (audioInitializedRef.current) return; // already ran, skip
    audioInitializedRef.current = true;

    const initAudio = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.warn('Media devices not supported.');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
        microphoneRef.current.connect(analyserRef.current);

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

        const checkAudioLevels = () => {
          if (!analyserRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);

          // Calculate low frequency energy (bins 1-8, approx 150Hz - 1.3kHz)
          let lowEnergy = 0;
          for (let i = 1; i <= 8; i++) {
            lowEnergy += dataArray[i];
          }
          lowEnergy /= 8;

          // Calculate high frequency energy (bins 15-45, approx 2.5kHz - 7.5kHz)
          let highEnergy = 0;
          for (let i = 15; i <= 45; i++) {
            highEnergy += dataArray[i];
          }
          highEnergy /= 31;

          // Average energy of the current frame
          const currentEnergy = (lowEnergy + highEnergy) / 2;

          // Maintain a history of energy levels for running average (background noise tracker)
          const history = clapContextRef.current.history || [];
          history.push(currentEnergy);
          if (history.length > 40) history.shift();
          clapContextRef.current.history = history;

          const avgEnergy = history.reduce((sum, val) => sum + val, 0) / (history.length || 1);

          // A clap is a transient onset:
          // 1. Sudden energy spike relative to background (at least 2.2x the average background energy)
          // 2. Mid/High-frequency dominance (relaxed ratio > 0.45 to support poor built-in laptop mics)
          // 3. Minimum absolute volume to ignore quiet background noise (energy > 8)
          const isClapCandidate = currentEnergy > 8 && 
                                  currentEnergy > avgEnergy * 2.2 && 
                                  (highEnergy / (lowEnergy + 1)) > 0.45;

          if (isClapCandidate) {
            if (!clapContextRef.current.isSpiking) {
              clapContextRef.current.spikeStartTime = Date.now();
              clapContextRef.current.isSpiking = true;
            }
          } else {
            if (clapContextRef.current.isSpiking) {
              const duration = Date.now() - clapContextRef.current.spikeStartTime;
              clapContextRef.current.isSpiking = false;

              // Clap duration filter: must be very brief (10ms to 120ms)
              if (duration >= 10 && duration <= 120) {
                const now = Date.now();
                const { lastClapTime, clapCount } = clapContextRef.current;
                const timeSinceLastClap = now - lastClapTime;

                // Double clap window: 150ms to 800ms
                if (clapCount === 1 && timeSinceLastClap > 150 && timeSinceLastClap < 800) {
                  clapContextRef.current.clapCount = 0;
                  clapContextRef.current.lastClapTime = 0;
                  if (callbacksRef.current.onWake) callbacksRef.current.onWake();
                } else {
                  clapContextRef.current.clapCount = 1;
                  clapContextRef.current.lastClapTime = now;
                }
              }
            }
          }

          animationFrameRef.current = requestAnimationFrame(checkAudioLevels);
        };

        checkAudioLevels();
      } catch (error) {
        if (
          error.name === 'NotFoundError' ||
          error.name === 'NotAllowedError' ||
          error.name === 'OverconstrainedError'
        ) {
          console.warn('Microphone not available — wake detection disabled');
          return;
        }
        if (callbacksRef.current.onError) callbacksRef.current.onError(error);
      }
    };

    initAudio();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (microphoneRef.current) microphoneRef.current.disconnect();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 2. Web Speech API STT
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let currentTranscript = '';
      let isFinal = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }
      setTranscript(currentTranscript);
      if (callbacksRef.current.onTranscript) callbacksRef.current.onTranscript(currentTranscript, isFinal);
    };

    recognition.onerror = (event) => {
      if (
        event.error === 'aborted' ||
        event.error === 'no-speech' ||
        event.error === 'network'
      ) return;
      if (callbacksRef.current.onError) callbacksRef.current.onError(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const startListening = useCallback((lang = 'en-IN') => {
    if (typeof window === 'undefined' || !recognitionRef.current) return;
    try {
      recognitionRef.current.lang = lang;
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
    } catch (error) {
      console.error('Failed to start listening:', error);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (typeof window === 'undefined' || !recognitionRef.current) return;
    try {
      recognitionRef.current.abort();
      setIsListening(false);
    } catch (error) {
      console.error('Failed to stop listening:', error);
    }
  }, []);

  // 3. TTS
  const speak = useCallback((text, lang = 'en-IN') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    const voices = window.speechSynthesis.getVoices();
    const targetVoice =
      voices.find(v => v.lang === lang) ||
      voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (targetVoice) utterance.voice = targetVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (callbacksRef.current.onSpeakStart) callbacksRef.current.onSpeakStart();
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      if (callbacksRef.current.onSpeakEnd) callbacksRef.current.onSpeakEnd();
    };
    utterance.onerror = (event) => {
      setIsSpeaking(false);
      if (callbacksRef.current.onError) callbacksRef.current.onError(event.error);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  return {
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isListening,
    isSpeaking,
    transcript
  };
};

export default useDrishtiVoice;