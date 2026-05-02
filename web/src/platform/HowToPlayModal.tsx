import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import "./HowToPlayModal.css";
import { GAMES } from "../games/registry.js";
import type { GameCategory, GamePlugin } from "./game-plugin/types.js";

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  text: string;
  /** Optional — used to scope same-category suggestions and exclude self. */
  pluginId?: string;
  category?: GameCategory;
}

interface Block {
  kind: "heading" | "paragraph" | "bullets";
  level?: number;
  text?: string;
  items?: string[];
}

interface Section {
  heading: string | null;
  level: number;
  blocks: Block[];
}

type TabKey = "overview" | "rules" | "tips";

const SECTION_ALIASES: Record<string, string> = {
  goal: "Goal",
  goals: "Goal",
  objective: "Goal",
  "how to play": "How to Play",
  "how to win": "How to Play",
  gameplay: "How to Play",
  rules: "How to Play",
  tips: "Tips",
  tip: "Tips",
  strategy: "Tips",
  hints: "Tips",
  "pro tip": "Tips",
  "pro tips": "Tips",
};

/** Parse one line of inline markdown (`**bold**`, `*italic*`). */
function renderInline(line: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < line.length) {
    if (line.startsWith("**", i)) {
      const end = line.indexOf("**", i + 2);
      if (end !== -1) {
        out.push(<strong key={`${keyBase}-${key++}`}>{line.slice(i + 2, end)}</strong>);
        i = end + 2;
        continue;
      }
    }
    if (line[i] === "*") {
      const end = line.indexOf("*", i + 1);
      if (end !== -1 && end !== i + 1) {
        out.push(<em key={`${keyBase}-${key++}`}>{line.slice(i + 1, end)}</em>);
        i = end + 1;
        continue;
      }
    }
    let j = i;
    while (j < line.length && line[j] !== "*") j++;
    out.push(line.slice(i, j));
    i = j;
  }
  return out;
}

/** Parse the howToPlay text into structured sections + blocks. */
function parseHowToPlay(text: string): Section[] {
  const lines = text.split(/\r?\n/);
  const sections: Section[] = [];
  let current: Section = { heading: null, level: 0, blocks: [] };
  let paraBuffer: string[] = [];
  let bulletBuffer: string[] = [];

  const flushPara = (): void => {
    if (paraBuffer.length > 0) {
      current.blocks.push({ kind: "paragraph", text: paraBuffer.join(" ") });
      paraBuffer = [];
    }
  };
  const flushBullets = (): void => {
    if (bulletBuffer.length > 0) {
      current.blocks.push({ kind: "bullets", items: bulletBuffer });
      bulletBuffer = [];
    }
  };
  const flushAll = (): void => { flushPara(); flushBullets(); };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (trimmed === "") {
      flushAll();
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      flushAll();
      sections.push(current);
      const level = headingMatch[1]!.length;
      const headingText = headingMatch[2]!.trim();
      current = { heading: headingText, level, blocks: [] };
      continue;
    }

    const bulletMatch = /^[-*]\s+(.+)$/.exec(trimmed);
    if (bulletMatch) {
      flushPara();
      bulletBuffer.push(bulletMatch[1]!);
      continue;
    }

    const prefixMatch = /^([A-Za-z][A-Za-z ]{1,40}):\s*(.*)$/.exec(trimmed);
    if (prefixMatch && SECTION_ALIASES[prefixMatch[1]!.toLowerCase()]) {
      flushAll();
      sections.push(current);
      current = { heading: prefixMatch[1]!, level: 2, blocks: [] };
      const rest = prefixMatch[2]!.trim();
      if (rest) paraBuffer.push(rest);
      continue;
    }

    flushBullets();
    paraBuffer.push(trimmed);
  }

  flushAll();
  sections.push(current);

  return sections.filter((s) => s.heading != null || s.blocks.length > 0);
}

function canonicalHeading(heading: string | null): string | null {
  if (!heading) return null;
  const key = heading.trim().toLowerCase();
  return SECTION_ALIASES[key] ?? heading;
}

/** Heuristic: classify a parsed section into the Rules, Tips, or Overview tab. */
function classifySection(sec: Section): TabKey {
  const head = (sec.heading ?? "").toLowerCase();
  if (/(^|\b)(tip|tips|strategy|strategies|hint|hints|pro tip|pro tips)\b/.test(head)) {
    return "tips";
  }
  if (/(^|\b)(rule|rules|how to play|how to win|gameplay|goal|goals|objective|moves?|deal|setup|scoring)\b/.test(head)) {
    return "rules";
  }
  // No heading or non-matching heading → infer from content.
  if (!sec.heading) {
    const blob = sec.blocks
      .map((b) => (b.kind === "paragraph" ? (b.text ?? "") : (b.items ?? []).join(" ")))
      .join(" ")
      .toLowerCase();
    if (/\b(pro tip|tip:|strategy|tips?\b)/.test(blob)) return "tips";
  }
  return "overview";
}

