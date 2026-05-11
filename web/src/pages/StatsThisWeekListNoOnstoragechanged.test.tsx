import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins the absence of the `onstoragechanged` attribute on StatsPage's
 * current-week breakdown list (data-testid="stats-this-week-list"). The
 * `onstoragechanged` inline event handler attribute is not a standard DOM
 * event for <ul> elements and has no defined semantics on a presentational
 * weekly summary list. Leaving such an attribute present could mislead
 * future refactors, expose unexpected handler wiring via DOM serialization,
 * or accidentally bind storage-event behaviour to a non-interactive list.
 * This test guards against any change that accidentally attaches an
 * `onstoragechanged` attribute to this list element.
 */
describe("StatsPage stats-this-week-list ul — onstoragechanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onstoragechanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onstoragechanged")).toBe(false);
    expect(ul.getAttribute("onstoragechanged")).toBeNull();
  });
});
