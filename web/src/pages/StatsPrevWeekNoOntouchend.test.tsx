import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain presentational <ul>. The `ontouchend` global event
 * handler attribute, if present, would register an inline JavaScript handler
 * for touch-end events directly on the element. Inline event handler
 * attributes bypass React's synthetic event system, are difficult to audit,
 * and conflict with Content Security Policy directives that forbid inline
 * script. Sibling tests pin the absence of many other global / ARIA / event
 * attributes on this <ul>; this test pins the absence of `ontouchend`
 * specifically so any future change that attaches an inline touch-end handler
 * to this summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — ontouchend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no ontouchend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ontouchend")).toBe(false);
    expect(ul.getAttribute("ontouchend")).toBeNull();
  });
});
