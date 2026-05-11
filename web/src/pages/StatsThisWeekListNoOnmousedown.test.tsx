import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3132: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The legacy
 * `onmousedown` content attribute would, if present, register a string-based
 * mouse-down handler parsed by the HTML parser into an inline event listener.
 * On a presentational summary <ul> this would be both unnecessary and a
 * potential XSS/CSP smell, since inline event-handler attributes are exactly
 * what strict Content-Security-Policy rules try to forbid. Sibling tests
 * already pin the absence of many other event-handler attributes
 * (onclick, onmouseover, onmouseenter, onmouseleave, onmouseup, etc.) on this
 * same ul, but `onmousedown` absence is not yet pinned. Pinning it here
 * ensures any future change that accidentally attaches an inline mousedown
 * handler to this list is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onmousedown attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3132: stats-this-week-list ul has no onmousedown attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onmousedown")).toBe(false);
    expect(ul.getAttribute("onmousedown")).toBeNull();
  });
});
