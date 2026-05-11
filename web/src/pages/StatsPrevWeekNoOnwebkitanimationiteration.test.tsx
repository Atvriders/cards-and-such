import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul>. The `onwebkitanimationiteration` IDL
 * attribute is the legacy WebKit-prefixed inline event handler that fires
 * each time a CSS animation iterates. A presentational summary list has no
 * animation lifecycle to observe, so this handler should never be wired up
 * inline. Pinning its absence here ensures any future change that
 * accidentally attaches an inline `onwebkitanimationiteration` handler to
 * this <ul> is reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — onwebkitanimationiteration attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no onwebkitanimationiteration attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onwebkitanimationiteration")).toBe(false);
    expect(ul.getAttribute("onwebkitanimationiteration")).toBeNull();
  });
});
