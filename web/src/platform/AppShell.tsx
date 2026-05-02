import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./stores/auth.js";
import { ToastHost } from "./ui/Toast.js";
import { SparkleHost } from "./Sparkles.js";
import ThemePicker from "./ui/ThemePicker.js";
import LightModeToggle from "./ui/LightModeToggle.js";
import { isSoundOn, setSoundOn, playSound } from "./sounds.js";
import {
  KeyboardShortcutsModal,
  useKeyboardShortcutsModal,
} from "./KeyboardShortcuts.js";
import { GAMES } from "../games/registry.js";
import { pickQuickstart } from "./quickstart.js";
import { t } from "./i18n.js";
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

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const [hasNewHighScore, setHasNewHighScore] = useState(false);
  // Global "?" / Shift+/ overlay listing every shortcut in the app. The hook
  // installs its own keydown listener and skips inputs/textareas/CE surfaces.
  const shortcuts = useKeyboardShortcutsModal();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [soundOn, setSoundOnState] = useState<boolean>(() => isSoundOn());
  const [surpriseSplash, setSurpriseSplash] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const categoriesRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

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

  const submitSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    const q = searchTerm.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : "/");
    setSearchOpen(false);
    setMobileNavOpen(false);
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
    <div className="app-shell">
      <header className={`app-header${scrolled ? " is-scrolled" : ""}`}>
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

        <nav className={mobileNavOpen ? "is-open" : ""}>
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
            className={`header-search${searchOpen ? " is-open" : ""}`}
            onSubmit={submitSearch}
            role="search"
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
              onBlur={() => { if (!searchTerm) setSearchOpen(false); }}
            />
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

      <main><Outlet /></main>

      <footer className="app-footer" aria-label="Site footer">
        <div className="app-footer-col app-footer-brand-col">
          <span className="app-footer-brand">Cards and Such</span>
          <span className="app-footer-tagline">Classic to modern card games</span>
        </div>
        <nav className="app-footer-col app-footer-links" aria-label="Site information">
          <NavLink to="/about">About</NavLink>
          <NavLink to="/privacy">Privacy</NavLink>
          <NavLink to="/credits">Credits</NavLink>
          <NavLink to="/settings">Settings</NavLink>
          <NavLink to="/stats">Stats</NavLink>
          <button
            type="button"
            className="app-footer-shortcuts"
            onClick={() => shortcuts.setOpen(true)}
            data-testid="footer-shortcuts-btn"
          >
            Shortcuts
          </button>
        </nav>
        <div className="app-footer-col app-footer-meta">
          <span className="app-footer-count">
            <strong>{GAMES.length.toLocaleString()}</strong> games in the catalog
          </span>
          <span className="app-footer-sep" aria-hidden="true">·</span>
          <span className="app-footer-credit">Built with Claude</span>
          <a
            className="app-footer-github"
            href="https://github.com/Atvriders/cards-and-such"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            title="GitHub"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
            </svg>
          </a>
        </div>
      </footer>

      <ToastHost />
      <SparkleHost />
      <KeyboardShortcutsModal open={shortcuts.open} onClose={shortcuts.close} />

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
  );
}
