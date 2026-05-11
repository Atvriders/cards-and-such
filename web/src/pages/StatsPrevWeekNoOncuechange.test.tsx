import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * StatsPage's prior-week breakdown list (data-testid="stats-prev-week") is a
 * plain presentational <ul>. The `oncuechange` event handler attribute is a
 * media-related global event handler intended for elements that emit cue
 * change events (e.g. <track>); on a <ul> it carries no semantics. Pinning
 * its absence here ensures any accidental introduction of an inline event
 * handler on this presentational summary list is reviewed deliberately.
 */
describe("StatsPage stats-prev-week ul — oncuechange attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-prev-week ul has no oncuechange attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("oncuechange")).toBe(false);
    expect(ul.getAttribute("oncuechange")).toBeNull();
  });
});
