import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2979: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `marginheight` attribute is an obsolete presentational attribute that was
 * historically only valid on <body>, <frame>, and <iframe> elements to control
 * the top/bottom inner margin of the embedded document. It is not defined on a
 * <ul> and has been removed from the HTML specification in favor of CSS
 * (`margin-top`/`margin-bottom`). Leaving it present on this list would emit
 * invalid HTML, be ignored by modern browsers, and could mislead future
 * refactors or static analyzers. Sibling absence tests already pin many other
 * obsolete/presentational attributes (frameborder, scrolling, marginwidth-style
 * concerns covered elsewhere); pinning `marginheight` here closes that gap and
 * ensures any future change that accidentally attaches it to this presentational
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — marginheight attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2979: stats-this-week-list ul has no marginheight attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("marginheight")).toBe(false);
    expect(ul.getAttribute("marginheight")).toBeNull();
  });
});
