import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul>. The `onbeforeinstallpromptchanged` attribute
 * is not a standard HTML event handler attribute and carries no defined
 * semantics on a <ul>. Pinning its absence ensures any future change that
 * accidentally attaches this attribute to this presentational summary list
 * is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onbeforeinstallpromptchanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onbeforeinstallpromptchanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onbeforeinstallpromptchanged")).toBe(false);
    expect(ul.getAttribute("onbeforeinstallpromptchanged")).toBeNull();
  });
});
