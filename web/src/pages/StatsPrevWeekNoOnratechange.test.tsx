import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onratechange` content attribute is an HTML
 * event handler attribute defined for media elements (<audio>, <video>) that
 * fires when the playback rate of the media changes. It has no defined
 * semantics on a <ul>, but if present it would still be parsed as an inline
 * event handler and executed by the browser, which would be both a needless
 * attack surface and a confusing signal to anything inspecting the DOM.
 * Sibling tests already pin the absence of other unrelated attributes on this
 * <ul>; this test pins the absence of `onratechange` so any future change
 * that accidentally attaches one is reviewed deliberately.
 */
describe("StatsPage stats-prev-week ul — onratechange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onratechange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onratechange")).toBe(false);
    expect(ul.getAttribute("onratechange")).toBeNull();
  });
});
