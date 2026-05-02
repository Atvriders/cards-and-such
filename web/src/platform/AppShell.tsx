import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./stores/auth.js";
import { ToastHost } from "./ui/Toast.js";
import ThemePicker from "./ui/ThemePicker.js";
import LightModeToggle from "./ui/LightModeToggle.js";
import { isSoundOn, setSoundOn, playSound } from "./sounds.js";
import KeyboardCheatSheet from "./KeyboardCheatSheet.js";
import { GAMES } from "../games/registry.js";
import { pickQuickstart } from "./quickstart.js";
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
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [hasNewHighScore, setHasNewHighScore] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [soundOn, setSoundOnState] = useState<boolean>(() => isSoundOn());
  const searchInputRef = useRef<HTMLInputElement | null>(null);

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

  // Global "?" (Shift+/) opens the keyboard cheat sheet. Ignored while typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== "?") return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      e.preventDefault();
      setCheatSheetOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
          <NavLink to="/" end onClick={() => setMobileNavOpen(false)}>Lobby</NavLink>
          <NavLink to="/daily" onClick={() => setMobileNavOpen(false)}>Daily</NavLink>
          <NavLink to="/leaderboard" onClick={() => setMobileNavOpen(false)}>Leaderboard</NavLink>
          <button
            type="button"
            className="whats-new-link"
            onClick={() => { setWhatsNewOpen(true); setMobileNavOpen(false); }}
          >
            What's New
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
          <button onClick={logout} aria-label="logout">Sign out</button>
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
      <KeyboardCheatSheet open={cheatSheetOpen} onClose={() => setCheatSheetOpen(false)} />

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
