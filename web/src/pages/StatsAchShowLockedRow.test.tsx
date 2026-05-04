import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1303: The "Show locked" toggle inside the Achievements section is wrapped
 * in a `<label class="stats-show-locked-row">` that hosts both the checkbox
 * input AND its visible "Show locked" text span (StatsPage.tsx ~L1750-L1759).
 * Existing tests already cover:
 *   - the toggle's `data-testid` and checked behaviour (W…),
 *   - the `cards-stats-show-locked` localStorage persistence,
 *   - the `aria-label="Show locked achievements"` on the input itself,
 * but nothing pins the wrapper `<label>` element. A regression that swapped
 * the wrapping element to a `<div>` (breaking implicit click-to-toggle), or
 * dropped/renamed the `.stats-show-locked-row` class (breaking the row
 * layout CSS), or detached the visible "Show locked" text from the same
 * label (breaking accessibility — clicking the text would no longer toggle
 * the checkbox), would all leave every other test green. Lock the contract:
 * the row MUST be a `<label>`, MUST carry class `stats-show-locked-row`,
 * AND MUST contain BOTH the toggle input AND the literal "Show locked"
 * text — all three together, on the same element.
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

function renderPage(): void {
  render(
    <MemoryRouter>
      <ConfirmProvider>
        <StatsPage />
      </ConfirmProvider>
    </MemoryRouter>,
  );
}

describe("StatsPage achievements show-locked row wrapper", () => {
  beforeEach(() => {
    localStorage.clear();
    if (typeof URL.createObjectURL !== "function") {
      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        value: vi.fn(() => "blob:mock"),
      });
    } else {
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock");
    }
  });

  it("W1303: '.stats-show-locked-row' is a <label> that wraps the show-locked toggle AND the visible 'Show locked' text", () => {
    seedStats();
    renderPage();

    // The toggle input itself is well-pinned via data-testid; walk UP from
    // it to the wrapping element to catch wrapper regressions.
    const toggle = screen.getByTestId("stats-show-locked-toggle");
    const wrapper = toggle.closest(".stats-show-locked-row");
    expect(wrapper).not.toBeNull();

    // Wrapper MUST be a <label> — a <div> would break implicit click-to-
    // toggle on the visible text and is an a11y regression.
    expect(wrapper!.tagName).toBe("LABEL");

    // Same element MUST contain the visible "Show locked" text in a span,
    // so clicking the text toggles the same checkbox.
    const span = wrapper!.querySelector("span");
    expect(span).not.toBeNull();
    expect(span!.textContent).toBe("Show locked");
  });
});
