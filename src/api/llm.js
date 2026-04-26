const ANTHROPIC_KEY = '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';
const GEMINI_KEY = 'AIzaSyB6vchHuJBAZ6yF7-ONnYgGZCLMPwjDBfA'; // User should fill this or we can use an env var

export const MODELS = [
  { id: "claude-3-5-sonnet-latest", name: "Claude 3.5 Sonnet", provider: "anthropic", thinking: true },
  { id: "claude-3-5-haiku-latest", name: "Claude 3.5 Haiku", provider: "anthropic", thinking: false },
  { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", provider: "google", thinking: true },
  { id: "gemini-3.0-flash-preview", name: "Gemini 3.0 Flash", provider: "google", thinking: false },
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
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    return callAnthropic({ modelId, system, userMessage, maxTokens, thinking, signal }, retries - 1);
  }

  if (!resp.ok) {
    const errorText = await resp.text();
    let message = errorText;
    try { message = JSON.parse(errorText)?.error?.message || errorText; } catch {}
    throw new Error(`Anthropic Error ${resp.status}: ${message}`);
  }

  const data = await resp.json();
  const textBlock = (data.content || []).find(c => c.type === "text");
  return textBlock?.text || "";
}

async function callGemini({ modelId, system, userMessage, maxTokens, signal }, retries) {
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
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return callGemini({ modelId, system, userMessage, maxTokens, signal }, retries - 1);
  }

  if (!resp.ok) {
    const errorText = await resp.text();
    let message = errorText;
    try { message = JSON.parse(errorText)?.error?.message || errorText; } catch {}
    throw new Error(`Gemini Error ${resp.status}: ${message}`);
  }

  const data = await resp.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

export function extractJSON(text) {
  let c = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(c); } catch {}
  const s = c.indexOf("{"), e = c.lastIndexOf("}");
  if (s !== -1 && e > s) try { return JSON.parse(c.slice(s, e + 1)); } catch {}
  throw new Error(`JSON parse failed. First 300 chars: ${text.slice(0, 300)}`);
}
