/**
 * speechUtils.js
 * Utility to clean markdown, URLs, tables, and formatting symbols
 * before sending text to Web Speech API / Edge TTS, ensuring natural sounding spoken output.
 */

export function cleanTextForSpeech(text) {
  if (!text) return '';

  let cleaned = text;

  // 1. Replace markdown links [text](url) with just 'text'
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 2. Remove raw URLs
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');

  // 3. Clean markdown tables: convert rows into spoken commas/sentences
  // Remove markdown table divider lines like | :--- | :--- |
  cleaned = cleaned.replace(/^\|[\s\-:]+\|\s*$/gm, '');
  // Clean table pipes '|' to pauses / commas
  cleaned = cleaned.replace(/\|/g, ', ');

  // 4. Clean markdown headings (###, ##, #)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // 5. Clean emojis and special symbols that TTS might read awkwardly
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{2600}-\u{26FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{2700}-\u{27BF}]/gu, '');

  // 6. Clean markdown formatting tokens (*, _, `, ~, >, #)
  cleaned = cleaned.replace(/[*_`~>#]/g, ' ');

  // 7. Expand common police acronyms for smoother pronunciation if helpful
  cleaned = cleaned.replace(/\bFIR\b/g, 'F.I.R.');
  cleaned = cleaned.replace(/\bCCTNS\b/g, 'C.C.T.N.S.');
  cleaned = cleaned.replace(/\bANPR\b/g, 'A.N.P.R.');
  cleaned = cleaned.replace(/\bSOP\b/g, 'S.O.P.');
  cleaned = cleaned.replace(/\bPS\b/g, 'Police Station');

  // 8. Normalize whitespace and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // 9. Cap length for speech buffer safety (first 500 characters or 2-3 sentences)
  if (cleaned.length > 500) {
    const periodIdx = cleaned.indexOf('.', 400);
    if (periodIdx !== -1 && periodIdx < 600) {
      cleaned = cleaned.substring(0, periodIdx + 1);
    } else {
      cleaned = cleaned.substring(0, 500) + '...';
    }
  }

  return cleaned;
}
