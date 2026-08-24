import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogle } from "@ai-sdk/google";
import { createOllama } from "ai-sdk-ollama";
import type { AIProvider } from "@decksmith/shared";

export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
}

export function getProvider(provider: AIProvider, config: ProviderConfig = {}) {
  switch (provider) {
    case "openai":
      return createOpenAI({
        apiKey: config.apiKey || process.env.OPENAI_API_KEY,
        baseURL: config.baseUrl,
      });
    case "anthropic":
      return createAnthropic({
        apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
        baseURL: config.baseUrl,
      });
    case "google":
      return createGoogle({
        apiKey: config.apiKey || process.env.GOOGLE_API_KEY,
      });
    case "ollama":
      return createOllama({
        baseURL: config.baseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      });
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export function getModelId(provider: AIProvider): string {
  switch (provider) {
    case "openai":
      return "gpt-4o";
    case "anthropic":
      return "claude-sonnet-4-6";
    case "google":
      return "gemini-2.5-flash";
    case "ollama":
      return process.env.OLLAMA_MODEL || "llama3.1";
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
