import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `oncontextlost` event-handler content attribute
 * is defined on <canvas> elements and fires when the rendering context for a
 * canvas is lost; it has no defined semantics on a <ul>. Setting it would
 * still register an inline event-handler attribute that browsers would parse
 * and potentially expose to extensions or DOM serialization. Sibling tests
 * pin the absence of many global and ARIA attributes on this <ul>, but none
 * pin the absence of `oncontextlost`. Pinning it here ensures any future
 * change that accidentally attaches this canvas-specific event handler to
 * this presentational summary list is reviewed deliberately rather than
 * slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — oncontextlost attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no oncontextlost attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncontextlost")).toBe(false);
    expect(ul.getAttribute("oncontextlost")).toBeNull();
  });
});
