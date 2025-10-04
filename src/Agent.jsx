import { useEffect, useRef, useState, useMemo } from "react";
import "./Styles/Agent.css";
import Navbar from "./Components/Navbar";

/* ============== API ============== */
const API_BASE = import.meta.env.VITE_API_BASE?.trim();
const API_KEY = import.meta.env.VITE_API_KEY?.trim();
const API_URL = API_BASE ? `${API_BASE.replace(/\/+$/, "")}/query` : "";

/* Suggested prompts */
const SUGGESTIONS = [
  "What increases bloom risk this week?",
  "Explain PC1 in simple terms.",
  "Which drivers tend to shift together before a bloom?",
];

/* ============== Utils ============== */
function hhmm(dateOrMs) {
  if (dateOrMs == null) return "";
  let d;
  if (typeof dateOrMs === "number") d = new Date(dateOrMs);
  else if (dateOrMs instanceof Date) d = dateOrMs;
  else d = new Date(dateOrMs);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/* يحوّل الروابط لنقر مباشر بدون مكتبات */
function linkify(text) {
  if (!text) return "";
  const urlRe = /\b(https?:\/\/[^\s)]+|www\.[^\s)]+)\b/gi;
  return text.replace(urlRe, (m) => {
    const href = m.startsWith("http") ? m : `https://${m}`;
    return `<a href="${href}" target="_blank" rel="noreferrer">${m}</a>`;
  });
}

