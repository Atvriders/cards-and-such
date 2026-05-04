import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1497: When StatsPage's footer "Reset stats" button opens the ConfirmDialog,
 * the dialog must carry `aria-modal="true"`. That attribute is what tells
 * assistive tech the rest of the page is inert while the prompt is open —
 * without it, screen-reader users can wander out of the alertdialog and
 * acknowledge the destructive action without realising the prompt was modal.
 *
 * Existing reset-flow coverage pins:
 *   - W895: dialog title text + aria-labelledby wiring
 *   - W916: dialog body copy + aria-describedby wiring
 *   - W904: confirm-yes carries the danger variant class
 *   - W1316: confirm-yes button text reads "Reset stats"
 *   - W1327: confirm-no button text reads "Cancel"
 *   - W1246: footer reset button className (`stats-reset-btn`)
 *   - W1484: footer reset button explicit type="button"
 *   - W650 : confirm-no path leaves stats blob intact
 *
 * None of those assert the `aria-modal` attribute on the alertdialog itself.
 * A regression that drops `aria-modal="true"` (or flips it to "false") would
 * silently weaken the screen-reader contract without any other test failing.
 * Pin the literal string value so the wiring cannot drift.
 */
describe("StatsPage reset flow — confirm dialog aria-modal", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1497: stats-reset confirm dialog carries aria-modal=\"true\"", async () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("stats-reset"));
    const dialog = await screen.findByTestId("confirm-dialog");
    // Pin the exact string the ConfirmDialog renders — aria-modal is the
    // contract that tells AT the rest of the page is inert while open.
    expect(dialog.getAttribute("aria-modal")).toBe("true");
  });
});
