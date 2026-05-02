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

  it("aggregate hint/undo cards render with localStorage values", () => {
    seedRichStats();
    renderPage();
    const hintsCard = screen.getByTestId("stat-total-hints");
    const undosCard = screen.getByTestId("stat-total-undos");
    // 7 + 3 = 10 hints, 5 + 2 = 7 undos based on seedRichStats().
    expect(hintsCard.textContent).toContain("10");
    expect(undosCard.textContent).toContain("7");
  });
});
