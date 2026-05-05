import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2480: StatsPage's `stats-this-week` card renders the current-week summary
 * <ul data-testid="stats-this-week-list"> whose three <li> rows are bare list
 * items with NO attributes — neither class (pinned by W1789), nor
 * id, role, style, or tabindex. This test pins the absence of an
 * `id` on the FIRST <li> (the "Plays" row). The row carries no identifier
 * because it has no need for external coupling — its visual position is
 * fixed by the parent <ul>'s `.stats-week-list` class, its content is
 * found via the inner <span class="stats-week-label"> / <em class="stats-week-value">
 * children, and assistive tech announces it through native list-item
 * semantics (W1781 pins the LI tagName).
 *
 * Existing first-row tests pin its tagName as LI (W1781), the absence of
 * a class attribute (W1789), the exact element-child count of three
 * (W1656 — label SPAN + value EM + delta SPAN), and the inner label tag
 * as SPAN (W1607). Sibling rows pin their own no-class invariants
 * (W*: SecondRowLiNoClass / ThirdRowLiNoClass). NONE of those assertions
 * inspect whether the first <li> wrapper carries an `id` attribute. A
 * regression that added `id="stats-week-plays"` (for example, to enable a
 * deep-link anchor or label[for=...] coupling) would silently satisfy
 * every existing this-week assertion while introducing a global identifier
 * that risks collision with user-authored markup and diverges from the
 * card's existing identifier-free row contract. This test pins the first
 * this-week <li> as having NO `id` attribute.
 */
describe("StatsPage stats-this-week — first <li> has no id", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2480: stats-this-week-list first <li> has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const list = within(card).getByTestId("stats-this-week-list");
    const firstRow = list.querySelector("li");
    expect(firstRow).not.toBeNull();
    // The first <li> wrapper must remain identifier-free: no `id`
    // attribute. All inner hooks live on the SPAN/EM/SPAN children.
    expect(firstRow!.hasAttribute("id")).toBe(false);
    expect(firstRow!.getAttribute("id")).toBeNull();
  });
});
