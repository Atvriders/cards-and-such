import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onloadedmetadata` content attribute is an event handler defined only on
 * media elements such as <audio> and <video>, where it fires when the user
 * agent has determined the duration and dimensions of the media resource. On
 * a <ul> the attribute has no defined behavior, but if it were ever set its
 * value would still be serialized into the DOM and could be interpreted as
 * inline event-handler code by future tooling, scrapers, or sanitizers,
 * creating a latent XSS-shaped surface and confusing accessibility tooling.
 * Pinning the absence of `onloadedmetadata` on this presentational weekly
 * summary list ensures any future change that accidentally attaches a media
 * event handler to it is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onloadedmetadata attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onloadedmetadata attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onloadedmetadata")).toBe(false);
    expect(ul.getAttribute("onloadedmetadata")).toBeNull();
  });
});
