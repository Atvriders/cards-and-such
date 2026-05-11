import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain presentational <ul>. The `onstoragechanged` attribute
 * is not a standard HTML event-handler content attribute (the standard
 * `storage` event fires on Window, not on individual elements, and is wired
 * via `window.onstorage` rather than per-element markup). Setting an
 * attribute named `onstoragechanged` on this <ul> would carry no defined
 * semantics, would not bind any event listener, and would only pollute the
 * serialized DOM. Pinning its absence here ensures any future change that
 * accidentally attaches such a non-standard event-handler attribute to this
 * summary list is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onstoragechanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onstoragechanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onstoragechanged")).toBe(false);
    expect(ul.getAttribute("onstoragechanged")).toBeNull();
  });
});
