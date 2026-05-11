import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3053: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `volume`
 * attribute is a deprecated/legacy media-related attribute (historically associated
 * with <bgsound> and audio/video elements) and carries no defined semantics on a
 * <ul>. Leaving it present would still be exposed via DOM serialization and could
 * mislead assistive technology, crawlers, or future refactors that try to interpret
 * it as a media volume hint. A wide array of other this-week-list attribute
 * absences are pinned (id, role, style, tabindex, ARIA, cite, etc.), but no test
 * pins `volume` absence on `stats-this-week-list`. Pinning it here ensures any
 * future change that accidentally attaches a `volume` value to this presentational
 * weekly summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — volume attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3053: stats-this-week-list ul has no volume attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("volume")).toBe(false);
    expect(ul.getAttribute("volume")).toBeNull();
  });
});
