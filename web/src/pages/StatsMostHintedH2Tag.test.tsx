import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2516: The "Most-hinted games" stats card (data-testid
 * `stats-most-hinted`, pinned as a <div className="stats-card"> by W1631)
 * uses an `<h2>` element as its card header. Existing coverage pins
 * the heading text + level via `getByRole("heading", { level: 2 })`
 * (W854), the h2 → parent-card structural relationship (W1488,
 * StatsSectionH2MostHintedParent), the absence of a `class` attribute
 * on the heading (W2510, StatsMostHintedH2NoClass), and the global
 * absence of `id` / `style` on every StatsPage h2 (W2092, W2142). All
 * of those rely either on the ARIA heading role and accessible-name
 * lookup or on attribute-absence checks — none pin the literal tagName
 * of the heading element. A refactor that keeps the heading text +
 * level but switches the underlying element to a
 * `<div role="heading" aria-level={2}>` (or any other role-bearing
 * element) would silently break the semantic outline for assistive
 * tech that depends on real h2 elements while every
 * `getByRole("heading")`-based assertion continues to pass. Pin the
 * h2's literal `tagName` via a testid → querySelector lookup (no
 * `getByRole`) so this card's header element type is enforced
 * independently from the role-based accessible-name contract — mirroring
 * W1977 (Personal records by category) on the Most-hinted games card.
 */
describe("StatsPage — most-hinted h2 tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2516: stats-most-hinted card's first h2 has tagName 'H2'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-most-hinted");
    const heading = card.querySelector("h2");
    expect(heading).not.toBeNull();
    expect(heading!.tagName).toBe("H2");
  });
});
