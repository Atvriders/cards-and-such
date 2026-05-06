import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2567: StatsPage's "This week" stats card (data-testid="stats-this-week")
 * is rendered as a plain <div className="stats-card stats-card--week">. Its
 * accessible-name story is carried by the visible <h2>This week</h2> heading
 * directly inside the card, not by an `aria-labelledby` reference pointing
 * at some other element. Existing pins on the card already cover the
 * tagName, exact className, absence of `id` (W2024), inline `style` (W2140),
 * `tabindex`, explicit `role` (W2345), and `aria-label` (W2537). The
 * sibling stats-this-week-list <ul> has its `aria-labelledby` absence
 * pinned via W2498, but NO existing test pins the absence of an
 * `aria-labelledby` attribute on the stats-this-week CARD div itself.
 * Adding `aria-labelledby="..."` to the card would (a) introduce a second
 * accessible name source that could drift from / silently override the
 * visible <h2>, (b) require a stable `id` on the referenced node which
 * would couple this region to a fragment anchor in a way W2024 deliberately
 * avoids, and (c) silently change how assistive tech announces the card if
 * it later gains `role="region"`. Pin the absence so any future change
 * that attaches a labelledby reference to the card div is reviewed
 * deliberately. Mirrors W2498 (this-week list no-aria-labelledby) and
 * W2537 (this-week card no-aria-label) at the card layer.
 */
describe("StatsPage stats-this-week card — aria-labelledby attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2567: stats-this-week card has no aria-labelledby attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    expect(card.tagName).toBe("DIV");
    expect(card.hasAttribute("aria-labelledby")).toBe(false);
    expect(card.getAttribute("aria-labelledby")).toBeNull();
  });
});
