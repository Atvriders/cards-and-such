import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onspeechend` attribute on the StatsPage
 * current-week breakdown list (data-testid="stats-this-week-list"). The
 * `onspeechend` event handler attribute belongs to the Web Speech API's
 * SpeechSynthesisUtterance interface and has no defined meaning on a
 * presentational <ul>. Leaving such an attribute on the element would
 * still surface as a string-valued DOM attribute and could be
 * mis-interpreted by future refactors, assistive technology, or
 * crawlers. Other event-handler-attribute absences are pinned on this
 * same element; this test extends that coverage to `onspeechend` so any
 * accidental future addition is reviewed deliberately.
 */
describe("StatsPage stats-this-week-list ul — onspeechend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onspeechend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onspeechend")).toBe(false);
    expect(ul.getAttribute("onspeechend")).toBeNull();
  });
});
