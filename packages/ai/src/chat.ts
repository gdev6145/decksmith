import { generateText, streamText } from "ai";
import { SYSTEM_PROMPT } from "@decksmith/shared";
import { getProvider, getModelId, type ProviderConfig } from "./providers";
import type { AIProvider, ChatMessage } from "@decksmith/shared";

export interface ChatOptions {
  provider: AIProvider;
  model?: string;
  messages: ChatMessage[];
  systemPrompt?: string;
  providerConfig?: ProviderConfig;
}

export interface StreamChatOptions extends ChatOptions {
  onChunk?: (chunk: string) => void;
}

export async function chat(options: ChatOptions): Promise<string> {
  const { provider, messages, systemPrompt, providerConfig } = options;
  const modelId = options.model || getModelId(provider);
  const providerInstance = getProvider(provider, providerConfig);

  const result = await generateText({
    model: providerInstance(modelId),
    system: systemPrompt || SYSTEM_PROMPT,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  return result.text;
}

export async function streamChat(options: StreamChatOptions): Promise<ReadableStream<string>> {
  const { provider, messages, systemPrompt, providerConfig, onChunk } = options;
  const modelId = options.model || getModelId(provider);
  const providerInstance = getProvider(provider, providerConfig);

  const result = streamText({
    model: providerInstance(modelId),
    system: systemPrompt || SYSTEM_PROMPT,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const stream = result.textStream;

  return new ReadableStream<string>({
    async start(controller) {
      for await (const chunk of stream) {
        if (onChunk) onChunk(chunk);
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });
}

export interface PartRecommendation {
  partId: string;
  name: string;
  reason: string;
  confidence: number;
}

export async function getPartRecommendations(
  query: string,
  availableParts: Array<{ id: string; name: string; category: string; specs: unknown }>,
  provider: AIProvider = "openai"
): Promise<PartRecommendation[]> {
  const providerInstance = getProvider(provider);
  const modelId = getModelId(provider);

  const result = await generateText({
    model: providerInstance(modelId),
    system: `You are a cyberdeck parts expert. Given a user query and available parts, recommend the best parts.
Return a JSON array of recommendations with partId, name, reason, and confidence (0-1).
Only recommend parts from the available list.`,
    prompt: `Query: ${query}\n\nAvailable parts:\n${JSON.stringify(availableParts, null, 2)}`,
  });

  try {
    return JSON.parse(result.text);
  } catch {
    return [];
  }
}
