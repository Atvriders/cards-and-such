import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2637: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul class="stats-week-list stats-week-list--prev">
 * with three read-only summary rows. The list is purely presentational and
 * has no separate descriptive paragraph, hint, or off-screen helper text in
 * the DOM that it needs to point at via `aria-describedby`. Sibling pins
 * already cover the absence of `aria-label` (W2373), `id`, `role`, `style`,
 * `tabindex`, and the exact class string and child counts, but no existing
 * test pins the absence of an `aria-describedby` attribute on this <ul>.
 * Attaching `aria-describedby` would (a) reference an element that does not
 * exist (silently producing no announcement and a brittle ARIA contract),
 * or (b) wire the list to an unrelated id, changing the screen-reader
 * announcement for this presentational summary. Pinning the absence of
 * `aria-describedby` ensures any future refactor that attempts to bolt a
 * description reference onto the list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — aria-describedby attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2637: stats-prev-week ul has no aria-describedby attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("aria-describedby")).toBe(false);
    expect(ul.getAttribute("aria-describedby")).toBeNull();
  });
});
