import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3247: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `onfullscreenchange` attribute
 * is a global event handler content attribute that, when present, registers a
 * handler for the Fullscreen API's `fullscreenchange` event on the element.
 * On a presentational summary <ul> there is no fullscreen behavior to react
 * to, and any string value would be parsed and executed as JavaScript by the
 * browser, opening an obvious script-injection surface. Sibling tests already
 * pin the absence of `id`, `role`, `style`, `tabindex`, `is`, `cite`, and a
 * broad array of ARIA / global / event-handler attributes on this <ul>, but
 * none pin the absence of `onfullscreenchange`. Pinning it here ensures any
 * future change that accidentally attaches an `onfullscreenchange` handler to
 * this list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onfullscreenchange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3247: stats-prev-week ul has no onfullscreenchange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onfullscreenchange")).toBe(false);
    expect(ul.getAttribute("onfullscreenchange")).toBeNull();
  });
});
