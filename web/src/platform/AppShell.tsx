import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./stores/auth.js";
import { ConfirmProvider } from "./ConfirmDialog.js";
import { ToastHost } from "./ui/Toast.js";
import { SparkleHost } from "./Sparkles.js";
import ThemePicker from "./ui/ThemePicker.js";
import LightModeToggle from "./ui/LightModeToggle.js";
import { isSoundOn, setSoundOn, playSound } from "./sounds.js";
import {
  KeyboardShortcutsModal,
  useKeyboardShortcutsModal,
} from "./KeyboardShortcuts.js";
import { InstallPrompt } from "./InstallPrompt.js";
import { UpdateBanner } from "./UpdateBanner.js";
import { GAMES } from "../games/registry.js";
import { pickQuickstart } from "./quickstart.js";
import { t } from "./i18n.js";
import { WelcomeTutorial } from "./Tutorial.js";
import {
  hasSeenWelcomeTutorial,
  markWelcomeTutorialSeen,
  setCoachmarkPending,
} from "./tutorials.js";
import { searchAll, type SearchHit } from "./search.js";
import { decodeChallenge } from "./friendCode.js";
import "./AppShell.css";

const CHANGELOG: Array<{ title: string; detail: string }> = [
  { title: "Sticky scroll-shadow header", detail: "Header now drops a subtle shadow once you scroll." },
  { title: "Lobby search box", detail: "Hit the magnifier in the header to filter the lobby." },
  { title: "What's New modal", detail: "You're looking at it." },
  { title: "High-score alerts", detail: "Bell glows when other players post a new top score." },
  { title: "Mobile hamburger menu", detail: "Nav collapses below 700px viewport width." },
];

