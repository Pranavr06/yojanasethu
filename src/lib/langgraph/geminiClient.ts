// @ts-ignore
import { GoogleGenAI } from '@google/genai';

export const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
];

export interface GeminiCallConfig {
  temperature?: number;
  maxOutputTokens?: number;
  systemInstruction?: string;
  timeoutMs?: number;
}

export interface StructuredCallParams<T> {
  prompt: string;
  schema?: Record<string, any>;
  config?: GeminiCallConfig;
  audioBase64?: string;
  audioMimeType?: string;
  fallbackValue?: T;
}

export interface TextCallParams {
  prompt: string;
  systemInstruction?: string;
  config?: GeminiCallConfig;
  fallbackText?: string;
}

export interface GeminiResponse<T> {
  success: boolean;
  data?: T;
  text?: string;
  modelUsed?: string;
  latencyMs?: number;
  error?: string;
}

/**
 * Robust server-side Gemini invocation with cascading model fallback and structured JSON parsing.
 */
export async function invokeGeminiStructured<T>(
  params: StructuredCallParams<T>
): Promise<GeminiResponse<T>> {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    if (params.fallbackValue !== undefined) {
      return {
        success: false,
        data: params.fallbackValue,
        error: 'GEMINI_API_KEY is not configured in server environment.',
        latencyMs: Date.now() - startTime,
      };
    }
    return {
      success: false,
      error: 'GEMINI_API_KEY is missing from server environment.',
      latencyMs: Date.now() - startTime,
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const parts: any[] = [];
      if (params.config?.systemInstruction) {
        parts.push({ text: `System Context & Guidelines:\n${params.config.systemInstruction}\n\n` });
      }

      if (params.audioBase64 && !params.audioBase64.includes('undefined')) {
        parts.push({
          inlineData: {
            mimeType: params.audioMimeType || 'audio/webm',
            data: params.audioBase64,
          },
        });
      }

      parts.push({ text: params.prompt });

      const requestPayload: any = {
        model,
        contents: [{ role: 'user', parts }],
        config: {
          temperature: params.config?.temperature ?? 0.2,
          maxOutputTokens: params.config?.maxOutputTokens ?? 2048,
          responseMimeType: 'application/json',
        },
      };

      if (params.schema) {
        requestPayload.config.responseSchema = params.schema;
      }

      // Execute with timeout race
      const timeoutMs = params.config?.timeoutMs ?? 15000;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms on model ${model}`)), timeoutMs)
      );

      const generatePromise = ai.models.generateContent(requestPayload);
      const response: any = await Promise.race([generatePromise, timeoutPromise]);

      const rawText = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!rawText.trim()) {
        throw new Error(`Empty response returned by model ${model}`);
      }

      // Clean markdown code blocks if model wrapped JSON in ```json ... ```
      let cleaned = rawText.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed: T = JSON.parse(cleaned);
      return {
        success: true,
        data: parsed,
        text: rawText,
        modelUsed: model,
        latencyMs: Date.now() - startTime,
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`[GeminiClient] Model ${model} structured call failed:`, err?.message || err);
    }
  }

  // All models failed; return fallback if available
  if (params.fallbackValue !== undefined) {
    return {
      success: false,
      data: params.fallbackValue,
      error: lastError?.message || 'All Gemini candidate models failed.',
      latencyMs: Date.now() - startTime,
    };
  }

  return {
    success: false,
    error: lastError?.message || 'Failed to generate structured response from Gemini.',
    latencyMs: Date.now() - startTime,
  };
}

/**
 * Plain-text generation with model cascade and deterministic fallback.
 */
export async function invokeGeminiText(params: TextCallParams): Promise<GeminiResponse<string>> {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      text: params.fallbackText || 'AI reasoning unavailable without API key configuration.',
      error: 'GEMINI_API_KEY missing.',
      latencyMs: Date.now() - startTime,
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const parts: any[] = [];
      if (params.systemInstruction) {
        parts.push({ text: `System Prompt:\n${params.systemInstruction}\n\n` });
      }
      parts.push({ text: params.prompt });

      const timeoutMs = params.config?.timeoutMs ?? 15000;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms on model ${model}`)), timeoutMs)
      );

      const response: any = await Promise.race([
        ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts }],
          config: {
            temperature: params.config?.temperature ?? 0.3,
            maxOutputTokens: params.config?.maxOutputTokens ?? 2048,
          },
        }),
        timeoutPromise,
      ]);

      const rawText = response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (rawText.trim()) {
        return {
          success: true,
          text: rawText.trim(),
          modelUsed: model,
          latencyMs: Date.now() - startTime,
        };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[GeminiClient] Model ${model} text call failed:`, err?.message || err);
    }
  }

  return {
    success: false,
    text: params.fallbackText || 'AI coaching response temporarily unavailable.',
    error: lastError?.message || 'All Gemini models failed.',
    latencyMs: Date.now() - startTime,
  };
}
