import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2627: StatsPage's "Achievements" h2 — the section heading inside the
 * `data-testid="stats-achievements"` card — is a static section title and
 * is intentionally NOT a drag source. Sibling tests already pin adjacent
 * contracts on this same heading node:
 *   - W846 pins the heading text + level via `getByRole`.
 *   - W1883 pins the heading's className === "" (bare-class contract).
 *   - W1471 pins the heading's parent (.stats-card div with
 *     data-testid="stats-achievements").
 *   - W1476 pins the heading as the first element child of the
 *     achievements stats-card.
 *   - W2092 pins the absence of an `id` on every StatsPage h2.
 *   - W2142 pins the absence of an inline `style` attribute on every h2.
 *   - W2614 pins the absence of a `tabindex` attribute on the
 *     achievements-card h2 specifically.
 *
 * What is NOT pinned by any of those tests is the absence of a
 * `draggable` attribute on the "Achievements" h2 itself. Adding
 * `draggable={true}` (e.g. to allow users to drag the heading text into
 * a notes app or a card-reordering surface) or even `draggable={false}`
 * (which would still serialize as a literal `draggable="false"` attribute
 * on the rendered DOM node and signal an explicit drag-policy decision
 * targetable by user-agent stylesheets / drag handlers) would silently
 * change the heading's HTML5 drag semantics — the `dragstart` event
 * would fire from the heading and the heading would become a drag source
 * — while every other contract still held. Mirrors the NoDraggable
 * pattern pinned for the activity-card h2 (W2624), the categories-card
 * h2 (W2528), and the this-week-card h2 (W2556). Pin the absence of any
 * `draggable` attribute on the achievements-card h2 so any future change
 * that introduces one is a deliberate, test-acknowledged contract
 * change. The lookup goes through
 * `getByTestId("stats-achievements").querySelector("h2")` rather than a
 * role/heading query so the assertion does not depend on heading
 * semantics — it locks the literal `draggable` attribute presence on the
 * first h2 inside the achievements card.
 */
describe("StatsPage stats-achievements — h2 draggable attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2627: stats-achievements 'Achievements' h2 has no draggable attribute", () => {
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
    // draggable-absence contract.
    expect(h2!.tagName).toBe("H2");
    expect(h2!.textContent).toBe("Achievements");
    // Use `hasAttribute` rather than a value check — even an explicit
    // `draggable="false"` would serialize on the DOM node and signal a
    // deliberate drag-policy decision rather than the implicit default.
    expect(h2!.hasAttribute("draggable")).toBe(false);
  });
});
