import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "../platform/PageHead.js";
import { loadStats } from "../platform/stats.js";
import { getStreak, recordDailyPlayed, type DailyStreak } from "../platform/userdata.js";
import { buildShareCardSvg, downloadSvg } from "../platform/svgShare.js";
import {
  estimatedMinutes,
  formatDateStamp,
  getTodaysDaily,
  getYesterdaysDaily,
  parScore,
  pickDailyGame,
  todayStamp,
  yesterdayStamp,
} from "./dailyPicker.js";
import "./DailyPage.css";

/** localStorage key for the cosmetic "Notify me daily" toggle. */
const DAILY_NOTIFY_KEY = "cards-daily-notify";

/**
 * Re-export so existing call-sites that import `recordDailyCompletion` from
 * this module keep compiling. The argument list is preserved; the gameId is
 * unused now (the streak machinery is keyed only on dates).
 */
export function recordDailyCompletion(_gameId: string, stamp: string): void {
  recordDailyPlayed(stamp);
}

/** Pretty-print YYYY-MM-DD as e.g. "Saturday, May 2, 2026". */
function prettyDate(stamp: string): string {
  const [y, m, d] = stamp.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return stamp;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Build a list of the last 30 day stamps ending at `now`, oldest -> newest. */
function last30Stamps(now: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    out.push(formatDateStamp(d));
  }
  return out;
}

/** Build the last 7 day stamps ending at `now`, newest -> oldest. */
function last7Stamps(now: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    out.push(formatDateStamp(d));
  }
  return out;
}

/**
 * Read the cosmetic "notify me daily" preference. Persisted as the literal
 * string "true" so the {@link KNOWN_KEYS} export round-trip stays trivial
 * if/when we extend it. Defaults to false.
 */
function readNotifyPref(): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(DAILY_NOTIFY_KEY) === "true";
  } catch {
    return false;
  }
}

function writeNotifyPref(on: boolean): void {
  try {
    if (typeof localStorage === "undefined") return;
    if (on) localStorage.setItem(DAILY_NOTIFY_KEY, "true");
    else localStorage.removeItem(DAILY_NOTIFY_KEY);
  } catch { /* ignore */ }
}

