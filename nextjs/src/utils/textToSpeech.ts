/**
 * Utility for Text-to-Speech in DRISHTI.
 * Attempts to use backend TTS API, falling back to browser speechSynthesis API.
 */

export async function speakText(text: string, language: 'en' | 'kn'): Promise<void> {
  const cleanText = text.substring(0, 500); // Limit length

  try {
    // 1. Try backend Zia TTS endpoint first (POST /api/voice/tts)
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
    const response = await fetch(`${base}/voice/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText, language })
    });

    if (response.ok) {
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      await audio.play();
      return;
    }
  } catch (err) {
    console.warn('Backend TTS failed or unavailable, falling back to browser SpeechSynthesis:', err);
  }

  // 2. Fallback: Browser Web Speech API SpeechSynthesis
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.substring(0, 300));
    utterance.lang = language === 'en' ? 'en-IN' : 'kn-IN';
    utterance.rate = 0.9; // Slightly slower for better clarity

    // Basic selection of Kannada/Indian English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      language === 'en' 
        ? voice.lang.includes('en-IN') 
        : voice.lang.includes('kn-IN')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  } else {
    console.error('Text-to-speech is not supported in this browser.');
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
