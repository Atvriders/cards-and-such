import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1545: StatsPage's footer destructive control is a `<button>` whose visible
 * label reads exactly "Reset stats". Existing tests pin the button's className
 * (W1246: `stats-reset-btn`), explicit `type="button"` (W1484), tagName
 * (BUTTON sanity in W1246), `data-testid="stats-reset"`, and the
 * ConfirmDialog wiring (W1316/W1327 cover the *confirm-yes* and *confirm-no*
 * labels inside the modal — NOT the trigger button's own label). Notably, the
 * footer trigger button's own visible textContent ("Reset stats") is NOT
 * pinned anywhere — a regression that re-labels this trigger to "Clear",
 * "Delete", "Reset all", etc. would weaken the destructive-action copy
 * (and break user muscle-memory) while every existing structural test still
 * passes. Lock the trigger's exact visible label here.
 *
 * Related (do NOT duplicate):
 *   - W1246: footer reset button className token (`stats-reset-btn`)
 *   - W1484: footer reset button explicit `type="button"`
 *   - W1316: confirm-dialog YES button text reads "Reset stats" (different element)
 *   - W1327: confirm-dialog NO  button text reads "Cancel"        (different element)
 *   - W1346: footer note precedes reset button (sibling order)
 */
describe("StatsPage footer — reset button visible label", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1545: stats-reset button textContent reads exactly 'Reset stats'", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const btn = screen.getByTestId("stats-reset");
    // Pin the trigger button's exact visible label — the destructive-action
    // copy users see in the page footer (NOT the confirm-dialog yes label).
    expect(btn.textContent).toBe("Reset stats");
  });
});
