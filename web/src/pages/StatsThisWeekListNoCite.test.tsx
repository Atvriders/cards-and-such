import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2904: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML `cite`
 * attribute is only meaningful on <blockquote>, <q>, <ins>, and <del> elements,
 * where it points at a URL identifying the source of a quotation or change. On
 * a <ul> the attribute carries no defined semantics, but leaving it present
 * would still be exposed via DOM serialization and could mislead assistive
 * technology, crawlers, or future refactors that try to interpret it as a
 * citation source. The sibling `stats-prev-week` ul already has its `cite`
 * absence pinned (W2902), and a wide array of other this-week-list attribute
 * absences are pinned (id, role, style, tabindex, ARIA, etc.), but no test
 * pins `cite` absence on `stats-this-week-list`. Pinning it here ensures any
 * future change that accidentally attaches a `cite` URL to this presentational
 * weekly summary list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — cite attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2904: stats-this-week-list ul has no cite attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("cite")).toBe(false);
    expect(ul.getAttribute("cite")).toBeNull();
  });
});
