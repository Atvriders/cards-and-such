import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onplaying` attribute is
 * an event handler intended for media elements (<audio>, <video>) that fires
 * when playback begins after being paused. On a <ul> the attribute carries
 * no defined semantics, but leaving it present would still be exposed via
 * DOM serialization and could trigger unexpected script execution or
 * mislead future refactors. Pinning its absence here ensures any future
 * change that accidentally attaches an `onplaying` handler to this
 * presentational summary list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onplaying attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onplaying attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onplaying")).toBe(false);
    expect(ul.getAttribute("onplaying")).toBeNull();
  });
});
