import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * Pins absence of the `onanimationcancel` inline event-handler content
 * attribute on StatsPage's current-week breakdown list
 * (data-testid="stats-this-week-list"). The list is rendered as a plain
 * presentational <ul class="stats-week-list"> with no animation lifecycle
 * concerns of its own, so an `onanimationcancel=""` attribute serialized
 * into the DOM would be dead weight at best and, at worst, a vector for
 * inline-script injection via future templating mistakes. A wide set of
 * other attribute absences are already pinned on this element; pinning
 * `onanimationcancel` here ensures any future change that accidentally
 * attaches an inline animationcancel handler to this summary list is
 * reviewed deliberately rather than slipping in unnoticed.
 */
describe("StatsPage stats-this-week-list ul — onanimationcancel attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stats-this-week-list ul has no onanimationcancel attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-this-week-list");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("onanimationcancel")).toBe(false);
    expect(ul.getAttribute("onanimationcancel")).toBeNull();
  });
});
