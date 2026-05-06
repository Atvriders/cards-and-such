import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2631: StatsPage's "Personal records" h2 — the section heading inside
 * the `data-testid="stats-personal-records"` card (the per-game "Top 10
 * best times across all games" panel rendered around line 1617 of
 * StatsPage.tsx) — is a static section title and is intentionally NOT
 * focusable. Existing sibling pins on this same heading already cover:
 *   - W2508 — tagName === "H2" + textContent === "Personal records"
 *     (StatsPersonalRecordsH2TagName.test.tsx).
 *   - W2620 — `role` attribute absence
 *     (StatsPersonalRecordsH2NoRole.test.tsx).
 *   - W1896 — className === "" so the heading inherits global card
 *     typography rather than a one-off override
 *     (StatsPersonalRecordsTitleClass.test.tsx).
 *   - W1457 — parent linkage: the h2 is a direct child of the
 *     `.stats-card` div with data-testid="stats-personal-records"
 *     (StatsSectionH2PersonalRecordsParent.test.tsx).
 *   - W2092 — global pin that every StatsPage h2 has no `id` attribute.
 *   - W2142 — global pin that every StatsPage h2 has no inline `style`
 *     attribute.
 *
 * What is NOT pinned by any of those tests is the absence of a
 * `tabindex` attribute on the personal-records h2 itself. Adding
 * `tabIndex={-1}` (e.g. to make the heading programmatically focusable
 * as a skip-link target) or `tabIndex={0}` (e.g. to insert the heading
 * into the keyboard tab order so it acts as a focus anchor for
 * screen-reader / hash-link landings) would silently change the
 * StatsPage tab order and screen-reader focus semantics while every
 * other contract still held. Mirrors the NoTabindex pattern already
 * pinned for the activity-card h2 (W2518), the categories-card h2
 * (W2506), the achievements-card h2 (W2614), and the most-hinted-card
 * h2 (W2618).
 *
 * Pin the absence of any `tabindex` attribute via `hasAttribute` so any
 * future change that introduces one — even `tabIndex={-1}` (which
 * would not appear in the visible tab order) — is a deliberate,
 * test-acknowledged contract change. The lookup goes through
 * `getByTestId("stats-personal-records").querySelector("h2")` rather
 * than a role/heading query so the assertion does not depend on heading
 * semantics — it locks the literal `tabindex` attribute presence on the
 * first h2 inside the personal-records card.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established NoTabindex sibling-file pattern so the test shares the
 * `src/pages/StatsPersonalRecords` vitest path filter without colliding
 * with concurrent edits to the mega-file.
 */
describe("StatsPage stats-personal-records — h2 tabindex attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2631: stats-personal-records 'Personal records' h2 has no tabindex attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-personal-records");
    const h2 = card.querySelector("h2");
    expect(h2).not.toBeNull();
    // Sanity: confirm we located the right heading before pinning the
    // tabindex-absence contract.
    expect(h2!.tagName).toBe("H2");
    expect(h2!.textContent).toBe("Personal records");
    // The actual contract under test. Use `hasAttribute` rather than a
    // value check — any explicit tabindex (including `tabIndex={-1}`,
    // which would not appear in the visible tab order) must trip this
    // assertion.
    expect(h2!.hasAttribute("tabindex")).toBe(false);
  });
});
