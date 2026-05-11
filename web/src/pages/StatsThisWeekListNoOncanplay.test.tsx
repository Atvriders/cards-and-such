import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul>. The HTML `oncanplay` event handler attribute is
 * defined for media elements (<audio>, <video>) and fires when the user agent
 * can begin playback of the media. On a <ul> it has no defined semantics and
 * would only execute as an inline event handler, raising both security
 * (inline-script) and accessibility concerns. Pinning its absence here
 * ensures any future change that accidentally attaches an `oncanplay`
 * handler to this presentational weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — oncanplay attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no oncanplay attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncanplay")).toBe(false);
    expect(ul.getAttribute("oncanplay")).toBeNull();
  });
});
