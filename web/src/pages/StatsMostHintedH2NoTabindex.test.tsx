import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2618: StatsPage's "Most-hinted games" h2 — the section heading inside
 * the `data-testid="stats-most-hinted"` stats-card div — is a static
 * section title and is intentionally NOT focusable. Sibling tests already
 * pin adjacent contracts on this same heading node and its containing
 * card:
 *   - W2516 pins the heading's literal tagName === "H2"
 *     (StatsMostHintedH2Tag).
 *   - W2510 pins the heading's `class` attribute absence
 *     (StatsMostHintedH2NoClass).
 *   - W1488 pins the heading's parent (.stats-card div with
 *     data-testid="stats-most-hinted") via StatsSectionH2MostHintedParent.
 *   - W2092 pins the absence of an `id` on every StatsPage h2
 *     (StatsH2NoId).
 *   - W2142 pins the absence of an inline `style` attribute on every
 *     StatsPage h2 (StatsH2NoStyle).
 *   - W2259 pins the absence of `tabindex` on the most-hinted CARD
 *     wrapper, not on the inner h2 (StatsCardsNoTabindex /
 *     StatsMostHintedNoTabindex).
 *
 * What is NOT pinned by any of those tests is the absence of a
 * `tabindex` attribute on the Most-hinted-games h2 itself. Adding
 * `tabIndex={-1}` (e.g. to make the heading programmatically focusable
 * as a hash-link landing or a skip-link target after a leaderboard
 * action) or `tabIndex={0}` (e.g. to insert the heading into the
 * keyboard tab order so it acts as a screen-reader focus anchor) would
 * silently change the StatsPage tab order and focus semantics while
 * every other contract still held. Mirrors the NoTabindex pattern
 * pinned for the activity-card heading (W2518) and the categories-card
 * heading (W2506). Pin the absence of any `tabindex` attribute on the
 * most-hinted-card h2 so any future change that introduces one is a
 * deliberate, test-acknowledged contract change. The lookup goes
 * through `getByTestId("stats-most-hinted").querySelector("h2")` rather
 * than a role/heading query so the assertion does not depend on heading
 * semantics — it locks the literal `tabindex` attribute presence on the
 * first h2 inside the most-hinted card.
 */
describe("StatsPage stats-most-hinted — h2 tabindex attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2618: stats-most-hinted 'Most-hinted games' h2 has no tabindex attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-most-hinted");
    const h2 = card.querySelector("h2");
    expect(h2).not.toBeNull();
    // Sanity: confirm we located the right heading before pinning the
    // tabindex-absence contract.
    expect(h2!.tagName).toBe("H2");
    expect(h2!.textContent).toBe("Most-hinted games");
    // Use `hasAttribute` rather than a value check — even an explicit
    // `tabindex="-1"` would make the heading programmatically focusable
    // and create a new undeclared focus surface.
    expect(h2!.hasAttribute("tabindex")).toBe(false);
  });
});