export default function DailyPage(): JSX.Element {
  const today = useMemo(() => todayStamp(), []);
  const yesterday = useMemo(() => yesterdayStamp(), []);
  const todays = useMemo(() => getTodaysDaily(), []);
  const yest = useMemo(() => getYesterdaysDaily(), []);

  const [streak, setStreak] = useState<DailyStreak>(() => getStreak());

  // Refresh streak when the page regains focus — covers the user returning
  // from a play session in the same tab.
  useEffect(() => {
    const refresh = (): void => setStreak(getStreak());
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const stats = useMemo(() => loadStats(), []);
  const yesterdayBest = stats.perGame[yest.game.id]?.best ?? 0;
  const yesterdayPar = parScore(yest.game, yest.seed);
  const todayPar = parScore(todays.game, todays.seed);
  const todayMinutes = estimatedMinutes(todays.game);
  const todayBest = stats.perGame[todays.game.id]?.best ?? 0;

  // Streak is "alive" only if the user played today or yesterday.
  const streakAlive = streak.lastDate === today || streak.lastDate === yesterday;
  const currentStreak = streakAlive ? streak.current : 0;
  const showEmpty = streak.current === 0 && streak.days.length === 0;

  // Heatmap: 30 cells, opacity driven by "played" set.
  const playedSet = useMemo(() => new Set(streak.days), [streak.days]);
  const heatStamps = useMemo(() => last30Stamps(), []);

  // 7-day history: newest -> oldest, with the picked game and a completion
  // signal pulled from the streak's `days` set (the canonical "played daily"
  // record). Falls back to checking `cards-best-times[gameId]` for a non-zero
  // best as a soft signal that the user has at least engaged with that game.
  const history = useMemo(() => {
    const stamps = last7Stamps();
    return stamps.map((stamp) => {
      const pick = pickDailyGame(stamp);
      const playedDaily = playedSet.has(stamp);
      const bestForGame = stats.perGame[pick.game.id]?.best ?? 0;
      const completed = playedDaily || bestForGame > 0;
      return { stamp, pick, completed, playedDaily };
    });
  }, [playedSet, stats]);

  const [notify, setNotify] = useState<boolean>(() => readNotifyPref());
  const handleNotifyToggle = (): void => {
    setNotify((prev) => {
      const next = !prev;
      writeNotifyPref(next);
      return next;
    });
  };

  const handleShare = (): void => {
    const lines = [
      `Game: ${todays.game.title}`,
      `Streak: ${currentStreak} day${currentStreak === 1 ? "" : "s"}`,
      `Best so far: ${todayBest > 0 ? todayBest.toLocaleString() : "—"}`,
      `Date: ${today}`,
    ];
    const svg = buildShareCardSvg({
      title: "Cards & Such — Daily Challenge",
      lines,
      accent: "#818cf8",
      date: new Date(),
    });
    downloadSvg(svg, `cards-daily-${today}.svg`);
  };

  return (
    <div className="daily-page" data-testid="daily-page">
      <PageHead
        title="Daily Challenge"
        description="A fresh seeded game every day. Build your streak and beat the daily par."
        canonical="https://cards.waterburp.com/daily"
      />

      <header className="daily-banner" aria-label="Today's challenge">
        <h1>Daily challenge</h1>
        <p className="daily-banner-sub">One curated game, same seed for everyone — fresh every day.</p>
        <span className="daily-banner-date" data-testid="daily-date">{prettyDate(today)}</span>
      </header>

      <section
        className="daily-pick"
        data-testid="daily-pick"
        aria-label="Today's daily pick"
      >
        <div className="daily-pick-meta">
          <span className="daily-pick-category">{todays.game.category}</span>
          <span className="daily-pick-date" title={today}>{today}</span>
        </div>
        <h2 className="daily-pick-title">{todays.game.title}</h2>
        {todays.game.description && (
          <p className="daily-pick-desc">{todays.game.description}</p>
        )}
        <dl className="daily-pick-stats">
          <div className="daily-pick-stat">
            <dt>Estimated</dt>
            <dd>{todayMinutes} min</dd>
          </div>
          <div className="daily-pick-stat">
            <dt>Par score</dt>
            <dd>{todayPar.toLocaleString()}</dd>
          </div>
          <div className="daily-pick-stat">
            <dt>Seed</dt>
            <dd className="daily-pick-seed">#{todays.seed}</dd>
          </div>
        </dl>
        <div className="daily-pick-actions">
          <Link
            to={`/play/${todays.game.id}?seed=${todays.seed}&daily=1`}
            className="daily-play-btn"
            data-testid="daily-play-btn"
          >
            Play Daily
          </Link>
          <button
            type="button"
            className="daily-share-btn"
            data-testid="daily-share-btn"
            onClick={handleShare}
            aria-label="Share my daily result as an SVG image"
          >
            Share result
          </button>
        </div>
      </section>

      <section className="daily-side">
        <article
          className="daily-streak-card"
          data-testid="daily-streak"
          aria-label={`Current streak ${currentStreak} days`}
        >
          <header className="daily-streak-head">
            <span className="daily-streak-flame" aria-hidden="true">{currentStreak > 0 ? "🔥" : "✨"}</span>
            <h3>Streak</h3>
          </header>
          <div className="daily-streak-row">
            <div className="daily-streak-stat">
              <span className="daily-streak-num">{currentStreak}</span>
              <span className="daily-streak-lbl">current</span>
            </div>
            <div className="daily-streak-stat">
              <span className="daily-streak-num">{streak.longest}</span>
              <span className="daily-streak-lbl">longest</span>
            </div>
          </div>
          <p className="daily-streak-last">
            {streak.lastDate
              ? <>Last played <strong>{streak.lastDate}</strong></>
              : <em>No daily plays yet.</em>}
          </p>
          {showEmpty
            ? <p className="daily-streak-empty">Play today's pick to start your streak!</p>
            : !streakAlive
              ? <p className="daily-streak-empty">Come back tomorrow to keep your streak going!</p>
              : null}
        </article>

        <article
          className="daily-recap"
          data-testid="daily-recap"
          aria-label="Yesterday's recap"
        >
          <header className="daily-recap-head">
            <h3>Yesterday</h3>
            <span className="daily-recap-date">{yesterday}</span>
          </header>
          <p className="daily-recap-title">{yest.game.title}</p>
          <dl className="daily-recap-stats">
            <div>
              <dt>Your best</dt>
              <dd>{yesterdayBest > 0 ? yesterdayBest.toLocaleString() : <span className="dim">—</span>}</dd>
            </div>
            <div>
              <dt>Par</dt>
              <dd>{yesterdayPar.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Result</dt>
              <dd>
                {yesterdayBest === 0
                  ? <span className="dim">Skipped</span>
                  : yesterdayBest >= yesterdayPar
                    ? <span className="ok">Beat par</span>
                    : <span className="warn">Below par</span>}
              </dd>
            </div>
          </dl>
          <Link
            className="daily-recap-link"
            to={`/play/${yest.game.id}?seed=${yest.seed}`}
          >
            Try again
          </Link>
        </article>
      </section>

      <section
        className="daily-heatmap"
        data-testid="daily-heatmap"
        aria-label="Last 30 days played"
      >
        <header className="daily-heatmap-head">
          <h3>Last 30 days</h3>
          <span className="daily-heatmap-count">{streak.days.filter((d) => heatStamps.includes(d)).length} / 30</span>
        </header>
        <svg
          className="daily-heatmap-svg"
          viewBox="0 0 320 56"
          role="img"
          aria-label="Daily activity heatmap"
        >
          {heatStamps.map((s, i) => {
            const played = playedSet.has(s);
            const cx = 8 + i * 10;
            return (
              <circle
                key={s}
                cx={cx}
                cy={28}
                r={played ? 4 : 2.5}
                className={played ? "daily-heat-on" : "daily-heat-off"}
                data-stamp={s}
              >
                <title>{s}{played ? " · played" : ""}</title>
              </circle>
            );
          })}
        </svg>
      </section>

      <section
        className="daily-history"
        data-testid="daily-history"
        aria-label="Last 7 daily picks"
      >
        <header className="daily-history-head">
          <h3>Last 7 days</h3>
          <span className="daily-history-count">
            {history.filter((h) => h.completed).length} / 7
          </span>
        </header>
        <ol className="daily-history-list">
          {history.map((row, i) => (
            <li
              key={row.stamp}
              className="daily-history-row"
              data-testid={`daily-history-row-${i}`}
            >
              <span className="daily-history-date">{row.stamp}</span>
              <span className="daily-history-game" title={row.pick.game.id}>
                {row.pick.game.title}
              </span>
              <span
                className={
                  row.completed
                    ? "daily-history-status ok"
                    : "daily-history-status dim"
                }
              >
                {row.completed ? "✓ Done" : "Skipped"}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="daily-notify-row"
        aria-label="Daily notification preference"
      >
        <label className="daily-notify-label">
          <input
            type="checkbox"
            data-testid="daily-notify"
            checked={notify}
            onChange={handleNotifyToggle}
          />
          <span>Notify me daily</span>
        </label>
        <span className="daily-notify-caveat">(coming soon)</span>
      </section>
    </div>
  );
}
