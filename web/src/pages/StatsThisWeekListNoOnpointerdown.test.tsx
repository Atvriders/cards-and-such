import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3209: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `onpointerdown`
 * inline-event content attribute, if present, would register a pointer-down event
 * handler at parse time on this presentational summary list. The <ul> is purely
 * a visual container for weekly aggregate rows — it has no pointer-interaction
 * affordance, no role, no tabindex, and is not advertised as activatable. Inline
 * `on*` handlers also bypass React's synthetic-event system and the project's
 * CSP posture, so any `onpointerdown` attribute leaking onto this node would
 * indicate a regression (e.g., a stray prop spread or a misnamed handler).
 * Sibling lists already pin `onpointerdown` absence (StatsPrevWeekNoOnpointerdown,
 * LobbyChipStripNoOnpointerdown) but `stats-this-week-list` itself is not yet
 * pinned for this attribute. Pinning it here ensures any future change that
 * accidentally attaches an inline `onpointerdown` handler to this list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpointerdown attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3209: stats-this-week-list ul has no onpointerdown attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerdown")).toBe(false);
    expect(ul.getAttribute("onpointerdown")).toBeNull();
  });
});
