const MODELS = {
  'groq/llama-3.3-70b-versatile': {
    provider: 'groq',
    model: 'llama-3.3-70b-versatile',
    label: 'Llama 3.3 70B (Groq)',
  },
  'groq/llama-3.1-8b-instant': {
    provider: 'groq',
    model: 'llama-3.1-8b-instant',
    label: 'Llama 3.1 8B (Groq)',
  },
  'gemini/gemini-2.0-flash': {
    provider: 'gemini',
    model: 'gemini-2.0-flash',
    label: 'Gemini 2.0 Flash (Google)',
  },
  'gemini/gemini-1.5-flash': {
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    label: 'Gemini 1.5 Flash (Google)',
  },
  'openai/gpt-4o-mini': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    label: 'GPT-4o Mini (OpenAI)',
    optional: true,
  },
};

const FALLBACK_ORDER = [
  { provider: 'groq', model: 'llama-3.3-70b-versatile', key: () => process.env.GROQ_API_KEY },
  { provider: 'gemini', model: 'gemini-2.0-flash', key: () => process.env.GEMINI_API_KEY },
  { provider: 'openai', model: 'gpt-4o-mini', key: () => process.env.OPENAI_API_KEY },
];

function getApiKey(provider) {
  const map = {
    groq: process.env.GROQ_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
    openai: process.env.OPENAI_API_KEY,
  };
  return map[provider] || null;
}

async function callOpenAI(model, messages, apiKey) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.4 }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${await res.text()}`);
  const json = await res.json();
  return json.choices[0].message.content;
}

async function callGroq(model, messages, apiKey) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature: 0.4 }),
  });

  if (!res.ok) throw new Error(`Groq error: ${await res.text()}`);
  const json = await res.json();
  return json.choices[0].message.content;
}

async function callGemini(model, messages, apiKey) {
  const system = messages.find((m) => m.role === 'system')?.content || '';
  const conversation = messages
    .filter((m) => m.role !== 'system')
    .map((m) => m.content)
    .join('\n\n');

  const body = {
    contents: [{ role: 'user', parts: [{ text: conversation }] }],
    generationConfig: { temperature: 0.4 },
  };
  if (system) {
    body.systemInstruction = { parts: [{ text: system }] };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) throw new Error(`Gemini error: ${await res.text()}`);
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini';
}

async function callProvider(provider, model, messages, apiKey) {
  if (provider === 'openai') return callOpenAI(model, messages, apiKey);
  if (provider === 'groq') return callGroq(model, messages, apiKey);
  if (provider === 'gemini') return callGemini(model, messages, apiKey);
  throw new Error(`Unknown provider: ${provider}`);
}

function demoResponse(modelId, task, premiumData) {
  return `[Demo AI — ${MODELS[modelId]?.label || modelId}]
Task: ${task}
Premium data acquired via x402: ${premiumData?.data || premiumData?.avaxUsd || 'N/A'}
Recommendation: AVAX shows bullish divergence. Consider monitoring yield opportunities on Fuji testnet.`;
}

function getProviderStatus() {
  return {
    groq: !!process.env.GROQ_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
  };
}

async function complete(modelId, messages) {
  const config = MODELS[modelId];
  const attempts = [];

  if (config) {
    const key = getApiKey(config.provider);
    if (key) {
      attempts.push({ provider: config.provider, model: config.model, key, label: config.label });
    }
  }

  for (const fb of FALLBACK_ORDER) {
    const key = fb.key();
    if (!key) continue;
    const exists = attempts.some((a) => a.provider === fb.provider && a.model === fb.model);
    if (!exists) {
      attempts.push({
        provider: fb.provider,
        model: fb.model,
        key,
        label: `${fb.provider}/${fb.model}`,
      });
    }
  }

  const errors = [];
  for (const attempt of attempts) {
    try {
      const text = await callProvider(attempt.provider, attempt.model, messages, attempt.key);
      return { text, provider: attempt.provider, model: attempt.model, fallback: attempt.label !== config?.label };
    } catch (err) {
      errors.push(`${attempt.label}: ${err.message}`);
    }
  }

  return { text: null, errors };
}

async function completeText(modelId, messages, premiumData, task) {
  const result = await complete(modelId, messages);
  if (result.text) return result.text;
  return demoResponse(modelId, task, premiumData);
}

module.exports = { MODELS, complete, completeText, demoResponse, getProviderStatus };