/* ============== Component ============== */
export default function Agent() {
  // الحالة + ترحيل آمن
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("bg_chat");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const now = Date.now();
          return parsed.map((m, idx) => ({
            id: m?.id ?? `${now}-${idx}`,
            role: m?.role ?? "assistant",
            content: typeof m?.content === "string" ? m.content : "",
            papers: Array.isArray(m?.papers) ? m.papers : undefined,
            error: Boolean(m?.error),
            ts: typeof m?.ts === "number" ? m.ts : now + idx,
          }));
        }
      }
    } catch {
      // ignore
    }
    return [
      {
        id: `seed-${Date.now()}`,
        role: "assistant",
        content:
          "Hi! I’m BloomGuard’s assistant. Ask about bloom risks, environmental drivers, or what-if scenarios.",
        ts: Date.now(),
      },
    ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isSlow, setIsSlow] = useState(false);
  const [latencyMs, setLatencyMs] = useState(null);

  const scrollerRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);
  const hasConfig = Boolean(API_URL && API_KEY);

  /* حفظ تلقائي */
  useEffect(() => {
    try {
      localStorage.setItem("bg_chat", JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  /* Scroll لأسفل عند تحديث الرسائل */
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  /* إخفاء التوست تلقائيًا */
  useEffect(() => {
    if (!apiError) return;
    const t = setTimeout(() => setApiError(null), 3200);
    return () => clearTimeout(t);
  }, [apiError]);

  /* autosize للـ textarea */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height =
      Math.min(ta.scrollHeight, window.innerHeight * 0.3) + "px";
  }, [input]);

  /* إظهار زر النزول للأسفل عند الابتعاد عن القاع */
  const [showScrollFab, setShowScrollFab] = useState(false);
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom =
        el.scrollHeight - (el.scrollTop + el.clientHeight) < 60;
      setShowScrollFab(!nearBottom);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const statusLabel = useMemo(() => {
    if (!hasConfig) return "No API";
    if (loading && isSlow) return "Slow…";
    if (loading) return "Working…";
    return "Connected";
  }, [hasConfig, loading, isSlow]);

  async function handleSend(textOverride) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setApiError(null);
    setLoading(true);
    setLatencyMs(null);

    const slowTimer = setTimeout(() => setIsSlow(true), 3200);
    const controller = new AbortController();
    abortRef.current = controller;

    const t0 = performance.now();

    try {
      if (!hasConfig) {
        throw new Error("API is not configured. Check your .env file.");
      }

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
          "ngrok-skip-browser-warning": "1",
        },
        body: JSON.stringify({ query: text, n_results: 3 }),
        signal: controller.signal,
      });

      const t1 = performance.now();
      setLatencyMs(Math.round(t1 - t0));

      if (!res.ok) {
        let detail = `${res.status} ${res.statusText}`;
        try {
          const data = await res.json();
          if (data?.detail) detail = data.detail;
        } catch {
          // تجاهل فشل parse
        }
        if (res.status === 429)
          throw new Error("The service is busy (429). Please try again.");
        if (res.status === 504)
          throw new Error("Upstream timeout (504). Try again.");
        throw new Error(detail);
      }

      const data = await res.json();
      const papers = Array.isArray(data?.papers_found)
        ? data.papers_found
        : null;
      const assistantText =
        (typeof data.response === "string" && data.response) ||
        "I generated a response, but it was empty.";

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: assistantText,
          papers,
          ts: Date.now(),
        },
      ]);
    } catch (e) {
      setApiError(
        e.name === "AbortError"
          ? "Request cancelled"
          : e.message || "Network error"
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          content:
            "Sorry—something went wrong reaching the RAG service. Please try again.",
          error: true,
          ts: Date.now(),
        },
      ]);
    } finally {
      clearTimeout(slowTimer);
      setIsSlow(false);
      setLoading(false);
      abortRef.current = null;
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function clearChat() {
    setMessages([
      {
        id: `seed-${Date.now()}`,
        role: "assistant",
        content:
          "Chat cleared. Ask about risks, drivers, or what-if scenarios.",
        ts: Date.now(),
      },
    ]);
  }

  function cancelRequest() {
    if (abortRef.current) abortRef.current.abort();
  }

  const showSuggestions =
    messages.length === 1 && messages[0]?.role === "assistant";

  return (
    <div className="agent-page">
      <Navbar />

      <header className="assistant-header container xl">
        <div className="ah-left">
          <h1 className="ah-title">Assistant</h1>
          <span
            className={`status-pill ${
              !hasConfig
                ? "error"
                : loading
                ? "loading"
                : isSlow
                ? "slow"
                : "ok"
            }`}
            title={
              !hasConfig
                ? "API is not configured (.env)"
                : isSlow
                ? "Response is slow"
                : loading
                ? "Working"
                : "Connected"
            }
          >
            {statusLabel}
          </span>
          {latencyMs != null && !loading && (
            <span className="latency">⏱ {latencyMs}ms</span>
          )}
        </div>
        <div className="ah-right">
          <div className="toolbar">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearChat}
              title="Clear conversation"
            >
              Clear
            </button>
            {loading && (
              <button
                type="button"
                className="btn danger"
                onClick={cancelRequest}
                title="Cancel running request"
              >
                Stop
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="agent-chat" ref={scrollerRef}>
        <div className="chat-container container xl">
          {showSuggestions && (
            <div className="suggestions-card">
              <div className="suggestions-head">
                <span className="suggestions-title">Suggested prompts</span>
                <span className="suggestions-hint">Click to send</span>
              </div>
              <div className="suggestions-list">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    className="suggestion"
                    onClick={() => handleSend(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              role={m.role}
              content={m.content}
              papers={m.papers}
              isError={m.error}
              ts={m.ts}
              onRetry={
                m.error
                  ? () => {
                      const lastUser = [...messages]
                        .reverse()
                        .find((x) => x.role === "user");
                      if (lastUser?.content) handleSend(lastUser.content);
                    }
                  : undefined
              }
            />
          ))}

          {loading && (
            <div className="bubble bot">
              <div className="typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>

        {showScrollFab && (
          <button
            type="button"
            className="scroll-fab"
            onClick={() => {
              const el = scrollerRef.current;
              if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
            }}
            title="Scroll to latest"
          >
            ↓
          </button>
        )}
      </div>

      {apiError && <div className="toast">{apiError}</div>}

      <form
        className="agent-inputbar"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <div className="input-dock container xl">
          <textarea
            ref={textareaRef}
            className="agent-input"
            rows={1}
            placeholder="Ask about bloom risks, environmental drivers, or scenarios…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
          />
          <button
            className="btn btn-primary send-btn"
            disabled={loading || !hasConfig || !input.trim()}
          >
            {loading ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Message bubble ---------- */
function MessageBubble({ role, content, papers, isError, ts, onRetry }) {
  const isUser = role === "user";

  async function copyText() {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      window.prompt("Copy this message:", content);
    }
  }

  return (
    <div className={`bubble-wrap ${isUser ? "right" : "left"}`}>
      <div
        className={`bubble ${isUser ? "user" : "bot"} ${
          isError ? "error" : ""
        }`}
      >
        <div className="meta">
          <div className="avatar" aria-hidden="true">
            {isUser ? "Y" : "B"}
          </div>
          <div className="meta-text">
            <span className="name">{isUser ? "You" : "Assistant"}</span>
            <span className="dot">•</span>
            <span className="time">{hhmm(ts ?? Date.now())}</span>
          </div>

          {!isUser && (
            <div className="actions">
              <button
                className="icon-btn"
                onClick={copyText}
                type="button"
                aria-label="Copy message"
                title="Copy"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="9"
                    y="9"
                    width="11"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                  />
                  <rect
                    x="4"
                    y="4"
                    width="11"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    opacity="0.6"
                  />
                </svg>
              </button>
              {isError && onRetry && (
                <button
                  className="icon-btn"
                  onClick={onRetry}
                  type="button"
                  aria-label="Retry request"
                  title="Retry"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 12a9 9 0 1 1-2.64-6.36"
                      stroke="currentColor"
                    />
                    <path d="M21 4v6h-6" stroke="currentColor" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* تحويل الروابط فقط مع الحفاظ على النص */}
        <div
          className="bubble-content"
          dangerouslySetInnerHTML={{
            __html: linkify(content).replace(/\n/g, "<br/>"),
          }}
        />

        {Array.isArray(papers) && papers.length > 0 && (
          <div className="papers">
            <div className="papers-title">Sources</div>
            <ul className="papers-list">
              {papers.map((p, idx) => (
                <li key={idx} className="paper-item">
                  <div className="paper-title">
                    {p.title || "Untitled source"}
                  </div>
                  {p.snippet && (
                    <div className="paper-snippet">{p.snippet}</div>
                  )}
                  {p.source && (
                    <a
                      className="paper-link"
                      href={p.source}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open source
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
