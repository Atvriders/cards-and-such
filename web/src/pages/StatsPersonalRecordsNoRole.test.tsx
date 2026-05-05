import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2378: StatsPage's "Personal records" stats card
 * (data-testid="stats-personal-records"), which wraps the per-game best-times
 * top-10 list, is currently rendered as a bare `<div>` WITHOUT an explicit
 * ARIA `role` attribute. Sibling tests already pin adjacent contracts on
 * this same node — its tagName as DIV (W1622), exact `stats-card`
 * className (W1622), the absence of `style` (W2125), `id` (W2022), and
 * `tabindex` (W2252) — but none pin the absence of a `role` attribute on
 * the card element itself. Adding e.g. `role="region"` (or `role="group"`,
 * `role="article"`) would silently promote this purely-structural wrapper
 * into an exposed landmark/region for assistive tech, changing the
 * accessibility tree shape and screen-reader navigation even though the
 * card has no `aria-label`/`aria-labelledby` to scope it. The current
 * design leaves the wrapper transparent to AT and lets the inner <h2>
 * "Personal records" heading carry the section semantics. Pin the absence
 * of a `role` attribute so any future change that adds one is reviewed
 * deliberately.
 */
describe("StatsPage stats-personal-records card — role attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2378: stats-personal-records card has no role attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records");
    expect(card.hasAttribute("role")).toBe(false);
  });
});
