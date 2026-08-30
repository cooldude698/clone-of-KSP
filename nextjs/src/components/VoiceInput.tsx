'use client';

import React, { useState, useEffect, useRef } from 'react';

interface VoiceInputProps {
  onTranscription: (text: string, language: 'en' | 'kn' | 'hi') => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const LANGUAGES: Array<{ id: 'en' | 'kn' | 'hi'; label: string; locale: string }> = [
  { id: 'en', label: 'EN', locale: 'en-IN' },
  { id: 'kn', label: 'ಕನ್ನಡ', locale: 'kn-IN' },
  { id: 'hi', label: 'हिंदी', locale: 'hi-IN' },
];

export default function VoiceInput({ onTranscription, onError, disabled = false }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'kn' | 'hi'>('en');
  const [isSupported, setIsSupported] = useState(true);
  const [statusText, setStatusText] = useState('Tap to speak');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for speech recognition support in the browser
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setStatusText('Speech not supported in browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      setStatusText('Listening... speak now');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setStatusText('Got it! ✓');
      onTranscription(transcript, selectedLanguage);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        setIsRecording(false);
        setStatusText('Tap to speak');
        return;
      }
      console.error('Speech recognition error:', event.error);
      onError('Voice recognition error: ' + event.error);
      setIsRecording(false);
      setStatusText('Error occurred');
    };

    recognition.onend = () => {
      setIsRecording(false);
      setTimeout(() => {
        setStatusText(isRecording ? 'Listening... speak now' : 'Tap to speak');
      }, 2000);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [selectedLanguage, onTranscription, onError]);

  const toggleLanguage = () => {
    setSelectedLanguage(prev => {
      if (prev === 'en') return 'kn';
      if (prev === 'kn') return 'hi';
      return 'en';
    });
  };

  const currentLangObj = LANGUAGES.find(l => l.id === selectedLanguage) || LANGUAGES[0];

  const startStopRecording = () => {
    if (disabled || !isSupported) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = currentLangObj.locale;
        try {
          recognitionRef.current.start();
        } catch (e: any) {
          console.error(e);
          onError('Failed to start recording: ' + e.message);
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 shadow-lg max-w-sm">
      <div className="flex items-center justify-between w-full gap-8">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Voice Assistant</span>
        <button
          onClick={toggleLanguage}
          disabled={isRecording}
          className="px-3 py-1 text-xs font-bold rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          title="Click to switch language (English / ಕನ್ನಡ / हिंदी)"
        >
          {currentLangObj.label}
        </button>
      </div>

      <button
        onClick={startStopRecording}
        disabled={disabled || !isSupported}
        className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
            : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed'
        }`}
        title={!isSupported ? 'Voice not supported in this browser. Use Chrome.' : statusText}
      >
        {isRecording ? (
          // Mic off / stop icon
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
        ) : (
          // Microphone icon
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
        )}
      </button>

      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
        {statusText}
      </span>
    </div>
  );
}
