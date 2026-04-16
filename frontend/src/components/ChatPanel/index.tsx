import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/api";
import styles from "./styles.module.css";

interface ChatSource {
  chapter_slug: string;
  heading: string;
  snippet: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
}

interface ChatPanelProps {
  chapterSlug?: string;
  selectedText?: string;
  onClearSelection?: () => void;
}

export default function ChatPanel({
  chapterSlug,
  selectedText,
  onClearSelection,
}: ChatPanelProps): React.ReactElement {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedText) {
      setIsOpen(true);
    }
  }, [selectedText]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post<{
        conversation_id: string;
        message: string;
        sources: ChatSource[];
      }>("/chat/message", {
        message: text,
        conversation_id: conversationId,
        chapter_slug: chapterSlug,
        selected_text: selectedText,
      });

      setConversationId(response.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.message,
          sources: response.sources,
        },
      ]);
      onClearSelection?.();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't process your request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return <></>;
  }

  return (
    <>
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        type="button"
      >
        {isOpen ? "\u2715" : "\uD83E\uDD16"}
      </button>

      {isOpen && (
        <div className={styles.panel} role="complementary" aria-label="AI Teaching Assistant">
          <div className={styles.header}>
            <div className={styles.headerIcon}>
              {"\uD83E\uDD16"}
            </div>
            <div className={styles.headerText}>
              <h3 id="chat-panel-title">AI Teaching Assistant</h3>
              <p>Powered by RAG</p>
            </div>
          </div>

          <div className={styles.messages} role="log" aria-live="polite" aria-labelledby="chat-panel-title">
            {messages.length === 0 && (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>{"\uD83D\uDCDA"}</span>
                <span className={styles.emptyTitle}>Ask about this chapter</span>
                <span className={styles.emptyHint}>
                  I can explain concepts, compare topics, or help you understand code examples.
                </span>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
                <div className={styles.messageContent}>{msg.content}</div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className={styles.sources}>
                    <strong>Sources:</strong>
                    {msg.sources.map((src, j) => (
                      <div key={j} className={styles.source}>
                        {src.chapter_slug} &mdash; {src.heading}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.messageContent}>
                  <div className={styles.loadingDots}>
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {selectedText && (
            <div className={styles.selectedContext}>
              <small>
                <strong>Selected:</strong> &ldquo;{selectedText.slice(0, 100)}
                {selectedText.length > 100 ? "..." : ""}&rdquo;
              </small>
            </div>
          )}

          <div className={styles.inputArea}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              aria-label="Type your question"
              rows={2}
              disabled={loading}
              className={styles.input}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={styles.sendButton}
              type="button"
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
