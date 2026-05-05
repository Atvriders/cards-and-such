import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2029: The "Personal records by category" stats card is identified
 * exclusively via `data-testid="stats-personal-records-by-category"`
 * and does NOT carry an `id` attribute. Existing coverage pins the
 * container tagName (W1954), className+testid via the structural
 * h2-parent test (W1464), the subtitle (W1296), the by-cat list
 * modifier class (W1333), the h2 tagName (W1977), and the row mapping
 * (W635) — but nothing pins the absence of an `id`. If a refactor were
 * to add `id="stats-personal-records-by-category"` (or any other id)
 * for in-page anchoring or scrollIntoView wiring, it would silently
 * introduce a new DOM hook with stable-selector implications (CSS
 * `#id` rules, `document.getElementById` consumers, fragment
 * navigation) while every existing assertion continues to pass. Pin
 * the absence of an `id` attribute so the contract is enforced.
 */
describe("StatsPage — personal records by category card has no id attribute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2029: stats-personal-records-by-category card has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records-by-category");
    expect(card.hasAttribute("id")).toBe(false);
  });
});
