import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2624: StatsPage's "Activity" h2 — the section heading inside the
 * `data-testid="stats-activity"` card — is a static section title and is
 * intentionally NOT a drag source. Sibling tests already pin adjacent
 * contracts on this same heading node:
 *   - W1884 pins the heading's className === "" (bare-class contract).
 *   - W1263 pins the heading's parent (.stats-card div with
 *     data-testid="stats-activity").
 *   - W2092 pins the absence of an `id` on every StatsPage h2.
 *   - W2142 pins the absence of an inline `style` attribute on every h2.
 *   - W2491 pins the absence of an explicit `role` attribute on the
 *     activity-card h2 specifically.
 *   - W2518 pins the absence of a `tabindex` attribute on the same h2.
 *
 * What is NOT pinned by any of those tests is the absence of a
 * `draggable` attribute on the Activity h2 itself. Adding `draggable`
 * (e.g. `draggable="true"` to allow the heading to be dragged as a
 * shareable section anchor, or `draggable="false"` to explicitly opt out
 * of the platform default in a way that user-agent stylesheets / drag
 * handlers can target) would silently surface a HTML5 drag-and-drop
 * interaction surface on a non-interactive section title — while every
 * other contract still held. Mirrors the NoDraggable contract pinned for
 * the categories-card heading (W2528). Pin the absence of any
 * `draggable` attribute on the activity-card h2 so any future change
 * that introduces one is a deliberate, test-acknowledged contract
 * change. The lookup goes through
 * `getByTestId("stats-activity").querySelector("h2")` rather than a
 * role/heading query so the assertion does not depend on heading
 * semantics — it locks the literal `draggable` attribute presence on
 * the first h2 inside the activity card.
 */
describe("StatsPage stats-activity — h2 draggable attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2624: stats-activity 'Activity' h2 has no draggable attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-activity");
    const h2 = card.querySelector("h2");
    expect(h2).not.toBeNull();
    // Sanity: confirm we located the right heading before pinning the
    // draggable-absence contract.
    expect(h2!.tagName).toBe("H2");
    expect(h2!.textContent).toBe("Activity");
    // Use `hasAttribute` rather than a value check — even an explicit
    // `draggable="false"` would surface a drag-and-drop attribute on a
    // non-interactive section title.
    expect(h2!.hasAttribute("draggable")).toBe(false);
  });
});
