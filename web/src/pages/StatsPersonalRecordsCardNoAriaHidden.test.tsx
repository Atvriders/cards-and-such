import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2583: StatsPage's "Personal records" stats card
 * (data-testid="stats-personal-records"), which wraps the per-game best-times
 * top-10 list, is rendered as a bare `<div>` with no ARIA attribution of its
 * own. Sibling pins on this same node already cover the absence of
 * `aria-label` (W2539), `aria-labelledby` (W…), `aria-describedby` (W…),
 * `id` (W2022), `style` (W2125), `tabindex` (W2252), and `role` (W2378).
 * What is NOT yet pinned is the absence of an `aria-hidden` attribute on
 * the card element itself. Adding `aria-hidden="true"` would silently
 * remove the entire personal-records section — including its inner <h2>
 * "Personal records" heading and the top-10 best-times list — from the
 * accessibility tree, making this content invisible to assistive
 * technology even while it remains visually present. Pin the absence of
 * an `aria-hidden` attribute so any future change that adds one is
 * reviewed deliberately.
 */
describe("StatsPage stats-personal-records card — aria-hidden attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2583: stats-personal-records card has no aria-hidden attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records");
    expect(card.hasAttribute("aria-hidden")).toBe(false);
  });
});
