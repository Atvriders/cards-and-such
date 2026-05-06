import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2633: StatsPage's "Most-hinted games" h2 — the section heading inside
 * the `data-testid="stats-most-hinted"` stats-card div — is intentionally
 * rendered bare with NO explicit `role` attribute. Assistive tech relies
 * solely on the implicit `heading` role with `aria-level=2` derived from
 * the literal `<h2>` tag.
 *
 * Sibling pins on this same heading already cover:
 *   - W2516 — tagName === "H2" via testid → querySelector lookup
 *     (StatsMostHintedH2Tag.test.tsx).
 *   - W2510 — `class` attribute absence so the heading inherits global
 *     stats-card typography (StatsMostHintedH2NoClass.test.tsx).
 *   - W2618 — `tabindex` attribute absence so the heading is not pulled
 *     into the keyboard tab order or used as a programmatic focus anchor
 *     (StatsMostHintedH2NoTabindex.test.tsx).
 *   - W1488 — parent linkage: the h2 is a direct child of the
 *     `.stats-card` div with data-testid="stats-most-hinted"
 *     (StatsSectionH2MostHintedParent.test.tsx).
 *   - W2092 — global pin that every StatsPage h2 has no `id` attribute
 *     (StatsH2NoId.test.tsx).
 *   - W2142 — global pin that every StatsPage h2 has no inline `style`
 *     attribute (StatsH2NoStyle.test.tsx).
 *
 * What is NOT pinned by any of those tests is the absence of an explicit
 * `role` attribute on the Most-hinted-games h2 itself. A refactor that
 * added e.g. `role="heading"` (a redundant duplicate of the implicit role
 * the `<h2>` tag already provides) or — far worse — `role="none"` /
 * `role="presentation"` (which would silently strip the heading from the
 * accessibility tree without altering the visible "Most-hinted games"
 * text, the className, the parent linkage, or any global h2 pin) would
 * slip past every existing assertion while breaking the document outline
 * that screen-reader users rely on to skim StatsPage and jump to the
 * most-hinted-games section. Note: W2360 (StatsMostHintedCardNoRole) pins
 * the role-attribute absence on the wrapping CARD div, not on the inner
 * h2 — they are independent contracts.
 *
 * Pin the absence of any explicit `role` via `hasAttribute("role")` so
 * that even an explicit `role="heading"` (the same role the tag already
 * implies) trips the test — any change here should be a deliberate,
 * test-acknowledged contract change. The lookup goes through
 * `getByTestId("stats-most-hinted").querySelector("h2")` rather than a
 * role/heading query so the assertion does not depend on heading
 * semantics — it locks the literal `role` attribute presence on the
 * first h2 inside the most-hinted card. Mirrors the W2491
 * (StatsActivityH2NoRole) and W2620 (StatsPersonalRecordsH2NoRole)
 * NoRole patterns on adjacent stats-card h2s.
 */
describe("StatsPage stats-most-hinted — h2 role attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2633: stats-most-hinted 'Most-hinted games' h2 has no role attribute", () => {
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
    // role-absence contract.
    expect(h2!.tagName).toBe("H2");
    expect(h2!.textContent).toBe("Most-hinted games");
    // Use `hasAttribute` rather than a value check — any explicit role
    // (even `role="heading"`, the implicit one the h2 tag already
    // provides) must trip this assertion.
    expect(h2!.hasAttribute("role")).toBe(false);
  });
});
