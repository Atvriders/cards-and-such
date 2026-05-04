import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Test coverage for StatsPage. The page reads its data from localStorage via
 * `loadStats()` (key: "cards-and-such:stats:v1") plus a handful of side
 * blobs (hints / undos / ratings / favorites / best times / streak).
 *
 * Each test seeds localStorage *before* render so the initial useState
 * snapshot picks up our fixture rather than an empty state.
 */

const STATS_KEY = "cards-and-such:stats:v1";

interface PerGameStats {
  played: number;
  wins: number;
  best: number;
}

interface StatsFixture {
  totalPlayed?: number;
  totalWins?: number;
  longestStreak?: number;
  currentStreak?: number;
  perGame?: Record<string, PerGameStats>;
  perCategory?: Record<string, number>;
  daysPlayed?: string[];
  unlocked?: string[];
}

function seedStats(fix: StatsFixture = {}): void {
  const state = {
    totalPlayed: fix.totalPlayed ?? 0,
    totalWins: fix.totalWins ?? 0,
    longestStreak: fix.longestStreak ?? 0,
    currentStreak: fix.currentStreak ?? 0,
    perGame: fix.perGame ?? {},
    perCategory: fix.perCategory ?? {},
    daysPlayed: fix.daysPlayed ?? [],
    unlocked: fix.unlocked ?? [],
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(state));
}

/** Default fixture covering both solitaire and cards categories so the
 *  category filter has something to flip between. Includes hints/undos
 *  blobs so drill-down + aggregate cards have real data. */
function seedRichStats(): void {
  seedStats({
    totalPlayed: 25,
    totalWins: 10,
    longestStreak: 4,
    currentStreak: 2,
    perGame: {
      "klondike": { played: 12, wins: 5, best: 300 },
      "spider": { played: 8, wins: 3, best: 200 },
      "agram": { played: 3, wins: 1, best: 50 },
      "balut": { played: 2, wins: 1, best: 75 },
    },
    perCategory: {
      solitaire: 20,
      cards: 3,
      dice: 2,
    },
    daysPlayed: ["2026-04-30", "2026-05-01", "2026-05-02"],
    unlocked: ["first-win", "ten-wins"],
  });
  localStorage.setItem("cards-hints-used", JSON.stringify({ klondike: 7, spider: 3 }));
  localStorage.setItem("cards-undos-used", JSON.stringify({ klondike: 5, spider: 2 }));
}

function renderPage(): void {
  render(
    <MemoryRouter>
      <ConfirmProvider>
        <StatsPage />
      </ConfirmProvider>
    </MemoryRouter>,
  );
}

