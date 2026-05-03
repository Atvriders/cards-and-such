import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "../platform/PageHead.js";
import { loadStats } from "../platform/stats.js";
import {
  getStreak,
  recordDailyPlayed,
  recordDailyPlayedWithShield,
  isShieldAvailable,
  SHIELD_COOLDOWN_DAYS,
  type DailyStreak,
} from "../platform/userdata.js";
import { buildShareCardSvg, downloadSvg } from "../platform/svgShare.js";
import { track } from "../platform/analytics.js";
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
  // Shield-aware: silently consumes the once-per-7-days streak shield when
  // the user is returning after exactly one missed day, so the streak
  // survives. Falls through to the unconditional path otherwise. The
  // legacy non-shield helper is re-exported below for tests / callers
  // that want the strict behavior.
  recordDailyPlayedWithShield(stamp);
}

/** Strict (non-shield) variant — kept for tests and explicit callers. */
export function recordDailyCompletionStrict(
  _gameId: string,
  stamp: string,
): void {
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

/**
 * Build the calendar grid for the month containing `now`.
 *
 * Returns a flat list of cells, padded so the first row starts on Sunday and
 * the last row ends on Saturday. Cells outside the active month are marked
 * with `inMonth=false` and have no stamp/day — they exist only to keep the
 * 7-column grid aligned. Cells past today (`isFuture=true`) are non-interactive
 * placeholders.
 */
interface CalendarCell {
  /** YYYY-MM-DD stamp for cells inside the month, otherwise empty string. */
  stamp: string;
  /** Day-of-month (1-31) for cells inside the month, otherwise 0. */
  day: number;
  /** True for cells that belong to the active month. */
  inMonth: boolean;
  /** True when this cell is today. */
  isToday: boolean;
  /** True when this cell is strictly after today (not yet playable). */
  isFuture: boolean;
}

function buildMonthGrid(now: Date = new Date()): {
  year: number;
  month: number; // 0-11
  cells: CalendarCell[];
} {
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayStr = formatDateStamp(now);

  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Total cells = whole weeks covering all days of the month.
  const total = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells: CalendarCell[] = [];
  for (let i = 0; i < total; i++) {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push({ stamp: "", day: 0, inMonth: false, isToday: false, isFuture: false });
      continue;
    }
    const d = new Date(year, month, dayNum);
    const stamp = formatDateStamp(d);
    cells.push({
      stamp,
      day: dayNum,
      inMonth: true,
      isToday: stamp === todayStr,
      isFuture: stamp > todayStr,
    });
  }
  return { year, month, cells };
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

  // Day-before-yesterday (YYYY-MM-DD) — used to detect the one-missed-day
  // case where the streak shield can still keep things alive.
  const dayBeforeYesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return formatDateStamp(d);
  }, []);
  const shieldAvailable = useMemo(() => isShieldAvailable(today), [today]);
  // Streak is "alive" if the user played today, yesterday, or — when a
  // shield is in their pocket — the day before yesterday. The shield isn't
  // burned until they actually play again (handled in recordDailyCompletion).
  const streakAlive =
    streak.lastDate === today
    || streak.lastDate === yesterday
    || (streak.lastDate === dayBeforeYesterday && shieldAvailable);
  const currentStreak = streakAlive ? streak.current : 0;
  const showEmpty = streak.current === 0 && streak.days.length === 0;

  // Played-days set used by both the calendar and the 7-day history list.
  const playedSet = useMemo(() => new Set(streak.days), [streak.days]);

  // Full-month calendar grid for the current month.
  const calendar = useMemo(() => buildMonthGrid(), []);
  const monthLabel = useMemo(() => {
    const d = new Date(calendar.year, calendar.month, 1);
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }, [calendar.year, calendar.month]);
  const inMonthCells = useMemo(
    () => calendar.cells.filter((c) => c.inMonth),
    [calendar.cells],
  );
  const playedThisMonth = useMemo(
    () => inMonthCells.filter((c) => playedSet.has(c.stamp)).length,
    [inMonthCells, playedSet],
  );

  // Selected past/today calendar cell — shows that day's pick details inline.
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const selectedPick = useMemo(
    () => (selectedStamp ? pickDailyGame(selectedStamp) : null),
    [selectedStamp],
  );
  const selectedPlayed = selectedStamp ? playedSet.has(selectedStamp) : false;
  const handleCellClick = (cell: CalendarCell): void => {
    if (!cell.inMonth || cell.isFuture) return;
    setSelectedStamp((prev) => (prev === cell.stamp ? null : cell.stamp));
  };

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
    track("daily.share", { gameId: todays.game.id });
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
              <span className="daily-streak-num-row">
                <span className="daily-streak-num">{currentStreak}</span>
                <span
                  className={
                    shieldAvailable
                      ? "daily-streak-shield is-ready"
                      : "daily-streak-shield is-spent"
                  }
                  data-testid="daily-streak-shield"
                  role="img"
                  aria-label={
                    shieldAvailable
                      ? "Streak shield ready: missing one day this week won't break your streak"
                      : `Streak shield spent: recharges in up to ${SHIELD_COOLDOWN_DAYS} days`
                  }
                  title={
                    shieldAvailable
                      ? `Streak shield ready - once every ${SHIELD_COOLDOWN_DAYS} days, missing a day won't break your streak.`
                      : "Streak shield used - recharging."
                  }
                >
                  {/* Inline SVG shield so the icon stays crisp at any DPR. */}
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <path
                      d="M8 1.2 2.5 3.2v4.4c0 3.2 2.3 5.9 5.5 7.2 3.2-1.3 5.5-4 5.5-7.2V3.2L8 1.2Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="0.6"
                      strokeLinejoin="round"
                    />
                    {shieldAvailable && (
                      <path
                        d="M5.6 8.1 7.3 9.8l3.1-3.4"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>
                </span>
              </span>
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
        className="daily-calendar"
        data-testid="daily-calendar"
        aria-label={`Daily activity for ${monthLabel}`}
      >
        <header className="daily-calendar-head">
          <h3>{monthLabel}</h3>
          <span className="daily-calendar-count">
            {playedThisMonth} / {inMonthCells.length}
          </span>
        </header>
        <div className="daily-calendar-dow" aria-hidden="true">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <span key={d} className="daily-calendar-dow-cell">{d}</span>
          ))}
        </div>
        <div className="daily-calendar-grid" role="grid">
          {calendar.cells.map((cell, i) => {
            if (!cell.inMonth) {
              return (
                <span
                  key={`pad-${i}`}
                  className="daily-cal-cell daily-cal-pad"
                  aria-hidden="true"
                />
              );
            }
            const played = playedSet.has(cell.stamp);
            const isSelected = selectedStamp === cell.stamp;
            const classes = [
              "daily-cal-cell",
              played ? "is-played" : "is-empty",
              cell.isToday ? "is-today" : "",
              cell.isFuture ? "is-future" : "",
              isSelected ? "is-selected" : "",
            ].filter(Boolean).join(" ");
            const aria = `${cell.stamp}${played ? ", played" : ""}${cell.isToday ? ", today" : ""}`;
            return (
              <button
                type="button"
                key={cell.stamp}
                data-testid={`daily-cal-cell-${cell.stamp}`}
                data-stamp={cell.stamp}
                className={classes}
                onClick={() => handleCellClick(cell)}
                disabled={cell.isFuture}
                aria-label={aria}
                aria-pressed={isSelected}
              >
                <span className="daily-cal-day">{cell.day}</span>
                {played && <span className="daily-cal-check" aria-hidden="true">✓</span>}
              </button>
            );
          })}
        </div>
        {selectedPick && (
          <div
            className="daily-calendar-detail"
            data-testid="daily-cal-detail"
            role="status"
            aria-live="polite"
          >
            <div className="daily-calendar-detail-row">
              <span className="daily-calendar-detail-date">{prettyDate(selectedPick.stamp)}</span>
              <span
                className={
                  selectedPlayed
                    ? "daily-calendar-detail-status ok"
                    : "daily-calendar-detail-status dim"
                }
              >
                {selectedPlayed ? "✓ Played" : "Not played"}
              </span>
            </div>
            <p className="daily-calendar-detail-title">{selectedPick.game.title}</p>
            <p className="daily-calendar-detail-meta">
              <span>{selectedPick.game.category}</span>
              <span className="daily-calendar-detail-seed">seed #{selectedPick.seed}</span>
            </p>
            {selectedPick.game.description && (
              <p className="daily-calendar-detail-desc">{selectedPick.game.description}</p>
            )}
          </div>
        )}
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
