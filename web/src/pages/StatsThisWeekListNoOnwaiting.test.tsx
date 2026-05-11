import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onwaiting` attribute on the StatsPage current-week
 * breakdown list (data-testid="stats-this-week-list"). The `onwaiting` event
 * handler attribute is only meaningful on media elements (<audio>, <video>),
 * where it fires when playback stalls waiting for the next frame. On a plain
 * presentational <ul> it carries no defined semantics; if it were ever
 * attached as an inline handler it would still be parsed and executed as
 * JavaScript by the browser, creating both a dead-code and a latent
 * XSS-shaped surface. Sibling absence pins already cover a wide range of
 * attributes on this element (id, role, style, cite, ARIA, etc.). Pinning
 * `onwaiting` here ensures any future change that accidentally attaches an
 * inline media event handler to this weekly summary list is reviewed
 * deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onwaiting attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onwaiting attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onwaiting")).toBe(false);
    expect(ul.getAttribute("onwaiting")).toBeNull();
  });
});
