import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1467: StatsPage's `.stats-controls` wrapper contains an inner
 * `.lobby-chips` div that carries `role="tablist"` and
 * `aria-label="Filter by category"`. These ARIA attributes are what
 * actually expose the chip row to assistive tech as a tablist named
 * "Filter by category" — losing either silently degrades a11y while
 * the visible chips still render. No existing Stats test pins these
 * inner ARIA attributes; the sibling W1452 test only locks the OUTER
 * `.stats-controls` tag and explicitly notes the inner aria is unpinned.
 * Lock the inner ChipStrip aria here so a refactor (e.g. switching to
 * `role="group"` or removing the label) is caught.
 */
describe("StatsPage stats-controls inner ChipStrip aria", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1467: inner lobby-chips has role=tablist and aria-label='Filter by category'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const controls = screen.getByTestId("stats-controls");
    const chips = controls.querySelector(".lobby-chips");
    expect(chips).not.toBeNull();
    expect(chips!.getAttribute("role")).toBe("tablist");
    expect(chips!.getAttribute("aria-label")).toBe("Filter by category");
  });
});
