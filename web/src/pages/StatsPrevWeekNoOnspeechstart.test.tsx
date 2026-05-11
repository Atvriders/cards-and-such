import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onspeechstart` attribute is
 * an inline event handler for the SpeechRecognition `speechstart` event.
 * It has no meaning on a presentational <ul> and, if present, would attach
 * an inline event handler that could execute attacker-controlled script in
 * the event of an XSS regression. Sibling tests pin the absence of many
 * other attributes on this element; this test pins the absence of
 * `onspeechstart` so any future change that accidentally attaches such an
 * inline handler is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onspeechstart attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onspeechstart attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onspeechstart")).toBe(false);
    expect(ul.getAttribute("onspeechstart")).toBeNull();
  });
});
