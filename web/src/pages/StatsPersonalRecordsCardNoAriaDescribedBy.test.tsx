import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2571: StatsPage's "Personal records" stats card
 * (data-testid="stats-personal-records") wraps the per-game best-times top-10
 * list and is rendered as a bare `<div>` with no ARIA attribution of its own.
 * Sibling pins on this same node already cover its tagName/className contract
 * (W1622), absence of `id` (W2022), `style` (W2125), `tabindex` (W2252),
 * `role` (W2378), `aria-label` (W2539), and `aria-labelledby` (sibling). What
 * is NOT yet pinned is the absence of an `aria-describedby` attribute on the
 * card element itself. Adding an `aria-describedby` would associate the
 * structural wrapper with an accessible description string — combined with
 * any future `role` addition (e.g. region/group) it would silently promote
 * this purely structural div into an announced, described landmark for
 * assistive technology, duplicating or distorting what the inner <h2>
 * "Personal records" heading and subtitle already convey. Pin the absence of
 * an `aria-describedby` attribute so any future change that adds one is
 * reviewed deliberately.
 */
describe("StatsPage stats-personal-records card — aria-describedby attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2571: stats-personal-records card has no aria-describedby attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records");
    expect(card.hasAttribute("aria-describedby")).toBe(false);
  });
});
