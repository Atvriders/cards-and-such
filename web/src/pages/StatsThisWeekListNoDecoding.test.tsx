import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2926: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `decoding`
 * attribute is only meaningful on <img> elements, where it hints to the browser
 * whether to decode the image synchronously, asynchronously, or auto. On a <ul>
 * the attribute carries no defined semantics, but leaving it present would still
 * be exposed via DOM serialization and could mislead assistive technology,
 * crawlers, or future refactors that try to interpret it as an image-decoding
 * directive. A wide array of other this-week-list attribute absences are pinned
 * (id, role, style, tabindex, ARIA, cite, etc.), but no test pins `decoding`
 * absence on `stats-this-week-list`. Pinning it here ensures any future change
 * that accidentally attaches a `decoding` hint to this presentational weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — decoding attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2926: stats-this-week-list ul has no decoding attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("decoding")).toBe(false);
    expect(ul.getAttribute("decoding")).toBeNull();
  });
});
