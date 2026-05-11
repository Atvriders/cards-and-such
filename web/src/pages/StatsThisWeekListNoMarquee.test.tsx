import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3049: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The legacy
 * `marquee` attribute has no defined semantics on any modern HTML element —
 * the `<marquee>` element itself is obsolete and removed from the HTML
 * specification, and no standard attribute named `marquee` exists on <ul>.
 * Leaving such an attribute present would still be exposed via DOM
 * serialization and could mislead assistive technology, crawlers, or future
 * refactors that try to interpret it as a scrolling-text hint. A wide array
 * of other this-week-list attribute absences are pinned (id, role, style,
 * tabindex, ARIA, cite, etc.), but no test pins `marquee` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches a `marquee` attribute to this presentational weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — marquee attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3049: stats-this-week-list ul has no marquee attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("marquee")).toBe(false);
    expect(ul.getAttribute("marquee")).toBeNull();
  });
});
