import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2622: StatsPage's "Top played" h2 — the section heading inside the
 * categories stats card (`data-testid="stats-categories"`, rendered
 * around line 1485 of StatsPage.tsx) — is intentionally rendered bare
 * with NO explicit `role` attribute. Assistive tech relies solely on
 * the implicit `heading` role with `aria-level=2` derived from the
 * literal `<h2>` tag.
 *
 * Sibling pins on this same heading already cover:
 *   - W828   — tagName === "H2" + textContent === "Top played"
 *     (StatsPage.test.tsx).
 *   - W1878  — className === "" so the heading inherits global card
 *     typography rather than a one-off override
 *     (StatsCategoriesTitleClass.test.tsx).
 *   - W1460  — parent linkage: the h2 is a direct child of the
 *     `.stats-card` div with `data-testid="stats-categories"`.
 *   - W2092  — global pin that every StatsPage h2 has no `id`
 *     attribute.
 *   - W2142  — global pin that every StatsPage h2 has no inline
 *     `style` attribute.
 *   - W2506  — `tabindex` attribute absence on the categories h2
 *     specifically (StatsCategoriesH2NoTabindex.test.tsx).
 *   - W2528  — `draggable` attribute absence on the categories h2
 *     specifically (StatsCategoriesH2NoDraggable.test.tsx).
 *
 * What is NOT pinned by any of those tests is the absence of an
 * explicit `role` attribute on the categories h2 itself. A refactor
 * that added e.g. `role="heading"` (a redundant duplicate of the
 * implicit role the `<h2>` tag already provides) or — far worse —
 * `role="none"` / `role="presentation"` (which would silently strip
 * the heading from the accessibility tree without altering the
 * visible "Top played" text, the className, the parent linkage, or
 * any global h2 pin) would slip past every existing assertion while
 * breaking the document outline that screen-reader users rely on to
 * skim StatsPage and jump to the categories section.
 *
 * Pin the absence of any explicit `role` via `hasAttribute("role")`
 * so that even an explicit `role="heading"` (the same role the tag
 * already implies) trips the test — any change here should be a
 * deliberate, test-acknowledged contract change. The lookup goes
 * through `getByTestId("stats-categories").querySelector("h2")`
 * rather than a role/heading query so the assertion does not depend
 * on heading semantics — it locks the literal `role` attribute
 * presence on the first h2 inside the categories card.
 *
 * Lives in a NEW SIBLING file (not StatsPage.test.tsx) following the
 * established W2491 (StatsActivityH2NoRole), W2541
 * (StatsThisWeekH2NoRole), and W2620 (StatsPersonalRecordsH2NoRole)
 * NoRole pattern so the test shares the `src/pages/StatsCategories`
 * vitest path filter without colliding with concurrent edits to the
 * mega-file.
 */
describe("StatsPage stats-categories — h2 role attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2622: stats-categories 'Top played' h2 has no role attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-categories");
    const h2 = card.querySelector("h2");
    expect(h2).not.toBeNull();
    // Sanity: confirm we located the right heading before pinning the
    // role-absence contract.
    expect(h2!.tagName).toBe("H2");
    expect(h2!.textContent).toBe("Top played");
    // Use `hasAttribute` rather than a value check — any explicit role
    // (even `role="heading"`, the implicit one the h2 tag already
    // provides) must trip this assertion.
    expect(h2!.hasAttribute("role")).toBe(false);
  });
});
