import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2710: StatsPage's "Personal records" stats card
 * (data-testid="stats-personal-records"), which wraps the per-game best-times
 * top-10 list, is rendered as a bare `<div>` with no ARIA attribution of its
 * own. Sibling pins on this same node already cover its tagName/className
 * contract, the absence of `id`, `style`, `tabindex`, `role`, `aria-label`,
 * `aria-labelledby`, `aria-describedby`, `aria-controls`, and `aria-hidden`.
 * What is NOT yet pinned is the absence of an `aria-roledescription`
 * attribute on the card element itself. Adding an `aria-roledescription`
 * would override the way assistive technology announces this purely
 * structural wrapper — combined with any future `role` addition it would
 * silently re-label the card with a custom role string for screen readers,
 * even though the inner <h2> "Personal records" heading is the intended
 * carrier of section semantics. Pin the absence of an `aria-roledescription`
 * attribute so any future change that adds one is reviewed deliberately.
 */
describe("StatsPage stats-personal-records card — aria-roledescription attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2710: stats-personal-records card has no aria-roledescription attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records");
    expect(card.hasAttribute("aria-roledescription")).toBe(false);
  });
});
