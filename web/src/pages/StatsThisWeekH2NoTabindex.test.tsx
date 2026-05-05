import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2524: StatsPage's "This week" h2 — the section heading of the this-week
 * stats card (data-testid="stats-this-week", which contains both the
 * `stats-this-week-list` ul and the prev-week related card
 * `stats-prev-week` ul) — is a static section title and is intentionally
 * NOT focusable. Existing tests pin adjacent contracts on this same
 * heading node:
 *   - W1857 pins the heading's tagName === "H2".
 *   - W2456 pins the heading's className === "" (bare-class contract).
 *   - W2512 pins the absence of an `id` on the heading specifically.
 *   - W1468 pins the heading's parent (.stats-card div with
 *     data-testid="stats-this-week").
 *   - W2092 pins the absence of an `id` on every StatsPage h2.
 *   - W2142 pins the absence of an inline `style` attribute on every h2.
 *   - W2345 pins the absence of an explicit `role` attribute on the
 *     this-week CARD wrapper, not on the inner h2.
 *
 * What is NOT pinned by any of those tests is the absence of a
 * `tabindex` attribute on the "This week" h2 itself. Adding
 * `tabIndex={-1}` (e.g. to make the heading programmatically focusable
 * as a skip-link target after a deltas-export interaction or as a
 * hash-link landing for `#this-week`) or `tabIndex={0}` (e.g. to insert
 * the heading into the keyboard tab order so it acts as a screen-reader
 * focus anchor) would silently change the StatsPage tab order and
 * focus semantics while every other contract still held. Mirrors the
 * NoTabindex pattern pinned for the activity-card h2 (W2518) and the
 * categories-card h2 (W2506). Pin the absence of any `tabindex`
 * attribute on the this-week-card h2 so any future change that
 * introduces one is a deliberate, test-acknowledged contract change.
 * The lookup goes through
 * `getByTestId("stats-this-week").querySelector("h2")` rather than a
 * role/heading query so the assertion does not depend on heading
 * semantics — it locks the literal `tabindex` attribute presence on the
 * first h2 inside the this-week card (the same card whose body holds
 * the prev-week related list).
 */
describe("StatsPage stats-this-week — h2 tabindex attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2524: stats-this-week 'This week' h2 has no tabindex attribute", () => {
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
    // tabindex-absence contract.
    expect(h2!.tagName).toBe("H2");
    expect(h2!.textContent).toBe("This week");
    // Use `hasAttribute` rather than a value check — even an explicit
    // `tabindex="-1"` would make the heading programmatically focusable
    // and create a new undeclared focus surface.
    expect(h2!.hasAttribute("tabindex")).toBe(false);
  });
});
