import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2971: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `srcdoc`
 * attribute is only meaningful on <iframe> elements, where it provides inline
 * HTML content for the embedded browsing context. On a <ul> the attribute
 * carries no defined semantics, but leaving it present would still be exposed
 * via DOM serialization and could mislead crawlers, assistive technology, or
 * future refactors that try to interpret it as inline document content. The
 * sibling `stats-prev-week` ul already has its `srcdoc` absence pinned, and a
 * wide array of other this-week-list attribute absences are pinned (id, role,
 * style, tabindex, ARIA, cite, etc.), but no test pins `srcdoc` absence on
 * `stats-this-week-list`. Pinning it here ensures any future change that
 * accidentally attaches a `srcdoc` payload to this presentational weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — srcdoc attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2971: stats-this-week-list ul has no srcdoc attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("srcdoc")).toBe(false);
    expect(ul.getAttribute("srcdoc")).toBeNull();
  });
});
