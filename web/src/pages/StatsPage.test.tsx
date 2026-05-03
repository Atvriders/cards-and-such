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
});
