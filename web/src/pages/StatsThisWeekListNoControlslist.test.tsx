import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3101: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `controlslist` attribute is only meaningful on media elements (<audio>,
 * <video>) where it restricts which native control affordances the user
 * agent exposes (e.g. "nodownload nofullscreen noremoteplayback"). On a
 * <ul> the attribute carries no defined semantics, but leaving it present
 * would still be exposed via DOM serialization and could confuse future
 * refactors that conflate the weekly summary list with a media-control
 * surface. A wide array of other this-week-list attribute absences are
 * pinned (id, role, style, tabindex, ARIA, cite, etc.), but no test pins
 * `controlslist` absence on `stats-this-week-list`. Pinning it here ensures
 * any future change that accidentally attaches a `controlslist` value to
 * this presentational weekly summary list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — controlslist attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3101: stats-this-week-list ul has no controlslist attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("controlslist")).toBe(false);
    expect(ul.getAttribute("controlslist")).toBeNull();
  });
});
