import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2556: StatsPage's "This week" h2 — the section heading of the this-week
 * stats card (data-testid="stats-this-week", which contains both the
 * `stats-this-week-list` ul and the prev-week related card
 * `stats-prev-week` ul) — is a static section title and is intentionally
 * NOT a drag source. Existing tests pin adjacent contracts on this same
 * heading node:
 *   - W1857 pins the heading's tagName === "H2".
 *   - W2456 pins the heading's className === "" (bare-class contract).
 *   - W2512 pins the absence of an `id` on the heading specifically.
 *   - W2524 pins the absence of any `tabindex` attribute on the heading.
 *   - W2092 pins the absence of an `id` on every StatsPage h2.
 *   - W2142 pins the absence of an inline `style` attribute on every h2.
 *
 * What is NOT pinned by any of those tests is the absence of a
 * `draggable` attribute on the "This week" h2 itself. Adding
 * `draggable={true}` (e.g. to allow users to drag the heading text into
 * a notes app or a card-reordering surface) or even `draggable={false}`
 * (which would still serialize as a literal `draggable="false"` attribute
 * on the rendered DOM node and signal an explicit drag-policy decision)
 * would silently change the heading's HTML5 drag semantics — the
 * `dragstart` event would fire from the heading and the heading would
 * become a drag source — while every other contract still held. Pin the
 * absence of any `draggable` attribute on the this-week-card h2 so any
 * future change that introduces one is a deliberate, test-acknowledged
 * contract change. The lookup goes through
 * `getByTestId("stats-this-week").querySelector("h2")` rather than a
 * role/heading query so the assertion does not depend on heading
 * semantics — it locks the literal `draggable` attribute presence on the
 * first h2 inside the this-week card (the same card whose body holds
 * the prev-week related list).
 */
describe("StatsPage stats-this-week — h2 draggable attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2556: stats-this-week 'This week' h2 has no draggable attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const h2 = card.querySelector("h2");
    expect(h2).not.toBeNull();
    // Sanity: confirm we located the right heading before pinning the
    // draggable-absence contract.
    expect(h2!.tagName).toBe("H2");
    expect(h2!.textContent).toBe("This week");
    // Use `hasAttribute` rather than a value check — even an explicit
    // `draggable="false"` would serialize on the DOM node and signal a
    // deliberate drag-policy decision rather than the implicit default.
    expect(h2!.hasAttribute("draggable")).toBe(false);
  });
});
