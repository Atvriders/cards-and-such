import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "../platform/PageHead.js";
import { loadStats } from "../platform/stats.js";
import { getStreak, recordDailyPlayed, type DailyStreak } from "../platform/userdata.js";
import {
  estimatedMinutes,
  formatDateStamp,
  getTodaysDaily,
  getYesterdaysDaily,
  parScore,
  todayStamp,
  yesterdayStamp,
} from "./dailyPicker.js";
import "./DailyPage.css";

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

  // Streak is "alive" only if the user played today or yesterday.
  const streakAlive = streak.lastDate === today || streak.lastDate === yesterday;
  const currentStreak = streakAlive ? streak.current : 0;
  const showEmpty = streak.current === 0 && streak.days.length === 0;

  // Heatmap: 30 cells, opacity driven by "played" set.
  const playedSet = useMemo(() => new Set(streak.days), [streak.days]);
  const heatStamps = useMemo(() => last30Stamps(), []);

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
        <Link
          to={`/play/${todays.game.id}?seed=${todays.seed}&daily=1`}
          className="daily-play-btn"
          data-testid="daily-play-btn"
        >
          Play Daily
        </Link>
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
    </div>
  );
}
