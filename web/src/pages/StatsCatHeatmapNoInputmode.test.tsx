import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2839 — The category x day-of-week heatmap on StatsPage is a static
 * `role="img"` summary rendered as a non-editable grid of past-activity
 * cells. It accepts no text input, has no contenteditable surface, and is
 * not a form control. W2688 already pins the absence of `aria-relevant`
 * on this element; this test pins the absence of the IME / virtual-keyboard
 * hint attribute `inputmode`.
 *
 * `inputmode` is a global attribute that tells browsers which on-screen
 * keyboard layout (numeric, decimal, tel, email, search, url, none, etc.)
 * to surface when the user focuses an editable element. Attaching it to a
 * static `role="img"` summary is meaningless to assistive tech but actively
 * harmful on touch devices: if the heatmap ever gains a focusable surface
 * (e.g. an accidental `tabindex="0"` or `contenteditable` regression), a
 * stale `inputmode` would pop the wrong virtual keyboard on tap, blocking
 * the chart and confusing the user about whether the heatmap is editable.
 *
 * Pin `inputmode` absence so any drift toward editable/IME-bearing
 * semantics on this static chart fails here before it ships.
 */
describe("StatsPage cat heatmap inputmode absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2839: stats-cat-heatmap root has no inputmode attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("inputmode")).toBe(false);
  });
});
