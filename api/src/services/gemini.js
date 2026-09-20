const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

export function parseGeminiKeys(value) {
  if (!value || !value.trim()) return [];
  let candidates;
  const trimmed = value.trim();
  if (trimmed.startsWith('[')) {
    try { candidates = JSON.parse(trimmed); } catch { throw Object.assign(new Error('Malformed GEMINI_API_KEYS'), { code: 'INVALID_CONFIGURATION' }); }
    if (!Array.isArray(candidates)) throw Object.assign(new Error('Malformed GEMINI_API_KEYS'), { code: 'INVALID_CONFIGURATION' });
  } else candidates = trimmed.split(',');
  const keys = [...new Set(candidates.filter((key) => typeof key === 'string').map((key) => key.trim()).filter(Boolean))];
  if (!keys.length) throw Object.assign(new Error('GEMINI_API_KEYS contains no usable keys'), { code: 'INVALID_CONFIGURATION' });
  return keys;
}

export class GeminiKeyManager {
  constructor(keys, fetchImpl = fetch, timeoutMs = 20_000) { this.keys = [...keys]; this.fetchImpl = fetchImpl; this.next = 0; this.timeoutMs = timeoutMs; }
  async complete(prompt, options = {}) {
    if (!this.keys.length) throw Object.assign(new Error('Gemini is not configured.'), { code: 'UNAVAILABLE' });
    let lastStatus;
    for (let attempt = 0; attempt < this.keys.length; attempt++) {
      const index = (this.next + attempt) % this.keys.length;
      let response;
      try {
        response = await this.fetchImpl('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.keys[index] }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 4096 }, ...options }), signal: AbortSignal.timeout(this.timeoutMs) });
      } catch { lastStatus = 'NETWORK'; continue; }
      if (response.ok) { this.next = index; return response.json(); }
      lastStatus = response.status;
      if (!RETRYABLE_STATUS.has(response.status)) throw Object.assign(new Error('Gemini request was rejected.'), { code: 'GEMINI_REQUEST_REJECTED', status: response.status });
    }
    throw Object.assign(new Error('All Gemini keys failed.'), { code: 'UNAVAILABLE', cause: lastStatus });
  }
}
