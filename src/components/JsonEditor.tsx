import { useRef, useCallback, useMemo, useState } from "react";
import { Braces, Check, AlertTriangle } from "lucide-react";

/** Lightweight JSON editor with syntax highlighting, validation & format. */

// --- Syntax highlighting ---------------------------------------------------

type TokenType = "key" | "string" | "number" | "bool" | "null" | "brace" | "text";

interface Token {
  type: TokenType;
  value: string;
}

const TOKEN_RE =
  /("(?:[^"\\]|\\.)*")\s*(?=:)|("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b|(true|false)\b|(null)\b|([{}[\]:,])/g;

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;

  for (const m of src.matchAll(TOKEN_RE)) {
    if (m.index! > last) {
      tokens.push({ type: "text", value: src.slice(last, m.index!) });
    }

    if (m[1] != null) tokens.push({ type: "key", value: m[1] });
    else if (m[2] != null) tokens.push({ type: "string", value: m[2] });
    else if (m[3] != null) tokens.push({ type: "number", value: m[3] });
    else if (m[4] != null) tokens.push({ type: "bool", value: m[4] });
    else if (m[5] != null) tokens.push({ type: "null", value: m[5] });
    else if (m[6] != null) tokens.push({ type: "brace", value: m[6] });

    last = m.index! + m[0].length;
  }

  if (last < src.length) {
    tokens.push({ type: "text", value: src.slice(last) });
  }

  return tokens;
}

const COLOR: Record<TokenType, string> = {
  key: "text-[#7aa2f7]",
  string: "text-[#9ece6a]",
  number: "text-[#ff9e64]",
  bool: "text-[#ff9e64]",
  null: "text-[#737aa2]",
  brace: "text-[#8A8F98]",
  text: "",
};

function Highlighted({ code }: { code: string }) {
  const tokens = useMemo(() => tokenize(code), [code]);

  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} className={COLOR[t.type]}>
          {t.value}
        </span>
      ))}
      {"\n"}
    </>
  );
}

// --- Validation ------------------------------------------------------------

interface ValidationResult {
  valid: boolean;
  error?: string;
  position?: { line: number; col: number };
}

function validateJson(src: string): ValidationResult {
  if (!src.trim()) return { valid: true };
  try {
    JSON.parse(src);
    return { valid: true };
  } catch (e) {
    const msg = String(e).replace(/^SyntaxError:\s*/, "");
    const posMatch = msg.match(/position\s+(\d+)/i);
    if (posMatch) {
      const pos = Number(posMatch[1]);
      const before = src.slice(0, pos);
      const line = (before.match(/\n/g) || []).length + 1;
      const lastNl = before.lastIndexOf("\n");
      const col = pos - lastNl;
      return { valid: false, error: msg, position: { line, col } };
    }
    return { valid: false, error: msg };
  }
}

// --- Component -------------------------------------------------------------

interface JsonEditorProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}

export function JsonEditor({
  value,
  onChange,
  placeholder,
  rows = 8,
}: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [focused, setFocused] = useState(false);

  const validation = useMemo(() => validateJson(value), [value]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newVal = value.slice(0, start) + "  " + value.slice(end);
        onChange(newVal);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      }
    },
    [value, onChange],
  );

  const formatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
    } catch {
      // no-op
    }
  }, [value, onChange]);

  const lineHeight = 20;
  const minH = rows * lineHeight;
  const maxH = 14 * lineHeight; // cap at 14 lines before scrolling

  const borderColor = !value.trim()
    ? "border-border"
    : validation.valid
      ? "border-border"
      : "border-red-500/40";
  const focusBorder = focused
    ? validation.valid || !value.trim()
      ? "border-accent/60 shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
      : "border-red-500/60 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]"
    : "";

  return (
    <div className="space-y-0">
      {/* Editor container */}
      <div
        className={`relative rounded-t-lg ${borderColor} ${focusBorder} border bg-bg-primary overflow-hidden transition-all duration-200`}
        style={{ minHeight: minH, maxHeight: maxH }}
      >
        {/* Highlighted layer */}
        <pre
          ref={preRef}
          aria-hidden
          className="absolute inset-0 px-3 py-2 text-xs font-mono leading-5 whitespace-pre-wrap break-words overflow-auto pointer-events-none select-none"
        >
          {value ? <Highlighted code={value} /> : null}
        </pre>

        {/* Transparent textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          spellCheck={false}
          className="relative w-full h-full px-3 py-2 text-xs font-mono leading-5 bg-transparent text-transparent caret-[#EDEDEF] outline-none resize-none placeholder:text-text-secondary/40"
          style={{ minHeight: minH, maxHeight: maxH }}
          placeholder={!value ? placeholder : undefined}
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-bg-primary/60 border border-t-0 border-border rounded-b-lg">
        <div className="flex items-center gap-1.5 min-h-[16px]">
          {value.trim() &&
            (validation.valid ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-500/70">
                <Check size={10} />
                Valid
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-red-400/80 max-w-[240px] truncate">
                <AlertTriangle size={10} className="shrink-0" />
                <span className="truncate">{validation.error}</span>
                {validation.position && (
                  <span className="text-text-secondary/40 shrink-0">
                    L{validation.position.line}:{validation.position.col}
                  </span>
                )}
              </span>
            ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-secondary/30">
            {value.trim()
              ? `${(value.match(/\n/g) || []).length + 1} lines`
              : ""}
          </span>
          {value.trim() && validation.valid && (
            <button
              type="button"
              onClick={formatJson}
              title="Format JSON"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-text-secondary/50 hover:text-accent hover:bg-accent/10 transition-colors"
            >
              <Braces size={11} />
              Format
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
