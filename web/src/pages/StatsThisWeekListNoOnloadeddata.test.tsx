import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onloadeddata` attribute is a media event handler defined on <audio> and
 * <video> elements, where it fires when media data has been loaded. On a <ul>
 * the attribute carries no defined semantics and will never fire, but leaving
 * it present would still be exposed via DOM serialization and represents
 * arbitrary inline script that could mislead future refactors or be flagged
 * by CSP / static analysis. The sibling `stats-prev-week` ul already has its
 * attribute-absence pins, and a wide array of other this-week-list attribute
 * absences are pinned, but no test pins `onloadeddata` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an `onloadeddata` handler to this presentational
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onloadeddata attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onloadeddata attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onloadeddata")).toBe(false);
    expect(ul.getAttribute("onloadeddata")).toBeNull();
  });
});
