import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2639: StatsPage's "Achievements" h2 — the section heading inside the
 * `data-testid="stats-achievements"` card — is intentionally rendered
 * bare with NO explicit `role` attribute, so assistive tech relies solely
 * on the implicit `heading` role with `aria-level=2` derived from the h2
 * tag. Sibling tests already pin adjacent contracts on this same heading
 * node:
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
 *   - W2627 pins the absence of a `draggable` attribute on the
 *     achievements-card h2 specifically.
 *
 * What is NOT pinned by any of those tests is the absence of an explicit
 * `role` attribute on the Achievements h2 itself. A refactor that added
 * e.g. `role="heading"` (a redundant duplicate of the implicit role) or
 * worse `role="presentation"` / `role="none"` (which would silently strip
 * the heading from the accessibility tree without altering the visible
 * text or any className-based assertion) would slip past every existing
 * test while breaking the document outline that screen-reader users rely
 * on to skim StatsPage. Mirrors the NoRole pattern pinned for the
 * activity-card h2 (W2491), the categories-card h2
 * (StatsCategoriesH2NoRole), the most-hinted h2 (StatsMostHintedH2NoRole),
 * and the this-week-card h2 (W…). Pin the absence of any explicit `role`
 * via `hasAttribute("role")` so even an explicit `role="heading"` (the
 * same role the tag already implies) fails the test — any change here
 * should be a deliberate, test-acknowledged contract change. The lookup
 * goes through `getByTestId("stats-achievements").querySelector("h2")`
 * rather than a role/heading query so the assertion does not depend on
 * heading semantics — it locks the literal `role` attribute presence on
 * the first h2 inside the achievements card.
 */
describe("StatsPage stats-achievements — h2 role attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2639: stats-achievements 'Achievements' h2 has no role attribute", () => {
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
    // role-absence contract.
    expect(h2!.tagName).toBe("H2");
    expect(h2!.textContent).toBe("Achievements");
    // Use `hasAttribute` rather than a value check — any explicit role
    // (even `role="heading"`, the implicit one the h2 tag already
    // provides) must trip this assertion.
    expect(h2!.hasAttribute("role")).toBe(false);
  });
});
