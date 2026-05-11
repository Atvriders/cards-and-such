import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `onseeked` attribute is
 * an event handler content attribute defined for media elements (<audio>,
 * <video>) that fires when a seek operation completes. On a <ul> it has no
 * defined semantics, but if present it would still be parsed as an inline
 * event handler and executed by the browser, creating both an XSS surface
 * and a misleading signal about this list being a media element. Sibling
 * tests already pin the absence of many global, ARIA, and presentational
 * attributes on this <ul>, but none pin the absence of `onseeked`. Pinning
 * it here ensures any future change that accidentally attaches an
 * `onseeked` handler to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onseeked attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onseeked attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onseeked")).toBe(false);
    expect(ul.getAttribute("onseeked")).toBeNull();
  });
});
