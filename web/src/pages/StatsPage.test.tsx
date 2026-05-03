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

  it("achievement search filters the cards", () => {
    seedRichStats();
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

  it("most-hinted rows render an inline sparkline per game", () => {
    seedRichStats();
    renderPage();
    // seedRichStats puts klondike + spider in cards-hints-used.
    expect(screen.getByTestId("stats-sparkline-klondike")).toBeInTheDocument();
    expect(screen.getByTestId("stats-sparkline-spider")).toBeInTheDocument();
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

  it("aggregate hint/undo cards render with localStorage values", () => {
    seedRichStats();
    renderPage();
    const hintsCard = screen.getByTestId("stat-total-hints");
    const undosCard = screen.getByTestId("stat-total-undos");
    // 7 + 3 = 10 hints, 5 + 2 = 7 undos based on seedRichStats().
    expect(hintsCard.textContent).toContain("10");
    expect(undosCard.textContent).toContain("7");
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

  it("stats-hour-of-day card buckets time-history timestamps into hour bins", () => {
    seedRichStats();
    // Pin three klondike plays to a known local hour so peak text is stable.
    const peak = new Date();
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

  it("achievement cards render in unlocked → in-progress → locked order with matching data-state", () => {
    // Seed exactly: 1 unlocked (first-win), 2 in-progress (ten-wins, hundred-wins),
    // rest locked. totalWins=1 is the only stats lever flipped, so the only
    // achievements with cur>0 are first-win/ten-wins/hundred-wins. first-win is
    // forced to "unlocked" via the unlocked array, leaving exactly 2 in-progress.
    seedStats({
      totalWins: 1,
      unlocked: ["first-win"],
    });
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
});
