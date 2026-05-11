import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins absence of the `onwebkitfullscreenchange` attribute on the
 * `stats-this-week-list` <ul>. The WebKit-prefixed fullscreen change event
 * handler attribute has no defined semantics on a presentational list and
 * would only be meaningful as an inline event handler on an element that
 * participates in the fullscreen API. Pinning its absence guards against any
 * future change accidentally attaching a stringified handler to this list,
 * which would be both inert noise in the DOM and a potential XSS-shaped foot
 * gun if user-controlled data ever flowed into it.
 */
describe("StatsPage stats-this-week-list ul — onwebkitfullscreenchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onwebkitfullscreenchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onwebkitfullscreenchange")).toBe(false);
    expect(ul.getAttribute("onwebkitfullscreenchange")).toBeNull();
  });
});
