import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain presentational <ul>. The HTML `onseeking` event-handler
 * content attribute is only meaningful on media elements (<audio>, <video>),
 * where it fires when the user starts seeking the media. On a <ul> the
 * attribute has no defined semantics, but if present its value would be
 * compiled by the browser as a JavaScript event handler attached to the
 * element, which is both a security smell (inline-handler / CSP violation)
 * and a maintainability hazard. Sibling tests pin the absence of many other
 * attributes on this <ul>, but none pin the absence of `onseeking`. Pinning
 * it here ensures any future change that accidentally attaches an
 * `onseeking` handler to this summary list is reviewed deliberately rather
 * than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onseeking attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onseeking attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onseeking")).toBe(false);
    expect(ul.getAttribute("onseeking")).toBeNull();
  });
});
