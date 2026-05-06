import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2614: StatsPage's "Achievements" h2 — the section heading of the
 * achievements stats card (data-testid="stats-achievements") — is a
 * static section title and is intentionally NOT focusable. Existing
 * tests pin adjacent contracts on this same heading node:
 *   - W846 pins the heading text + level via `getByRole`.
 *   - W1883 pins the heading's className === "" via `getByRole`.
 *   - W1471 pins the heading's parent (.stats-card div with
 *     data-testid="stats-achievements").
 *   - W1476 pins the heading as the first element child of the
 *     achievements stats-card.
 *   - W2092 pins the absence of an `id` on every StatsPage h2.
 *   - W2142 pins the absence of an inline `style` attribute on every h2.
 *   - W2256 pins the absence of a `tabindex` attribute on the
 *     achievements CARD wrapper, not on the inner h2.
 *
 * What is NOT pinned by any of those tests is the absence of a
 * `tabindex` attribute on the "Achievements" h2 itself. Adding
 * `tabIndex={-1}` (e.g. to make the heading programmatically focusable
 * as a skip-link target after a search-clear interaction or as a
 * hash-link landing for `#achievements`) or `tabIndex={0}` (e.g. to
 * insert the heading into the keyboard tab order so it acts as a
 * screen-reader focus anchor) would silently change the StatsPage tab
 * order and focus semantics while every other contract still held.
 * Mirrors the NoTabindex pattern pinned for the activity-card h2
 * (W2518), the categories-card h2 (W2506), and the this-week-card h2
 * (W2524). Pin the absence of any `tabindex` attribute on the
 * achievements-card h2 so any future change that introduces one is a
 * deliberate, test-acknowledged contract change. The lookup goes
 * through `getByTestId("stats-achievements").querySelector("h2")`
 * rather than a role/heading query so the assertion does not depend on
 * heading semantics — it locks the literal `tabindex` attribute
 * presence on the first h2 inside the achievements card.
 */
describe("StatsPage stats-achievements — h2 tabindex attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2614: stats-achievements 'Achievements' h2 has no tabindex attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-achievements");
    const h2 = card.querySelector("h2");
    expect(h2).not.toBeNull();
    // Sanity: confirm we located the right heading before pinning the
    // tabindex-absence contract.
    expect(h2!.tagName).toBe("H2");
    expect(h2!.textContent).toBe("Achievements");
    // Use `hasAttribute` rather than a value check — even an explicit
    // `tabindex="-1"` would make the heading programmatically focusable
    // and create a new undeclared focus surface.
    expect(h2!.hasAttribute("tabindex")).toBe(false);
  });
});