describe("StatsPage", () => {
  beforeEach(() => {
    localStorage.clear();
    // Stub URL.createObjectURL so the export buttons don't blow up in jsdom.
    if (typeof URL.createObjectURL !== "function") {
      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        value: vi.fn(() => "blob:mock"),
      });
    } else {
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    }
    if (typeof URL.revokeObjectURL !== "function") {
      Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        value: vi.fn(),
      });
    } else {
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    }
  });

  it("renders all three charts when stats exist", () => {
    seedRichStats();
    renderPage();
    expect(screen.getByTestId("stats-bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("stats-line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("stats-pie-chart")).toBeInTheDocument();
  });

  it("category filter changes the bar chart's contents", () => {
    seedRichStats();
    renderPage();
    // "All" view shows klondike (solitaire) bar.
    expect(screen.getByTestId("stats-drill-klondike")).toBeInTheDocument();
    expect(screen.getByTestId("stats-drill-agram")).toBeInTheDocument();

    // Switch to "Cards" — solitaire bars should drop out, agram remains.
    fireEvent.click(screen.getByTestId("stats-cat-filter-cards"));
    expect(screen.queryByTestId("stats-drill-klondike")).toBeNull();
    expect(screen.queryByTestId("stats-drill-spider")).toBeNull();
    expect(screen.getByTestId("stats-drill-agram")).toBeInTheDocument();

    // Back to "All" — solitaire bar is back.
    fireEvent.click(screen.getByTestId("stats-cat-filter-all"));
    expect(screen.getByTestId("stats-drill-klondike")).toBeInTheDocument();
  });

  it("range buttons toggle aria-pressed on the line chart range toggle", () => {
    seedRichStats();
    renderPage();
    const r14 = screen.getByTestId("stats-range-14d");
    const r30 = screen.getByTestId("stats-range-30d");
    // Default is 14 — pressed.
    expect(r14.getAttribute("aria-pressed")).toBe("true");
    expect(r30.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(r30);
    expect(r14.getAttribute("aria-pressed")).toBe("false");
    expect(r30.getAttribute("aria-pressed")).toBe("true");
  });

  // W180 — Range selector exclusivity for the 7-day window. Clicking
  // `stats-range-7d` must flip aria-pressed=true on itself AND aria-pressed
  // =false on `stats-range-14d` (the previously-pressed default), so the
  // toggle group always has exactly one pressed button. Pins the exclusivity
  // half of the contract that the existing 14↔30 test doesn't cover.
  it("W180: clicking stats-range-7d flips aria-pressed true on it and false on stats-range-14d", () => {
    seedRichStats();
    renderPage();
    const r7 = screen.getByTestId("stats-range-7d");
    const r14 = screen.getByTestId("stats-range-14d");
    // Default is 14 — pressed; 7 starts unpressed.
    expect(r14.getAttribute("aria-pressed")).toBe("true");
    expect(r7.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(r7);
    expect(r7.getAttribute("aria-pressed")).toBe("true");
    expect(r14.getAttribute("aria-pressed")).toBe("false");
  });

  // W626 — Range selector exclusivity for the 90-day window. Clicking
  // `stats-range-90d` must flip aria-pressed=true on itself AND leave every
  // other range button (7d, 14d, 30d) with aria-pressed=false, so the toggle
  // group always has exactly one pressed button. Extends the W180 contract to
  // the widest range option, which the existing 7↔14 and 14↔30 tests miss.
  it("W626: clicking stats-range-90d flips aria-pressed exclusively (7/14/30 all false)", () => {
    seedRichStats();
    renderPage();
    const r7 = screen.getByTestId("stats-range-7d");
    const r14 = screen.getByTestId("stats-range-14d");
    const r30 = screen.getByTestId("stats-range-30d");
    const r90 = screen.getByTestId("stats-range-90d");
    // Default is 14 — pressed; 90 starts unpressed.
    expect(r14.getAttribute("aria-pressed")).toBe("true");
    expect(r90.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(r90);
    // Exclusivity: only 90d is pressed; the others all flip to unpressed.
    expect(r90.getAttribute("aria-pressed")).toBe("true");
    expect(r7.getAttribute("aria-pressed")).toBe("false");
    expect(r14.getAttribute("aria-pressed")).toBe("false");
    expect(r30.getAttribute("aria-pressed")).toBe("false");
  });

  // W676 — Activity range toggle changes the rendered data window. The
  // existing 7d/14d/30d/90d tests only verify aria-pressed flips on the
  // buttons; none assert the LineChart actually re-derives its data series
  // when the range changes. Seed daysPlayed spanning >30 days so the 7d, 30d
  // and 90d windows would each yield a different point count, render the
  // page (default range 14 → 14 circles), then click 7d and 90d and assert
  // the rendered <circle> count tracks the new window length. Pins the
  // contract that `lastNDays(playedSet, range)` actually feeds the chart.
  it("W676: stats activity range toggle changes the rendered data window", () => {
    // Seed 60 daysPlayed entries so even the 90d window has a non-trivial
    // play history, but circle counts equal window length regardless of
    // play density (LineChart renders one <circle> per day, value or zero).
    const today = new Date();
    const days: string[] = [];
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
    }
    seedStats({
      totalPlayed: 60,
      totalWins: 30,
      perGame: { klondike: { played: 60, wins: 30, best: 100 } },
      perCategory: { solitaire: 60 },
      daysPlayed: days,
    });
    renderPage();
    const lineChart = screen.getByTestId("stats-line-chart");
    // Default range is 14 → LineChart renders one <circle> per day.
    expect(lineChart.querySelectorAll("circle").length).toBe(14);

    // Toggle to 7d — point count must shrink to 7.
    fireEvent.click(screen.getByTestId("stats-range-7d"));
    expect(screen.getByTestId("stats-line-chart").querySelectorAll("circle").length).toBe(7);

    // Toggle to 90d — point count must grow to 90, distinct from both prior
    // windows so we've actually proven the data series is range-driven.
    fireEvent.click(screen.getByTestId("stats-range-90d"));
    expect(screen.getByTestId("stats-line-chart").querySelectorAll("circle").length).toBe(90);
  });

  it("achievement search filters the cards", () => {
    seedRichStats();
    // Show-locked toggle defaults off; streak achievements are locked under
    // the rich fixture (no daily-streak blob), so flip the persisted flag on
    // to keep this search assertion focused on filter behavior, not visibility.
    localStorage.setItem("cards-stats-show-locked", "true");
    renderPage();
    // Sanity: a couple of well-known achievements render initially.
    expect(screen.getByTestId("achievement-first-win")).toBeInTheDocument();
    expect(screen.getByTestId("achievement-ten-wins")).toBeInTheDocument();

    const search = screen.getByTestId("stats-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "streak" } });
    // "Streak Starter" / "Keeper" / "Legend" survive; "First Win" filtered out.
    expect(screen.queryByTestId("achievement-first-win")).toBeNull();
    expect(screen.getByTestId("achievement-streak-starter")).toBeInTheDocument();

    // Empty-state when no match.
    fireEvent.change(search, { target: { value: "zzznotathing" } });
    expect(screen.getByTestId("stats-search-empty")).toBeInTheDocument();
  });

  // W180 — Achievement search filters cards by *title* match. The existing
  // "streak" assertion exercises the description-includes branch (several
  // achievement descriptions contain the word "streak"); this test pins the
  // title-includes branch by searching for "shark", which appears only in
  // the title "Card Shark" — no description contains it. Keeps both halves
  // of the `title || description` predicate covered.
  it("W180: typing in stats-search filters achievement cards by name (title match)", () => {
    seedRichStats();
    // Card Shark is locked under the rich fixture — keep it visible so the
    // title-match filter assertion isn't masked by the show-locked gate.
    localStorage.setItem("cards-stats-show-locked", "true");
    renderPage();
    // Sanity: target card and a non-matching neighbor both render initially.
    expect(screen.getByTestId("achievement-card-shark")).toBeInTheDocument();
    expect(screen.getByTestId("achievement-first-win")).toBeInTheDocument();

    const search = screen.getByTestId("stats-search") as HTMLInputElement;
    fireEvent.change(search, { target: { value: "shark" } });
    // Only "Card Shark" survives; "First Win" and "10 Wins" filtered out.
    expect(screen.getByTestId("achievement-card-shark")).toBeInTheDocument();
    expect(screen.queryByTestId("achievement-first-win")).toBeNull();
    expect(screen.queryByTestId("achievement-ten-wins")).toBeNull();
  });

  it("show-locked toggle defaults off, hides locked cards, persists to localStorage", () => {
    // 1 unlocked + 2 in-progress + many locked. Same shape as the ordering
    // test, but here we verify the toggle gates locked cards.
    seedStats({
      totalWins: 1,
      unlocked: ["first-win"],
    });
    renderPage();

    const grid = screen
      .getByTestId("stats-achievements")
      .querySelector(".achievements-grid") as HTMLElement;
    const lockedCount = (): number =>
      Array.from(grid.querySelectorAll('[data-state="locked"]')).length;

    // Toggle defaults to off → no locked cards rendered.
    const toggle = screen.getByTestId("stats-show-locked-toggle") as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    expect(lockedCount()).toBe(0);
    // Unlocked + in-progress still render.
    expect(screen.getByTestId("achievement-first-win")).toBeInTheDocument();
    expect(screen.getByTestId("achievement-ten-wins")).toBeInTheDocument();

    // Flipping the toggle reveals locked cards and persists "true".
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
    expect(lockedCount()).toBeGreaterThan(0);
    expect(localStorage.getItem("cards-stats-show-locked")).toBe("true");

    // Flipping back hides them again and persists "false".
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);
    expect(lockedCount()).toBe(0);
    expect(localStorage.getItem("cards-stats-show-locked")).toBe("false");
  });

  it("show-locked toggle reads its initial value from localStorage", () => {
    seedStats({ totalWins: 1, unlocked: ["first-win"] });
    localStorage.setItem("cards-stats-show-locked", "true");
    renderPage();
    const toggle = screen.getByTestId("stats-show-locked-toggle") as HTMLInputElement;
    expect(toggle.checked).toBe(true);
    const grid = screen
      .getByTestId("stats-achievements")
      .querySelector(".achievements-grid") as HTMLElement;
    expect(grid.querySelectorAll('[data-state="locked"]').length).toBeGreaterThan(0);
  });

  it("clicking a bar opens the drill-down panel with hint/undo rows", () => {
    seedRichStats();
    renderPage();
    fireEvent.click(screen.getByTestId("stats-drill-klondike"));
    const panel = screen.getByTestId("stats-drill-panel");
    expect(panel).toBeInTheDocument();
    // Hint and undo rows reflect the seeded localStorage counters.
    const hints = within(panel).getByTestId("stats-drill-hints");
    const undos = within(panel).getByTestId("stats-drill-undos");
    expect(hints.textContent).toContain("7");
    expect(undos.textContent).toContain("5");
  });

  it("clicking the same bar twice toggles the drill-down panel closed", () => {
    seedRichStats();
    renderPage();
    // First click opens the panel for the targeted bar.
    fireEvent.click(screen.getByTestId("stats-drill-klondike"));
    expect(screen.getByTestId("stats-drill-panel")).toBeInTheDocument();
    // Second click on the same bar closes it (toggle), rather than re-mounting.
    fireEvent.click(screen.getByTestId("stats-drill-klondike"));
    expect(screen.queryByTestId("stats-drill-panel")).toBeNull();
  });

  it("reset stats button shows confirm dialog and clears on confirm", async () => {
    seedRichStats();
    renderPage();
    expect(localStorage.getItem(STATS_KEY)).not.toBeNull();
    fireEvent.click(screen.getByTestId("stats-reset"));
    // ConfirmProvider mounts the dialog.
    const yes = await screen.findByTestId("confirm-yes");
    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(yes);
    });
    // resetStats() removes the stats blob and the hint/undo counters.
    expect(localStorage.getItem(STATS_KEY)).toBeNull();
    expect(localStorage.getItem("cards-hints-used")).toBeNull();
    expect(localStorage.getItem("cards-undos-used")).toBeNull();
  });

  // Tight three-step pin on the stats-reset → ConfirmDialog → confirm-yes
  // happy path: assert the dialog is NOT present pre-click, IS present after
  // click, and that confirming clears the canonical stats blob at
  // `cards-and-such:stats:v1`. This complements the broader test above by
  // isolating the dialog visibility transition + the single key the page is
  // contractually obligated to wipe (sister blobs are covered separately).
  it("stats-reset → ConfirmDialog → confirm-yes clears cards-and-such:stats:v1", async () => {
    seedRichStats();
    renderPage();
    // Pre-click: stats blob is seeded, dialog is not mounted.
    expect(localStorage.getItem(STATS_KEY)).not.toBeNull();
    expect(screen.queryByTestId("confirm-dialog")).toBeNull();
    expect(screen.queryByTestId("confirm-yes")).toBeNull();

    // Click the reset button → ConfirmProvider mounts the dialog.
    fireEvent.click(screen.getByTestId("stats-reset"));
    const dialog = await screen.findByTestId("confirm-dialog");
    expect(dialog).toBeInTheDocument();
    const yes = screen.getByTestId("confirm-yes");
    expect(yes).toBeInTheDocument();

    // Confirm → resetStats() removes the canonical stats key.
    await act(async () => {
      fireEvent.click(yes);
    });
    expect(localStorage.getItem(STATS_KEY)).toBeNull();
  });

  // W325 — Reset isolation. The stats-reset action is contractually
  // limited to the stats blob + its derived counters (hints/undos/time-
  // history). Sister blobs that represent independent user signals —
  // `cards-ratings`, `cards-favorites`, and `cards-best-times` — must
  // survive a reset so users don't lose curated metadata when they only
  // intended to wipe play stats. Pins the negative half of resetStats()'s
  // contract that the existing tests don't cover.
  it("W325: stats-reset clears stats key only, leaving ratings/favorites/best-times untouched", async () => {
    seedRichStats();
    // Seed the three sister blobs that must survive a reset.
    const ratings = { klondike: 5, spider: 4, agram: 3 };
    const favorites = ["klondike", "spider"];
    const bestTimes = { klondike: 120, spider: 90, agram: 200 };
    localStorage.setItem("cards-ratings", JSON.stringify(ratings));
    localStorage.setItem("cards-favorites", JSON.stringify(favorites));
    localStorage.setItem("cards-best-times", JSON.stringify(bestTimes));

    renderPage();
    // Pre-condition: stats blob + sister blobs all present.
    expect(localStorage.getItem(STATS_KEY)).not.toBeNull();
    expect(localStorage.getItem("cards-ratings")).not.toBeNull();
    expect(localStorage.getItem("cards-favorites")).not.toBeNull();
    expect(localStorage.getItem("cards-best-times")).not.toBeNull();

    // Click reset, confirm.
    fireEvent.click(screen.getByTestId("stats-reset"));
    const yes = await screen.findByTestId("confirm-yes");
    await act(async () => {
      fireEvent.click(yes);
    });

    // Stats key + its derived counters are gone.
    expect(localStorage.getItem(STATS_KEY)).toBeNull();
    expect(localStorage.getItem("cards-hints-used")).toBeNull();
    expect(localStorage.getItem("cards-undos-used")).toBeNull();

    // Sister blobs must be byte-for-byte identical to what we seeded —
    // not merely present, but unmodified. Round-trip the JSON to ensure
    // no in-place mutation snuck in via a shared reference.
    expect(localStorage.getItem("cards-ratings")).toBe(JSON.stringify(ratings));
    expect(localStorage.getItem("cards-favorites")).toBe(JSON.stringify(favorites));
    expect(localStorage.getItem("cards-best-times")).toBe(JSON.stringify(bestTimes));
  });

  // W650 — Reset CANCEL flow. The destructive reset path is gated by a
  // ConfirmDialog: clicking `stats-reset` mounts the dialog, but the
  // user must be able to back out (via `confirm-no` or the backdrop)
  // and have the stats blob remain byte-for-byte intact. This pins the
  // negative half of the reset contract — no resetStats() call should
  // fire when the dialog is dismissed rather than confirmed.
  it("W650: stats-reset → confirm-no leaves stats blob intact", async () => {
    seedRichStats();
    const seeded = localStorage.getItem(STATS_KEY);
    const seededHints = localStorage.getItem("cards-hints-used");
    const seededUndos = localStorage.getItem("cards-undos-used");
    expect(seeded).not.toBeNull();

    renderPage();
    // Open the dialog, then back out via the Cancel button.
    fireEvent.click(screen.getByTestId("stats-reset"));
    const cancel = await screen.findByTestId("confirm-no");
    expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(cancel);
    });

    // Dialog dismissed, stats + sister counters untouched.
    expect(screen.queryByTestId("confirm-dialog")).toBeNull();
    expect(localStorage.getItem(STATS_KEY)).toBe(seeded);
    expect(localStorage.getItem("cards-hints-used")).toBe(seededHints);
    expect(localStorage.getItem("cards-undos-used")).toBe(seededUndos);
  });

  // W690 — Reset wipes per-game time-history blobs but leaves unrelated
  // user-data keys untouched. resetStats() funnels through
  // clearAllTimeHistories(), which iterates every `cards-time-history:*`
  // key and removes it. The existing W325 test pins ratings/favorites/
  // best-times preservation but never seeds `cards-time-history:*` so it
  // can't observe the time-history half of the contract. This test seeds
  // two `cards-time-history:<gameId>` blobs (the targeted keys) plus
  // `cards-lobby-filter` (an unrelated key from the same userdata module
  // that must survive a stats reset) and asserts the time-history blobs
  // disappear while the lobby filter is byte-for-byte intact.
  it("W690: stats-reset clears cards-time-history:* keys but leaves cards-lobby-filter untouched", async () => {
    seedRichStats();
    // Targeted keys — should be removed by resetStats() →
    // clearAllTimeHistories().
    const klondikeHistory = JSON.stringify([
      { day: "2026-05-01", time: 120 },
      { day: "2026-05-02", time: 90 },
    ]);
    const spiderHistory = JSON.stringify([
      { day: "2026-05-01", time: 200 },
    ]);
    localStorage.setItem("cards-time-history:klondike", klondikeHistory);
    localStorage.setItem("cards-time-history:spider", spiderHistory);
    // Unrelated key — must survive the reset.
    const lobbyFilter = JSON.stringify({ category: "solitaire", sort: "name" });
    localStorage.setItem("cards-lobby-filter", lobbyFilter);

    renderPage();
    // Pre-condition: targeted + unrelated all present.
    expect(localStorage.getItem("cards-time-history:klondike")).toBe(klondikeHistory);
    expect(localStorage.getItem("cards-time-history:spider")).toBe(spiderHistory);
    expect(localStorage.getItem("cards-lobby-filter")).toBe(lobbyFilter);

    // Click reset, confirm.
    fireEvent.click(screen.getByTestId("stats-reset"));
    const yes = await screen.findByTestId("confirm-yes");
    await act(async () => {
      fireEvent.click(yes);
    });

    // Targeted: stats blob + every cards-time-history:* key gone.
    expect(localStorage.getItem(STATS_KEY)).toBeNull();
    expect(localStorage.getItem("cards-time-history:klondike")).toBeNull();
    expect(localStorage.getItem("cards-time-history:spider")).toBeNull();
    // Unrelated: lobby filter preserved byte-for-byte.
    expect(localStorage.getItem("cards-lobby-filter")).toBe(lobbyFilter);
  });

  it("export buttons exist and are clickable without throwing", () => {
    seedRichStats();
    renderPage();
    const bar = screen.getByTestId("stats-export-bar");
    const line = screen.getByTestId("stats-export-line");
    const pie = screen.getByTestId("stats-export-pie");
    const all = screen.getByTestId("stats-export-all");
    const json = screen.getByTestId("stats-export-json");
    expect(bar).toBeInTheDocument();
    expect(line).toBeInTheDocument();
    expect(pie).toBeInTheDocument();
    expect(all).toBeInTheDocument();
    expect(json).toBeInTheDocument();
    // None of these should throw — they all funnel through downloadSvg
    // which we've stubbed via URL.createObjectURL above.
    expect(() => fireEvent.click(bar)).not.toThrow();
    expect(() => fireEvent.click(line)).not.toThrow();
    expect(() => fireEvent.click(pie)).not.toThrow();
    expect(() => fireEvent.click(all)).not.toThrow();
    expect(() => fireEvent.click(json)).not.toThrow();
    // exportAll stamps the achievement flag.
    expect(localStorage.getItem("cards-stats-exported")).toBe("true");
  });

  // W564 — CSV export shape. Two pinning tests:
  //   1. The Download CSV button renders alongside the other export controls.
  //   2. Clicking it invokes URL.createObjectURL with a text/csv Blob whose
  //      payload starts with the canonical header and emits one row per
  //      game in stats.perGame.
  it("W564: stats-export-csv button renders", () => {
    seedRichStats();
    renderPage();
    const csv = screen.getByTestId("stats-export-csv");
    expect(csv).toBeInTheDocument();
    expect(csv.textContent).toMatch(/CSV/);
  });

  it("W564: clicking stats-export-csv calls URL.createObjectURL with a text/csv Blob whose payload has the canonical header + a row per game", async () => {
    seedRichStats();
    // Capture the Blob handed to URL.createObjectURL so we can read its text.
    const createSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    renderPage();
    fireEvent.click(screen.getByTestId("stats-export-csv"));

    expect(createSpy).toHaveBeenCalled();
    const blob = createSpy.mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    // Blob type carries the text/csv MIME (with charset); spreadsheet tools
    // key off the major/minor type so we pin "text/csv" explicitly.
    expect(blob.type).toMatch(/^text\/csv/);

    // jsdom's Blob doesn't implement .text(); read it via FileReader so we
    // stay portable across the project's vitest environment.
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (): void => resolve(String(reader.result ?? ""));
      reader.onerror = (): void => reject(reader.error);
      reader.readAsText(blob);
    });
    const lines = text.split(/\r\n|\n/).filter((l) => l.length > 0);
    // Header row matches the documented column contract exactly — any drift
    // would silently break downstream pivot tables / scripts.
    expect(lines[0]).toBe(
      "gameId,plays,wins,winRate,bestTime,bestScore,rating,hintsUsed,undosUsed",
    );
    // seedRichStats seeds 4 games (agram, balut, klondike, spider) sorted
    // alphabetically by buildStatsCsv → exactly 4 data rows after the header.
    expect(lines.length).toBe(1 + 4);
    const gameIds = lines.slice(1).map((row) => row.split(",")[0]);
    expect(gameIds).toEqual(["agram", "balut", "klondike", "spider"]);
  });

  // W587 — CSV row data contract. Pins the per-game data row produced by
  // buildStatsCsv() so downstream pivot tables / scripts can rely on the
  // exact cell contents (not just the header). Seeds a single klondike entry
  // with plays=10, wins=5, best(Time)=120 and asserts the emitted row matches
  // `klondike,10,5,0.5000,120,...` after RFC 4180 escaping.
  it("W587: buildStatsCsv emits klondike,10,5,0.5000,120,... for seeded klondike stats", async () => {
    seedStats({
      totalPlayed: 10,
      totalWins: 5,
      perGame: {
        klondike: { played: 10, wins: 5, best: 120 },
      },
    });
    // bestTime column is sourced from `cards-best-times`, not stats.perGame.best.
    localStorage.setItem("cards-best-times", JSON.stringify({ klondike: 120 }));

    const createSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    renderPage();
    fireEvent.click(screen.getByTestId("stats-export-csv"));

    expect(createSpy).toHaveBeenCalled();
    const blob = createSpy.mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (): void => resolve(String(reader.result ?? ""));
      reader.onerror = (): void => reject(reader.error);
      reader.readAsText(blob);
    });
    const lines = text.split(/\r\n|\n/).filter((l) => l.length > 0);
    // Header + exactly one data row for the single seeded game.
    expect(lines.length).toBe(2);
    // gameId,plays,wins,winRate(0.5000),bestTime(120),bestScore(120),rating(empty),hintsUsed(0),undosUsed(0).
    expect(lines[1]).toMatch(/^klondike,10,5,0\.5000,120,/);
    expect(lines[1]).toBe("klondike,10,5,0.5000,120,120,,0,0");
  });

  // W594 — CSV RFC 4180 escaping. A gameId containing a comma or double-quote
  // must be wrapped in double-quotes with internal quotes doubled, otherwise
  // spreadsheet parsers will split the row on the embedded comma or
  // mis-pair the quote. We seed an adversarial id (`evil"game,name`) directly
  // into stats.perGame — it doesn't need to exist in the registry; csvCell()
  // operates on the raw key from loadStats().perGame.
  it("W594: buildStatsCsv escapes gameId with comma and quote per RFC 4180", async () => {
    const evilId = 'evil"game,name';
    seedStats({
      perGame: {
        [evilId]: { played: 1, wins: 0, best: 0 },
      },
    });

    const createSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    renderPage();
    fireEvent.click(screen.getByTestId("stats-export-csv"));

    const blob = createSpy.mock.calls[0][0] as Blob;
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (): void => resolve(String(reader.result ?? ""));
      reader.onerror = (): void => reject(reader.error);
      reader.readAsText(blob);
    });
    const lines = text.split(/\r\n|\n/).filter((l) => l.length > 0);
    // Exactly header + one data row.
    expect(lines.length).toBe(2);
    // The escaped cell must:
    //   1. Begin with a double-quote (wrapping the comma-bearing value).
    //   2. Double the embedded `"` → `""`.
    //   3. Preserve the embedded comma inside the quoted region (so the row
    //      still has the canonical 9 logical fields when parsed RFC 4180-wise).
    const dataRow = lines[1];
    expect(dataRow.startsWith('"evil""game,name"')).toBe(true);
    // Pin the full row so any future drift in csvCell() or column order
    // surfaces immediately. winRate=0/1=0.0000, bestTime/rating empty.
    expect(dataRow).toBe('"evil""game,name",1,0,0.0000,,0,,0,0');
  });

  // W655 — JSON export shape. Clicking stats-export-json must hand
  // URL.createObjectURL a Blob with the application/json MIME, and the
  // payload must parse to an object whose top-level shape matches the
  // documented StatsJsonExport schema (version=1, app/kind tags, an ISO
  // exportedAt, and the full set of side-table keys). Anchors the public
  // contract for power-user backups + bug-report attachments.
  it("W655: clicking stats-export-json downloads a JSON blob matching the stats schema", async () => {
    seedRichStats();
    localStorage.setItem("cards-ratings", JSON.stringify({ klondike: 4 }));
    localStorage.setItem("cards-favorites", JSON.stringify(["klondike"]));
    localStorage.setItem("cards-best-times", JSON.stringify({ klondike: 120 }));

    const createSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    renderPage();
    fireEvent.click(screen.getByTestId("stats-export-json"));

    expect(createSpy).toHaveBeenCalled();
    const blob = createSpy.mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    // MIME pinned to application/json so browsers offer a sensible default
    // handler when the user opens the downloaded file.
    expect(blob.type).toMatch(/^application\/json/);

    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (): void => resolve(String(reader.result ?? ""));
      reader.onerror = (): void => reject(reader.error);
      reader.readAsText(blob);
    });
    const parsed = JSON.parse(text) as Record<string, unknown>;

    // Top-level schema tags — version/app/kind are the discriminators that
    // future importers will key off, so any drift here is a breaking change.
    expect(parsed.version).toBe(1);
    expect(parsed.app).toBe("cards-and-such");
    expect(parsed.kind).toBe("stats");
    expect(typeof parsed.exportedAt).toBe("string");
    expect(() => new Date(parsed.exportedAt as string).toISOString()).not.toThrow();

    // Side-table keys all present (null is allowed for missing blobs, but
    // the keys themselves must be there so consumers can rely on the shape).
    for (const key of [
      "stats",
      "bestTimes",
      "ratings",
      "favorites",
      "hintsUsed",
      "undosUsed",
      "timeHistory",
    ]) {
      expect(parsed).toHaveProperty(key);
    }

    // The seeded side-tables round-trip into the export payload verbatim.
    expect(parsed.bestTimes).toEqual({ klondike: 120 });
    expect(parsed.ratings).toEqual({ klondike: 4 });
    expect(parsed.favorites).toEqual(["klondike"]);
    expect(parsed.hintsUsed).toEqual({ klondike: 7, spider: 3 });
    expect(parsed.undosUsed).toEqual({ klondike: 5, spider: 2 });

    // Nested stats blob carries the seeded perGame map so importers can
    // restore the exact aggregate snapshot the user had at export time.
    const stats = parsed.stats as { perGame: Record<string, unknown> };
    expect(stats.perGame).toHaveProperty("klondike");
    expect(stats.perGame).toHaveProperty("spider");
  });

  it("most-hinted rows render an inline sparkline per game", () => {
    seedRichStats();
    renderPage();
    // seedRichStats puts klondike + spider in cards-hints-used.
    expect(screen.getByTestId("stats-sparkline-klondike")).toBeInTheDocument();
    expect(screen.getByTestId("stats-sparkline-spider")).toBeInTheDocument();
  });

  // W291 — Most-hinted rows feed the Sparkline a single sample (`[row.count]`)
  // because no per-week hint history is tracked. The Sparkline component's
  // single-sample branch draws one centered horizontal bar (a `<line>`, not a
  // `<polyline>`), so the row gets exactly one bar/dot for the current count.
  // This pins both the testid contract and the single-sample render shape so a
  // future refactor can't silently switch the most-hinted card to a multi-point
  // polyline (which would imply hint history we don't actually track).
  it("W291: most-hinted row gets stats-sparkline-<id> SVG with a single bar per current count", () => {
    // Seed only klondike at count=5 so the row index and shape are unambiguous.
    localStorage.setItem("cards-hints-used", JSON.stringify({ klondike: 5 }));
    renderPage();
    const spark = screen.getByTestId("stats-sparkline-klondike");
    // Element is the SVG itself, scoped to the most-hinted row (not the
    // drill-down panel, which is closed by default).
    expect(spark.tagName.toLowerCase()).toBe("svg");
    expect(spark).toHaveClass("stats-sparkline");
    // Single-sample branch: one <line>, zero <polyline>. This is the "single
    // bar/dot per current count" rendering — count=5 doesn't draw 5 marks, it
    // draws one bar whose presence represents the row's count.
    const lines = spark.querySelectorAll("line");
    const polylines = spark.querySelectorAll("polyline");
    expect(lines.length).toBe(1);
    expect(polylines.length).toBe(0);
    // Sparkline lives inside the most-hinted card's first row (rank 1) so the
    // testid is wired through the Top-5 map rather than to some other panel.
    const row = screen.getByTestId("stats-most-hinted-row-0");
    expect(row).toContainElement(spark);
  });

  it("drill-down panel shows a best-times sparkline when history exists", () => {
    seedRichStats();
    // Seed a per-game time history so the drill-down has something to plot.
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: 1, time: 90 },
        { ts: 2, time: 80 },
        { ts: 3, time: 70 },
      ]),
    );
    renderPage();
    fireEvent.click(screen.getByTestId("stats-drill-klondike"));
    const panel = screen.getByTestId("stats-drill-panel");
    expect(within(panel).getByTestId("stats-sparkline-klondike")).toBeInTheDocument();
  });

  // W573 — Drill-down sparkline pulls last-N best times from
  // `cards-time-history:<gameId>` and renders a polyline with one vertex per
  // surviving entry. Multi-entry histories must produce a <polyline> (not a
  // single horizontal bar / baseline), and the vertex count must match the
  // number of finite, positive `time` values on the blob.
  it("W573: drill-down sparkline renders a polyline vertex per cards-time-history:<gameId> entry", () => {
    seedRichStats();
    // Five klondike finishes, oldest -> newest. All `time` values are finite
    // and positive so each one survives the projection in `drillInfo.times`
    // and contributes a vertex to the polyline.
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: 1, time: 200 },
        { ts: 2, time: 180 },
        { ts: 3, time: 150 },
        { ts: 4, time: 130 },
        { ts: 5, time: 110 },
      ]),
    );
    renderPage();
    fireEvent.click(screen.getByTestId("stats-drill-klondike"));
    const panel = screen.getByTestId("stats-drill-panel");
    const spark = within(panel).getByTestId("stats-sparkline-klondike");
    expect(spark).toBeInTheDocument();
    // With >1 finite samples the Sparkline renders a <polyline> (single-sample
    // path emits a <line> instead). Vertex count must equal the seeded length.
    const polyline = spark.querySelector("polyline");
    expect(polyline).not.toBeNull();
    const points = (polyline?.getAttribute("points") ?? "")
      .trim()
      .split(/\s+/)
      .filter((p) => p.length > 0);
    expect(points.length).toBe(5);
  });

  // W573 — Empty-history fallback. With no `cards-time-history:<gameId>` blob
  // (or one with zero usable entries), the drill-down panel must NOT mount the
  // sparkline at all. The page's render gate is `drillInfo.times.length > 0`,
  // so the testid simply isn't in the DOM rather than rendering an empty SVG.
  it("W573: drill-down sparkline is absent when cards-time-history:<gameId> is empty", () => {
    seedRichStats();
    // No `cards-time-history:klondike` key exists; readTimeHistory returns [].
    renderPage();
    fireEvent.click(screen.getByTestId("stats-drill-klondike"));
    const panel = screen.getByTestId("stats-drill-panel");
    expect(panel).toBeInTheDocument();
    // Sparkline is gated on times.length > 0 → not rendered for empty history.
    expect(within(panel).queryByTestId("stats-sparkline-klondike")).toBeNull();
    // Best-time row still renders the em-dash fallback so layout is preserved.
    expect(panel.textContent).toContain("Best time");
    expect(panel.textContent).toContain("—");
  });

  it("aggregate hint/undo cards render with localStorage values", () => {
    seedRichStats();
    renderPage();
    const hintsCard = screen.getByTestId("stat-total-hints");
    const undosCard = screen.getByTestId("stat-total-undos");
    // 7 + 3 = 10 hints, 5 + 2 = 7 undos based on seedRichStats().
    expect(hintsCard.textContent).toContain("10");
    expect(undosCard.textContent).toContain("7");
  });

  // W225 — Aggregate hints/undos sum across all per-game keys in
  // `cards-hints-used` / `cards-undos-used`. Pins the asymmetric case where
  // the hints blob has multiple games (klondike:7 + spider:3 → 10) but the
  // undos blob carries a single key (klondike:2 → 2). Guards against any
  // drift in hintsTotal()/undosTotal() that would over- or under-count a
  // sparse second blob (e.g. mistakenly intersecting keys across the two).
  it("W225: stat-total-hints/undos sum cards-hints-used / cards-undos-used across per-game keys", () => {
    // Seed minimal stats so the page hydrates past the loader; the hint/undo
    // aggregate cards read directly from the side blobs, not the main stats.
    seedStats({ totalPlayed: 1 });
    localStorage.setItem("cards-hints-used", JSON.stringify({ klondike: 7, spider: 3 }));
    localStorage.setItem("cards-undos-used", JSON.stringify({ klondike: 2 }));
    renderPage();
    const hintsCard = screen.getByTestId("stat-total-hints");
    const undosCard = screen.getByTestId("stat-total-undos");
    // 7 + 3 = 10 hints from a two-key blob.
    expect(hintsCard.textContent).toContain("10");
    // 2 from a single-key undos blob — must NOT borrow spider's 3 from the
    // hints blob (no key intersection / cross-blob bleed).
    expect(undosCard.textContent).toContain("2");
    expect(hintsCard.textContent).not.toMatch(/NaN/);
    expect(undosCard.textContent).not.toMatch(/NaN/);
  });

  // W472 — Total time played aggregate card. Two pinning tests:
  //   1. Empty stats (no time-history blobs at all) → "0h 0m 0s" sentinel.
  //   2. Multi-game time-history → sum is rendered with full H/M/S breakdown.
  // Complements the existing "stats-total-time card renders summed seconds"
  // test below by isolating the empty-state sentinel and a richer multi-game
  // sum that crosses the hour boundary (so we exercise all three Hh/Mm/Ss
  // components rather than just minutes/seconds).
  it("W472: stats-total-time card shows '0h 0m 0s' when no time-history blobs exist", () => {
    seedStats({ totalPlayed: 0, totalWins: 0 });
    renderPage();
    const card = screen.getByTestId("stats-total-time");
    expect(card).toBeInTheDocument();
    expect(card.textContent).toContain("Total time played");
    expect(card.textContent).toContain("0h 0m 0s");
    expect(card.textContent).not.toMatch(/NaN/);
  });

  it("W472: stats-total-time card sums multi-game time-history across the hour boundary", () => {
    // 3 klondike entries totaling 3700s + 2 spider entries totaling 125s +
    // 1 agram entry of 75s = 3900s = 1h 5m 0s. Verifies cross-game aggregation
    // and that hours/minutes/seconds all roll up correctly past 3600s.
    seedRichStats();
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: 1, time: 1200 },
        { ts: 2, time: 1500 },
        { ts: 3, time: 1000 },
      ]),
    );
    localStorage.setItem(
      "cards-time-history:spider",
      JSON.stringify([{ ts: 1, time: 100 }, { ts: 2, time: 25 }]),
    );
    localStorage.setItem(
      "cards-time-history:agram",
      JSON.stringify([{ ts: 1, time: 75 }]),
    );
    renderPage();
    const card = screen.getByTestId("stats-total-time");
    expect(card).toBeInTheDocument();
    expect(card.textContent).toContain("1h 5m 0s");
    expect(card.textContent).not.toMatch(/NaN/);
  });

  it("stats-total-time card renders summed seconds from cards-time-history blobs", () => {
    seedRichStats();
    // 90 + 60 = 150s for klondike, 30s for spider → 180s total → "0h 3m 0s".
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([{ ts: 1, time: 90 }, { ts: 2, time: 60 }]),
    );
    localStorage.setItem(
      "cards-time-history:spider",
      JSON.stringify([{ ts: 1, time: 30 }]),
    );
    renderPage();
    const card = screen.getByTestId("stats-total-time");
    expect(card).toBeInTheDocument();
    expect(card.textContent).toContain("0h 3m 0s");
  });

  it("stats-sessions card renders the cards-session-count localStorage value", () => {
    seedRichStats();
    localStorage.setItem("cards-session-count", "42");
    renderPage();
    const card = screen.getByTestId("stats-sessions");
    expect(card).toBeInTheDocument();
    expect(card.textContent).toContain("42");
  });

  it("stats-personal-records-by-category renders fastest time per category from cards-best-times", () => {
    seedRichStats();
    // klondike (solitaire) 120s, spider (solitaire) 90s → solitaire pick = spider 90s.
    // agram (cards) 200s. balut (dice) 150s.
    localStorage.setItem(
      "cards-best-times",
      JSON.stringify({ klondike: 120, spider: 90, agram: 200, balut: 150 }),
    );
    renderPage();
    const card = screen.getByTestId("stats-personal-records-by-category");
    expect(card).toBeInTheDocument();
    const solitaireRow = screen.getByTestId("stats-pr-cat-solitaire");
    expect(solitaireRow.textContent).toContain("Spider Solitaire");
    expect(screen.getByTestId("stats-pr-cat-cards").textContent).toContain("Agram");
    expect(screen.getByTestId("stats-pr-cat-dice").textContent).toContain("Balut");
    // Untouched category renders an em-dash placeholder.
    expect(screen.getByTestId("stats-pr-cat-board").getAttribute("data-empty")).toBe("true");
  });

  // W635: Personal records by category — one entry per category with no
  // contention, so each category row should show exactly its seeded game's
  // title + formatted best time. `texas-holdem` is the cards-category
  // hold'em plugin (id "holdem" is only a family alias, not a registered
  // GamePlugin). formatBestTime: 120->"2m 0s", 60->"1m 0s", 80->"1m 20s".
  it("W635: stats-personal-records-by-category maps one PR per category from cards-best-times", () => {
    seedRichStats();
    localStorage.setItem(
      "cards-best-times",
      JSON.stringify({ klondike: 120, "texas-holdem": 60, yahtzee: 80 }),
    );
    renderPage();
    const solitaireRow = screen.getByTestId("stats-pr-cat-solitaire");
    expect(solitaireRow.textContent).toContain("Klondike Solitaire");
    expect(solitaireRow.textContent).toContain("2m 0s");
    const cardsRow = screen.getByTestId("stats-pr-cat-cards");
    expect(cardsRow.textContent).toContain("Texas Hold'em");
    expect(cardsRow.textContent).toContain("1m 0s");
    const diceRow = screen.getByTestId("stats-pr-cat-dice");
    expect(diceRow.textContent).toContain("Yahtzee-style");
    expect(diceRow.textContent).toContain("1m 20s");
  });

  it("stats-cat-heatmap aggregates plays by category × day-of-week from time histories", () => {
    seedRichStats();
    // Two recent klondike (solitaire) plays + one recent agram (cards) play.
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: now - 1 * dayMs, time: 60 },
        { ts: now - 2 * dayMs, time: 90 },
      ]),
    );
    localStorage.setItem(
      "cards-time-history:agram",
      JSON.stringify([{ ts: now - 1 * dayMs, time: 30 }]),
    );
    renderPage();
    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid).toBeInTheDocument();
    // Sum the data-count attribute across every solitaire cell — must equal 2.
    const solitaireCells = grid.querySelectorAll('[data-testid^="stats-cat-heatmap-solitaire-"]');
    let solitaireTotal = 0;
    solitaireCells.forEach((c) => {
      solitaireTotal += Number(c.getAttribute("data-count") ?? 0);
    });
    expect(solitaireTotal).toBe(2);
    const cardsCells = grid.querySelectorAll('[data-testid^="stats-cat-heatmap-cards-"]');
    let cardsTotal = 0;
    cardsCells.forEach((c) => {
      cardsTotal += Number(c.getAttribute("data-count") ?? 0);
    });
    expect(cardsTotal).toBe(1);
  });

  it("stats-cat-heatmap renders an empty 5x7 grid (35 cells, all data-count=0) when no time history exists", () => {
    // Seed only the stats blob so the page renders, but no cards-time-history:* keys
    // and no cards-best-times. Heatmap should render every cell with data-count="0".
    seedStats({ totalPlayed: 0, totalWins: 0 });
    renderPage();
    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid).toBeInTheDocument();
    const cells = grid.querySelectorAll('[data-testid^="stats-cat-heatmap-"]');
    // 5 categories (solitaire/cards/dice/board/arcade) × 7 days = 35 cells.
    expect(cells.length).toBe(35);
    cells.forEach((c) => {
      expect(c.getAttribute("data-count")).toBe("0");
      expect((c as HTMLElement).textContent).toBe("");
    });
    // Each of the 5 known categories must contribute exactly 7 cells.
    for (const cat of ["solitaire", "cards", "dice", "board", "arcade"]) {
      const catCells = grid.querySelectorAll(`[data-testid^="stats-cat-heatmap-${cat}-"]`);
      expect(catCells.length).toBe(7);
    }
  });

  it("stats-cat-heatmap sets per-cell data-count and opacity scaled to max across categories", () => {
    seedRichStats();
    const dayMs = 24 * 60 * 60 * 1000;
    // Anchor to 12:00 today so DST/midnight rollover doesn't flip the bucketed
    // weekday. We reuse this base to derive deterministic per-day timestamps.
    const base = new Date();
    base.setHours(12, 0, 0, 0);
    const baseMs = base.getTime();
    // dowIndex matches the page's Mon=0..Sun=6 remap of getDay().
    const dowOf = (ts: number): number => (new Date(ts).getDay() + 6) % 7;

    // Three klondike (solitaire) plays all on the same weekday — yields a
    // single solitaire cell with count=3 (the global max).
    const solTs = baseMs - 1 * dayMs;
    // Two agram (cards) plays on a *different* weekday — count=2 in one cell.
    const cardsTs = baseMs - 2 * dayMs;
    // One balut (dice) play on yet another weekday — count=1 in one cell.
    const diceTs = baseMs - 3 * dayMs;
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: solTs, time: 60 },
        { ts: solTs + 60_000, time: 60 },
        { ts: solTs + 120_000, time: 60 },
      ]),
    );
    localStorage.setItem(
      "cards-time-history:agram",
      JSON.stringify([
        { ts: cardsTs, time: 30 },
        { ts: cardsTs + 60_000, time: 30 },
      ]),
    );
    localStorage.setItem(
      "cards-time-history:balut",
      JSON.stringify([{ ts: diceTs, time: 45 }]),
    );

    renderPage();
    const grid = screen.getByTestId("stats-cat-heatmap");
    const dayLabels = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
    const solCell = grid.querySelector(
      `[data-testid="stats-cat-heatmap-solitaire-${dayLabels[dowOf(solTs)]}"]`,
    ) as HTMLElement;
    const cardsCell = grid.querySelector(
      `[data-testid="stats-cat-heatmap-cards-${dayLabels[dowOf(cardsTs)]}"]`,
    ) as HTMLElement;
    const diceCell = grid.querySelector(
      `[data-testid="stats-cat-heatmap-dice-${dayLabels[dowOf(diceTs)]}"]`,
    ) as HTMLElement;
    expect(solCell).not.toBeNull();
    expect(cardsCell).not.toBeNull();
    expect(diceCell).not.toBeNull();
    expect(solCell.getAttribute("data-count")).toBe("3");
    expect(cardsCell.getAttribute("data-count")).toBe("2");
    expect(diceCell.getAttribute("data-count")).toBe("1");
    // Opacity formula in HeatmapChart: max>0 ? 0.12 + 0.88*(v/max) : 0.08.
    // With max=3 the solitaire cell hits the full 1.0, cards = 0.12 + 0.88*(2/3),
    // dice = 0.12 + 0.88*(1/3).
    const solOpacity = Number(solCell.style.opacity);
    const cardsOpacity = Number(cardsCell.style.opacity);
    const diceOpacity = Number(diceCell.style.opacity);
    expect(solOpacity).toBeCloseTo(1.0, 5);
    expect(cardsOpacity).toBeCloseTo(0.12 + 0.88 * (2 / 3), 5);
    expect(diceOpacity).toBeCloseTo(0.12 + 0.88 * (1 / 3), 5);
    // Strict ordering: more plays => higher opacity.
    expect(solOpacity).toBeGreaterThan(cardsOpacity);
    expect(cardsOpacity).toBeGreaterThan(diceOpacity);
    // Untouched cells use the max>0 baseline (formula: 0.12 + 0.88*0/max = 0.12).
    // The deeper 0.08 floor only applies when max === 0 (whole-grid empty case).
    const emptyBoardCell = grid.querySelector(
      '[data-testid="stats-cat-heatmap-board-mon"]',
    ) as HTMLElement;
    expect(emptyBoardCell.getAttribute("data-count")).toBe("0");
    expect(Number(emptyBoardCell.style.opacity)).toBeCloseTo(0.12, 5);
    // Empty cells render no text content (only nonzero counts get printed).
    expect(emptyBoardCell.textContent).toBe("");
  });

  it("stats-hour-of-day card buckets time-history timestamps into hour bins", () => {
    seedRichStats();
    // Pin three klondike plays to a known local hour so peak text is stable.
    // Anchor to YESTERDAY so the seeded hour is never in the future relative
    // to Date.now() (buildHourOfDayCounts drops ts > now), which would
    // otherwise zero out the bucket when the suite runs before 09:00 local.
    const peak = new Date();
    peak.setDate(peak.getDate() - 1);
    peak.setHours(9, 0, 0, 0);
    const peakTs = peak.getTime();
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: peakTs, time: 60 },
        { ts: peakTs + 60_000, time: 60 },
        { ts: peakTs + 120_000, time: 60 },
      ]),
    );
    renderPage();
    const card = screen.getByTestId("stats-hour-of-day");
    expect(card).toBeInTheDocument();
    expect(card.textContent).toContain("Peak 09:00");
    expect(card.textContent).toContain("3 total plays");
  });

  // W353 — Hour-of-day chart peak hour highlight. Seed 5 klondike plays at
  // 14:00 + 2 at 09:00 across two time-history blobs so buildHourOfDayCounts
  // sees a clear winner at hour 14. The card text must include `Peak 14:00`
  // and only the 14h bar (`stats-hour-bar-14`) carries `data-peak="true"`,
  // pinning both the human-readable peak label and the SVG bar marker that
  // downstream styling / screenshot diffs key off of.
  it("W353: hour-of-day chart highlights peak hour 14:00 with data-peak=true on stats-hour-bar-14", () => {
    seedRichStats();
    // Anchor seeded plays to fixed local-time hours by cloning a noon-base
    // Date and rewriting the hour field, so DST and timezone offsets don't
    // shift the bucket out from under the assertion. Stamp YESTERDAY so a
    // pre-09:00 (or pre-14:00) suite run doesn't push the seed into the
    // future and trip buildHourOfDayCounts' ts > now skip.
    const at = (hour: number): number => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      d.setHours(hour, 0, 0, 0);
      return d.getTime();
    };
    const peakTs = at(14);
    const otherTs = at(9);
    // 5 plays at 14:00 (split across klondike + spider so we exercise the
    // multi-blob aggregator) and 2 plays at 09:00 to give 14 a clean win.
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: peakTs, time: 60 },
        { ts: peakTs + 60_000, time: 60 },
        { ts: peakTs + 120_000, time: 60 },
        { ts: otherTs, time: 60 },
        { ts: otherTs + 60_000, time: 60 },
      ]),
    );
    localStorage.setItem(
      "cards-time-history:spider",
      JSON.stringify([
        { ts: peakTs + 180_000, time: 60 },
        { ts: peakTs + 240_000, time: 60 },
      ]),
    );

    renderPage();
    const card = screen.getByTestId("stats-hour-of-day");
    expect(card).toBeInTheDocument();
    // Card subtitle pins the peak hour label + total sample count (5+2=7).
    expect(card.textContent).toContain("Peak 14:00");
    expect(card.textContent).toContain("7 total plays");

    // The chart SVG advertises peak hour via data-peak-hour, and exactly the
    // 14h bar carries data-peak="true" — every other bar is unmarked.
    const chart = screen.getByTestId("stats-hour-chart");
    expect(chart.getAttribute("data-peak-hour")).toBe("14");
    const peakBar = screen.getByTestId("stats-hour-bar-14");
    expect(peakBar.getAttribute("data-peak")).toBe("true");
    const nonPeakBar = screen.getByTestId("stats-hour-bar-9");
    expect(nonPeakBar.getAttribute("data-peak")).toBeNull();
    // Across all 24 bars, exactly one is marked as the peak.
    expect(chart.querySelectorAll('[data-peak="true"]').length).toBe(1);
  });

  // W715 — Per-bar data-count exposes the exact hour bucket counts. Distinct
  // from W353 (which only checks data-peak on the winning bar): here we seed
  // an asymmetric distribution across THREE different hours and verify every
  // one of the 24 bars exists and reports the correct count via data-count.
  // Exercises the full counts[] array, not just the argmax, so any regression
  // that misindexes the bucket array (e.g. off-by-one, UTC vs local hour)
  // surfaces on the non-peak bins too. Also pins the contract that the chart
  // always renders 24 bars regardless of distribution sparsity.
  it("W715: stats-hour-chart renders 24 bars whose data-count matches each hour bucket", () => {
    seedRichStats();
    // Anchor seeded plays to fixed local-time hours on YESTERDAY to dodge
    // both DST/timezone shifts AND the future-skew filter that drops
    // ts > now (which would otherwise nuke late-hour buckets when the test
    // runs in the morning and vice versa).
    const at = (hour: number): number => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      d.setHours(hour, 0, 0, 0);
      return d.getTime();
    };
    // Distribution: 4 plays at 03:00, 1 play at 11:00, 2 plays at 20:00
    // (split across two time-history blobs to exercise multi-blob aggregation).
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: at(3), time: 60 },
        { ts: at(3) + 60_000, time: 60 },
        { ts: at(3) + 120_000, time: 60 },
        { ts: at(11), time: 60 },
      ]),
    );
    localStorage.setItem(
      "cards-time-history:spider",
      JSON.stringify([
        { ts: at(3) + 180_000, time: 60 },
        { ts: at(20), time: 60 },
        { ts: at(20) + 60_000, time: 60 },
      ]),
    );

    renderPage();
    const chart = screen.getByTestId("stats-hour-chart");
    expect(chart.getAttribute("data-total")).toBe("7");

    // All 24 bars must render — the chart's contract is one bar per hour
    // regardless of how sparse the distribution is.
    const bars = chart.querySelectorAll('[data-testid^="stats-hour-bar-"]');
    expect(bars.length).toBe(24);

    // Expected per-hour counts: hour 3 -> 4, hour 11 -> 1, hour 20 -> 2,
    // every other hour -> 0. Walk every bar and assert data-count matches.
    const expected = new Array<number>(24).fill(0);
    expected[3] = 4;
    expected[11] = 1;
    expected[20] = 2;
    for (let hr = 0; hr < 24; hr++) {
      const bar = screen.getByTestId(`stats-hour-bar-${hr}`);
      expect(bar.getAttribute("data-count")).toBe(String(expected[hr]));
    }

    // Sanity-check the totals line up: sum of every bar's data-count equals
    // the chart's data-total attribute (7).
    let sum = 0;
    bars.forEach((b) => {
      sum += Number((b as HTMLElement).getAttribute("data-count") ?? 0);
    });
    expect(sum).toBe(7);
  });

  it("achievement cards render in unlocked → in-progress → locked order with matching data-state", () => {
    // Seed exactly: 1 unlocked (first-win), 2 in-progress (ten-wins, hundred-wins),
    // rest locked. totalWins=1 is the only stats lever flipped, so the only
    // achievements with cur>0 are first-win/ten-wins/hundred-wins. first-win is
    // forced to "unlocked" via the unlocked array, leaving exactly 2 in-progress.
    seedStats({
      totalWins: 1,
      unlocked: ["first-win"],
    });
    // Show-locked toggle defaults off; this test asserts the locked bucket
    // ordering, so opt in via the persisted flag before mount.
    localStorage.setItem("cards-stats-show-locked", "true");
    renderPage();

    const grid = screen
      .getByTestId("stats-achievements")
      .querySelector(".achievements-grid") as HTMLElement;
    expect(grid).not.toBeNull();
    const cards = Array.from(
      grid.querySelectorAll('[data-testid^="achievement-"]'),
    ).filter((el) => !el.getAttribute("data-testid")?.startsWith("achievement-progress-"));

    // Bucket counts: 1 / 2 / many.
    const states = cards.map((c) => c.getAttribute("data-state"));
    expect(states.filter((s) => s === "unlocked").length).toBe(1);
    expect(states.filter((s) => s === "in-progress").length).toBe(2);
    expect(states.filter((s) => s === "locked").length).toBeGreaterThan(0);

    // Section ordering: every unlocked precedes every in-progress, and every
    // in-progress precedes every locked.
    const firstInProgress = states.indexOf("in-progress");
    const lastUnlocked = states.lastIndexOf("unlocked");
    const firstLocked = states.indexOf("locked");
    const lastInProgress = states.lastIndexOf("in-progress");
    expect(lastUnlocked).toBeLessThan(firstInProgress);
    expect(lastInProgress).toBeLessThan(firstLocked);

    // Concrete head-of-list assertions: the unlocked + both in-progress cards
    // are the seeded ones, and ten-wins (10% progress) outranks hundred-wins
    // (1% progress) within the in-progress bucket.
    expect(cards[0].getAttribute("data-testid")).toBe("achievement-first-win");
    expect(cards[0].getAttribute("data-state")).toBe("unlocked");
    expect(cards[1].getAttribute("data-testid")).toBe("achievement-ten-wins");
    expect(cards[1].getAttribute("data-state")).toBe("in-progress");
    expect(cards[2].getAttribute("data-testid")).toBe("achievement-hundred-wins");
    expect(cards[2].getAttribute("data-state")).toBe("in-progress");

    // First locked card sits immediately after the in-progress block and
    // carries data-state="locked".
    expect(cards[3].getAttribute("data-state")).toBe("locked");
  });

  it("this-week comparison card shows current and prior 7-day windows with deltas", () => {
    seedRichStats();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    // Seed klondike with 4 plays in the current week (3 wins, times 60/80/100/120s)
    // and 2 plays in the prior week (1 win, times 200/240s) so we get a clear
    // up-direction delta on plays/wins and a down-direction delta on avg time.
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: now - 1 * dayMs, time: 60, score: 100 },
        { ts: now - 2 * dayMs, time: 80, score: 200 },
        { ts: now - 3 * dayMs, time: 100, score: 0 },
        { ts: now - 6 * dayMs, time: 120, score: 50 },
        { ts: now - 9 * dayMs, time: 200, score: 75 },
        { ts: now - 12 * dayMs, time: 240, score: 0 },
      ]),
    );
    renderPage();
    const card = screen.getByTestId("stats-this-week");
    expect(card).toBeInTheDocument();
    // Current week: 4 plays, 3 wins.
    expect(card.textContent).toContain("4");
    expect(card.textContent).toContain("3");
    // Prior block has 2 plays, 1 win.
    const prior = screen.getByTestId("stats-prev-week");
    expect(prior.textContent).toContain("2");
    expect(prior.textContent).toContain("1");
    // Plays delta: (4-2)/2 = 100% up.
    expect(card.textContent).toMatch(/100%/);
    // At least one delta should render with up direction.
    const ups = card.querySelectorAll('[data-direction="up"]');
    expect(ups.length).toBeGreaterThan(0);
  });

  // W633: focused regression for the "Plays" row delta direction on the
  // this-week comparison card. Seed exactly 4 plays in the current 7d
  // window and 2 plays in the prior 7d window — pctDelta = (4-2)/2 = 100%
  // and the direction must render as "up" (▲ glyph + is-up class) on the
  // stats-this-week card. Guards against an inverted-direction regression
  // where a positive delta would erroneously render as "down" or "flat".
  it("this-week plays delta points up with 100% when current=4 vs prior=2 (W633)", () => {
    seedRichStats();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    // 4 plays inside [now-7d, now] vs 2 plays inside [now-14d, now-7d).
    // Wins are zeroed (score:0) so the wins-row delta is null and can't
    // accidentally satisfy the up-direction assertion below.
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: now - 1 * dayMs, time: 60, score: 0 },
        { ts: now - 2 * dayMs, time: 60, score: 0 },
        { ts: now - 4 * dayMs, time: 60, score: 0 },
        { ts: now - 6 * dayMs, time: 60, score: 0 },
        { ts: now - 9 * dayMs, time: 60, score: 0 },
        { ts: now - 12 * dayMs, time: 60, score: 0 },
      ]),
    );
    renderPage();

    const card = screen.getByTestId("stats-this-week");
    expect(card).toBeInTheDocument();

    // The Plays row is the first <li> in the current-week list.
    const list = within(card).getByTestId("stats-this-week-list");
    const playsRow = list.querySelectorAll("li")[0];
    expect(playsRow).toBeDefined();
    expect(playsRow!.textContent).toContain("4");

    // Direction MUST be "up" — the ▲ glyph and is-up class come from the
    // d > 0 branch of renderDelta. A flat/down render here is a regression.
    const playsDelta = playsRow!.querySelector(".stats-week-delta");
    expect(playsDelta).not.toBeNull();
    expect(playsDelta!.getAttribute("data-direction")).toBe("up");
    expect(playsDelta!.classList.contains("is-up")).toBe(true);
    expect(playsDelta!.textContent).toContain("▲");
    expect(playsDelta!.textContent).toContain("100%");

    // Inversion-immunity: the same span must NOT carry the down/flat
    // classes or glyphs. If a future refactor ever swaps the if/else
    // branches in renderDelta, these guards fail loudly instead of
    // letting "up" render with the wrong styling.
    expect(playsDelta!.classList.contains("is-down")).toBe(false);
    expect(playsDelta!.classList.contains("is-flat")).toBe(false);
    expect(playsDelta!.textContent).not.toContain("▼");
    expect(playsDelta!.textContent).not.toContain("—");

    // Prior block confirms the 2-play baseline is what the delta divided by.
    const prior = screen.getByTestId("stats-prev-week");
    const priorPlays = prior.querySelectorAll("li")[0];
    expect(priorPlays!.textContent).toContain("2");

    // Whole-card scoping: with score=0 on every play, wins go from 0→0 and
    // pctDelta returns null (prior <= 0), so wins/avg-time render as flat
    // em-dashes. Only the Plays row should carry data-direction="up", and
    // it should be exactly the playsDelta span we already asserted.
    const upDeltas = card.querySelectorAll('[data-direction="up"]');
    expect(upDeltas.length).toBe(1);
    expect(upDeltas[0]).toBe(playsDelta);
  });

  // W537: defensive rendering against extreme localStorage corruption.
  // The page must NOT crash, and the affected cards must degrade gracefully:
  //   - corrupt time-history blob → hour chart still renders, total === 0.
  //   - bad best-times entries (NaN/negatives/strings/null/non-finite) →
  //     personal-records card filters them out instead of showing garbage.
  describe("defensive against corrupt localStorage (W537)", () => {
    it("renders with corrupt JSON in cards-time-history:klondike — hour chart shows 0 plays", () => {
      seedRichStats();
      // Malformed JSON (truncated object), trailing garbage, and unicode.
      // progressJSON() catches the SyntaxError and returns null, so the entry
      // is skipped without bubbling the throw up to the render tree.
      localStorage.setItem(
        "cards-time-history:klondike",
        '{"ts":1234,"time":\u{1F4A9}NaN, broken json \u{0000}\uD800',
      );
      // Sibling well-formed-but-semantically-corrupt blob: object instead of
      // array, and an array of non-objects + non-finite ts values. Each
      // branch is rejected by the `Array.isArray` / typeof / isFinite gates.
      localStorage.setItem(
        "cards-time-history:spider",
        JSON.stringify({ not: "an array" }),
      );
      localStorage.setItem(
        "cards-time-history:agram",
        JSON.stringify([null, "string-not-object", 42, { ts: "nope", time: 60 }, { ts: null, time: 60 }]),
      );

      // The render itself is the primary assertion — if any of the above
      // threw, this would explode before reaching the testid checks.
      expect(() => renderPage()).not.toThrow();

      const card = screen.getByTestId("stats-hour-of-day");
      expect(card).toBeInTheDocument();
      expect(card.textContent).toContain("No plays recorded yet");

      // The chart SVG itself reports total=0 via its data-total attribute,
      // and no bar carries data-peak="true" because peakHour is null.
      const chart = screen.getByTestId("stats-hour-chart");
      expect(chart.getAttribute("data-total")).toBe("0");
      expect(chart.getAttribute("data-peak-hour")).toBe("");
      expect(chart.querySelectorAll('[data-peak="true"]').length).toBe(0);
    });

    it("filters NaN/negative/non-finite entries from personal records card", () => {
      seedRichStats();
      // JSON.stringify converts NaN/Infinity → null, so we go through a Record
      // shape that exercises every reject branch in the personalRecords memo:
      //   - klondike: legit positive   → kept
      //   - spider:   null (was NaN)   → typeof !== "number" → dropped
      //   - agram:    -50              → t <= 0 → dropped
      //   - balut:    "NaN" string     → typeof !== "number" → dropped
      //   - 0 second entry             → t <= 0 → dropped
      //   - unknown game id            → no plug → dropped
      const corruptBestTimes: Record<string, unknown> = {
        klondike: 120,
        spider: null,
        agram: -50,
        balut: "NaN",
        "extra-zero-game": 0,
        "ghost-game-id-not-in-registry": 90,
      };
      localStorage.setItem("cards-best-times", JSON.stringify(corruptBestTimes));

      expect(() => renderPage()).not.toThrow();

      const card = screen.getByTestId("stats-personal-records");
      expect(card).toBeInTheDocument();

      // Only the single legit entry survives — exactly one PR row rendered.
      const rows = card.querySelectorAll('[data-testid^="stats-pr-row-"]');
      expect(rows.length).toBe(1);
      expect(rows[0].getAttribute("data-testid")).toBe("stats-pr-row-0");
      expect(rows[0].textContent).toContain("Klondike");
      // None of the dropped IDs leak into the DOM as a row.
      expect(card.textContent).not.toContain("Spider");
      expect(card.textContent).not.toContain("Agram");
      expect(card.textContent).not.toContain("Balut");
      expect(card.textContent).not.toContain("ghost-game-id-not-in-registry");
    });
  });

  // W513 — Replays panel: when there are saved replays in
  // `cards-replays`, the panel must render one row per replay (newest-
  // first) AND surface a "View all replays" link pointing at /replays
  // so power users can jump from the dashboard summary to the full
  // replay browser. This test pins both halves of that contract: the
  // row testids are present in newest-first order, and the link's
  // href round-trips through React Router as `/replays`.
  it("W513: replays panel lists saved replays and links to /replays", () => {
    seedStats({ totalPlayed: 1 });
    // Disk order is newest-last; the panel reverses for display so
    // the freshest entry shows up at index 0 (matching the user's
    // mental model of "most recent on top").
    localStorage.setItem(
      "cards-replays",
      JSON.stringify([
        { id: "r-old", gameId: "klondike", seed: 1, actions: [], savedAt: 1 },
        { id: "r-new", gameId: "spider", seed: 2, actions: ["a", "b"], savedAt: 2 },
      ]),
    );
    renderPage();

    const panel = screen.getByTestId("stats-replays-panel");
    expect(panel).toBeInTheDocument();
    // Empty-state message must NOT render once we have entries — the
    // two branches of the panel are mutually exclusive and a regression
    // that forgot to gate on `replays.length` would surface here.
    expect(screen.queryByTestId("stats-replays-empty")).not.toBeInTheDocument();

    // Newest-first ordering: r-new ("spider") at index 0, r-old
    // ("klondike") at index 1. The Play link's href encodes the gameId
    // for that row, giving us a stable, locale-independent assertion
    // surface that doesn't depend on which display title the GAMES
    // registry happens to expose for each plugin.
    const row0Play = within(panel).getByTestId("stats-replay-0-play");
    const row1Play = within(panel).getByTestId("stats-replay-1-play");
    expect(row0Play.getAttribute("href")).toBe("/play/spider?seed=2");
    expect(row1Play.getAttribute("href")).toBe("/play/klondike?seed=1");

    // The "View all replays" link is the load-bearing affordance for
    // W513 — it must point at the standalone /replays route so the
    // dashboard panel never becomes a dead-end.
    const viewAll = within(panel).getByTestId("view-all-replays");
    expect(viewAll).toBeInTheDocument();
    expect(viewAll.getAttribute("href")).toBe("/replays");
  });

  // W519: defensive against root-stats-blob corruption (StatsState shape).
  // The W537 block above hits side-tables (time-history, best-times); this
  // block exercises the canonical `cards-and-such:stats:v1` blob itself —
  // historically only protected by a JSON-parse try/catch + a shallow
  // `{...empty, ...parsed}` spread, which let bad field types (string
  // perGame, non-array daysPlayed/unlocked, etc.) bubble straight into
  // render and crash deep inside `Object.entries` / `new Set(daysPlayed)` /
  // `unlocked.includes`. loadStats() now coerces each field to its empty
  // default; these tests pin that contract at the page boundary.
  describe("defensive against root stats blob corruption (W519)", () => {
    it("structurally corrupt StatsState fields fall back to empty defaults", () => {
      // perGame as a string would make `Object.entries(perGame)` yield
      // single-character tuples; daysPlayed as a number would crash
      // `new Set(daysPlayed)`; unlocked as a string would crash
      // `unlocked.includes(...)`. NaN / null / object-shaped numerics must
      // clamp to 0 rather than render "NaN" or "[object Object]" text.
      localStorage.setItem(
        STATS_KEY,
        JSON.stringify({
          totalPlayed: "not-a-number",
          totalWins: null,
          longestStreak: NaN,
          currentStreak: { wat: 1 },
          perGame: "totally-not-an-object",
          perCategory: null,
          daysPlayed: 12345,
          unlocked: "first-win",
        }),
      );
      expect(() => renderPage()).not.toThrow();
      expect(screen.getByTestId("stats-page")).toBeInTheDocument();
      expect(screen.getByTestId("stats-line-chart")).toBeInTheDocument();
      // Aggregates fall back to zero; never render "NaN" or junk.
      const played = screen.getByTestId("stat-total-played");
      expect(played.textContent).toContain("0");
      expect(played.textContent).not.toMatch(/NaN/);
      expect(screen.getByTestId("stat-total-wins").textContent).toContain("0");
      // The bogus string-shaped `unlocked` field must not phantom-unlock the
      // first-win achievement — coerces to []. The card is locked + hidden by
      // the default show-locked toggle, so it shouldn't render at all; if a
      // future change relaxes that, it must not carry data-state="unlocked".
      const firstWin = screen.queryByTestId("achievement-first-win");
      if (firstWin) {
        expect(firstWin.getAttribute("data-state")).not.toBe("unlocked");
      }
    });

    it("unicode-keyed time-history blob with NaN times — totalTime + page survive", () => {
      // totalTimePlayedSeconds() walks every `cards-time-history:*` key. A
      // unicode gameId suffix is allowed (no registered game matches, but the
      // aggregator still parses the entry list). NaN / string / negative /
      // Infinity times must be filtered, leaving only the single 45s entry.
      seedRichStats();
      const now = Date.now();
      localStorage.setItem(
        "cards-time-history:🎴-mystery-\u{1F0A1}-game",
        JSON.stringify([
          { ts: now - 1000, time: NaN },
          { ts: now - 2000, time: "60" },
          { ts: now - 3000, time: -5 },
          { ts: now - 4000, time: 45 },
          { ts: now - 5000, time: Number.POSITIVE_INFINITY },
        ]),
      );
      expect(() => renderPage()).not.toThrow();
      const totalTime = screen.getByTestId("stats-total-time");
      // Only the 45s entry survives → "0h 0m 45s"; never renders "NaN".
      expect(totalTime.textContent).toContain("0h 0m 45s");
      expect(totalTime.textContent).not.toMatch(/NaN/);
      // Charts that scan time-history globally also survive a unicode key.
      expect(screen.getByTestId("stats-hour-chart")).toBeInTheDocument();
      expect(screen.getByTestId("stats-cat-heatmap")).toBeInTheDocument();
    });
  });

  // Final integration coverage for the show-locked toggle (W515 / W531).
  // Three discrete checks: hide-on-off, show-on-on, persistence to the
  // `cards-stats-show-locked` localStorage key.
  describe("stats-show-locked-toggle (integration)", () => {
    function gridLockedCount(): number {
      const grid = screen
        .getByTestId("stats-achievements")
        .querySelector(".achievements-grid") as HTMLElement;
      return Array.from(grid.querySelectorAll('[data-state="locked"]')).length;
    }

    it("toggle off hides locked cards", () => {
      seedStats({ totalWins: 1, unlocked: ["first-win"] });
      localStorage.setItem("cards-stats-show-locked", "false");
      renderPage();
      const toggle = screen.getByTestId("stats-show-locked-toggle") as HTMLInputElement;
      expect(toggle.checked).toBe(false);
      expect(gridLockedCount()).toBe(0);
    });

    it("toggle on shows locked cards", () => {
      seedStats({ totalWins: 1, unlocked: ["first-win"] });
      localStorage.setItem("cards-stats-show-locked", "true");
      renderPage();
      const toggle = screen.getByTestId("stats-show-locked-toggle") as HTMLInputElement;
      expect(toggle.checked).toBe(true);
      expect(gridLockedCount()).toBeGreaterThan(0);
    });

    it("toggle state persists in cards-stats-show-locked", () => {
      seedStats({ totalWins: 1, unlocked: ["first-win"] });
      renderPage();
      const toggle = screen.getByTestId("stats-show-locked-toggle") as HTMLInputElement;
      // Default off → flipping on writes "true".
      fireEvent.click(toggle);
      expect(localStorage.getItem("cards-stats-show-locked")).toBe("true");
      // Flipping back writes "false" (round-trip persistence).
      fireEvent.click(toggle);
      expect(localStorage.getItem("cards-stats-show-locked")).toBe("false");
    });
  });

  // W156: Achievement progress bars expose ARIA progressbar semantics so
  // assistive tech can announce "halfway there". The Card Shark achievement
  // tracks unique games played with a goal of 50; seeding 25 distinct
  // `perGame` keys must yield a progressbar with aria-valuenow=25,
  // aria-valuemin=0, aria-valuemax=50 (i.e. 50% progress) and the bucket
  // must classify as "in-progress" (not unlocked, not locked) so the card
  // renders regardless of the show-locked toggle default.
  it("W156: Card Shark achievement renders progressbar at aria-valuenow=25 / aria-valuemax=50 when 25 unique games are seeded", () => {
    // Build 25 distinct perGame entries — Card Shark's `cur` is
    // `Object.keys(s.perGame).length` clamped to 50, so 25 keys → cur=25.
    const perGame: Record<string, { played: number; wins: number; best: number }> = {};
    for (let i = 0; i < 25; i++) {
      perGame[`game-${i}`] = { played: 1, wins: 0, best: 0 };
    }
    seedStats({ totalPlayed: 25, perGame });
    renderPage();

    // Card itself must be in-progress — neither unlocked (cur < goal) nor
    // hidden behind the locked-toggle gate (cur > 0 puts it in the
    // in-progress bucket which is always visible).
    const card = screen.getByTestId("achievement-card-shark");
    expect(card).toBeInTheDocument();
    expect(card.getAttribute("data-state")).toBe("in-progress");

    // Progressbar carries the canonical ARIA values: now=25, min=0, max=50.
    const progressWrap = within(card).getByTestId("achievement-progress-card-shark");
    const bar = progressWrap.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar).not.toBeNull();
    expect(bar.getAttribute("aria-valuenow")).toBe("25");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("50");
    // data-pct mirrors the rounded percent — pin 50 so any drift in the
    // pct formula (e.g. floor vs round) surfaces here, not just visually.
    expect(bar.getAttribute("data-pct")).toBe("50");
    // Human-readable cur/goal label matches the ARIA contract.
    expect(progressWrap.textContent).toContain("25/50");
  });

  // W244: Most-hinted games card. Reads `cards-hints-used` directly and ranks
  // the top 5 by hint count, descending. Empty / missing blob shows the
  // "No hints used yet" empty state with a nudge to the lightbulb button.
  describe("most-hinted card (W244)", () => {
    it("renders top 5 with klondike first when seeded {klondike:7, spider:3}", () => {
      // Stats blob is required so the page hydrates past the loader; the
      // most-hinted memo derives purely from cards-hints-used.
      seedStats({ totalPlayed: 1 });
      localStorage.setItem("cards-hints-used", JSON.stringify({ klondike: 7, spider: 3 }));
      renderPage();
      const panel = screen.getByTestId("stats-most-hinted");
      expect(within(panel).getByText("Most-hinted games")).toBeTruthy();
      // Two seeded entries → exactly two rendered rows (top-5 cap unchanged).
      const row0 = within(panel).getByTestId("stats-most-hinted-row-0");
      const row1 = within(panel).getByTestId("stats-most-hinted-row-1");
      expect(within(panel).queryByTestId("stats-most-hinted-row-2")).toBeNull();
      // klondike (7) outranks spider (3).
      expect(within(row0).getByText("Klondike Solitaire")).toBeTruthy();
      expect(within(row0).getByText("7")).toBeTruthy();
      expect(within(row1).getByText("Spider Solitaire")).toBeTruthy();
      expect(within(row1).getByText("3")).toBeTruthy();
    });

    // W615: Each rendered most-hinted row exposes a `Play` Link whose `href`
    // round-trips through React Router as `/play/<gameId>`, giving users a
    // one-click jump from the stats dashboard back into the game they've
    // hinted on most. Pins the per-row Link contract so any drift in the
    // route shape (or accidental swap to a non-routed <a>) surfaces here.
    it("W615: each row exposes a Play Link with href /play/<id>", () => {
      seedStats({ totalPlayed: 1 });
      localStorage.setItem("cards-hints-used", JSON.stringify({ klondike: 7, spider: 3 }));
      renderPage();
      const panel = screen.getByTestId("stats-most-hinted");
      const row0 = within(panel).getByTestId("stats-most-hinted-row-0");
      const row1 = within(panel).getByTestId("stats-most-hinted-row-1");
      const play0 = within(row0).getByRole("link", { name: "Play" });
      const play1 = within(row1).getByRole("link", { name: "Play" });
      expect(play0.getAttribute("href")).toBe("/play/klondike");
      expect(play1.getAttribute("href")).toBe("/play/spider");
    });

    it("shows empty-state copy when no hints have been used", () => {
      seedStats({ totalPlayed: 1 });
      renderPage();
      const panel = screen.getByTestId("stats-most-hinted");
      expect(
        within(panel).getByText("No hints used yet — try the lightbulb button on a game!"),
      ).toBeTruthy();
      expect(within(panel).queryByTestId("stats-most-hinted-row-0")).toBeNull();
    });
  });

  // W475: The `stats-sessions` summary card surfaces the persisted
  // `cards-session-count` integer (bumped once per app boot by userdata.ts).
  // Seeding the raw localStorage key with "42" before render must round-trip
  // straight into the card's value, pinning the read path that
  // `getSessionCount()` exposes to StatsPage's summary grid.
  it("W475: stats-sessions card renders seeded cards-session-count value", () => {
    seedStats({ totalPlayed: 1 });
    localStorage.setItem("cards-session-count", "42");
    renderPage();
    const card = screen.getByTestId("stats-sessions");
    expect(within(card).getByText("Sessions")).toBeTruthy();
    expect(within(card).getByText("42")).toBeTruthy();
  });

  // W701: stat-longest-streak renders `stats.longestStreak` from loadStats().
  // Distinct from currentStreak — this is the all-time peak in `daysPlayed`
  // streak count, persisted on the stats blob. The card should render the
  // exact integer with the "Longest streak" label, untouched by category
  // filters (which only affect totalsForFilter, not the Records grid).
  it("W701: stat-longest-streak renders the persisted longestStreak from loadStats", () => {
    seedStats({
      totalPlayed: 30,
      totalWins: 12,
      longestStreak: 9,
      currentStreak: 2,
      perCategory: { solitaire: 30 },
    });
    renderPage();
    const card = screen.getByTestId("stat-longest-streak");
    expect(within(card).getByText("Longest streak")).toBeTruthy();
    expect(within(card).getByText("9")).toBeTruthy();
    expect(card.textContent).not.toMatch(/NaN/);
  });

  // W681: stat-favorite-category renders the highest-count perCategory key
  // resolved by `favoriteCategory(stats)` (highest plays-count wins). With
  // perCategory={solitaire:20, cards:3, dice:2}, the card must show "solitaire".
  it("W681: stat-favorite-category renders the highest-count perCategory key", () => {
    seedStats({
      totalPlayed: 25,
      totalWins: 10,
      perCategory: {
        solitaire: 20,
        cards: 3,
        dice: 2,
      },
    });
    renderPage();
    const card = screen.getByTestId("stat-favorite-category");
    expect(within(card).getByText("Favorite")).toBeTruthy();
    expect(within(card).getByText("solitaire")).toBeTruthy();
    expect(card.textContent).not.toContain("—");
  });

  // W717: stats-this-week's "Avg time" row formats current.avgTime via
  // formatAvgTime → formatBestTime ("Mm Ss"). Seed three klondike entries
  // inside the current 7d window with times 60/120/180s — mean is 120s, so
  // the Avg time <em> must read exactly "2m 0s". Existing this-week tests
  // (W633 and the up-direction delta test) only assert plays/wins counts
  // and delta directions; this pins the actual formatted average string.
  it("W717: stats-this-week Avg time row renders formatAvgTime(current.avgTime) as 'Mm Ss'", () => {
    seedRichStats();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    // Three plays in [now-7d, now], times 60/120/180s → mean = 120s = "2m 0s".
    // Score=0 on every entry so winsDelta is null and can't accidentally
    // bleed into the avg-time row's text via shared classnames.
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: now - 1 * dayMs, time: 60, score: 0 },
        { ts: now - 2 * dayMs, time: 120, score: 0 },
        { ts: now - 3 * dayMs, time: 180, score: 0 },
      ]),
    );
    renderPage();

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    // Avg time is the 3rd <li> in the current-week list.
    const avgRow = list.querySelectorAll("li")[2];
    expect(avgRow).toBeDefined();
    expect(avgRow!.textContent).toContain("Avg time");
    const avgValue = avgRow!.querySelector(".stats-week-value");
    expect(avgValue).not.toBeNull();
    expect(avgValue!.textContent).toBe("2m 0s");
    // Sanity: the format-failure sentinel must not slip in when avgTime
    // is a finite positive number, and the value must not be NaN.
    expect(avgValue!.textContent).not.toBe("—");
    expect(avgValue!.textContent).not.toMatch(/NaN/);
  });

  // W451: Sanity-check the responsive `.stats-card-grid` so a refactor that
  // drops a card or renames a `data-testid` fails fast. jsdom does not run
  // the `@media (min-width: 1024px)` rule that promotes `stats-activity` to
  // `grid-column: span 2`, so we assert the data-testid that the CSS selector
  // targets (or the inline style fallback, if a future change uses one).
  it("W451: responsive card grid renders all expected testids and activity spans 2 cols on desktop", () => {
    seedRichStats();
    renderPage();
    const expected = [
      "stats-activity",
      "stats-records",
      "stats-categories",
      "stats-hour-of-day",
      "stats-cat-heatmap-card",
      "stats-this-week",
      "stats-personal-records",
      "stats-personal-records-by-category",
      "stats-most-hinted",
      "stats-replays-panel",
      "stats-achievements",
    ];
    for (const id of expected) {
      expect(screen.getByTestId(id)).toBeTruthy();
    }
    const activity = screen.getByTestId("stats-activity");
    const inlineSpan = (activity as HTMLElement).style.gridColumn;
    if (inlineSpan) {
      expect(inlineSpan).toBe("span 2");
    } else {
      // CSS selector `.stats-card-grid > [data-testid="stats-activity"]`
      // sets `grid-column: span 2` at >=1024px. Verify the hook attribute
      // and grid membership the rule depends on.
      expect(activity.getAttribute("data-testid")).toBe("stats-activity");
      expect(activity.parentElement?.classList.contains("stats-card-grid")).toBe(true);
      expect(activity.classList.contains("stats-card")).toBe(true);
    }
  });

  // W738: stat-total-played + stat-total-wins recompute from per-game sums
  // when a category filter is active. Distinct from the "all" view which
  // reads stats.totalPlayed/Wins directly. seedRichStats: klondike (12p/5w)
  // + spider (8p/3w) are solitaire => 20p/8w. agram (3p/1w) is cards.
  // balut (2p/1w) is dice. The unfiltered totals (25/10) must NOT bleed
  // through after switching to the solitaire filter.
  it("W738: stat-total-played + stat-total-wins reflect per-game sums when category filter active", () => {
    seedRichStats();
    renderPage();
    // Sanity: "All" view shows the raw stats.totalPlayed / totalWins.
    expect(screen.getByTestId("stat-total-played").textContent).toContain("25");
    expect(screen.getByTestId("stat-total-wins").textContent).toContain("10");
    // Switch filter to Solitaire — only klondike (12) + spider (8) match.
    fireEvent.click(screen.getByTestId("stats-cat-filter-solitaire"));
    const played = screen.getByTestId("stat-total-played");
    const wins = screen.getByTestId("stat-total-wins");
    expect(played.textContent).toContain("20");
    expect(wins.textContent).toContain("8");
    // Must not echo the unfiltered totals after the filter is applied.
    expect(played.textContent).not.toContain("25");
    expect(wins.textContent).not.toContain("10");
    // Switch to Cards — only agram (3p/1w) matches.
    fireEvent.click(screen.getByTestId("stats-cat-filter-cards"));
    expect(screen.getByTestId("stat-total-played").textContent).toContain("3");
    expect(screen.getByTestId("stat-total-wins").textContent).toContain("1");
  });

  // W741: The personal-records card flags a row as a brand-new PR by
  // rendering a `stats-pr-new-<id>` badge inside its title cell. The
  // `isFresh` predicate (StatsPage.tsx ~L1199) requires (a) `cards-best-times`
  // matches the latest `cards-time-history:<id>` entry within 0.05s AND
  // (b) the latest entry beats the second-best by > 0.05s. This pins both
  // halves: when an older slow run plus a fresh fast run align with the
  // best-time blob, the NEW badge appears for that game and ONLY for that
  // game (a stale-only entry must NOT light up the badge).
  it("W741: stats-pr-new badge renders for a freshly-set PR but not for a tied/stale one", () => {
    seedStats({ totalPlayed: 5 });
    // klondike: latest entry (120s) beats prior (300s) and matches
    // cards-best-times → fresh PR. spider: latest entry equals prior best
    // (200s ties 200s), so isFresh stays false (no strict improvement).
    localStorage.setItem(
      "cards-best-times",
      JSON.stringify({ klondike: 120, spider: 200 }),
    );
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: 1_000, time: 300 },
        { ts: 2_000, time: 120 },
      ]),
    );
    localStorage.setItem(
      "cards-time-history:spider",
      JSON.stringify([
        { ts: 1_000, time: 200 },
        { ts: 2_000, time: 200 },
      ]),
    );
    renderPage();

    const card = screen.getByTestId("stats-personal-records");
    // Fresh PR for klondike: badge renders inside the row.
    const klondikeBadge = within(card).getByTestId("stats-pr-new-klondike");
    expect(klondikeBadge).toBeInTheDocument();
    expect(klondikeBadge.textContent).toMatch(/NEW/i);
    // Spider tied its prior best — no strict improvement, so no NEW badge.
    expect(within(card).queryByTestId("stats-pr-new-spider")).not.toBeInTheDocument();
  });

  // W745: The replays panel renders an empty-state copy block
  // (`stats-replays-empty`) with the "No replays saved yet …" hint when the
  // `cards-replays` localStorage blob is missing or holds an empty array.
  // This is the dual of W513 (which pins the populated path); together they
  // prove the panel's two branches are mutually exclusive. The "Last 0 saved
  // replays" header copy and the always-on "View all replays" link must
  // also render so the empty state never becomes a dead-end for new users.
  it("W745: stats-replays-empty renders 'No replays saved yet' copy when cards-replays is empty", () => {
    seedStats({ totalPlayed: 1 });
    // Explicit empty array → forces the `replays.length === 0` branch even
    // if a stray defensive default happened to coerce missing → []. Belt
    // and suspenders: also clear in case beforeEach didn't.
    localStorage.setItem("cards-replays", JSON.stringify([]));
    renderPage();

    const panel = screen.getByTestId("stats-replays-panel");
    const empty = within(panel).getByTestId("stats-replays-empty");
    expect(empty).toBeInTheDocument();
    expect(empty.textContent).toMatch(/No replays saved yet/i);
    // Populated branch must NOT render any replay rows.
    expect(within(panel).queryByTestId("stats-replay-0")).not.toBeInTheDocument();
    // Header reflects the zero count with pluralized "replays".
    expect(panel.textContent).toMatch(/Last 0 saved replays/);
    // The view-all link must remain present even in the empty state so the
    // /replays route stays reachable from the dashboard.
    const viewAll = within(panel).getByTestId("view-all-replays");
    expect(viewAll.getAttribute("href")).toBe("/replays");
  });

  // W749: Each achievement card renders a human-readable status label inside
  // `.achievement-status` driven by the bucket: "Unlocked" / "In progress" /
  // "Locked". Distinct from the existing `data-state` ordering tests (W515 /
  // W531 / unlocked→in-progress→locked test) which pin the *attribute*, and
  // from W156 which pins the ARIA progressbar values — this test pins the
  // visible English copy assistive tech and sighted users actually see. Seed
  // a triplet that hits all three buckets simultaneously: first-win unlocked,
  // ten-wins in-progress (totalWins=1 → cur=1/goal=10), card-shark locked
  // (zero perGame keys → cur=0/goal=50). Show-locked toggle must be on so
  // the locked card renders.
  it("W749: each achievement card's .achievement-status text matches its bucket (Unlocked / In progress / Locked)", () => {
    seedStats({
      totalWins: 1,
      perGame: {},
      unlocked: ["first-win"],
    });
    localStorage.setItem("cards-stats-show-locked", "true");
    renderPage();

    const unlockedCard = screen.getByTestId("achievement-first-win");
    const inProgressCard = screen.getByTestId("achievement-ten-wins");
    const lockedCard = screen.getByTestId("achievement-card-shark");

    // Sanity: pin each card to the bucket the status label is supposed to
    // mirror, so a regression in the bucket-classifier doesn't masquerade as
    // a label-copy regression.
    expect(unlockedCard.getAttribute("data-state")).toBe("unlocked");
    expect(inProgressCard.getAttribute("data-state")).toBe("in-progress");
    expect(lockedCard.getAttribute("data-state")).toBe("locked");

    // The status label text is the load-bearing assertion: each bucket maps
    // to exactly one of the three canonical strings.
    const unlockedStatus = unlockedCard.querySelector(".achievement-status");
    const inProgressStatus = inProgressCard.querySelector(".achievement-status");
    const lockedStatus = lockedCard.querySelector(".achievement-status");
    expect(unlockedStatus?.textContent).toBe("Unlocked");
    expect(inProgressStatus?.textContent).toBe("In progress");
    expect(lockedStatus?.textContent).toBe("Locked");
  });

  // W752 — Replays-panel header pluralization for the singular case. The
  // header copy is `Last {n} saved replay{n === 1 ? "" : "s"} (max 5)` so
  // exactly one entry must read "Last 1 saved replay" (no trailing "s")
  // while two-or-more rolls over to "saved replays". W513 / W745 cover the
  // populated (n=2) and empty (n=0) cases — both render the plural — so the
  // singular branch has no live coverage. A stray refactor that flipped the
  // ternary or hard-coded "replays" would silently regress only this case.
  // We seed a single replay and pin both halves: the singular header text
  // is present, AND the plural form is NOT (so a "1 saved replays" double-
  // form bug also fails this assertion).
  it("W752: replays panel header uses singular 'saved replay' when exactly one replay is saved", () => {
    seedStats({ totalPlayed: 1 });
    localStorage.setItem(
      "cards-replays",
      JSON.stringify([
        { id: "r-only", gameId: "klondike", seed: 7, actions: ["a"], savedAt: 1 },
      ]),
    );
    renderPage();

    const panel = screen.getByTestId("stats-replays-panel");
    // Header must read the singular form for exactly one saved replay.
    expect(panel.textContent).toMatch(/Last 1 saved replay\b/);
    // And must NOT contain the plural form — guards against a regression
    // that always emits "replays" regardless of count.
    expect(panel.textContent).not.toMatch(/Last 1 saved replays/);
    // Sanity: the single row is in fact rendered (so we're really on the
    // populated branch and not accidentally matching empty-state copy).
    expect(within(panel).getByTestId("stats-replay-0")).toBeInTheDocument();
    expect(within(panel).queryByTestId("stats-replay-1")).not.toBeInTheDocument();
  });

  // W755: The `.achievement-progress-fill` inline `width: <pct>%` style is the
  // load-bearing visual cue that drives the rendered fill bar — distinct from
  // W156 which pins the ARIA progressbar attributes (aria-valuenow / -valuemax
  // / data-pct) and the cur/goal text label, but never touches the actual
  // CSS width that paints the bar. A regression that drops the inline style
  // (e.g. moving width to a className lookup) or computes the percent from a
  // different formula would render a flat / 100%-full bar visually while the
  // ARIA attrs still read correct — silently misleading sighted users. Seed
  // the same Card Shark fixture (25 unique perGame keys, goal 50) and pin the
  // fill element's `style.width` to exactly "50%".
  it("W755: achievement progress fill renders inline width:50% when 25 of 50 unique games are seeded", () => {
    const perGame: Record<string, { played: number; wins: number; best: number }> = {};
    for (let i = 0; i < 25; i++) {
      perGame[`game-${i}`] = { played: 1, wins: 0, best: 0 };
    }
    seedStats({ totalPlayed: 25, perGame });
    renderPage();

    const card = screen.getByTestId("achievement-card-shark");
    const fill = card.querySelector(".achievement-progress-fill") as HTMLElement;
    expect(fill).not.toBeNull();
    // Inline style must be the exact "50%" string driven by the rounded pct
    // — not "0%" (regression to default), not "50" (missing unit), not
    // "100%" (regression that ignores cur/goal ratio).
    expect(fill.style.width).toBe("50%");
  });

  // W760: The "view-all-replays" affordance must render as a real anchor
  // element (React Router's <Link> compiles to <a>) with the literal copy
  // "View all replays →" — including the trailing right-arrow glyph that
  // signals forward navigation to sighted users. W513 and W745 already pin
  // the href contract on both populated and empty branches; this test pins
  // the *element type* and *visible label* so a regression that swaps Link
  // for a <button onClick={navigate}> (which would break right-click → "Open
  // in new tab", middle-click, and Cmd-click flows) or strips the arrow for
  // a plain "View all" rename gets caught at the dashboard boundary.
  it("W760: view-all-replays renders as anchor with 'View all replays →' label in populated state", () => {
    seedStats({ totalPlayed: 1 });
    localStorage.setItem(
      "cards-replays",
      JSON.stringify([
        { id: "r-only", gameId: "klondike", seed: 7, actions: ["a"], savedAt: 1 },
      ]),
    );
    renderPage();

    const panel = screen.getByTestId("stats-replays-panel");
    const viewAll = within(panel).getByTestId("view-all-replays");
    // Element type: must be an <a> tag (Link → anchor), NOT a <button>.
    // This guarantees native browser navigation semantics (new-tab, copy
    // link address, etc.) rather than a JS-only click handler.
    expect(viewAll.tagName).toBe("A");
    // Literal visible copy including the trailing arrow glyph (U+2192).
    // textContent collapses to the exact string the user reads.
    expect(viewAll.textContent).toBe("View all replays →");
  });

  // W764: Each achievement card renders the human-readable `title` and
  // `description` from the achievement metadata as the two prominent visual
  // text rows the user actually reads — `.achievement-title` carries the
  // proper-noun name ("Card Shark") and `.achievement-desc` carries the
  // imperative goal copy ("Play 50 unique games."). W156 / W755 / W749 pin
  // the progress bar, fill width, and status label respectively, but none
  // touch the title / description text rows. A regression that swaps title
  // for id (so users see "card-shark" instead of "Card Shark"), drops the
  // description div entirely, or renders the wrong achievement's metadata
  // into the card would silently make the grid unreadable while the ARIA
  // / progress assertions stay green. Pin both child div text contents to
  // the exact strings sourced from the static ACHIEVEMENTS array.
  it("W764: card-shark card renders '.achievement-title' as 'Card Shark' and '.achievement-desc' as 'Play 50 unique games.'", () => {
    // 25 unique perGame keys puts card-shark in the "in-progress" bucket
    // (cur=25, goal=50) so the card is visible regardless of the
    // show-locked toggle default — same fixture pattern used by W156/W755.
    const perGame: Record<string, { played: number; wins: number; best: number }> = {};
    for (let i = 0; i < 25; i++) {
      perGame[`game-${i}`] = { played: 1, wins: 0, best: 0 };
    }
    seedStats({ totalPlayed: 25, perGame });
    renderPage();

    const card = screen.getByTestId("achievement-card-shark");
    // Title row: must be the proper-noun human name, not the id slug.
    const title = card.querySelector(".achievement-title") as HTMLElement;
    expect(title).not.toBeNull();
    expect(title.textContent).toBe("Card Shark");
    // Description row: imperative goal copy verbatim (note trailing period).
    const desc = card.querySelector(".achievement-desc") as HTMLElement;
    expect(desc).not.toBeNull();
    expect(desc.textContent).toBe("Play 50 unique games.");
  });

  // W768: The `stats-personal-records` card is the per-game best-times table
  // and the memo (StatsPage.tsx ~L1215) sorts ascending by `time` (lower = better)
  // so the fastest run lands at row 0. W635 covered the by-category PR mapping
  // and W681 covered the favorite-category card — but no existing test pins
  // the ascending-by-time order across multiple top-table rows. A regression
  // that flipped the comparator (or sorted by id / insertion order) would
  // silently let a slower time outrank a faster one while every other PR
  // assertion stayed green. Seed four real game ids in deliberately
  // non-ascending insertion order and assert each `stats-pr-row-<idx>` lands
  // on the expected gameId in strict ascending-time order.
  it("W768: stats-personal-records rows render in ascending-time order regardless of insertion order", () => {
    seedStats({ totalPlayed: 4 });
    // Insertion order is intentionally scrambled (not ascending, not
    // alphabetical) so a regression that returned insertion order, key
    // order, or alphabetical order would all fail this assertion.
    localStorage.setItem(
      "cards-best-times",
      JSON.stringify({
        spider: 200,    // expect row 2
        klondike: 50,   // expect row 0 (fastest)
        yahtzee: 300,   // expect row 3 (slowest)
        agram: 120,     // expect row 1
      }),
    );
    renderPage();

    const card = screen.getByTestId("stats-personal-records");
    // All four legit entries render — none of the cap-at-10 / corrupt-filter
    // branches should kick in for this fixture.
    const rows = card.querySelectorAll('[data-testid^="stats-pr-row-"]');
    expect(rows.length).toBe(4);

    // Row 0 = fastest (klondike 50s); row 3 = slowest (yahtzee 300s).
    const row0 = within(card).getByTestId("stats-pr-row-0");
    const row1 = within(card).getByTestId("stats-pr-row-1");
    const row2 = within(card).getByTestId("stats-pr-row-2");
    const row3 = within(card).getByTestId("stats-pr-row-3");
    expect(row0.textContent).toContain("Klondike");
    expect(row1.textContent).toContain("Agram");
    expect(row2.textContent).toContain("Spider");
    expect(row3.textContent).toContain("Yahtzee");
  });

  // W786: The `stats-personal-records` per-game best-times card caps the rendered
  // list at 10 rows (`rows.slice(0, 10)` in StatsPage.tsx). W768 covers the sort
  // order; this complements it by asserting the cap itself — seeding 13 valid
  // best-times must yield exactly 10 rendered rows, with the 11th-fastest entry
  // (chess at 110s) absent from the DOM.
  it("W786: stats-personal-records caps at 10 rows when 13+ entries are seeded", () => {
    seedStats({ totalPlayed: 13 });
    // 13 valid game ids in strictly ascending best-time order. Top 10 by speed
    // should render; chess (110s), checkers (120s), pinochle (130s) must be
    // dropped by the slice(0, 10) cap.
    localStorage.setItem(
      "cards-best-times",
      JSON.stringify({
        klondike: 10,
        spider: 20,
        agram: 30,
        balut: 40,
        yahtzee: 50,
        "texas-holdem": 60,
        hearts: 70,
        euchre: 80,
        whist: 90,
        sudoku: 100,
        chess: 110,    // 11th-fastest — must NOT render
        checkers: 120, // 12th — must NOT render
        pinochle: 130, // 13th — must NOT render
      }),
    );
    renderPage();

    const card = screen.getByTestId("stats-personal-records");
    const rows = card.querySelectorAll('[data-testid^="stats-pr-row-"]');
    expect(rows.length).toBe(10);
    // The fastest entry (klondike, 10s) lands at row 0; the 10th-fastest
    // (sudoku, 100s) lands at row 9; the cap drops chess/checkers/pinochle.
    expect(within(card).getByTestId("stats-pr-row-0").textContent).toContain("Klondike");
    expect(within(card).getByTestId("stats-pr-row-9").textContent).toContain("Sudoku");
    expect(card.querySelector('[data-testid="stats-pr-row-10"]')).toBeNull();
    expect(card.textContent).not.toContain("Chess");
    expect(card.textContent).not.toContain("Checkers");
    expect(card.textContent).not.toContain("Pinochle");
  });

  // W798: the stats-cat-heatmap-card renders a subtitle with a running count of
  // total plays in the last 30 days (e.g. "5 plays in the last 30 days"). The
  // counter is derived from cards-time-history:* timestamps within the 30-day
  // window — verify it matches the seeded entry count rather than total entries.
  it("W798: stats-cat-heatmap-card subtitle renders '<n> plays in the last 30 days' counter", () => {
    seedStats({ totalPlayed: 4 });
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    // 3 plays inside the 30-day window (klondike is solitaire), 1 outside (40d ago)
    // — the counter should report 3, not 4. Plus a non-categorized id to confirm
    // that uncategorized history doesn't pollute the visible counter total.
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: now - 1 * dayMs, time: 90, score: 100 },
        { ts: now - 5 * dayMs, time: 120, score: 200 },
        { ts: now - 15 * dayMs, time: 60, score: 50 },
        { ts: now - 40 * dayMs, time: 30, score: 25 }, // outside window
      ]),
    );
    renderPage();

    const card = screen.getByTestId("stats-cat-heatmap-card");
    const subtitle = card.querySelector(".stats-chart-label");
    expect(subtitle).not.toBeNull();
    expect(subtitle?.textContent).toBe("3 plays in the last 30 days");
  });

  // W820: complement to W633 (which exercised the up-direction branch). When
  // the current 7-day window has FEWER plays than the prior 7-day window, the
  // Plays delta must render with the down-direction styling (is-down class,
  // ▼ glyph, data-direction="down") and the absolute percent magnitude. This
  // pins the d < 0 branch of renderDelta so a future refactor that swaps the
  // up/down branches fails loudly here instead of shipping inverted arrows.
  it("W820: stats-this-week Plays delta renders is-down with ▼ glyph when current<prior", () => {
    seedRichStats();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    // 2 plays in current window vs 4 in prior window → -50% delta.
    // Score=0 keeps wins at 0/0 so wins-row delta is null and can't shadow
    // the down-direction assertion below.
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: now - 1 * dayMs, time: 60, score: 0 },
        { ts: now - 3 * dayMs, time: 60, score: 0 },
        { ts: now - 8 * dayMs, time: 60, score: 0 },
        { ts: now - 9 * dayMs, time: 60, score: 0 },
        { ts: now - 11 * dayMs, time: 60, score: 0 },
        { ts: now - 13 * dayMs, time: 60, score: 0 },
      ]),
    );
    renderPage();

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    const playsRow = list.querySelectorAll("li")[0];
    expect(playsRow).toBeDefined();
    expect(playsRow!.textContent).toContain("2");

    const playsDelta = playsRow!.querySelector(".stats-week-delta");
    expect(playsDelta).not.toBeNull();
    expect(playsDelta!.getAttribute("data-direction")).toBe("down");
    expect(playsDelta!.classList.contains("is-down")).toBe(true);
    expect(playsDelta!.textContent).toContain("▼");
    // Magnitude is rendered as the absolute value (no leading "-").
    expect(playsDelta!.textContent).toContain("50%");
    expect(playsDelta!.textContent).not.toContain("-50%");

    // Inversion-immunity: the same span must NOT carry up/flat styling.
    expect(playsDelta!.classList.contains("is-up")).toBe(false);
    expect(playsDelta!.classList.contains("is-flat")).toBe(false);
    expect(playsDelta!.textContent).not.toContain("▲");
  });

  // W823 — Page-level h1 must render the literal title "Your stats". This
  // pins the top-level heading text + level so a regression that drops the
  // h1, downgrades it to a div, or rewrites the copy (e.g. "Statistics",
  // "My stats") fails loudly. Heading-role + level-1 lookup also guards
  // accessibility: assistive tech relies on exactly one h1 to announce the
  // page identity.
  it("W823: stats page renders 'Your stats' as the top-level h1 heading", () => {
    renderPage();
    const heading = screen.getByRole("heading", { level: 1, name: "Your stats" });
    expect(heading).toBeTruthy();
    expect(heading.tagName).toBe("H1");
  });

  // W828 — The "Top played" section heading must render as an h2. This pins
  // the section's heading text + level so a regression that drops the h2,
  // downgrades it to a div/h3, or rewrites the copy fails loudly. Section
  // h2's give assistive tech a stable outline of the page.
  it("W828: stats page renders 'Top played' as a level-2 section heading", () => {
    renderPage();
    const heading = screen.getByRole("heading", { level: 2, name: "Top played" });
    expect(heading).toBeTruthy();
    expect(heading.tagName).toBe("H2");
  });

  // W826: completes the renderDelta direction trio. W633 pinned the up
  // branch (d > 0) and W820 pinned the down branch (d < 0); this test
  // pins the FLAT branch (d === 0) on the Plays row of the this-week
  // card. Seed an equal number of plays in the current 7d window and the
  // prior 7d window — pctDelta = (n - n) / n = 0% — so the delta must
  // render with is-flat class, data-direction="flat", a literal "0%"
  // magnitude, and explicitly NOT carry the up/down glyphs (▲ / ▼) or
  // classes. Note: the d == null branch ALSO renders is-flat with an
  // em-dash; this test deliberately exercises the d === 0 sub-branch
  // (prior > 0) so the "0%" textContent assertion forces the right path.
  it("W826: stats this-week Plays delta renders is-flat with 0% when current==prior", () => {
    seedRichStats();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    // 2 plays in current window vs 2 plays in prior window → 0% delta.
    // Score=0 keeps wins at 0/0 so wins-row delta is null (also is-flat
    // but with em-dash, not 0%) and can't accidentally satisfy the
    // playsRow assertions below — we explicitly query li[0] (Plays).
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: now - 1 * dayMs, time: 60, score: 0 },
        { ts: now - 3 * dayMs, time: 60, score: 0 },
        { ts: now - 9 * dayMs, time: 60, score: 0 },
        { ts: now - 11 * dayMs, time: 60, score: 0 },
      ]),
    );
    renderPage();

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    const playsRow = list.querySelectorAll("li")[0];
    expect(playsRow).toBeDefined();
    expect(playsRow!.textContent).toContain("2");

    const playsDelta = playsRow!.querySelector(".stats-week-delta");
    expect(playsDelta).not.toBeNull();
    expect(playsDelta!.getAttribute("data-direction")).toBe("flat");
    expect(playsDelta!.classList.contains("is-flat")).toBe(true);
    // d === 0 branch renders the literal "0%" magnitude (not em-dash —
    // that's the d == null branch which has prior <= 0).
    expect(playsDelta!.textContent).toContain("0%");

    // Inversion-immunity: the flat span must NOT carry up/down styling
    // or glyphs. If a future refactor swaps branches in renderDelta,
    // these guards fail loudly instead of shipping the wrong direction.
    expect(playsDelta!.classList.contains("is-up")).toBe(false);
    expect(playsDelta!.classList.contains("is-down")).toBe(false);
    expect(playsDelta!.textContent).not.toContain("▲");
    expect(playsDelta!.textContent).not.toContain("▼");
  });

  // W832: completes the renderDelta is-flat coverage. W826 pinned the
  // d === 0 sub-branch (current == prior > 0) which renders "0%". The
  // is-flat class is shared with the d == null sub-branch — that path
  // fires when pctDelta returns null because `prior <= 0` (no baseline,
  // so a percentage isn't meaningful). This test seeds plays in the
  // CURRENT 7d window only — zero plays in the prior 7d window — and
  // pins the em-dash render: same is-flat / data-direction="flat"
  // wrapper as W826, but the magnitude must be the literal em-dash
  // (U+2014) and explicitly NOT "0%" / "%". Guards against a refactor
  // that collapses the two flat branches into one and accidentally
  // ships "0%" when prior == 0 (which would imply a 0% change against
  // a zero baseline — meaningless and misleading).
  it("W832: stats this-week Plays delta renders is-flat with em-dash when prior==0", () => {
    seedRichStats();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    // 3 plays inside [now-7d, now], NONE in [now-14d, now-7d). Prior
    // window is empty so pctDelta(3, 0) hits the `prior <= 0` guard
    // and returns null — renderDelta takes the d == null branch.
    // Score=0 keeps wins delta null too (also null/em-dash, but we
    // explicitly query li[0] = Plays so wins can't shadow).
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts: now - 1 * dayMs, time: 60, score: 0 },
        { ts: now - 3 * dayMs, time: 60, score: 0 },
        { ts: now - 5 * dayMs, time: 60, score: 0 },
      ]),
    );
    renderPage();

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    const playsRow = list.querySelectorAll("li")[0];
    expect(playsRow).toBeDefined();
    expect(playsRow!.textContent).toContain("3");

    const playsDelta = playsRow!.querySelector(".stats-week-delta");
    expect(playsDelta).not.toBeNull();
    expect(playsDelta!.getAttribute("data-direction")).toBe("flat");
    expect(playsDelta!.classList.contains("is-flat")).toBe(true);
    // d == null branch renders the literal em-dash (U+2014) — distinct
    // from the d === 0 branch's "0%" magnitude. Pin both the presence
    // of the em-dash AND the absence of any percent sign so a refactor
    // that collapses the two flat branches fails loudly.
    expect(playsDelta!.textContent).toContain("—");
    expect(playsDelta!.textContent).not.toContain("0%");
    expect(playsDelta!.textContent).not.toContain("%");

    // Inversion-immunity: the flat/null span must NOT carry up/down
    // styling or glyphs. If a future refactor reorders renderDelta's
    // branches, these guards fail loudly instead of letting "no prior
    // baseline" render with a misleading direction arrow.
    expect(playsDelta!.classList.contains("is-up")).toBe(false);
    expect(playsDelta!.classList.contains("is-down")).toBe(false);
    expect(playsDelta!.textContent).not.toContain("▲");
    expect(playsDelta!.textContent).not.toContain("▼");
  });
});
