import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3248: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onfullscreenchange` attribute is an HTML event handler content attribute
 * that fires when the element enters or exits fullscreen mode. It has no
 * defined meaning on a presentational <ul> summarizing weekly card-study
 * stats, and attaching one would couple a serialized inline handler string
 * to a list that never participates in the Fullscreen API. The sibling
 * `stats-prev-week` ul and this list already have a wide array of other
 * event-handler and attribute absences pinned, but `onfullscreenchange`
 * is not yet covered for `stats-this-week-list`. Pinning it here ensures
 * any future change that accidentally attaches an inline
 * `onfullscreenchange` handler to this list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onfullscreenchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3248: stats-this-week-list ul has no onfullscreenchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onfullscreenchange")).toBe(false);
    expect(ul.getAttribute("onfullscreenchange")).toBeNull();
  });
});
