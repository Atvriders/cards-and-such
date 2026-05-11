import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul>. The `onprogress` content attribute is an event
 * handler attribute defined for elements that fire progress events (e.g.
 * <progress>, media elements, XHR-like progress sources). On a presentational
 * <ul> it has no defined semantics, but if it were ever attached it would
 * register an inline event handler that runs arbitrary JS on progress events
 * bubbling through the element. Sibling tests already pin the absence of many
 * attributes on this <ul>; this test pins the absence of `onprogress` so any
 * future change that accidentally wires an inline progress handler onto this
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onprogress attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onprogress attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onprogress")).toBe(false);
    expect(ul.getAttribute("onprogress")).toBeNull();
  });
});
