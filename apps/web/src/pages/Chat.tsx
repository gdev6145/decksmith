import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, Bot, User, Loader2, Settings, Plus, Trash2, MessageSquare, ExternalLink } from "lucide-react";
import type { ChatMessage, AIProvider, AIModel } from "@decksmith/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: `Hey! I'm Decksmith, your AI cyberdeck building assistant.

I can help you with:
- Planning your cyberdeck build
- Recommending compatible parts
- Troubleshooting issues
- Optimizing for your budget and use case

What are you looking to build?`,
  timestamp: new Date(),
};

interface PartRecommendation {
  partId: string;
  name: string;
  category: string;
  reason: string;
  confidence: number;
  price?: number;
  currency?: string;
  slug?: string;
  image?: string;
}

interface ChatSessionListItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count: { messages: number };
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [showSettings, setShowSettings] = useState(false);
  const [models, setModels] = useState<AIModel[]>([]);
  const [sessions, setSessions] = useState<ChatSessionListItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [recommendations, setRecommendations] = useState<PartRecommendation[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const autoSentRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchModels = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/models`);
      if (res.ok) setModels(await res.json());
    } catch (e) {
      console.error("Failed to fetch models:", e);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/sessions`);
      if (res.ok) setSessions(await res.json());
    } catch (e) {
      console.error("Failed to fetch sessions:", e);
    }
  }, []);

  useEffect(() => {
    fetchModels();
    fetchSessions();
  }, [fetchModels, fetchSessions]);

  const promptParam = searchParams.get("prompt");
  useEffect(() => {
    if (promptParam && !autoSentRef.current) {
      autoSentRef.current = true;
      handleSubmit({ preventDefault: () => {} } as React.FormEvent, promptParam);
      setSearchParams({}, { replace: true });
    }
  }, []);

  const fetchRecommendations = useCallback(async (query: string) => {
    setIsRecommending(true);
    setRecommendations([]);
    try {
      const res = await fetch(`${API_URL}/api/chat/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, provider }),
      });
      if (res.ok) {
        const data = (await res.json()) as PartRecommendation[];
        setRecommendations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Recommend error:", error);
      setRecommendations([]);
    } finally {
      setIsRecommending(false);
    }
  }, [provider]);

  const startNewChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setActiveSessionId(null);
    setShowHistory(false);
    setRecommendations([]);
  };

  const loadSession = async (sessionId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/sessions/${sessionId}`);
      if (!res.ok) throw new Error("Failed to load session");
      const saved = (await res.json()) as Array<{
        id: string;
        role: string;
        content: string;
        createdAt: string;
      }>;
      const loaded: ChatMessage[] = saved.map((m) => ({
        id: m.id,
        role: m.role as ChatMessage["role"],
        content: m.content,
        timestamp: new Date(m.createdAt),
      }));
      setMessages(loaded.length ? loaded : [WELCOME_MESSAGE]);
      setActiveSessionId(sessionId);
      setShowHistory(false);
    } catch (error) {
      console.error("Load session error:", error);
    }
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`${API_URL}/api/sessions/${sessionId}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) startNewChat();
    } catch (error) {
      console.error("Delete session error:", error);
    }
  };

  const persistMessages = async (
    sessionId: string | null,
    toSave: ChatMessage[]
  ): Promise<string | null> => {
    try {
      let targetId = sessionId;
      if (!targetId) {
        const created = await fetch(`${API_URL}/api/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "New Chat" }),
        });
        if (!created.ok) return null;
        const session = await created.json();
        targetId = session.id;
      }
      const saved = await fetch(`${API_URL}/api/sessions/${targetId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toSave }),
      });
      if (!saved.ok) return null;
      const data = await saved.json();
      return targetId;
    } catch (error) {
      console.error("Persist error:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent, textOverride?: string) => {
    e.preventDefault();
    const text = (textOverride ?? input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    fetchRecommendations(userMessage.content);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp.toISOString(),
          })),
          provider,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };
      const finalMessages = [...updated, aiMessage];
      setMessages(finalMessages);

      const savedId = await persistMessages(activeSessionId, [userMessage, aiMessage]);
      if (savedId) {
        setActiveSessionId(savedId);
        fetchSessions();
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Make sure the API server is running on port 3001.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const displayName =
    models.find((m) => m.provider === provider)?.displayName ||
    provider.charAt(0).toUpperCase() + provider.slice(1);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-100">Decksmith AI</h1>
              <p className="text-sm text-gray-500">Using {displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-all"
              title="Chat history"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button
              onClick={startNewChat}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-all"
              title="New chat"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700 max-h-72 overflow-y-auto">
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Chat History</h2>
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-500">No previous conversations yet.</p>
            ) : (
              <ul className="space-y-2">
                {sessions.map((session) => (
                  <li key={session.id}>
                    <div
                      onClick={() => loadSession(session.id)}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        activeSessionId === session.id
                          ? "bg-neon-green/20 border border-neon-green/40"
                          : "bg-gray-700/50 hover:bg-gray-700"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-gray-200 truncate">{session.title}</p>
                        <p className="text-xs text-gray-500">
                          {session._count.messages} messages · {new Date(session.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteSession(session.id, e)}
                        className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <label className="block text-sm text-gray-400 mb-2">AI Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as AIProvider)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-neon-green"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-gray-900" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-neon-green/20 text-gray-100"
                  : "bg-gray-800 text-gray-200"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.role === "user" && (
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-300" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-gray-900" />
            </div>
            <div className="bg-gray-800 rounded-2xl px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-neon-green" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="px-4 pb-2">
          <p className="text-xs font-semibold text-neon-green uppercase tracking-wider mb-2">
            Recommended parts from catalog
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recommendations.map((rec) => (
              <a
                key={rec.partId}
                href={rec.slug ? `/parts/${rec.slug}` : undefined}
                className="flex items-center gap-3 bg-gray-800/60 border border-gray-700 rounded-xl p-3 hover:border-neon-green/50 transition-all min-w-[220px] flex-shrink-0"
              >
                {rec.image ? (
                  <img
                    src={rec.image}
                    alt={rec.name}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-900"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center text-xl">
                    🧩
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{rec.name}</p>
                  <p className="text-xs text-gray-500">{rec.category}</p>
                  <p className="text-sm font-semibold text-neon-green">
                    {rec.price != null ? `$${rec.price.toFixed(2)}` : "Price on request"}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
      {isRecommending && (
        <div className="px-4 pb-2 flex items-center gap-2 text-xs text-gray-500">
          <Loader2 className="w-3 h-3 animate-spin" />
          Finding matching parts...
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your build idea..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-neon-green transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-3 bg-neon-green text-gray-900 rounded-xl hover:bg-neon-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}