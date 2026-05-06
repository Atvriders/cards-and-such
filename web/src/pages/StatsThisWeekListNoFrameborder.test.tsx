import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2975: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `frameborder`
 * attribute is a deprecated, presentational attribute historically defined on
 * <frame> and <iframe> to control the rendering of a border around the embedded
 * frame. On a <ul> it has no defined semantics whatsoever and is not part of any
 * current HTML specification. Leaving it present would still be exposed via DOM
 * serialization, could mislead future refactors that scan for embedded-frame
 * markers, and might trigger spurious validator warnings. Sibling absences for
 * other deprecated/legacy presentational attributes on this same ul are already
 * pinned, but no test pins `frameborder` absence on `stats-this-week-list`.
 * Pinning it here ensures any future change that accidentally attaches a
 * `frameborder` to this presentational weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — frameborder attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2975: stats-this-week-list ul has no frameborder attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("frameborder")).toBe(false);
    expect(ul.getAttribute("frameborder")).toBeNull();
  });
});
