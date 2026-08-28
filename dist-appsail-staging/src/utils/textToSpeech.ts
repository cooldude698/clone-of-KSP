/**
 * Utility for Text-to-Speech in DRISHTI.
 * Routes audio requests through Catalyst Zia TTS (/server/drishtiVoice),
 * falling back safely if offline.
 */

let activeAudio: HTMLAudioElement | null = null;

export async function speakText(text: string, language: 'en' | 'kn' = 'en'): Promise<void> {
  const cleanText = text.substring(0, 500).replace(/[|*#`_~>]/g, ' ').trim();
  if (!cleanText) return;

  stopSpeaking();

  try {
    // 1. Primary: Catalyst Function Zia TTS endpoint
    const response = await fetch('/server/drishtiVoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'tts', text: cleanText, lang: language })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.audioBase64 && data.source === 'zia') {
        const mimeType = data.mimeType || 'audio/wav';
        const audio = new Audio(`data:${mimeType};base64,${data.audioBase64}`);
        activeAudio = audio;
        await audio.play();
        return;
      }
    }
  } catch (err) {
    console.warn('[speakText] Zia TTS endpoint unavailable:', err);
  }

  // 2. Fallback: Browser Web Speech API SpeechSynthesis
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText.substring(0, 300));
      utterance.lang = language === 'en' ? 'en-IN' : 'kn-IN';
      utterance.rate = 0.9;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        language === 'en' 
          ? voice.lang.includes('en-IN') || voice.name.toLowerCase().includes('india')
          : voice.lang.includes('kn-IN') || voice.name.toLowerCase().includes('kannada')
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  }
}

export function stopSpeaking(): void {
  if (activeAudio) {
    try { activeAudio.pause(); } catch (_) {}
    activeAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  if (activeAudio && !activeAudio.paused) return true;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
