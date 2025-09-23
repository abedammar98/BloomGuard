import { useEffect, useRef, useState } from "react";
import "./Styles/Agent.css";
import Navbar from "./Components/Navbar";

/** ========================
 *  Dev config (hard-coded)
 *  ========================
 *  1) Replace <PUBLIC_URL_FROM_NOTEBOOK> with the HTTPS URL printed by Cell 16.
 *  2) API_KEY must match the SERVICE_API_KEY in your notebook launcher.
 */
// Read from Vite env (set in .env)
const API_BASE = import.meta.env.VITE_API_BASE?.trim();
const API_KEY  = import.meta.env.VITE_API_KEY?.trim();

// Build the endpoint safely (remove any trailing slash just in case)
const API_URL = API_BASE ? `${API_BASE.replace(/\/+$/, "")}/query` : "";

// Optional: warn in dev if missing
if (!API_BASE || !API_KEY) {
  // eslint-disable-next-line no-console
  console.warn("[Agent] Missing VITE_API_BASE or VITE_API_KEY — add them to .env");
}

/**
 * Chat UI page:
 * - Unified theme via variables from Home.css
 * - Scrolls to newest message
 * - Simple loading + error handling
 * - Renders optional `papers_found` list (if your backend sends it as an array)
 */
export default function Agent() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I’m BloomGuard’s assistant. Ask me about cyanobacteria bloom risks, drivers, or scenarios.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const scrollerRef = useRef(null);

  // auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    // push user message
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setApiError(null);
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
          "ngrok-skip-browser-warning": "1",
        },
        body: JSON.stringify({ query: text, n_results: 3 }),
      });

      if (!res.ok) {
        let detail = `${res.status} ${res.statusText}`;
        try {
          const data = await res.json();
          if (data?.detail) detail = data.detail;
        } catch (_) {}
        throw new Error(detail);
      }

      const data = await res.json();

      // Normalize fields
      const maybeArray = data?.papers_found;
      const papers = Array.isArray(maybeArray) ? maybeArray : null;
      const assistantText =
        (typeof data.response === "string" && data.response) ||
        "I generated a response, but it was empty.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantText, papers },
      ]);
    } catch (err) {
      setApiError(err.message || "Network error");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry—something went wrong reaching the RAG service. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="agent-page">
      <Navbar />

      <div className="agent-chat" ref={scrollerRef}>
        {messages.map((m, i) => (
          <MessageBubble
            key={i}
            role={m.role}
            content={m.content}
            papers={m.papers}
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

      {apiError && <div className="agent-error">Error: {apiError}</div>}

      <form className="agent-inputbar" onSubmit={sendMessage}>
        <input
          className="agent-input"
          type="text"
          placeholder="Ask about bloom risks, conditions, or scenarios…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button className="btn btn-primary send-btn" disabled={loading}>
          {loading ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ role, content, papers }) {
  const isUser = role === "user";
  return (
    <div className={`bubble ${isUser ? "user" : "bot"}`}>
      <div className="bubble-role">{isUser ? "You" : "Assistant"}</div>
      <div className="bubble-content">{content}</div>

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
  );
}
