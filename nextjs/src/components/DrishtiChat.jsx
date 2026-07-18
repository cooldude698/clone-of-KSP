import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DrishtiChat = ({
  isOpen,
  onClose,
  transcript,
  response,
  onSendText,
  onChipClick,
  onDispatch,
  onExportPdf,
  language = 'en',
  onLanguageChange,
  isRecording = false,
  onPttStart,
  onPttEnd,
}) => {
  const [inputText, setInputText] = useState('');
  const responseAreaRef = useRef(null);

  // Auto-scroll response area when response changes
  useEffect(() => {
    if (responseAreaRef.current) {
      responseAreaRef.current.scrollTop = responseAreaRef.current.scrollHeight;
    }
  }, [response]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendText(inputText);
      setInputText('');
    }
  };

  const urgency = response?.urgency || 'low';

  const getUrgencyAnimation = () => {
    switch (urgency) {
      case 'critical':
        return {
          boxShadow: [
            '0 0 15px rgba(239, 68, 68, 0.4)',
            '0 0 35px rgba(239, 68, 68, 0.8)',
            '0 0 15px rgba(239, 68, 68, 0.4)'
          ],
          borderColor: 'rgba(239, 68, 68, 0.6)',
          x: [-3, 3, -3, 3, 0], // slight shake
        };
      case 'high':
        return {
          boxShadow: [
            '0 0 10px rgba(249, 115, 22, 0.3)',
            '0 0 25px rgba(249, 115, 22, 0.6)',
            '0 0 10px rgba(249, 115, 22, 0.3)'
          ],
          borderColor: 'rgba(249, 115, 22, 0.5)',
          x: 0,
        };
      case 'medium':
        return {
          boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)',
          borderColor: 'rgba(245, 158, 11, 0.4)',
          x: 0,
        };
      case 'low':
      default:
        return {
          boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)',
          borderColor: 'rgba(34, 197, 94, 0.3)',
          x: 0,
        };
    }
  };

  const getUrgencyTransition = () => {
    const baseTransition = { type: 'spring', damping: 20, stiffness: 300 };
    switch (urgency) {
      case 'critical':
        return {
          ...baseTransition,
          boxShadow: { repeat: Infinity, duration: 0.8, ease: "easeInOut" },
          x: { repeat: Infinity, duration: 0.5, repeatDelay: 1.5 }
        };
      case 'high':
        return {
          ...baseTransition,
          boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" }
        };
      default:
        return baseTransition;
    }
  };

  const dotColorClass = {
    critical: 'bg-red-500 animate-pulse',
    high: 'bg-orange-500 animate-pulse',
    medium: 'bg-amber-500',
    low: 'bg-green-500',
  }[urgency] || 'bg-green-500';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            ...getUrgencyAnimation()
          }}
          exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
          transition={getUrgencyTransition()}
          className="fixed bottom-[220px] right-6 w-[380px] max-h-[500px] flex flex-col bg-[#0a0f1e]/80 backdrop-blur-xl border rounded-2xl overflow-hidden z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${dotColorClass}`}></div>
              <span className="text-white font-semibold text-sm tracking-widest">DRISHTI</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="flex items-center gap-1 p-0.5 rounded bg-white/5 border border-white/10">
                {['en', 'kn'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => onLanguageChange && onLanguageChange(lang)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all
                      ${language === lang
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-white/50 hover:text-white'}`}
                  >
                    {lang === 'en' ? 'EN' : 'ಕನ್ನಡ'}
                  </button>
                ))}
              </div>
              <button 
                onClick={onClose}
                className="text-white/50 hover:text-white transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          </div>

          {/* Transcript Area */}
          <div className="px-4 py-3 border-b border-white/10 bg-black/40 min-h-[55px] max-h-[90px] overflow-y-auto">
             <p className="text-gray-400 italic text-sm">
                {transcript || "Listening..."}
             </p>
          </div>

          {/* Response Area */}
          <div ref={responseAreaRef} className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
             {response ? (
                <div className="flex flex-col gap-4">
                  {response.response_text && (
                      <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                        {response.response_text}
                      </p>
                  )}

                  {/* Visualization Placeholder */}
                  {response.visualization && response.visualization.type && (
                     <div className="w-full h-32 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="text-white/40 text-xs font-mono">
                           Visualization: {response.visualization.type}
                        </span>
                     </div>
                  )}

                  {/* Follow up suggestions */}
                  {response.follow_up_suggestions && response.follow_up_suggestions.length > 0 && (
                     <div className="flex flex-wrap gap-2 mt-2">
                        {response.follow_up_suggestions.map((suggestion, idx) => (
                           <motion.button
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              key={idx}
                              onClick={() => onChipClick(suggestion)}
                              className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-xs hover:bg-blue-500/20 hover:border-blue-500/50 hover:shadow-[0_0_12px_rgba(59,130,246,0.4)] transition-all text-left"
                           >
                              {suggestion}
                           </motion.button>
                        ))}
                     </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                    <button onClick={onDispatch} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-[11px] font-bold tracking-wider transition-colors shadow-lg shadow-green-500/20 border border-green-500/50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/></svg>
                      DISPATCH UNITS
                    </button>
                    <button onClick={onExportPdf} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold tracking-wider transition-colors shadow-lg shadow-indigo-500/20 border border-indigo-500/50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                      DOWNLOAD REPORT
                    </button>
                  </div>
                </div>
             ) : (
                <div className="flex items-center justify-center h-24">
                  <span className="text-white/30 text-sm italic">Waiting for response...</span>
                </div>
             )}
          </div>

          {/* Input Fallback */}
          <div className="p-3 border-t border-white/10 bg-black/40">
             <div className="flex items-center gap-2">
                {/* Hold to Talk button */}
                <button
                  id="chat-ptt-btn"
                  onMouseDown={onPttStart}
                  onMouseUp={onPttEnd}
                  onTouchStart={onPttStart}
                  onTouchEnd={onPttEnd}
                  className={`p-2 rounded-lg border transition-all flex items-center justify-center flex-shrink-0
                    ${isRecording 
                      ? 'bg-red-600 border-red-500 text-white animate-pulse'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'}`}
                  title="Hold to Talk (PTT)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" x2="12" y1="19" y2="22"/>
                  </svg>
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 focus:shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DrishtiChat;
