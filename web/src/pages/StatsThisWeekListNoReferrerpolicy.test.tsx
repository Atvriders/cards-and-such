import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2922: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `referrerpolicy` attribute is only meaningful on elements that initiate a
 * fetch tied to a Referer header — `<a>`, `<area>`, `<img>`, `<iframe>`,
 * `<link>`, and `<script>`. On a <ul> it has no defined semantics, but its
 * presence would still be exposed via DOM serialization and could mislead
 * assistive technology, crawlers, or future refactors that attempt to
 * interpret it as a privacy directive. The sibling `stats-prev-week` ul has
 * a wide range of attribute absences pinned, and many other this-week-list
 * attribute absences are also pinned (id, role, style, tabindex, ARIA, cite,
 * etc.), but no test pins `referrerpolicy` absence on `stats-this-week-list`.
 * Pinning it here ensures any future change that accidentally attaches a
 * `referrerpolicy` value to this presentational weekly summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — referrerpolicy attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2922: stats-this-week-list ul has no referrerpolicy attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("referrerpolicy")).toBe(false);
    expect(ul.getAttribute("referrerpolicy")).toBeNull();
  });
});
