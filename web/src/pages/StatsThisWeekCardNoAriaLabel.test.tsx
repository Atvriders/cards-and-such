import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2537: StatsPage's "This week" stats card (data-testid="stats-this-week")
 * is rendered as a plain <div className="stats-card stats-card--week">. Its
 * accessible-name story is carried by the visible <h2>This week</h2> heading
 * directly inside the card, not by an authored `aria-label` override on the
 * card div itself. Existing pins on the card already cover the tagName,
 * exact className, and absence of `id` (W2024), inline `style` (W2140),
 * `tabindex`, and explicit `role` (W2345). The sibling stats-this-week-list
 * <ul> has its `aria-label` absence pinned via W2468 and `aria-labelledby`
 * absence via W2498, but NO existing test pins the absence of an
 * `aria-label` attribute on the stats-this-week CARD div. Adding
 * `aria-label="This week"` (or similar) to the card would (a) introduce a
 * second accessible name that could drift from the visible <h2>, (b)
 * silently change how assistive tech announces the region if the card later
 * gains `role="region"`, and (c) make the card discoverable via
 * getByRole(..., { name: ... }) in a way downstream tests could couple to.
 * Pin the absence so any future change that attaches an authored name to
 * the card div is reviewed deliberately. Mirrors W2468 (this-week list
 * no-aria-label) at the card layer.
 */
describe("StatsPage stats-this-week card — aria-label attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2537: stats-this-week card has no aria-label attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    expect(card.tagName).toBe("DIV");
    expect(card.hasAttribute("aria-label")).toBe(false);
    expect(card.getAttribute("aria-label")).toBeNull();
  });
});
