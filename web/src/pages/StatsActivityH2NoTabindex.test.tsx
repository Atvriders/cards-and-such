import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2518: StatsPage's "Activity" h2 — the section heading inside the
 * `data-testid="stats-activity"` card — is a static section title and is
 * intentionally NOT focusable. Sibling tests already pin adjacent
 * contracts on this same heading node:
 *   - W1884 pins the heading's className === "" (bare-class contract).
 *   - W1263 pins the heading's parent (.stats-card div with
 *     data-testid="stats-activity").
 *   - W2092 pins the absence of an `id` on every StatsPage h2.
 *   - W2142 pins the absence of an inline `style` attribute on every h2.
 *   - W2491 pins the absence of an explicit `role` attribute on the
 *     activity-card h2 specifically.
 *   - W2242 pins the absence of `tabindex` on the activity CARD wrapper,
 *     not on the inner h2.
 *
 * What is NOT pinned by any of those tests is the absence of a
 * `tabindex` attribute on the Activity h2 itself. Adding `tabIndex={-1}`
 * (e.g. to make the heading programmatically focusable as a hash-link
 * landing or a skip-link target after an export-button interaction) or
 * `tabIndex={0}` (e.g. to insert the heading into the keyboard tab order
 * so it acts as a screen-reader focus anchor) would silently change the
 * StatsPage tab order and focus semantics while every other contract
 * still held. Mirrors the NoTabindex pattern pinned for the categories
 * card heading (W2506). Pin the absence of any `tabindex` attribute on
 * the activity-card h2 so any future change that introduces one is a
 * deliberate, test-acknowledged contract change. The lookup goes through
 * `getByTestId("stats-activity").querySelector("h2")` rather than a
 * role/heading query so the assertion does not depend on heading
 * semantics — it locks the literal `tabindex` attribute presence on the
 * first h2 inside the activity card.
 */
describe("StatsPage stats-activity — h2 tabindex attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2518: stats-activity 'Activity' h2 has no tabindex attribute", () => {
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
    // tabindex-absence contract.
    expect(h2!.tagName).toBe("H2");
    expect(h2!.textContent).toBe("Activity");
    // Use `hasAttribute` rather than a value check — even an explicit
    // `tabindex="-1"` would make the heading programmatically focusable
    // and create a new undeclared focus surface.
    expect(h2!.hasAttribute("tabindex")).toBe(false);
  });
});
