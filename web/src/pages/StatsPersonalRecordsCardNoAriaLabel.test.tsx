import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2539: StatsPage's "Personal records" stats card
 * (data-testid="stats-personal-records"), which wraps the per-game best-times
 * top-10 list, is rendered as a bare `<div>` with no ARIA attribution of its
 * own. Sibling pins on this same node already cover its tagName/className
 * contract (W1622), `stats-card` className (W1622), and the absence of
 * `id` (W2022), `style` (W2125), `tabindex` (W2252), and `role` (W2378), as
 * well as the inner h2 tagName (W2508). What is NOT yet pinned is the
 * absence of an `aria-label` on the card element itself. Adding an
 * `aria-label` would change the accessible name semantics of this purely
 * structural wrapper — combined with any future `role` addition it would
 * silently promote the card into a named landmark/region for assistive
 * technology, even though the inner <h2> "Personal records" heading is
 * the intended carrier of section semantics. Pin the absence of an
 * `aria-label` attribute so any future change that adds one is reviewed
 * deliberately.
 */
describe("StatsPage stats-personal-records card — aria-label attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2539: stats-personal-records card has no aria-label attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records");
    expect(card.hasAttribute("aria-label")).toBe(false);
  });
});
