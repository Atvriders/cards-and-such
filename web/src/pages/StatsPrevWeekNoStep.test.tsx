import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2939: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `step` attribute is only
 * meaningful on <input> elements of numeric/date types (and <select>
 * indirectly via form association), where it constrains the granularity of
 * accepted values. On a <ul> the attribute carries no defined semantics, but
 * leaving it present would still be exposed via DOM serialization and could
 * mislead assistive technology, crawlers, or future refactors that try to
 * interpret it as a numeric step hint. Sibling tests already pin the absence
 * of `cite`, `headers`, `formmethod`, and a broad array of ARIA / global
 * attributes on this <ul>, but none pin the absence of `step`. Pinning it
 * here ensures any future change that accidentally attaches a `step` value
 * to this presentational summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — step attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2939: stats-prev-week ul has no step attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("step")).toBe(false);
    expect(ul.getAttribute("step")).toBeNull();
  });
});
