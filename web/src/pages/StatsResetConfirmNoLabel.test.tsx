import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W1327: When the user clicks the footer's stats-reset button, StatsPage opens
 * a ConfirmDialog whose "no" (cancel) button must read exactly "Cancel".
 * StatsPage's handleReset() deliberately does NOT pass a `cancelLabel` into
 * showConfirm() — the ConfirmDialog's default cancelLabel ("Cancel") is what
 * reaches the visible button. That default-by-omission is load-bearing: a
 * regression that *added* a cancelLabel like "Keep stats" (or anything
 * action-specific) would change the cancel-button text without any other
 * assertion noticing.
 *
 * Existing reset-flow coverage pins:
 *   - W895: dialog title text + aria-labelledby wiring
 *   - W916: dialog body copy + aria-describedby wiring
 *   - W904: confirm-yes carries the danger variant class
 *   - W1316: confirm-yes button text reads "Reset stats"
 *   - W1246: footer reset button className (`stats-reset-btn`)
 *   - W650 : confirm-no path leaves stats blob intact
 *
 * None of those assert the *text* on the confirm-no button itself. Pin the
 * default "Cancel" so the wiring (handleReset omits cancelLabel → ConfirmDialog
 * default → rendered button text) cannot drift to a custom value silently.
 */
describe("StatsPage reset flow — confirm-no button label", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W1327: confirm-no button on the reset dialog reads exactly 'Cancel'", async () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId("stats-reset"));
    const no = await screen.findByTestId("confirm-no");
    // Pin the ConfirmDialog default — handleReset deliberately omits
    // cancelLabel, so any non-"Cancel" text means a regression added one.
    expect(no.textContent).toBe("Cancel");
    expect(no.tagName).toBe("BUTTON");
  });
});
