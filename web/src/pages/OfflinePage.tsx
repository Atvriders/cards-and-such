import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "../platform/PageHead.js";
import { GAMES } from "../games/registry.js";
import { readRecentlyPlayed } from "../platform/quickstart.js";
import "./OfflinePage.css";

interface RecentEntry {
  id: string;
  title: string;
}

function readEntries(): RecentEntry[] {
  // Prefer the canonical recents key written by `recordPlayed` so the
  // offline fallback shares state with Quick Start. Fall back to the
  // simpler `cards-recent-games` array if a host page wrote one.
  const ids = new Set<string>();
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem("cards-recent-games");
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          for (const v of parsed) if (typeof v === "string") ids.add(v);
        }
      }
    }
  } catch {
    /* ignore */
  }
  for (const id of readRecentlyPlayed()) ids.add(id);

  const lookup = new Map(
    GAMES.filter((g): g is NonNullable<typeof g> => g != null).map(
      (g) => [g.id, g.title] as const,
    ),
  );
  return Array.from(ids)
    .filter((id) => lookup.has(id))
    .slice(0, 12)
    .map((id) => ({ id, title: lookup.get(id) ?? id }));
}

export default function OfflinePage(): JSX.Element {
  const initial = useMemo(readEntries, []);
  const [recents, setRecents] = useState<RecentEntry[]>(initial);
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    function refresh(): void {
      setRecents(readEntries());
    }
    function handleOnline(): void {
      setOnline(true);
    }
    function handleOffline(): void {
      setOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <div className="offline-page" data-testid="offline-page">
      <PageHead title="Offline" />

      <header className="offline-hero" data-testid="offline-hero">
        <OfflineIconSvg />
        <h1 className="offline-title">You&apos;re offline</h1>
        <p className="offline-tag">
          {online
            ? "Looks like the network just blipped — most local games still play fine."
            : "No connection — but you can still play any game you've recently opened."}
        </p>
        <div className="offline-status" aria-live="polite">
          <span className={`offline-dot ${online ? "is-online" : "is-offline"}`} />
          {online ? "Network restored" : "Offline mode"}
        </div>
      </header>

      <section className="offline-section">
        <h2 className="offline-section-title">Recently opened</h2>
        {recents.length === 0 ? (
          <p className="offline-empty">
            No recent games yet. Open one online and it&apos;ll show up here for
            offline play.
          </p>
        ) : (
          <ul className="offline-recents">
            {recents.map((g) => (
              <li key={g.id}>
                <Link
                  to={`/play/${g.id}`}
                  className="offline-recent"
                  data-testid={`offline-recent-${g.id}`}
                >
                  <span className="offline-recent-title">{g.title}</span>
                  <span className="offline-recent-cta">Play</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="offline-section offline-tips">
        <h2 className="offline-section-title">Tips</h2>
        <ul className="offline-list">
          <li>Daily, leaderboards, and online play need a connection.</li>
          <li>Local solitaire, dice, and puzzle games run entirely in your browser.</li>
          <li>Reopen the lobby once you&apos;re back online to sync scores.</li>
        </ul>
        <p className="offline-section-hint">
          Try the <Link to="/" className="offline-link">lobby</Link> if you&apos;re
          back online.
        </p>
      </section>
    </div>
  );
}

function OfflineIconSvg(): JSX.Element {
  return (
    <svg
      className="offline-svg"
      viewBox="0 0 220 200"
      role="img"
      aria-label="Offline cloud icon"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="offline-cloud-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
        <linearGradient id="offline-stroke-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f0abfc" />
          <stop offset="50%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
      </defs>
      <path
        d="M55 130 Q35 130 35 110 Q35 92 55 90 Q60 65 90 65 Q120 65 130 90 Q160 90 165 110 Q165 130 145 130 Z"
        fill="url(#offline-cloud-grad)"
        stroke="url(#offline-stroke-grad)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <line
        x1="40"
        y1="50"
        x2="180"
        y2="170"
        stroke="#f0abfc"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="100" cy="155" r="3" fill="#67e8f9" />
      <circle cx="120" cy="170" r="3" fill="#c4b5fd" />
      <circle cx="80" cy="170" r="3" fill="#f0abfc" />
    </svg>
  );
}
