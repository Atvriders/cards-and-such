import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3055: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `event` attribute has no
 * defined semantics on a <ul>; historically it appeared on <input> elements
 * to bind a DOM event name to a script, but it is not part of any modern HTML
 * specification and is not used by this presentational summary list. Leaving
 * it present would still be exposed via DOM serialization and could mislead
 * assistive technology, crawlers, or future refactors that try to interpret
 * it as an event binding. Sibling tests already pin the absence of `id`,
 * `role`, `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA /
 * global attributes on this <ul>, but none pin the absence of `event`.
 * Pinning it here ensures any future change that accidentally attaches an
 * `event` attribute to this presentational summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — event attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3055: stats-prev-week ul has no event attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("event")).toBe(false);
    expect(ul.getAttribute("event")).toBeNull();
  });
});
