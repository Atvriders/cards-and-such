import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2252: StatsPage's "Personal records" stats card
 * (data-testid="stats-personal-records"), which wraps the per-game best-times
 * top-10 list, is currently rendered WITHOUT a `tabindex` attribute. Sibling
 * tests already pin adjacent contracts on this same node — its tagName,
 * subtitle copy/class, row ordering, empty-state behavior, and the absence
 * of an `id` and inline `style` attribute — but no existing test pins the
 * absence of a `tabindex` attribute on the card element itself. Adding a
 * `tabindex` would silently insert this purely-structural wrapper into the
 * keyboard tab order (positive values) or make it programmatically focusable
 * (tabindex="0"/"-1"), shifting focus semantics and screen-reader navigation
 * even though the card itself is not an interactive control. The current
 * design keeps focus management on the actual interactive descendants and
 * leaves the card transparent to keyboard navigation. Pin the absence of a
 * `tabindex` attribute so any future change that adds one is reviewed
 * deliberately.
 */
describe("StatsPage stats-personal-records card — tabindex attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2252: stats-personal-records card has no tabindex attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records");
    expect(card.hasAttribute("tabindex")).toBe(false);
  });
});
