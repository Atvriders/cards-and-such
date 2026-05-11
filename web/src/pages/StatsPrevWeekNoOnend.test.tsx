import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The HTML `onend` attribute is not a defined event
 * handler attribute in the HTML specification — it is not part of the standard
 * global event handler content attributes. Leaving such an attribute present
 * on a presentational <ul> would carry no semantic value but could be
 * misinterpreted by tooling, future refactors, or custom code paths that scan
 * for event-like attributes. Sibling tests pin absences of many other
 * attributes on this <ul>; this test pins the absence of `onend` so that any
 * future change that accidentally attaches an `onend` value to this summary
 * list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onend")).toBe(false);
    expect(ul.getAttribute("onend")).toBeNull();
  });
});
