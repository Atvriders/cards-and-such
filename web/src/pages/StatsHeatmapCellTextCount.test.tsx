import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1403 — Sibling-test partner to W1192 (cell className), W1206 (cell title),
 * W1210 (per-row data-count), W1250 (heatmap root role+aria), W1198 (head
 * day labels), W1278 (row container DIV), W1341 (head spacer first child),
 * W1364/W1369 (data-row category label tag/position). Every
 * `.stats-heatmap-cell` renders `{v > 0 ? v : ""}` as its text content —
 * the *visible* digit shown to sighted users (data-count is invisible to
 * humans, only readable via DOM). StatsPage.test.tsx asserts the empty
 * branch (v === 0 ⇒ textContent === ""), but no existing test pins the
 * non-empty branch: that a cell with positive plays renders the *count*
 * itself as visible text. A refactor that flipped the render to e.g.
 * `{v > 0 ? "•" : ""}` (tally dot), `{v > 0 ? "✓" : ""}` (presence mark),
 * or simply omitted the text in favor of opacity-only encoding would
 * leave data-count, opacity, title, and className intact while making
 * every count visually unreadable. Pin the visible numeric text here.
 */
describe("StatsPage heatmap cell visible count text", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1403: stats-heatmap-cell renders the numeric play count as visible text when v > 0", () => {
    // Seed three klondike (solitaire) plays on a single weekday so exactly
    // one solitaire cell ends up with count=3. We don't care which weekday
    // — we resolve the cell via dow-of-timestamp, mirroring the page's
    // Mon=0..Sun=6 remap of getDay().
    const dayMs = 24 * 60 * 60 * 1000;
    const base = new Date();
    base.setHours(12, 0, 0, 0);
    const ts = base.getTime() - dayMs;
    localStorage.setItem(
      "cards-time-history:klondike",
      JSON.stringify([
        { ts, time: 60 },
        { ts: ts + 60_000, time: 60 },
        { ts: ts + 120_000, time: 60 },
      ]),
    );

    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const dayLabels = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
    const dow = (new Date(ts).getDay() + 6) % 7;
    const cell = screen.getByTestId(
      `stats-cat-heatmap-solitaire-${dayLabels[dow]}`,
    );
    // Sanity: data-count must be 3 (the seeded play count). If this fails
    // the test environment is broken — fall back to the W1210 assertion
    // on per-row counts before debugging this one.
    expect(cell.getAttribute("data-count")).toBe("3");
    // The actual W1403 lock: visible text content equals the count digit.
    // `.toBe("3")` (not `.toContain`) to forbid wrapping with extra glyphs
    // like "3 plays" or "•3" that would hide the digit behind clutter.
    expect(cell.textContent).toBe("3");
  });
});
