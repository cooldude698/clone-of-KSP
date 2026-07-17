import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DrishtiChat = ({
  isOpen,
  onClose,
  transcript,
  response,
  onSendText,
  onChipClick,
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
            <button 
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
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
                </div>
             ) : (
                <div className="flex items-center justify-center h-24">
                  <span className="text-white/30 text-sm italic">Waiting for response...</span>
                </div>
             )}
          </div>

          {/* Input Fallback */}
          <div className="p-3 border-t border-white/10 bg-black/40">
             <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 focus:shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
             </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DrishtiChat;