export default function AppShell(): JSX.Element {
  const username = useAuth((s) => s.username);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  // "Have a code?" modal — a tiny single-input dialog that decodes a
  // friend code into a /play/<gameId>?seed=...&friend=1 URL. Opens via
  // the nav link of the same name; auto-closes on a successful decode.
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [hasNewHighScore, setHasNewHighScore] = useState(false);
  // Global "?" / Shift+/ overlay listing every shortcut in the app. The hook
  // installs its own keydown listener and skips inputs/textareas/CE surfaces.
  const shortcuts = useKeyboardShortcutsModal();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [soundOn, setSoundOnState] = useState<boolean>(() => isSoundOn());
  const [surpriseSplash, setSurpriseSplash] = useState<string | null>(null);
  // First-run welcome carousel — opens automatically on a fresh device,
  // and re-opens on demand via the storage signal "cards-welcome-tutorial:open".
  const [welcomeOpen, setWelcomeOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return !hasSeenWelcomeTutorial();
    } catch {
      return false;
    }
  });
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const searchFormRef = useRef<HTMLFormElement | null>(null);

  // Live-preview popover state. `searchTerm` is the immediate input value;
  // `debouncedSearch` lags by 150ms so we don't rescore on every keystroke.
  // `searchSelected` is -1 when nothing is highlighted (Enter → /search),
  // 0..N-1 when a row is highlighted (Enter → that row's href).
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchSelected, setSearchSelected] = useState(-1);
  const [popoverOpen, setPopoverOpen] = useState(false);
  // Recent searches mirror SearchPage's `cards-recent-searches` key. We
  // load lazily on focus so a fresh tab picks up writes from /search.
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const RECENT_KEY = "cards-recent-searches";
  const SUGGESTED_QUERIES: ReadonlyArray<string> = [
    "klondike",
    "holdem",
    "wordle",
    "daily",
    "dice",
  ];

  const readRecentSearches = (): string[] => {
    try {
      if (typeof localStorage === "undefined") return [];
      const raw = localStorage.getItem(RECENT_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .filter((s): s is string => typeof s === "string")
          .slice(0, 5);
      }
    } catch {
      /* corrupt — fall through */
    }
    return [];
  };

  const clearRecentSearches = (): void => {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(RECENT_KEY);
      }
    } catch {
      /* ignore */
    }
    setRecentSearches([]);
  };

  // Settings → Gameplay re-opens the carousel by dispatching a custom event.
  // Listening here keeps AppShell the single mount point.
  useEffect(() => {
    const onOpen = (): void => setWelcomeOpen(true);
    window.addEventListener("cards:open-welcome-tutorial", onOpen as EventListener);
    return () =>
      window.removeEventListener("cards:open-welcome-tutorial", onOpen as EventListener);
  }, []);

  // Close the categories dropdown on outside click / Escape.
  useEffect(() => {
    if (!categoriesOpen) return;
    const onPointer = (e: MouseEvent): void => {
      const root = categoriesRef.current;
      if (root && e.target instanceof Node && root.contains(e.target)) return;
      setCategoriesOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setCategoriesOpen(false);
    };
    document.addEventListener("mousedown", onPointer, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [categoriesOpen]);

  const HEADER_CATEGORIES = [
    { id: "solitaire", label: "Solitaire", glyph: "♤" },
    { id: "cards", label: "Cards", glyph: "♣" },
    { id: "dice", label: "Dice", glyph: "⚂" },
    { id: "board", label: "Board", glyph: "▦" },
    { id: "arcade", label: "Arcade", glyph: "✦" },
  ] as const;

  const toggleSound = (): void => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundOnState(next);
    if (next) playSound("button-click");
  };

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Browse-It-All achievement: stamp `cards-pages-visited` with a coarse
  // bucket name on every route mount. Buckets keep the set bounded (we
  // don't want every /play/:id permutation to count). The five required
  // buckets line up with the spec: lobby, stats, daily, leaderboard, search.
  useEffect(() => {
    try {
      if (typeof localStorage === "undefined") return;
      const path = location.pathname;
      let bucket: string | null = null;
      if (path === "/" || path === "/lobby" || path.startsWith("/category")) bucket = "lobby";
      else if (path.startsWith("/stats")) bucket = "stats";
      else if (path.startsWith("/daily")) bucket = "daily";
      else if (path.startsWith("/leaderboard")) bucket = "leaderboard";
      else if (path.startsWith("/search")) bucket = "search";
      if (!bucket) return;
      const raw = localStorage.getItem("cards-pages-visited");
      let arr: string[] = [];
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed)) arr = parsed.filter((x): x is string => typeof x === "string");
        } catch {
          /* corrupt — start fresh */
        }
      }
      if (!arr.includes(bucket)) {
        arr.push(bucket);
        localStorage.setItem("cards-pages-visited", JSON.stringify(arr));
      }
    } catch {
      /* ignore quota / private mode */
    }
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Debounce the search term by 150ms before recomputing the popover hits.
  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(searchTerm), 150);
    return () => window.clearTimeout(handle);
  }, [searchTerm]);

  // Compute the top-3 game preview from the shared scorer. Limit=3 caps
  // the games group; we only render games (no families/categories) in the
  // header popover to keep it compact.
  const popoverHits = useMemo<SearchHit[]>(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed.length < 2) return [];
    const { topMatch, games } = searchAll(trimmed, 3);
    const list: SearchHit[] = [];
    if (topMatch && topMatch.kind === "game") list.push(topMatch);
    for (const g of games) {
      if (list.length >= 3) break;
      list.push(g);
    }
    return list.slice(0, 3);
  }, [debouncedSearch]);

  // Empty-state mode shows recents + suggestions. Triggered when the
  // popover is open (focus) but there's no actionable query yet.
  const isEmptyState
    = popoverOpen && searchOpen && debouncedSearch.trim().length === 0;
  const showPopover
    = (popoverOpen
      && searchOpen
      && debouncedSearch.trim().length >= 2)
    || isEmptyState;

  // Flat list of empty-state rows for keyboard nav (recents first, then
  // suggested). Each entry's `query` is what we set the input to and
  // navigate `/search?q=` with.
  const emptyStateRows = useMemo(
    () => {
      const rows: Array<{ kind: "recent" | "suggest"; query: string; idx: number }> = [];
      recentSearches.forEach((q, i) =>
        rows.push({ kind: "recent", query: q, idx: i }),
      );
      SUGGESTED_QUERIES.forEach((q, i) =>
        rows.push({ kind: "suggest", query: q, idx: i }),
      );
      return rows;
    },
    // SUGGESTED_QUERIES is a stable module constant — recents are the
    // only dynamic input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recentSearches],
  );

  // Reset selection whenever the result set changes.
  useEffect(() => { setSearchSelected(-1); }, [debouncedSearch]);

  // Open the popover whenever the user is actively typing 2+ chars.
  useEffect(() => {
    if (searchTerm.trim().length >= 2) setPopoverOpen(true);
  }, [searchTerm]);

  // Outside-click + Escape close the popover. Mirrors the categories menu.
  useEffect(() => {
    if (!showPopover) return;
    const onPointer = (e: MouseEvent): void => {
      const root = searchFormRef.current;
      if (root && e.target instanceof Node && root.contains(e.target)) return;
      setPopoverOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setPopoverOpen(false);
    };
    document.addEventListener("mousedown", onPointer, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [showPopover]);

  // High-score notification: poll a lightweight endpoint; gracefully no-op offline.
  useEffect(() => {
    let cancelled = false;
    const seenKey = "cas:lastSeenHighScoreId";
    const tick = async (): Promise<void> => {
      try {
        const res = await fetch("/api/leaderboard/recent?limit=1", { credentials: "include" });
        if (!res.ok) return;
        const rows: Array<{ id?: string | number; user?: string }> = await res.json();
        const top = rows[0];
        if (!top || cancelled) return;
        const id = String(top.id ?? "");
        const seen = localStorage.getItem(seenKey);
        if (id && id !== seen && top.user && top.user !== username) {
          setHasNewHighScore(true);
        }
      } catch {
        /* offline / endpoint missing — silently ignore */
      }
    };
    void tick();
    const handle = window.setInterval(tick, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(handle);
    };
  }, [username]);

  const onQuickStart = (): void => {
    const pick = pickQuickstart();
    if (!pick) {
      navigate("/");
      return;
    }
    if (soundOn) playSound("button-click");
    setMobileNavOpen(false);
    navigate(`/play/${pick.gameId}?quickstart=1`);
  };

  // Mulberry32 — fast, deterministic 32-bit PRNG. Seeded by the current
  // minute so a frantic re-click within the same minute returns the same
  // game (anti-frustration: don't punish users who fat-fingered).
  const mulberry32 = (seed: number): (() => number) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const onSurprise = (): void => {
    if (GAMES.length === 0) {
      navigate("/");
      return;
    }
    const minuteSeed = Math.floor(Date.now() / 60_000);
    const rand = mulberry32(minuteSeed);
    const idx = Math.floor(rand() * GAMES.length);
    const pick = GAMES[idx] ?? GAMES[0];
    if (!pick) {
      navigate("/");
      return;
    }
    if (soundOn) playSound("button-click");
    setMobileNavOpen(false);
    const title = (pick as unknown as { title?: string; name?: string; id: string }).title
      ?? (pick as unknown as { title?: string; name?: string; id: string }).name
      ?? pick.id;
    setSurpriseSplash(title);
    window.setTimeout(() => {
      setSurpriseSplash(null);
      navigate(`/play/${pick.id}?surprise=1`);
    }, 650);
  };

  const goToSearchPage = (): void => {
    const q = searchTerm.trim();
    // Submit (Enter) without a popover selection escalates to the dedicated
    // /search page so users get the deeper grouped + ranked view; the
    // lobby's inline filter remains available when not pressing Enter.
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/");
    setSearchOpen(false);
    setPopoverOpen(false);
    setMobileNavOpen(false);
  };

  const submitSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    // If a popover row is highlighted, navigate to it. Selection at
    // popoverHits.length is the "See all results" row, which falls
    // through to /search just like an unselected Enter.
    if (showPopover && searchSelected >= 0 && searchSelected < popoverHits.length) {
      const target = popoverHits[searchSelected];
      if (target) {
        navigate(target.href);
        setSearchOpen(false);
        setPopoverOpen(false);
        setMobileNavOpen(false);
        return;
      }
    }
    goToSearchPage();
  };

  const runQuery = (q: string): void => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setSearchTerm(trimmed);
    setDebouncedSearch(trimmed);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
    setPopoverOpen(false);
    setMobileNavOpen(false);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    // Empty-state branch: arrow keys cycle through recent + suggested rows,
    // Enter on a highlighted row navigates via /search?q=...
    if (showPopover && isEmptyState) {
      const total = emptyStateRows.length;
      if (total === 0) {
        if (e.key === "Escape") setPopoverOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSearchSelected((s) => Math.min(s + 1, total - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSearchSelected((s) => (s <= 0 ? -1 : s - 1));
      } else if (e.key === "Enter") {
        if (searchSelected >= 0 && searchSelected < total) {
          const row = emptyStateRows[searchSelected];
          if (row) {
            e.preventDefault();
            runQuery(row.query);
          }
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setPopoverOpen(false);
      }
      return;
    }
    if (!showPopover || popoverHits.length === 0) {
      if (e.key === "Escape") setPopoverOpen(false);
      return;
    }
    // Navigation indices: -1 = input itself (Enter → /search), 0..N-1 =
    // game rows, N = the "See all results" footer row. ArrowUp from row 0
    // returns to the input so the input is never "trapped".
    const max = popoverHits.length; // inclusive upper bound (the see-all row)
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchSelected((s) => Math.min(s + 1, max));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSearchSelected((s) => (s <= 0 ? -1 : s - 1));
    } else if (e.key === "Escape") {
      e.preventDefault();
      setPopoverOpen(false);
    }
  };

  const onPopoverRowClick = (hit: SearchHit): void => {
    navigate(hit.href);
    setSearchOpen(false);
    setPopoverOpen(false);
    setMobileNavOpen(false);
  };

  const submitCode = (e?: React.FormEvent): void => {
    if (e) e.preventDefault();
    const decoded = decodeChallenge(codeInput);
    if (!decoded) {
      setCodeError("That code didn't decode. Check for typos.");
      return;
    }
    setCodeError(null);
    setCodeModalOpen(false);
    setCodeInput("");
    navigate(
      `/play/${decoded.gameId}?seed=${decoded.seed}&friend=1`,
    );
  };

  const dismissNotifications = (): void => {
    setHasNewHighScore(false);
    // Mark current top as seen so we don't re-flag on next poll.
    void fetch("/api/leaderboard/recent?limit=1", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Array<{ id?: string | number }>) => {
        const id = rows?.[0]?.id;
        if (id != null) localStorage.setItem("cas:lastSeenHighScoreId", String(id));
      })
      .catch(() => {});
  };

  return (
    <ConfirmProvider>
    <div className="app-shell">
      {/* Skip link must be the first focusable element on the page so a
          keyboard user (or screen-reader user) can jump past the header /
          nav directly to <main>. The link is visually hidden until it
          receives focus, then becomes a high-contrast pill. */}
      <a className="skip-to-content" href="#main-content" data-testid="skip-to-content">
        Skip to content
      </a>
      <header
        className={`app-header${scrolled ? " is-scrolled" : ""}`}
        role="banner"
      >
        <div className="brand">Cards and Such</div>

        <button
          type="button"
          className="hamburger"
          aria-label="Toggle navigation"
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>

        <nav className={mobileNavOpen ? "is-open" : ""} aria-label="Main">
          <NavLink to="/" end onClick={() => setMobileNavOpen(false)}>{t("nav.lobby")}</NavLink>
          <div
            ref={categoriesRef}
            className="categories-menu"
            style={{ position: "relative", display: "inline-block" }}
          >
            <button
              type="button"
              className="whats-new-link"
              aria-haspopup="menu"
              aria-expanded={categoriesOpen}
              data-testid="nav-categories-toggle"
              onClick={() => setCategoriesOpen((v) => !v)}
            >
              Categories ▾
            </button>
            {categoriesOpen && (
              <div
                role="menu"
                data-testid="nav-categories-menu"
                style={{
                  position: "absolute",
                  top: "calc(100% + 0.35rem)",
                  left: 0,
                  zIndex: 30,
                  background: "var(--bg-surface, #1f2937)",
                  border: "1px solid var(--border, rgba(255,255,255,0.1))",
                  borderRadius: "0.5rem",
                  padding: "0.35rem",
                  minWidth: "9rem",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.15rem",
                }}
              >
                {HEADER_CATEGORIES.map((c) => (
                  <NavLink
                    key={c.id}
                    to={`/category/${c.id}`}
                    role="menuitem"
                    data-testid={`nav-cat-${c.id}`}
                    onClick={() => { setCategoriesOpen(false); setMobileNavOpen(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.4rem 0.6rem",
                      borderRadius: "0.35rem",
                      textDecoration: "none",
                      color: "inherit",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span aria-hidden="true">{c.glyph}</span>
                    <span>{c.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
          <NavLink to="/daily" onClick={() => setMobileNavOpen(false)}>{t("nav.daily")}</NavLink>
          <NavLink to="/leaderboard" onClick={() => setMobileNavOpen(false)}>{t("nav.leaderboard")}</NavLink>
          <button
            type="button"
            className="whats-new-link"
            onClick={() => { setWhatsNewOpen(true); setMobileNavOpen(false); }}
          >
            {t("nav.whats_new")}
          </button>
          <button
            type="button"
            className="whats-new-link"
            data-testid="nav-have-a-code"
            onClick={() => {
              setCodeError(null);
              setCodeInput("");
              setCodeModalOpen(true);
              setMobileNavOpen(false);
            }}
          >
            Have a code?
          </button>
        </nav>

        <div className="user">
          <button
            type="button"
            className="quick-start-btn"
            aria-label="Quick Start a game"
            title="Quick Start"
            data-testid="quick-start-btn"
            onClick={onQuickStart}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
          </button>
          <button
            type="button"
            className="surprise-btn"
            aria-label="Surprise me with a random game"
            title="Surprise!"
            data-testid="surprise-btn"
            onClick={onSurprise}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 12V8H6a2 2 0 1 1 0-4h12.5a1.5 1.5 0 1 1 0 3H12" />
              <rect x="2" y="12" width="20" height="8" rx="1" />
              <path d="M12 12v8" /><path d="M2 16h20" />
            </svg>
          </button>
          <form
            ref={searchFormRef}
            className={`header-search${searchOpen ? " is-open" : ""}`}
            onSubmit={submitSearch}
            role="search"
            style={{ position: "relative" }}
          >
            <button
              type="button"
              className="header-search-toggle"
              aria-label="Search lobby"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
              </svg>
            </button>
            <input
              ref={searchInputRef}
              type="search"
              aria-label="Search lobby"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={onSearchKeyDown}
              onFocus={() => {
                // Always open on focus — the popover branches on whether
                // there's a query (live hits) or not (recents+suggestions).
                setRecentSearches(readRecentSearches());
                setPopoverOpen(true);
              }}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showPopover}
              aria-controls="header-search-popover"
              aria-activedescendant={
                showPopover && searchSelected >= 0
                  ? `header-search-row-${searchSelected}`
                  : undefined
              }
            />
            {showPopover && isEmptyState ? (
              <div
                id="header-search-popover"
                role="listbox"
                data-testid="header-search-popover-empty"
                style={{
                  position: "absolute",
                  top: "calc(100% + 0.35rem)",
                  right: 0,
                  zIndex: 30,
                  minWidth: "260px",
                  maxWidth: "320px",
                  maxHeight: "60vh",
                  overflowY: "auto",
                  background: "var(--bg-surface, #1f2937)",
                  border: "1px solid var(--border, rgba(255,255,255,0.1))",
                  borderRadius: "0.5rem",
                  padding: "0.3rem",
                  boxShadow: "0 12px 28px rgba(0,0,0,0.45)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.15rem",
                }}
              >
                {recentSearches.length > 0 ? (
                  <>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        opacity: 0.6,
                        padding: "0.4rem 0.6rem 0.2rem",
                      }}
                    >
                      Recent searches
                    </div>
                    {recentSearches.map((q, i) => {
                      const flatIdx = i;
                      const selected = flatIdx === searchSelected;
                      return (
                        <button
                          key={`recent-${i}`}
                          type="button"
                          role="option"
                          data-testid={`header-search-recent-${i}`}
                          aria-selected={selected}
                          onMouseEnter={() => setSearchSelected(flatIdx)}
                          onClick={() => runQuery(q)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            padding: "0.4rem 0.6rem",
                            borderRadius: "0.35rem",
                            border: "none",
                            background: selected
                              ? "rgba(129, 140, 248, 0.18)"
                              : "transparent",
                            color: "inherit",
                            cursor: "pointer",
                            textAlign: "left",
                            font: "inherit",
                            fontSize: "0.85rem",
                          }}
                        >
                          <span aria-hidden="true" style={{ opacity: 0.55 }}>↻</span>
                          <span>{q}</span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      data-testid="header-search-clear-recents"
                      onClick={(e) => {
                        e.preventDefault();
                        clearRecentSearches();
                      }}
                      style={{
                        alignSelf: "flex-end",
                        marginTop: "0.1rem",
                        padding: "0.25rem 0.5rem",
                        border: "none",
                        background: "transparent",
                        color: "inherit",
                        cursor: "pointer",
                        font: "inherit",
                        fontSize: "0.7rem",
                        opacity: 0.6,
                        textDecoration: "underline",
                      }}
                    >
                      Clear recent searches
                    </button>
                  </>
                ) : null}
                <div
                  style={{
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    opacity: 0.6,
                    padding: "0.4rem 0.6rem 0.2rem",
                    marginTop: recentSearches.length > 0 ? "0.2rem" : 0,
                    borderTop:
                      recentSearches.length > 0
                        ? "1px solid var(--border, rgba(255,255,255,0.08))"
                        : "none",
                  }}
                >
                  Try one of these
                </div>
                {SUGGESTED_QUERIES.map((q, i) => {
                  const flatIdx = recentSearches.length + i;
                  const selected = flatIdx === searchSelected;
                  return (
                    <button
                      key={`suggest-${q}`}
                      type="button"
                      role="option"
                      data-testid={`header-search-suggest-${i}`}
                      aria-selected={selected}
                      onMouseEnter={() => setSearchSelected(flatIdx)}
                      onClick={() => runQuery(q)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.4rem 0.6rem",
                        borderRadius: "0.35rem",
                        border: "none",
                        background: selected
                          ? "rgba(129, 140, 248, 0.18)"
                          : "transparent",
                        color: "inherit",
                        cursor: "pointer",
                        textAlign: "left",
                        font: "inherit",
                        fontSize: "0.85rem",
                      }}
                    >
                      <span aria-hidden="true" style={{ opacity: 0.55 }}>✨</span>
                      <span>{q}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
            {showPopover && !isEmptyState && popoverHits.length > 0 ? (
              <div
                id="header-search-popover"
                role="listbox"
                data-testid="header-search-popover"
                style={{
                  position: "absolute",
                  top: "calc(100% + 0.35rem)",
                  right: 0,
                  zIndex: 30,
                  minWidth: "260px",
                  maxWidth: "320px",
                  maxHeight: "60vh",
                  overflowY: "auto",
                  background: "var(--bg-surface, #1f2937)",
                  border: "1px solid var(--border, rgba(255,255,255,0.1))",
                  borderRadius: "0.5rem",
                  padding: "0.3rem",
                  boxShadow: "0 12px 28px rgba(0,0,0,0.45)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.15rem",
                }}
              >
                {popoverHits.map((hit, idx) => {
                  const selected = idx === searchSelected;
                  return (
                    <button
                      key={`${hit.kind}-${hit.id}`}
                      type="button"
                      role="option"
                      id={`header-search-row-${idx}`}
                      data-testid={`header-search-row-${idx}`}
                      aria-selected={selected}
                      onMouseEnter={() => setSearchSelected(idx)}
                      onClick={() => onPopoverRowClick(hit)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "0.1rem",
                        padding: "0.45rem 0.6rem",
                        borderRadius: "0.35rem",
                        border: "none",
                        background: selected
                          ? "rgba(129, 140, 248, 0.18)"
                          : "transparent",
                        color: "inherit",
                        cursor: "pointer",
                        textAlign: "left",
                        font: "inherit",
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        {hit.title}
                      </span>
                      {hit.description ? (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            opacity: 0.7,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "100%",
                          }}
                        >
                          {hit.description}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
                <button
                  type="button"
                  role="option"
                  id={`header-search-row-${popoverHits.length}`}
                  data-testid="header-search-see-all"
                  aria-selected={searchSelected === popoverHits.length}
                  onMouseEnter={() => setSearchSelected(popoverHits.length)}
                  onClick={goToSearchPage}
                  style={{
                    marginTop: "0.2rem",
                    padding: "0.45rem 0.6rem",
                    borderTop: "1px solid var(--border, rgba(255,255,255,0.08))",
                    borderRadius: "0.35rem",
                    border: "none",
                    background:
                      searchSelected === popoverHits.length
                        ? "rgba(129, 140, 248, 0.18)"
                        : "transparent",
                    color: "inherit",
                    cursor: "pointer",
                    textAlign: "left",
                    font: "inherit",
                    fontSize: "0.8rem",
                    opacity: 0.85,
                  }}
                >
                  See all results for &ldquo;{searchTerm.trim()}&rdquo; →
                </button>
              </div>
            ) : null}
          </form>

          <button
            type="button"
            className={`bell${hasNewHighScore ? " has-dot" : ""}`}
            aria-label={hasNewHighScore ? "New high score notification" : "Notifications"}
            onClick={dismissNotifications}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {hasNewHighScore ? <span className="bell-dot" aria-hidden="true" /> : null}
          </button>

          <button
            type="button"
            className="sound-toggle"
            aria-label={soundOn ? "Mute sound effects" : "Unmute sound effects"}
            aria-pressed={soundOn}
            data-testid="sound-toggle-header"
            title={soundOn ? "Sound on" : "Sound off"}
            onClick={toggleSound}
          >
            {soundOn ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>
          <LightModeToggle />
          <ThemePicker />
          <span data-testid="current-user">{username}</span>
          <button onClick={logout} aria-label="logout">{t("nav.sign_out")}</button>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}><Outlet /></main>

      <footer className="app-footer" role="contentinfo" aria-label="Site footer">
        <div className="app-footer-cols">
          <div
            className="app-footer-col app-footer-brand-col"
            data-testid="footer-col-1"
          >
            <span className="app-footer-brand">Cards &amp; Such</span>
            <span className="app-footer-tagline">
              A sprawling catalog of card, dice, board, and arcade games — free
              to play in your browser.
            </span>
            <span className="app-footer-version">v0.0.0</span>
          </div>

          <nav
            className="app-footer-col app-footer-links"
            aria-label="Site links"
            data-testid="footer-col-2"
          >
            <span className="app-footer-col-title">Browse</span>
            <NavLink to="/" end>Lobby</NavLink>
            <NavLink to="/daily">Daily</NavLink>
            <NavLink to="/stats">Stats</NavLink>
            <NavLink to="/leaderboard">Leaderboard</NavLink>
            <NavLink to="/settings">Settings</NavLink>
            <NavLink to="/about">About</NavLink>
          </nav>

          <div
            className="app-footer-col app-footer-meta"
            data-testid="footer-col-3"
          >
            <span className="app-footer-col-title">Meta</span>
            <button
              type="button"
              className="app-footer-shortcuts"
              onClick={() => shortcuts.setOpen(true)}
              data-testid="footer-shortcuts-btn"
            >
              Shortcuts
            </button>
            <NavLink to="/privacy">Privacy</NavLink>
            <NavLink to="/credits">Credits</NavLink>
            <a
              className="app-footer-github"
              href="https://github.com/Atvriders/cards-and-such"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <div className="app-footer-bottom" data-testid="footer-bottom">
          <span>
            © {new Date().getFullYear()} Cards &amp; Such — built with React +
            Vite — open source on{" "}
            <a
              href="https://github.com/Atvriders/cards-and-such"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </span>
          <span className="app-footer-build">
            Built {new Date().toISOString().slice(0, 10)} ·{" "}
            <strong>{GAMES.length.toLocaleString()}</strong> games
          </span>
        </div>
      </footer>

      <ToastHost />
      <SparkleHost />
      <KeyboardShortcutsModal open={shortcuts.open} onClose={shortcuts.close} />
      <InstallPrompt />
      <UpdateBanner />

      {surpriseSplash ? (
        <div
          className="surprise-splash"
          role="status"
          aria-live="polite"
          data-testid="surprise-splash"
        >
          <div className="surprise-splash-card">
            <span className="surprise-splash-emoji" aria-hidden="true">🎁</span>
            <span className="surprise-splash-text">
              Surprise! You're playing <strong>{surpriseSplash}</strong>...
            </span>
          </div>
        </div>
      ) : null}

      {welcomeOpen ? (
        <WelcomeTutorial
          onComplete={() => {
            markWelcomeTutorialSeen();
            // Arm the lobby coachmark so the user gets a gentle nudge
            // toward the Featured strip on their next lobby visit.
            setCoachmarkPending();
            setWelcomeOpen(false);
          }}
          onSkip={() => {
            markWelcomeTutorialSeen();
            setCoachmarkPending();
            setWelcomeOpen(false);
          }}
        />
      ) : null}

      {codeModalOpen ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setCodeModalOpen(false)}
          data-testid="app-code-modal-backdrop"
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-code-title"
            onClick={(e) => e.stopPropagation()}
            style={{ minWidth: "min(360px, 90vw)" }}
          >
            <header>
              <h2 id="app-code-title">Enter friend code</h2>
              <button type="button" aria-label="Close" onClick={() => setCodeModalOpen(false)}>×</button>
            </header>
            <form onSubmit={submitCode} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem" }}>
              <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.85 }}>
                Paste the 6-character code your friend shared and we'll
                drop you into the same hand.
              </p>
              <input
                type="text"
                inputMode="latin"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="e.g. AB12CD"
                aria-label="Friend code"
                data-testid="app-code-input"
                value={codeInput}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                onChange={(e) => {
                  setCodeInput(e.target.value);
                  if (codeError) setCodeError(null);
                }}
                style={{
                  padding: "0.6rem 0.7rem",
                  font: "inherit",
                  fontSize: "1.1rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  borderRadius: "0.4rem",
                  border: "1px solid var(--border, rgba(255,255,255,0.18))",
                  background: "var(--bg-input, rgba(0,0,0,0.25))",
                  color: "inherit",
                }}
              />
              {codeError ? (
                <span
                  role="alert"
                  data-testid="app-code-error"
                  style={{ color: "#fca5a5", fontSize: "0.8rem" }}
                >
                  {codeError}
                </span>
              ) : null}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setCodeModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="app-code-go"
                  className="quick-start-btn"
                  style={{ padding: "0.45rem 0.9rem" }}
                >
                  Go
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {whatsNewOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setWhatsNewOpen(false)}>
          <div
            className="modal whats-new-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="whats-new-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header>
              <h2 id="whats-new-title">What's New</h2>
              <button type="button" aria-label="Close" onClick={() => setWhatsNewOpen(false)}>×</button>
            </header>
            <ul>
              {CHANGELOG.map((entry) => (
                <li key={entry.title}>
                  <strong>{entry.title}</strong>
                  <span>{entry.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
    </ConfirmProvider>
  );
}
