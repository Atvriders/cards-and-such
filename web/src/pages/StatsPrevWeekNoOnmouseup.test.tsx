import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3134: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onmouseup` attribute is a
 * global event handler attribute that would attach a JavaScript handler to run
 * when a pointer button is released over the element. This presentational
 * summary list has no interactive semantics and should never emit pointer
 * events to user code. Leaving an `onmouseup` attribute on the <ul> would
 * indicate accidental wiring of mouse handlers via inline HTML, which bypasses
 * React's synthetic event system and is a common refactor hazard. Sibling tests
 * pin the absence of many other global, ARIA, and event attributes on this
 * <ul>, but none pin the absence of `onmouseup`. Pinning it here ensures any
 * future change that attaches an inline `onmouseup` handler to this
 * presentational list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — onmouseup attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3134: stats-prev-week ul has no onmouseup attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmouseup")).toBe(false);
    expect(ul.getAttribute("onmouseup")).toBeNull();
  });
});
