import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1943: StatsPage renders the Replays panel as a `.stats-card` div carrying
 * `data-testid="stats-replays-panel"`. Existing tests assert that the panel's
 * classList *contains* "stats-card" (W1479) and pin assorted child classNames
 * (subtitle, row, view-all link, empty state) — but NO test pins the panel
 * element's `className` to *exact* equality. A regression that appends an
 * additional class (e.g. "stats-card stats-card--replays" during a CSS module
 * refactor) or reorders the className string would silently change the
 * load-bearing styling hook while every existing `classList.contains` and
 * child-class assertion still passed. Pin the exact className string so the
 * panel's outer styling contract is locked in.
 */
describe("StatsPage replays panel — outer card className exact equality", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1943: stats-replays-panel element's className is exactly 'stats-card'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-replays-panel");
    expect(card.className === "stats-card").toBe(true);
    // Sanity: the panel is a div, matching the StatsPage layout contract.
    expect(card.tagName).toBe("DIV");
  });
});
