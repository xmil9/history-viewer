"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHistory = generateHistory;
const generative_ai_1 = require("@google/generative-ai");
const types_1 = require("./types");
const llmTimestamps = [];
const MAX_LLM_CALLS_PER_MINUTE = 10;
function formatYear(year) {
    if (year < 0)
        return `${Math.abs(year)} BCE`;
    if (year === 0)
        return '1 BCE / 1 CE';
    return `${year} CE`;
}
function formatYearRange(startYear, endYear) {
    return `${formatYear(startYear)} to ${formatYear(endYear)}`;
}
function buildPrompt(placeName, lat, lng, startYear, endYear) {
    return [
        `For ${placeName} (coordinates ${lat.toFixed(4)}, ${lng.toFixed(4)}) between ${formatYearRange(startYear, endYear)},`,
        'give a history summary. List the 10 most notable events in that period.',
        'Return ONLY valid JSON with this exact shape:',
        '{"placeName":string,"periodLabel":string,"summary":string,"events":[{"year":number,"title":string,"detail":string}],"confidence":"high"|"medium"|"low","source":"gemini"|"groq"|"ollama"|"mock"|"cache"}',
    ].join(' ');
}
function canCallLlm() {
    const now = Date.now();
    while (llmTimestamps.length > 0 && now - llmTimestamps[0] > 60_000) {
        llmTimestamps.shift();
    }
    return llmTimestamps.length < MAX_LLM_CALLS_PER_MINUTE;
}
function markLlmCall() {
    llmTimestamps.push(Date.now());
}
function extractJson(text) {
    const trimmed = text.trim();
    if (trimmed.startsWith('{')) {
        return JSON.parse(trimmed);
    }
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
        throw new Error('Model did not return JSON.');
    }
    return JSON.parse(match[0]);
}
async function callGemini(placeName, lat, lng, startYear, endYear) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key not configured');
    }
    const client = new generative_ai_1.GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: 'gemma-4-31b-it' });
    const prompt = buildPrompt(placeName, lat, lng, startYear, endYear);
    console.log('prompt:', prompt);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('output:', text);
    return types_1.historyResponseSchema.parse({
        ...extractJson(text),
        source: 'gemini',
    });
}
async function callGroq(placeName, lat, lng, startYear, endYear) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('Groq API key not configured');
    }
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.4,
            messages: [
                {
                    role: 'user',
                    content: buildPrompt(placeName, lat, lng, startYear, endYear),
                },
            ],
        }),
    });
    if (!response.ok) {
        throw new Error(`Groq responded with ${response.status}`);
    }
    const data = (await response.json());
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
        throw new Error('Groq returned an empty response');
    }
    return types_1.historyResponseSchema.parse({
        ...extractJson(text),
        source: 'groq',
    });
}
async function callOllama(placeName, lat, lng, startYear, endYear) {
    const host = process.env.OLLAMA_HOST ?? 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL ?? 'llama3.2';
    const response = await fetch(`${host}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            stream: false,
            messages: [{ role: 'user', content: buildPrompt(placeName, lat, lng, startYear, endYear) }],
        }),
    });
    if (!response.ok) {
        throw new Error(`Ollama responded with ${response.status}`);
    }
    const data = (await response.json());
    const text = data.message?.content;
    if (!text) {
        throw new Error('Ollama returned an empty response');
    }
    return types_1.historyResponseSchema.parse({
        ...extractJson(text),
        source: 'ollama',
    });
}
async function tryProvider(name, placeName, lat, lng, startYear, endYear) {
    switch (name) {
        case 'gemini':
            return callGemini(placeName, lat, lng, startYear, endYear);
        case 'groq':
            return callGroq(placeName, lat, lng, startYear, endYear);
        case 'ollama':
            return callOllama(placeName, lat, lng, startYear, endYear);
    }
}
async function generateHistory(placeName, lat, lng, startYear, endYear) {
    if (process.env.USE_MOCK_HISTORY === 'true') {
        throw new Error('Mock mode enabled');
    }
    if (!canCallLlm()) {
        throw new Error('Free-tier rate limit reached on server');
    }
    const providers = [];
    if (process.env.GEMINI_API_KEY)
        providers.push('gemini');
    if (process.env.GROQ_API_KEY)
        providers.push('groq');
    if (process.env.OLLAMA_HOST)
        providers.push('ollama');
    if (providers.length === 0) {
        throw new Error('No LLM provider configured');
    }
    let lastError = null;
    for (const provider of providers) {
        try {
            markLlmCall();
            return await tryProvider(provider, placeName, lat, lng, startYear, endYear);
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown LLM error');
        }
    }
    throw lastError ?? new Error('All LLM providers failed');
}
