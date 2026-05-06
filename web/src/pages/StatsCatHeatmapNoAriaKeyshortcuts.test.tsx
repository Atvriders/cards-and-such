import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2800 — The category x day-of-week heatmap root is a static, purely
 * presentational chart announced as a single image (`role="img"` + literal
 * `aria-label`, W1250). The `aria-keyshortcuts` attribute advertises a
 * keyboard shortcut binding for an interactive element; applying it to a
 * non-focusable, non-interactive `role="img"` chart root is semantically
 * meaningless: assistive tech may announce a phantom shortcut on an
 * element that has no keyboard handler, no focusability (W2641 pinned
 * absence of tabindex), and no actionable behavior.
 *
 * Already pinned on the same root: role="img" + aria-label (W1250),
 * aria-labelledby/describedby/controls/current absence, aria-checked
 * (W2770), aria-pressed/selected/expanded/disabled/readonly/required/
 * orientation/multiselectable/haspopup/relevant/role-description/busy
 * absences. Pin the absence of `aria-keyshortcuts` so a future refactor
 * that wires a "press H to focus heatmap" hotkey and naively annotates
 * the img root with the shortcut string (instead of attaching it to a
 * dedicated focusable wrapper) fails loudly before shipping a screen-
 * reader regression that misrepresents the heatmap as interactive.
 */
describe("StatsPage cat heatmap aria-keyshortcuts absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2800: stats-cat-heatmap root has no aria-keyshortcuts attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const grid = screen.getByTestId("stats-cat-heatmap");
    expect(grid.hasAttribute("aria-keyshortcuts")).toBe(false);
  });
});
