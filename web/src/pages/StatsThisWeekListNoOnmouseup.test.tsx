import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3133: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The `onmouseup`
 * inline event handler attribute would register a script to run when a mouse
 * button is released over the element. On a presentational weekly summary list
 * that exposes no interactive behavior, an `onmouseup` handler would either be
 * dead code or, worse, an injection vector if user-controlled data ever flowed
 * into the attribute string. The sibling `stats-prev-week` ul and a wide array
 * of other this-week-list inline mouse handler absences (onclick, onmousedown,
 * onmousemove, onmouseover, onmouseout, onmouseenter, onmouseleave) are
 * already pinned, but no test pins `onmouseup` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches an `onmouseup` handler to this presentational list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onmouseup attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3133: stats-this-week-list ul has no onmouseup attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmouseup")).toBe(false);
    expect(ul.getAttribute("onmouseup")).toBeNull();
  });
});
