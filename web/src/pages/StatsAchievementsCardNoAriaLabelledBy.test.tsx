import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2532: StatsPage's `data-testid="stats-achievements"` card — the
 * `.stats-card` wrapper holding the Achievements heading, the search
 * input, the show-locked toggle, and the achievements grid — carries
 * NO explicit `aria-labelledby` attribute. Sibling pins already cover
 * several attribute-shape contracts on this same card:
 *   - StatsAchievementsCardClass.test.tsx pins the exact className.
 *   - StatsAchievementsCardNoId.test.tsx pins absence of `id`.
 *   - StatsAchievementsCardNoStyle.test.tsx pins absence of inline `style`.
 *   - StatsAchievementsNoTabindex.test.tsx pins absence of `tabindex`.
 *   - StatsAchievementsCardNoRole.test.tsx (W2355) pins absence of `role`.
 *   - StatsAchievementsCardNoAriaLabel.test.tsx (W2526) pins absence of
 *     `aria-label`.
 *   - StatsAchievementsCardChildCount.test.tsx (W2493) pins childElementCount.
 *   - StatsAchievementsCardLastChild.test.tsx (W2504) pins lastElementChild.
 *   - StatsAchievementsContainerTag.test.tsx pins the container tag.
 *   - StatsAchievementsTitleClass.test.tsx pins the heading shape.
 *
 * What none of those cover is the ABSENCE of an explicit
 * `aria-labelledby` attribute on the achievements card itself. The card
 * is a plain presentational `<div>` with no `role`, no `aria-label`,
 * and (this contract) no `aria-labelledby`. Adding
 * `aria-labelledby="…"` pointing at the inner `<h2>Achievements</h2>`
 * id would only have meaningful a11y impact if the wrapper were also
 * promoted to a labelable role (e.g. `region` / `group`), since on a
 * plain non-landmark `<div>` `aria-labelledby` is generally ignored by
 * assistive technologies. Pinning its absence guards against:
 *   1. A drive-by refactor that adds an id to the inner heading and
 *      wires it up via `aria-labelledby` on the wrapper, which would
 *      then naturally invite a paired `role="region"` change — together
 *      promoting this presentational wrapper into a named landmark and
 *      breaking the "plain unnamed wrapper" contract that
 *      StatsAchievementsCardNoRole + StatsAchievementsCardNoAriaLabel
 *      already establish.
 *   2. Inheriting a stale id reference if the heading ever loses its
 *      id, which would leave the wrapper pointing at a non-existent
 *      element (a known a11y anti-pattern).
 *
 * Pin the ABSENCE of any `aria-labelledby` attribute on the
 * achievements card, using `hasAttribute` so even an empty
 * `aria-labelledby=""` is caught (an empty IDREFS string is itself a
 * meaningful — and broken — a11y signal).
 */
describe("StatsPage stats-achievements — card aria-labelledby attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2532: stats-achievements card has no aria-labelledby attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-achievements");
    expect(card).not.toBeNull();

    // Sanity: confirm we pinned the achievements card itself and not
    // a descendant.
    expect(card.tagName).toBe("DIV");
    expect(card.classList.contains("stats-card")).toBe(true);

    // The actual contract: no explicit `aria-labelledby` attribute on
    // the achievements card wrapper. `hasAttribute` rather than a
    // specific-value check — even an empty `aria-labelledby=""` would
    // alter how some assistive technologies treat the wrapper.
    expect(card.hasAttribute("aria-labelledby")).toBe(false);
  });
});
