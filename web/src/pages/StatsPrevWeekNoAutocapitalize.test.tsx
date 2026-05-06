import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2846: StatsPage's `stats-this-week` card renders the PRIOR-week metric
 * list as a plain `<ul data-testid="stats-prev-week">` with no
 * `autocapitalize` attribute. `autocapitalize` is a text-input/contenteditable
 * authoring hint and has no semantic effect on a static `<ul>`; its presence
 * would imply the list is editable or accepting input, which it is not.
 *
 * Existing prev-week tests pin the className, child count, label/value tags,
 * and several other attribute absences, but none currently lock the absence
 * of `autocapitalize` on the list root. This test pins
 * `hasAttribute("autocapitalize") === false` so a regression that bolts a
 * stray input-style hint onto the prior-week list — e.g. via a misplaced
 * spread of editor props — fails fast.
 */
describe("StatsPage stats-this-week — prev-week list has no autocapitalize", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2846: stats-prev-week <ul> does not declare an `autocapitalize` attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const prior = within(card).getByTestId("stats-prev-week");
    expect(prior.tagName).toBe("UL");
    expect(prior.hasAttribute("autocapitalize")).toBe(false);
  });
});
