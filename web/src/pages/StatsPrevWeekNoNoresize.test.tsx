import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3094: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `noresize` attribute was a
 * legacy boolean attribute defined on <frame> elements in HTML4, signalling to
 * user agents that the frame could not be resized by the user. It was removed
 * entirely in HTML5 along with the <frame>/<frameset> elements themselves, so
 * on a <ul> it carries no defined semantics whatsoever. Leaving it present
 * would still appear in DOM serialization and could confuse legacy assistive
 * technology, crawlers, or future refactors that try to interpret it as a
 * resize hint. Sibling tests already pin the absence of `id`, `role`, `style`,
 * `tabindex`, `is`, `cite`, and a broad array of ARIA / global / obsolete
 * attributes on this <ul>, but none pin the absence of `noresize`. Pinning it
 * here ensures any future change that accidentally attaches a `noresize`
 * attribute to this presentational summary list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — noresize attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3094: stats-prev-week ul has no noresize attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("noresize")).toBe(false);
    expect(ul.getAttribute("noresize")).toBeNull();
  });
});
