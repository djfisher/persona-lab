export function getAPIKeys() {
  return {
    anthropic: localStorage.getItem('persona-lab-anthropic-key') || '',
    gemini: localStorage.getItem('persona-lab-gemini-key') || ''
  };
}

export const MODELS = [
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "anthropic", thinking: true },
  { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", provider: "anthropic", thinking: false },
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", provider: "google", thinking: true, freeTier: true },
  { id: "gemini-3.0-flash-preview", name: "Gemini 3.0 Flash", provider: "google", thinking: false, freeTier: true },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "google", thinking: true, freeTier: true },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google", thinking: false, freeTier: true },
];

export async function callAPI({ modelId, system, userMessage, maxTokens = 4096, thinking = false, signal }, retries = 3) {
  const model = MODELS.find(m => m.id === modelId) || MODELS[0];
  
  if (model.provider === "anthropic") {
    return callAnthropic({ modelId: model.id, system, userMessage, maxTokens, thinking, signal }, retries);
  } else if (model.provider === "google") {
    return callGemini({ modelId: model.id, system, userMessage, maxTokens, signal }, retries);
  }
  throw new Error(`Unsupported provider: ${model.provider}`);
}

async function callAnthropic({ modelId, system, userMessage, maxTokens, thinking, signal }, retries) {
  const { anthropic: ANTHROPIC_KEY } = getAPIKeys();
  if (!ANTHROPIC_KEY) throw new Error("Missing Anthropic API Key. Please add it in Settings.");

  const body = {
    model: modelId,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userMessage }],
    ...(thinking && { thinking: { type: "adaptive" } }),
  };

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify(body),
  });

  if (resp.status === 429 && retries > 0) {
    const retryAfter = parseInt(resp.headers.get("retry-after") || "20", 10);
    await new Promise((resolve, reject) => {
      const t = setTimeout(resolve, retryAfter * 1000);
      signal?.addEventListener("abort", () => { clearTimeout(t); reject(new DOMException("Aborted", "AbortError")); });
    });
    return callAnthropic({ modelId, system, userMessage, maxTokens, thinking, signal }, retries - 1);
  }

  if (!resp.ok) {
    const errorText = await resp.text();
    let message = errorText;
    try { message = JSON.parse(errorText)?.error?.message || errorText; } catch {}
    throw new Error(`Anthropic Error ${resp.status}: ${message}`);
  }

  const data = await resp.json();
  if (data.stop_reason === "max_tokens") throw new Error("Response truncated (max_tokens hit) — try again");
  const textBlock = (data.content || []).find(c => c.type === "text");
  if (!textBlock?.text?.trim()) throw new Error("Empty API response");
  return textBlock.text;
}

async function callGemini({ modelId, system, userMessage, maxTokens, signal }, retries) {
  const { gemini: GEMINI_KEY } = getAPIKeys();
  if (!GEMINI_KEY) throw new Error("Missing Gemini API Key. Please add it in Settings.");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_KEY}`;
  
  const body = {
    contents: [{
      role: "user",
      parts: [{ text: userMessage }]
    }],
    systemInstruction: {
      parts: [{ text: system }]
    },
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7
    }
  };

  const resp = await fetch(url, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (resp.status === 429 && retries > 0) {
    await new Promise((resolve, reject) => {
      const t = setTimeout(resolve, 5000);
      signal?.addEventListener("abort", () => { clearTimeout(t); reject(new DOMException("Aborted", "AbortError")); });
    });
    return callGemini({ modelId, system, userMessage, maxTokens, signal }, retries - 1);
  }

  if (!resp.ok) {
    const errorText = await resp.text();
    let message = errorText;
    try { message = JSON.parse(errorText)?.error?.message || errorText; } catch {}
    throw new Error(`Gemini Error ${resp.status}: ${message}`);
  }

  const data = await resp.json();
  const candidate = data.candidates?.[0];
  if (candidate?.finishReason === "MAX_TOKENS") throw new Error("Response truncated (max_tokens hit) — try again");
  const text = candidate?.content?.parts?.[0]?.text;
  if (!text?.trim()) throw new Error("Empty response from Gemini");
  return text;
}

export function extractJSON(text) {
  let c = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(c); } catch {}
  const s = c.indexOf("{"), e = c.lastIndexOf("}");
  if (s !== -1 && e > s) try { return JSON.parse(c.slice(s, e + 1)); } catch {}
  throw new Error(`JSON parse failed. First 300 chars: ${text.slice(0, 300)}`);
}
