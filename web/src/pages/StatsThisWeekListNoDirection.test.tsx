import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3058: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `direction`
 * attribute is a legacy / non-standard attribute (most notably used historically on
 * <marquee>) and has no defined semantics on a <ul> element. The modern, standards-
 * compliant way to set text directionality is via the global `dir` attribute (whose
 * absence on this list is already pinned in a sibling test). Leaving a stray
 * `direction` attribute on this presentational weekly summary list would carry no
 * semantic meaning, but would still be exposed via DOM serialization and could
 * mislead assistive technology, browser heuristics, or future refactors. Pinning
 * the absence of `direction` here ensures any future change that accidentally
 * attaches one to this list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — direction attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3058: stats-this-week-list ul has no direction attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("direction")).toBe(false);
    expect(ul.getAttribute("direction")).toBeNull();
  });
});
