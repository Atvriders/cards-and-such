import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3224: StatsPage's current-week breakdown list (data-testid="stats-this-week-list")
 * is rendered as a plain <ul> with className "stats-week-list". The
 * `onpointerleave` content attribute is the inline-event-handler form of the
 * Pointer Events `pointerleave` event. When present as an HTML attribute it is
 * parsed by the browser into a per-element event handler whose body executes
 * arbitrary script the first time the pointer leaves the element's bounding
 * region, which is an XSS-shaped surface that should never appear on a purely
 * presentational summary list. Many other event-handler and DOM attribute
 * absences are already pinned on `stats-this-week-list` (onclick, onmouseover,
 * cite, id, role, style, etc.), but no test currently pins `onpointerleave`
 * absence. Pinning it here ensures any future change that accidentally
 * attaches an `onpointerleave` handler-attribute to this list — whether via a
 * stray prop spread, a templating mistake, or a copy/paste from an
 * interactive component — is reviewed deliberately rather than slipping in
 * unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onpointerleave attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3224: stats-this-week-list ul has no onpointerleave attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onpointerleave")).toBe(false);
    expect(ul.getAttribute("onpointerleave")).toBeNull();
  });
});
