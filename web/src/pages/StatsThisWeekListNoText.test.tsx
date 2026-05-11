import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3070: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". HTML has no
 * standard `text` attribute defined for the <ul> element — the closest legacy
 * use is on <param> or <script>, and modern semantics expose text content via
 * the DOM `textContent` property, not an attribute. Leaving an unrecognized
 * `text` attribute on this presentational weekly summary <ul> would still be
 * serialized into the DOM where it could mislead assistive technology,
 * crawlers, custom CSS attribute selectors, or future refactors that try to
 * interpret it as a meaningful payload. A wide array of other this-week-list
 * attribute absences are already pinned (id, role, style, tabindex, ARIA,
 * cite, etc.), but no test pins `text` absence on `stats-this-week-list`.
 * Pinning it here ensures any future change that accidentally attaches a
 * `text` attribute to this list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — text attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3070: stats-this-week-list ul has no text attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("text")).toBe(false);
    expect(ul.getAttribute("text")).toBeNull();
  });
});
