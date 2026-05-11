import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul>. `oncuechangechanged` is not a defined
 * HTML event-handler attribute (the real media-track event handler is
 * `oncuechange`). Pinning the absence of the malformed
 * `oncuechangechanged` attribute on this presentational <ul> guards
 * against typos or autocomplete artifacts that could otherwise slip in
 * unnoticed, since unknown `on*`-style attributes would still be
 * serialized to the DOM and might confuse linters, scanners, or
 * future refactors. This complements existing sibling tests that pin
 * the absence of well-formed event-handler attributes on this <ul>.
 */
describe("StatsPage stats-prev-week ul — oncuechangechanged attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no oncuechangechanged attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncuechangechanged")).toBe(false);
    expect(ul.getAttribute("oncuechangechanged")).toBeNull();
  });
});
