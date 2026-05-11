import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is a
 * plain presentational <ul>. The `onpresentationconnectionavailable` IDL
 * attribute is a Presentation API event handler defined on
 * PresentationRequest objects (and as a content attribute it is not part of
 * the standard HTML element surface). Attaching it to a <ul> would have no
 * defined meaning, but as an inline event-handler-shaped attribute it could
 * be misinterpreted by tooling, scanners, or future refactors. This test
 * pins its absence so any accidental addition is caught in review.
 */
describe("StatsPage stats-prev-week ul — onpresentationconnectionavailable attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onpresentationconnectionavailable attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpresentationconnectionavailable")).toBe(false);
    expect(ul.getAttribute("onpresentationconnectionavailable")).toBeNull();
  });
});
