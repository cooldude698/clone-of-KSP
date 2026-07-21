'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Mic, AlertTriangle, CheckCircle, MicOff, RefreshCw, MessageSquare } from 'lucide-react';

export default function VoiceDebugStatus({ 
  micPermission, 
  isListening, 
  error, 
  lastTranscript, 
  onTryAgain, 
  onUseText,
  consecutiveErrors = 0
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  // If no issues and not listening and not asking for prompt, don't clutter the UI
  // But wait, the prompt says "judges see mic permission status, listening state, and any errors". 
  // Let's always show it if the user just interacted or if there is an error.
  if (micPermission === 'granted' && !isListening && !error && consecutiveErrors < 2) return null;

  let stateLabel = 'Ready';
  let stateColor = 'text-success-500';
  let Icon = CheckCircle;
  let showPulse = false;

  if (consecutiveErrors >= 2) {
    stateLabel = 'Text Input Fallback Mode';
    stateColor = 'text-warning-500';
    Icon = MessageSquare;
  } else if (error) {
    stateLabel = `Error: ${error}`;
    stateColor = 'text-critical-500';
    Icon = AlertTriangle;
  } else if (micPermission === 'denied') {
    stateLabel = 'Denied';
    stateColor = 'text-critical-500';
    Icon = MicOff;
  } else if (micPermission === 'prompt') {
    stateLabel = 'Requesting mic...';
    stateColor = 'text-warning-500';
    Icon = Mic;
  } else if (isListening) {
    stateLabel = 'Listening...';
    stateColor = 'text-phosphor-500';
    Icon = Mic;
    showPulse = true;
  }

  const badge = (
    <div className="fixed top-20 right-6 z-[9999] flex flex-col items-end gap-2 pointer-events-none">
      <div className="bg-steel-800/90 backdrop-blur-sm border border-steel-600/50 rounded-lg p-2 shadow-lg flex items-center gap-2 pointer-events-auto transition-all">
        <Icon className={`w-4 h-4 ${stateColor} ${showPulse ? 'animate-pulse' : ''}`} />
        <span className={`text-xs font-mono font-bold ${stateColor}`}>
          {stateLabel}
        </span>
        {lastTranscript && (
          <span className="text-xs text-paper-100/50 max-w-[150px] truncate ml-2 border-l border-steel-600 pl-2">
            "{lastTranscript}"
          </span>
        )}
      </div>

      {error && consecutiveErrors < 2 && (
        <div className="bg-critical-500/10 border border-critical-500/30 rounded-lg p-3 backdrop-blur-sm shadow-lg pointer-events-auto max-w-xs flex flex-col gap-2 animate-fade-in">
          <p className="text-xs text-paper-100 font-mono">
            Voice system encountered an error.
          </p>
          <div className="flex gap-2">
            {onTryAgain && (
              <button 
                onClick={onTryAgain}
                className="px-3 py-1.5 bg-steel-700 hover:bg-steel-600 rounded text-xs text-paper-100 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Try Again
              </button>
            )}
            {onUseText && (
              <button 
                onClick={onUseText}
                className="px-3 py-1.5 bg-phosphor-500/20 hover:bg-phosphor-500/30 text-phosphor-500 rounded text-xs transition-colors flex items-center gap-1"
              >
                <MessageSquare className="w-3 h-3" /> Use Text
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(badge, document.body);
}
