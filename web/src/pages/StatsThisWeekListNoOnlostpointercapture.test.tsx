import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3230: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onlostpointercapture` IDL attribute / event handler is only meaningful when
 * the element is actively participating in pointer capture, which a static
 * presentational summary <ul> never does. Leaving an `onlostpointercapture`
 * content attribute on this list would still be reflected via DOM
 * serialization and could mislead assistive technology, crawlers, or future
 * refactors that try to interpret it as a real pointer-capture handler. A
 * wide array of other this-week-list attribute absences are pinned (id, role,
 * style, tabindex, ARIA, cite, and numerous on* handlers), but no test pins
 * `onlostpointercapture` absence on `stats-this-week-list`. Pinning it here
 * ensures any future change that accidentally attaches an
 * `onlostpointercapture` attribute to this presentational weekly summary list
 * is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onlostpointercapture attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3230: stats-this-week-list ul has no onlostpointercapture attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onlostpointercapture")).toBe(false);
    expect(ul.getAttribute("onlostpointercapture")).toBeNull();
  });
});
