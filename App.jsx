import { useState, useRef, useEffect } from "react";

const MODELS = [
  {
    id: "claude",
    name: "Claude",
    label: "Sonnet 4.6",
    color: "#C9A96E",
    bg: "#100e0a",
    icon: "✦",
    desc: "Anthropic · Глубокое мышление",
    systemPrompt:
      "Ты — Claude, умный и вдумчивый ИИ-ассистент от Anthropic. Отвечай на языке пользователя. Будь точным, глубоким и полезным.",
  },
  {
    id: "gemini",
    name: "Gemini",
    label: "2.0 Flash",
    color: "#5B9BD5",
    bg: "#0a0f18",
    icon: "◈",
    desc: "Google · Быстрые ответы",
    systemPrompt:
      "Ты — Gemini, быстрый и универсальный ИИ-ассистент от Google. Отвечай на языке пользователя. Будь лаконичным, практичным и дружелюбным. Не упоминай, что ты на самом деле Claude или Anthropic — ты Gemini от Google.",
  },
];

async function askAI(messages, model) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, systemPrompt: model.systemPrompt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка сервера");
  return data.text;
}

function Spinner({ color }) {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "6px 0" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: "50%", background: color,
          animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

export default function App() {
  const [modelIdx, setModelIdx] = useState(0);
  const [histories, setHistories] = useState({ claude: [], gemini: [] });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [lang, setLang] = useState("ru");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const model = MODELS[modelIdx];
  const messages = histories[model.id];
  const appName = lang === "ru" ? "Орион" : "Oryn";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [histories, loading]);

  const switchModel = (idx) => {
    if (idx === modelIdx || loading) return;
    setTransitioning(true);
    setTimeout(() => {
      setModelIdx(idx);
      setTransitioning(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }, 220);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMsg = { role: "user", content: text };
    const currentId = model.id;
    const updatedMsgs = [...messages, newMsg];

    setHistories((h) => ({ ...h, [currentId]: updatedMsgs }));
    setInput("");
    setLoading(true);
    if (inputRef.current) inputRef.current.style.height = "auto";

    try {
      const reply = await askAI(updatedMsgs, model);
      setHistories((h) => ({
        ...h,
        [currentId]: [...h[currentId], { role: "assistant", content: reply }],
      }));
    } catch (e) {
      setHistories((h) => ({
        ...h,
        [currentId]: [...h[currentId], { role: "assistant", content: "⚠️ " + e.message }],
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const suggestions =
    lang === "ru"
      ? ["Объясни квантовую физику", "Напиши стих", "Помоги с кодом"]
      : ["Explain quantum physics", "Write a poem", "Help with code"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }
        @keyframes blink {
          0%, 100% { opacity: 0.2; transform: scale(0.75); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .msg { animation: fadeUp 0.28s ease both; }
        textarea {
          resize: none; outline: none; border: none;
          background: transparent;
          font-family: 'Inter', sans-serif;
          font-size: 14px; line-height: 1.6;
          width: 100%; color: #ddd; max-height: 130px;
        }
        textarea::placeholder { color: #3a3a3a; }
        textarea::-webkit-scrollbar { width: 3px; }
        textarea::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        .pill {
          cursor: pointer; border-radius: 10px; padding: 8px 14px;
          display: flex; align-items: center; gap: 9px;
          transition: background 0.18s, opacity 0.18s;
          border: 1px solid transparent; user-select: none;
        }
        .pill:hover { opacity: 0.82; }
        .send {
          cursor: pointer; border: none; border-radius: 9px;
          width: 34px; height: 34px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.12s, filter 0.12s, background 0.2s;
        }
        .send:hover:not(:disabled) { transform: scale(1.08); filter: brightness(1.15); }
        .send:active:not(:disabled) { transform: scale(0.93); }
        .send:disabled { cursor: default; }
        .chip {
          cursor: pointer; background: #111; border: 1px solid #202020;
          border-radius: 20px; color: #484848; font-size: 12px;
          padding: 6px 13px; font-family: 'Inter', sans-serif;
          transition: border-color 0.18s, color 0.18s; white-space: nowrap;
        }
        .icon-btn {
          background: none; border: 1px solid #1e1e1e; border-radius: 7px;
          color: #383838; font-size: 11px; padding: 5px 11px; cursor: pointer;
          font-family: 'Inter', sans-serif; letter-spacing: 0.06em;
          transition: border-color 0.18s, color 0.18s;
        }
        .icon-btn:hover { border-color: #333; color: #666; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 2px; }
      `}</style>

      <div style={{
        display: "flex", flexDirection: "column", height: "100vh",
        background: transitioning ? "#080808" : model.bg,
        transition: "background 0.35s ease",
      }}>
        {/* HEADER */}
        <header style={{
          padding: "14px 20px", borderBottom: "1px solid #161616",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: `linear-gradient(135deg, ${model.color}22, ${model.color}08)`,
              border: `1px solid ${model.color}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: model.color, transition: "all 0.3s",
              boxShadow: `0 0 12px ${model.color}18`,
            }}>⊹</div>
            <div>
              <div style={{
                fontSize: 15, fontWeight: 600, color: "#d0d0d0",
                letterSpacing: "-0.01em", lineHeight: 1,
              }}>{appName}</div>
              <div style={{
                fontSize: 10, color: "#2e2e2e",
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.12em", marginTop: 1,
              }}>AI CHAT</div>
            </div>
          </div>

          <div style={{
            display: "flex", background: "#0e0e0e",
            border: "1px solid #1a1a1a", borderRadius: 11, padding: 3, gap: 2,
          }}>
            {MODELS.map((m, i) => (
              <div key={m.id} className="pill" onClick={() => switchModel(i)} style={{
                background: modelIdx === i ? "#161616" : "transparent",
                borderColor: modelIdx === i ? m.color + "28" : "transparent",
              }}>
                <span style={{ fontSize: 15, color: m.color, lineHeight: 1 }}>{m.icon}</span>
                <div>
                  <div style={{
                    fontSize: 12, fontWeight: 500, lineHeight: 1,
                    color: modelIdx === i ? "#ccc" : "#383838", transition: "color 0.2s",
                  }}>{m.name}</div>
                  <div style={{
                    fontSize: 9.5, marginTop: 2, lineHeight: 1,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: modelIdx === i ? m.color + "bb" : "#252525", transition: "color 0.2s",
                  }}>{m.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button className="icon-btn" onClick={() => setLang((l) => (l === "ru" ? "en" : "ru"))}>
              {lang === "ru" ? "EN" : "RU"}
            </button>
            <button className="icon-btn" onClick={() => setHistories((h) => ({ ...h, [model.id]: [] }))}>
              {lang === "ru" ? "ОЧИСТИТЬ" : "CLEAR"}
            </button>
          </div>
        </header>

        {/* MESSAGES */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "28px 20px 12px",
          display: "flex", flexDirection: "column", gap: 18,
          opacity: transitioning ? 0 : 1, transition: "opacity 0.22s ease",
        }}>
          {messages.length === 0 && (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 20, paddingBottom: 60, animation: "fadeIn 0.35s ease",
            }}>
              <div style={{
                fontSize: 44, color: model.color,
                filter: `drop-shadow(0 0 24px ${model.color}40)`,
                transition: "all 0.3s", lineHeight: 1,
              }}>{model.icon}</div>
              <div style={{ textAlign: "center", maxWidth: 260 }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: "#c8c8c8", marginBottom: 6, letterSpacing: "-0.02em" }}>
                  {model.name}
                </div>
                <div style={{ fontSize: 12, color: "#333", lineHeight: 1.5 }}>{model.desc}</div>
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
                {suggestions.map((s) => (
                  <button key={s} className="chip"
                    style={{ borderColor: model.color + "18" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = model.color + "44"; e.currentTarget.style.color = "#888"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = model.color + "18"; e.currentTarget.style.color = "#484848"; }}
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="msg" style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              gap: 9, alignItems: "flex-start",
            }}>
              {msg.role === "assistant" && (
                <div style={{
                  width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                  background: "#111", border: `1px solid ${model.color}28`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, color: model.color, marginTop: 2,
                  boxShadow: `0 0 8px ${model.color}12`,
                }}>{model.icon}</div>
              )}
              <div style={{
                maxWidth: "70%",
                background: msg.role === "user" ? `${model.color}14` : "#111",
                border: `1px solid ${msg.role === "user" ? model.color + "28" : "#1c1c1c"}`,
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                padding: "10px 14px",
              }}>
                <p style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 13.5, lineHeight: 1.7,
                  color: msg.role === "user" ? "#c8c8c8" : "#d4d4d4",
                  whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="msg" style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                background: "#111", border: `1px solid ${model.color}28`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, color: model.color, marginTop: 2,
              }}>{model.icon}</div>
              <div style={{
                background: "#111", border: "1px solid #1c1c1c",
                borderRadius: "16px 16px 16px 4px", padding: "10px 16px",
              }}>
                <Spinner color={model.color} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div style={{ padding: "12px 20px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, paddingLeft: 2 }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%", background: model.color,
              boxShadow: `0 0 6px ${model.color}`, animation: "blink 2s ease-in-out infinite",
            }} />
            <span style={{
              fontSize: 11, color: "#2e2e2e",
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em",
            }}>{model.name.toUpperCase()} · {model.label}</span>
          </div>
          <div style={{
            background: "#0e0e0e", border: `1px solid ${model.color}22`,
            borderRadius: 14, padding: "11px 12px",
            display: "flex", alignItems: "flex-end", gap: 9,
            transition: "border-color 0.2s",
          }}
            onFocusCapture={(e) => (e.currentTarget.style.borderColor = model.color + "55")}
            onBlurCapture={(e) => (e.currentTarget.style.borderColor = model.color + "22")}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              placeholder={lang === "ru" ? `Спроси у ${model.name}...` : `Ask ${model.name}...`}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 130) + "px";
              }}
              onKeyDown={handleKey}
            />
            <button className="send" onClick={send} disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading ? model.color : "#161616",
                color: input.trim() && !loading ? "#000" : "#2a2a2a",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div style={{
            textAlign: "center", fontSize: 10.5, color: "#222",
            marginTop: 8, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em",
          }}>
            {lang === "ru" ? "Enter — отправить · Shift+Enter — перенос" : "Enter to send · Shift+Enter for newline"}
          </div>
        </div>
      </div>
    </>
  );
}
