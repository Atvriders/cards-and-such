import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2182: StatsPage's `stats-this-week` card renders its PRIOR-week metric
 * list as `<ul className="stats-week-list stats-week-list--prev"
 * data-testid="stats-prev-week">` — the base class plus exactly one BEM
 * modifier (`--prev`) and nothing else. The sibling current-week list pins
 * `className === "stats-week-list"` exactly (W1768) — this test is the
 * complementary pin on the prev-week side.
 *
 * Existing prev-week tests assert presence of the two classes via
 * toHaveClass() (W1592) which is satisfied even if a regression silently
 * appends an extra emphasis/utility class (e.g. accidentally adding
 * `stats-week-list--current` or some layout helper) to the prior-week list,
 * which would change the visual hierarchy of the comparison card while
 * leaving every other test green. Pinning the exact className string locks
 * the prev-week list to base + `--prev` only, with no stray modifiers.
 */
describe("StatsPage stats-this-week — prev-week list exact className", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2182: stats-prev-week <ul> className is exactly 'stats-week-list stats-week-list--prev'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    // Exact-equality on the className attribute — no stray modifiers or
    // utility classes beyond the base + `--prev` BEM modifier.
    expect(prior.className).toBe("stats-week-list stats-week-list--prev");
    expect(prior.getAttribute("class")).toBe(
      "stats-week-list stats-week-list--prev",
    );
  });
});
