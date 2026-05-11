import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `oncanplaythrough` IDL attribute is a media event handler defined on
 * HTMLMediaElement (audio/video) that fires when the browser estimates the
 * resource can play to the end without buffering. On a <ul> it has no
 * defined semantics, but if accidentally attached as an inline attribute it
 * would still be parsed as an event handler by the HTML parser and could
 * execute arbitrary script content, creating a latent XSS / unintended
 * side-effect surface. Pinning its absence here ensures any future change
 * that accidentally attaches an `oncanplaythrough` handler to this
 * presentational weekly summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — oncanplaythrough attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no oncanplaythrough attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncanplaythrough")).toBe(false);
    expect(ul.getAttribute("oncanplaythrough")).toBeNull();
  });
});
