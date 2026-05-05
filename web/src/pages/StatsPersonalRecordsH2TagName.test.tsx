import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2508: The "Personal records" stats card (data-testid
 * `stats-personal-records`) uses an `<h2>` element as its card header.
 * Existing coverage pins the heading text + level via
 * `getByRole("heading", { level: 2, name: "Personal records" })` (W841),
 * the h2 → parent-card structural relationship (W1457), and the bare
 * className contract (W1896) — but every one of those lookups is
 * mediated by the ARIA heading role + accessible-name resolution. A
 * refactor that kept the heading text but switched the underlying
 * element to a `<div role="heading" aria-level={2}>` (or any other
 * role-bearing element) would silently break the semantic outline
 * for assistive tech that depends on real `h2` elements while every
 * `getByRole("heading")`-based assertion continues to pass. Mirrors
 * the by-category h2 tagName contract pinned by W1977. Pin the h2's
 * literal `tagName` via a testid → querySelector lookup (no
 * `getByRole`) so this card's header element type is enforced
 * independently from the role-based accessible-name contract.
 */
describe("StatsPage — personal records h2 tagName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2508: stats-personal-records card's first h2 has tagName 'H2'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records");
    const heading = card.querySelector("h2");
    expect(heading).not.toBeNull();
    expect(heading!.tagName).toBe("H2");
    expect(heading!.textContent).toBe("Personal records");
  });
});
