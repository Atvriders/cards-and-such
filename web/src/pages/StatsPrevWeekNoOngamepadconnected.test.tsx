import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is
 * rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `ongamepadconnected` attribute
 * is a global event handler content attribute that, when present, would
 * register a `gamepadconnected` event listener on the element via inline
 * scripting. This list is a presentational summary with no gamepad-related
 * behavior, so any `ongamepadconnected` attribute would be either dead code
 * or, worse, an injection vector for inline script execution. Sibling tests
 * pin the absence of many other event handler and global attributes on this
 * <ul>; pinning `ongamepadconnected` here ensures future refactors don't
 * accidentally attach inline gamepad handlers to this list.
 */
describe("StatsPage stats-prev-week ul — ongamepadconnected attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no ongamepadconnected attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ongamepadconnected")).toBe(false);
    expect(ul.getAttribute("ongamepadconnected")).toBeNull();
  });
});
