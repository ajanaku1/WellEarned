import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/config/env';

const getClient = () => new GoogleGenerativeAI(env.geminiApiKey);

function friendlyError(e: any): never {
  const msg = String(e?.message || e || '');
  if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
    throw new Error('AI rate limit reached. Please wait a moment and try again.');
  }
  if (msg.includes('403') || msg.includes('API key')) {
    throw new Error('Invalid API key. Check your Gemini API configuration.');
  }
  if (msg.includes('404') || msg.includes('not found')) {
    throw new Error('AI model not available. Please try again later.');
  }
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('ECONNREFUSED')) {
    throw new Error('Network error. Check your internet connection.');
  }
  throw new Error(e?.message || 'AI request failed. Please try again.');
}

export async function analyzeGemini(prompt: string, fileParts: any[] = [], options: any = {}) {
  const genAI = getClient();
  const modelConfig: any = { model: options.model || 'gemini-2.0-flash' };
  if (options.tools) modelConfig.tools = options.tools;

  const model = genAI.getGenerativeModel(modelConfig);
  const parts = [...(fileParts || []), { text: prompt }];
  const requestOptions: any = {};
  if (options.generationConfig) requestOptions.generationConfig = options.generationConfig;

  let text: string;
  try {
    const result = await model.generateContent({ contents: [{ parts }], ...requestOptions });
    text = result.response.text();
  } catch (e) {
    friendlyError(e);
  }

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return text;
  }
}

export async function streamGeminiChat(
  history: { role: 'user' | 'model'; text: string }[],
  systemPrompt: string,
  options: any,
  onChunk: (text: string) => void,
  onToolCall?: (tool: any) => void,
) {
  const genAI = getClient();
  const modelConfig: any = { model: options.model || 'gemini-2.0-flash' };
  if (options.tools) modelConfig.tools = options.tools;

  const model = genAI.getGenerativeModel(modelConfig);

  const chatConfig: any = {
    history: (history || []).slice(0, -1).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    })),
    systemInstruction: { parts: [{ text: systemPrompt }] },
  };
  if (options.generationConfig) chatConfig.generationConfig = options.generationConfig;

  const chat = model.startChat(chatConfig);
  const lastUserMsg = history?.[history.length - 1]?.text || '';

  let full = '';
  const MAX_TOOL_ROUNDS = 3;

  let result: any;
  try {
    result = await chat.sendMessageStream(lastUserMsg);
  } catch (e) {
    friendlyError(e);
  }

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const functionCalls: any[] = [];

      for await (const chunk of result.stream) {
        const parts = chunk.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.text) {
            full += part.text;
            onChunk(full);
          }
          if (part.functionCall) {
            functionCalls.push(part.functionCall);
          }
        }
      }

      if (functionCalls.length === 0) break;

      // Resolve tool calls
      if (options.toolContext) {
        for (const fc of functionCalls) {
          if (onToolCall) onToolCall({ name: fc.name, args: fc.args });

          const resolver = options.toolContext[fc.name];
          const fnResult = resolver
            ? resolver(fc.args || {})
            : { error: `Unknown function: ${fc.name}` };

          result = await chat.sendMessageStream([{
            functionResponse: {
              name: fc.name,
              response: fnResult,
            },
          }]);
        }
      } else {
        break;
      }
    }
  } catch (e) {
    if (full) return full;
    friendlyError(e);
  }

  return full;
}
