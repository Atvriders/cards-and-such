import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2491: StatsPage's "Activity" h2 — the section heading inside the
 * `data-testid="stats-activity"` card — is intentionally rendered bare
 * with NO explicit `role` attribute, so assistive tech relies solely on
 * the implicit `heading` role with `aria-level=2` derived from the h2
 * tag. Sibling tests already pin adjacent contracts on this same heading
 * node:
 *   - W1884 pins the heading's className === "" (bare-class contract).
 *   - W1263 pins the heading's parent (.stats-card div with
 *     data-testid="stats-activity").
 *   - W2092 pins the absence of an `id` on every StatsPage h2.
 *   - W2142 pins the absence of an inline `style` attribute on every h2.
 *   - The W828/W833 audit pins heading text + level via getByRole.
 *
 * What is NOT pinned by any of those tests is the absence of an explicit
 * `role` attribute on the Activity h2 itself. A refactor that added e.g.
 * `role="heading"` (a redundant duplicate of the implicit role) or worse
 * `role="presentation"` / `role="none"` (which would silently strip the
 * heading from the accessibility tree without altering the visible text
 * or any className-based assertion) would slip past every existing test
 * while breaking the document outline that screen-reader users rely on
 * to skim StatsPage. Pin the absence of any explicit `role` via
 * `hasAttribute("role")` so even an explicit `role="heading"` (the same
 * role the tag already implies) fails the test — any change here should
 * be a deliberate, test-acknowledged contract change. The lookup goes
 * through `getByTestId("stats-activity").querySelector("h2")` rather
 * than a role/heading query so the assertion does not depend on heading
 * semantics — it locks the literal `role` attribute presence on the
 * first h2 inside the activity card.
 */
describe("StatsPage stats-activity — h2 role attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2491: stats-activity 'Activity' h2 has no role attribute", () => {
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
    // Use `hasAttribute` rather than a value check — any explicit role
    // (even `role="heading"`, the implicit one the h2 tag already
    // provides) must trip this assertion.
    expect(h2!.hasAttribute("role")).toBe(false);
  });
});
