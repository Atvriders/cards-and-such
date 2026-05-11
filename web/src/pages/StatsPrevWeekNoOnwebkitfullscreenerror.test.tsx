import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onwebkitfullscreenerror` inline event-handler
 * attribute on StatsPage's prior-week breakdown list
 * (data-testid="stats-prev-week"). The `onwebkitfullscreenerror` IDL
 * attribute fires the WebKit-prefixed fullscreenerror event on elements
 * that have requested fullscreen, but the prior-week summary list is a
 * presentational <ul> that never participates in the Fullscreen API.
 * Leaving such an inline handler attached would attach a global event
 * listener at parse time, mislead future maintainers about fullscreen
 * behaviour on this element, and bypass our normal React event delegation.
 * Pinning its absence here ensures that any change that accidentally
 * introduces an inline `onwebkitfullscreenerror=""` handler on this
 * presentational list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-prev-week ul — onwebkitfullscreenerror attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onwebkitfullscreenerror attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onwebkitfullscreenerror")).toBe(false);
    expect(ul.getAttribute("onwebkitfullscreenerror")).toBeNull();
  });
});
