import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The HTML
 * `onended` attribute is a media event handler that only has defined semantics
 * on <audio> and <video> elements, where it fires when playback has reached
 * the end of the media. On a <ul> the attribute carries no defined semantics,
 * but if present it would still be registered as an inline event handler by
 * the browser and could execute arbitrary script if a value were ever
 * injected. Other event-handler and attribute absences are already pinned for
 * this element; pinning `onended` absence here ensures any future change that
 * accidentally attaches an `onended` handler to this presentational weekly
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onended attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onended attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onended")).toBe(false);
    expect(ul.getAttribute("onended")).toBeNull();
  });
});
