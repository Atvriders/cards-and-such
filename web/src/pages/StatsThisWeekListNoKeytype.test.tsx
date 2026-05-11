import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3092: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `keytype`
 * attribute was an obsolete HTML5 form-control attribute originally defined on the
 * removed <keygen> element to indicate the kind of cryptographic key to generate
 * (e.g. "rsa"). It has no defined semantics on a <ul> and is no longer recognized
 * by modern browsers anywhere, but leaving it present would still be exposed via
 * DOM serialization and could mislead assistive technology, crawlers, linters, or
 * future refactors that try to interpret it. A wide array of other
 * this-week-list attribute absences are pinned (id, role, style, tabindex, cite,
 * ARIA, etc.), but no test pins `keytype` absence on `stats-this-week-list`.
 * Pinning it here ensures any future change that accidentally attaches a
 * `keytype` attribute to this presentational weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — keytype attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3092: stats-this-week-list ul has no keytype attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("keytype")).toBe(false);
    expect(ul.getAttribute("keytype")).toBeNull();
  });
});
