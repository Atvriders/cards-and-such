import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2776: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is a static summary <ul> rendering three read-only rows about the previous
 * ISO week (Prior plays / Prior wins / Prior avg time). It is not part of any
 * navigation, pagination, step indicator, or selection widget — there is no
 * notion of a "current" item among its rows. Sibling pins already cover the
 * absence of `aria-busy`, `aria-controls`, `aria-describedby`, `aria-haspopup`,
 * `aria-hidden`, `aria-labelledby`, `aria-label`, `aria-pressed`,
 * `aria-role-description`, and `aria-selected` on this <ul>, but no existing
 * test pins the absence of an `aria-current` attribute. Adding
 * `aria-current` (e.g. `aria-current="page"` or `aria-current="true"`) would
 * incorrectly signal to assistive technology that this informational list
 * represents the user's present location within a set of related items,
 * causing screen readers to announce a misleading "current" state and
 * disrupting navigation semantics. Pinning the absence of `aria-current`
 * ensures any future refactor that attempts to apply navigation-style state
 * to this static summary list is reviewed deliberately.
 */
describe("StatsPage stats-prev-week ul — aria-current attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2776: stats-prev-week ul has no aria-current attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-current")).toBe(false);
    expect(ul.getAttribute("aria-current")).toBeNull();
  });
});
