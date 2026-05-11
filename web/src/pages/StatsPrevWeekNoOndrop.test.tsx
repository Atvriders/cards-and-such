import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3202: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The HTML `ondrop` attribute is a
 * legacy inline event handler that registers a JavaScript drop listener
 * directly in the DOM. The prior-week summary list is a presentational
 * read-only breakdown of past activity — it is never a drop target and has
 * no business reacting to drag-and-drop interactions. Leaving an `ondrop`
 * attribute on this <ul> would execute arbitrary inline script on drop,
 * which is both a CSP smell and a potential XSS / drag-hijacking vector.
 * Sibling tests pin the absence of many other inline handlers and global
 * attributes on this <ul>, but none pin the absence of `ondrop`. Pinning
 * it here ensures any future change that attaches an inline drop handler
 * to this presentational summary list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ondrop attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3202: stats-prev-week ul has no ondrop attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondrop")).toBe(false);
    expect(ul.getAttribute("ondrop")).toBeNull();
  });
});
