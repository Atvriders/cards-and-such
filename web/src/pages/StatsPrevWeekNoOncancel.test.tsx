import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3244: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `oncancel` event handler
 * attribute fires when a <dialog> element is dismissed via the cancel
 * mechanism (e.g. Escape key). It is only meaningful on <dialog> elements,
 * and on a <ul> it has no defined semantics. Leaving it present would still
 * be exposed via DOM serialization and could be interpreted as an inline
 * event handler by attribute-scanning tools, security scanners, or future
 * refactors that mistakenly try to wire dialog-cancel behavior to a
 * presentational list. Sibling tests already pin the absence of many other
 * attributes on this <ul>, but none pin the absence of `oncancel`. Pinning
 * it here ensures any future change that accidentally attaches an
 * `oncancel` handler to this summary list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — oncancel attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3244: stats-prev-week ul has no oncancel attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncancel")).toBe(false);
    expect(ul.getAttribute("oncancel")).toBeNull();
  });
});