function focusableIn(el: HTMLElement): HTMLElement[] {
  const sel = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(el.querySelectorAll<HTMLElement>(sel)).filter(
    (n) => !n.hasAttribute("disabled") && n.getAttribute("aria-hidden") !== "true",
  );
}

/** Pick up to N other plugins from the same category, deterministically per-id+seed. */
function pickSuggestions(
  pluginId: string | undefined,
  category: GameCategory | undefined,
  count: number,
): GamePlugin[] {
  if (!category) return [];
  const pool = GAMES.filter(
    (g): g is GamePlugin => g != null && g.category === category && g.id !== pluginId,
  );
  if (pool.length === 0) return [];
  // Stable pseudo-shuffle keyed on the current plugin's id so suggestions
  // don't reshuffle on every render but vary between games.
  const seedStr = pluginId ?? category;
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = ((h << 5) - h + seedStr.charCodeAt(i)) | 0;
  const sorted = [...pool].sort((a, b) => {
    const ha = (h ^ hashString(a.id)) >>> 0;
    const hb = (h ^ hashString(b.id)) >>> 0;
    return ha - hb;
  });
  return sorted.slice(0, count);
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function HowToPlayModal({
  open,
  onClose,
  title,
  text,
  pluginId,
  category,
}: HowToPlayModalProps): JSX.Element | null {
  const [mounted, setMounted] = useState(open);
  const [animating, setAnimating] = useState(open);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setAnimating(true));
      return () => cancelAnimationFrame(id);
    }
    setAnimating(false);
    const id = window.setTimeout(() => setMounted(false), 220);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveTab("overview");
    }
  }, [open]);

  useEffect(() => {
    if (!mounted || !open) return;
    previouslyFocused.current = (document.activeElement as HTMLElement | null) ?? null;
    const dialog = dialogRef.current;
    if (dialog) {
      const focusables = focusableIn(dialog);
      (focusables[0] ?? dialog).focus();
    }

    const onKey = (ev: KeyboardEvent): void => {
      if (ev.key === "Escape") {
        ev.stopPropagation();
        onClose();
        return;
      }
      if (ev.key === "Tab" && dialog) {
        const focusables = focusableIn(dialog);
        if (focusables.length === 0) {
          ev.preventDefault();
          return;
        }
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        const active = document.activeElement as HTMLElement | null;
        if (ev.shiftKey && (active === first || !dialog.contains(active))) {
          ev.preventDefault();
          last.focus();
        } else if (!ev.shiftKey && active === last) {
          ev.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      previouslyFocused.current?.focus?.();
    };
  }, [mounted, open, onClose]);

  const sections = useMemo(() => parseHowToPlay(text), [text]);

  /** Bucket parsed sections into the three logical tabs. */
  const buckets = useMemo<Record<TabKey, Section[]>>(() => {
    const out: Record<TabKey, Section[]> = { overview: [], rules: [], tips: [] };
    for (const sec of sections) out[classifySection(sec)].push(sec);
    return out;
  }, [sections]);

  /** Tabs that actually have content. */
  const populatedTabs = useMemo<TabKey[]>(() => {
    return (["overview", "rules", "tips"] as TabKey[]).filter(
      (t) => buckets[t].length > 0,
    );
  }, [buckets]);

  /** If the parser only managed one bucket (typical for "bare prose"
   *  howToPlay strings), keep the legacy single-pane look — no tab strip. */
  const showTabs = populatedTabs.length > 1;

  /** Make sure the active tab is one that exists. */
  useEffect(() => {
    if (!open) return;
    if (populatedTabs.length === 0) return;
    if (!populatedTabs.includes(activeTab)) {
      setActiveTab(populatedTabs[0]!);
    }
  }, [open, populatedTabs, activeTab]);

  /** Apply the search query — filters sections in the *currently displayed*
   *  set. With tabs, that's the active tab's bucket; without tabs, all. */
  const visibleSections = useMemo<Section[]>(() => {
    const source = showTabs ? buckets[activeTab] : sections;
    const q = query.trim().toLowerCase();
    if (!q) return source;
    return source
      .map((sec) => {
        const headingMatches = (sec.heading ?? "").toLowerCase().includes(q);
        const blocks = sec.blocks.filter((b) => {
          if (b.kind === "paragraph") return (b.text ?? "").toLowerCase().includes(q);
          if (b.kind === "bullets")
            return (b.items ?? []).some((it) => it.toLowerCase().includes(q));
          return false;
        });
        if (headingMatches) return { ...sec, blocks: sec.blocks };
        if (blocks.length === 0) return null;
        return { ...sec, blocks };
      })
      .filter((s): s is Section => s != null);
  }, [showTabs, buckets, activeTab, sections, query]);

  const suggestions = useMemo(
    () => pickSuggestions(pluginId, category, 3),
    [pluginId, category],
  );

  if (!mounted) return null;

  const handlePrint = (): void => {
    if (typeof window !== "undefined" && typeof window.print === "function") {
      window.print();
    }
  };

  const stateClass = animating ? "is-open" : "is-closing";

  const renderSections = (list: Section[]): ReactNode => {
    if (list.length === 0) {
      return <p className="htp-empty">No matches.</p>;
    }
    return list.map((sec, i) => {
      const heading = canonicalHeading(sec.heading);
      return (
        <section key={i} className="htp-section">
          {heading && (
            <h3 className={`htp-section-heading htp-h${Math.min(sec.level || 2, 4)}`}>
              {heading}
            </h3>
          )}
          {sec.blocks.map((block, j) => {
            if (block.kind === "paragraph") {
              return (
                <p key={j} className="htp-p">
                  {renderInline(block.text ?? "", `p-${i}-${j}`)}
                </p>
              );
            }
            if (block.kind === "bullets") {
              const allNumbered = (block.items ?? []).every((it) =>
                /^\d+[.)]\s/.test(it),
              );
              return (
                <ul
                  key={j}
                  className={`htp-list${allNumbered ? " htp-list-numbered" : ""}`}
                >
                  {(block.items ?? []).map((item, k) => (
                    <li key={k}>{renderInline(item, `li-${i}-${j}-${k}`)}</li>
                  ))}
                </ul>
              );
            }
            return null;
          })}
        </section>
      );
    });
  };

  const tabLabels: Record<TabKey, string> = {
    overview: "Overview",
    rules: "Rules",
    tips: "Tips",
  };

  return (
    <div
      className={`htp-backdrop ${stateClass}`}
      onClick={onClose}
      data-testid="htp-backdrop"
    >
      <div
        className={`htp-modal ${stateClass}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="htp-title"
        ref={dialogRef}
        tabIndex={-1}
        data-testid="htp-modal"
      >
        <header className="htp-header">
          <div className="htp-titleblock">
            <span className="htp-eyebrow">How to Play</span>
            <h2 id="htp-title" className="htp-title">{title}</h2>
          </div>
          <div className="htp-header-actions">
            <button
              type="button"
              className="htp-iconbtn"
              onClick={handlePrint}
              title="Print"
              aria-label="Print"
              data-testid="htp-print"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
            </button>
            <button
              type="button"
              className="htp-iconbtn htp-close"
              onClick={onClose}
              title="Close"
              aria-label="Close"
              data-testid="htp-close"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        <div className="htp-search">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search rules..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search rules"
            data-testid="htp-search"
          />
        </div>

        {showTabs && (
          <div className="htp-tabs" role="tablist" aria-label="How to play sections">
            {populatedTabs.map((t) => {
              const selected = t === activeTab;
              return (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`htp-tab${selected ? " is-active" : ""}`}
                  onClick={() => setActiveTab(t)}
                  data-testid={`howto-tab-${t}`}
                >
                  {tabLabels[t]}
                </button>
              );
            })}
          </div>
        )}

        <div className="htp-body" data-testid="htp-body">
          {renderSections(visibleSections)}
        </div>

        {suggestions.length > 0 && (
          <div className="htp-suggest" data-testid="htp-suggest">
            <span className="htp-suggest-label">Try also:</span>
            <span className="htp-suggest-list">
              {suggestions.map((g, i) => (
                <span key={g.id}>
                  <a
                    className="htp-suggest-link"
                    href={`/play/${g.id}`}
                    data-testid={`howto-suggest-${i}`}
                  >
                    {g.title}
                  </a>
                  {i < suggestions.length - 1 ? <span className="htp-suggest-sep">, </span> : null}
                </span>
              ))}
            </span>
          </div>
        )}

        <footer className="htp-footer">
          <button
            type="button"
            className="htp-gotit"
            onClick={onClose}
            data-testid="htp-gotit"
          >
            Got it
          </button>
        </footer>
      </div>
    </div>
  );
}

export default HowToPlayModal;
