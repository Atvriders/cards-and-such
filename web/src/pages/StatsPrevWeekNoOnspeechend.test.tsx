import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onspeechend` IDL/content attribute is the
 * inline event handler that fires when a SpeechSynthesisUtterance finishes
 * speaking; it has no defined meaning on a presentational <ul> and should
 * never be serialized into this element. Pinning its absence here ensures
 * any future change that accidentally attaches an inline speech-synthesis
 * handler to this summary list is reviewed deliberately rather than slipping
 * in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onspeechend attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onspeechend attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onspeechend")).toBe(false);
    expect(ul.getAttribute("onspeechend")).toBeNull();
  });
});
