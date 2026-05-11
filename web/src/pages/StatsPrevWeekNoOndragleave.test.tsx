import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W3196: StatsPage's prior-week breakdown list (data-testid="stats-prev-week")
 * is rendered as a plain <ul> with className
 * "stats-week-list stats-week-list--prev". The `ondragleave` attribute is an
 * inline event handler used to react when a dragged item leaves an element
 * during a drag-and-drop operation. This presentational summary list does not
 * participate in any drag-and-drop interaction and should not have any inline
 * drag event handlers attached. Leaving an `ondragleave` attribute would
 * register a global-scoped event handler executed on every drag-leave event
 * targeting this ul, which is both a footgun (string-based evaluation, scope
 * leaks) and a potential XSS vector if any of the rendered content were ever
 * misinterpreted. Sibling tests already pin the absence of `id`, `role`,
 * `style`, `tabindex`, `is`, `cite`, and a broad array of ARIA / global
 * attributes on this <ul>, but none pin the absence of `ondragleave`. Pinning
 * it here ensures any future change that accidentally attaches an
 * `ondragleave` handler attribute to this list is reviewed deliberately
 * rather than slipping in unnoticed.
 */
describe("StatsPage stats-prev-week ul — ondragleave attribute absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W3196: stats-prev-week ul has no ondragleave attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const ul = screen.getByTestId("stats-prev-week");
    expect(ul.tagName).toBe("UL");
    expect(ul.hasAttribute("ondragleave")).toBe(false);
    expect(ul.getAttribute("ondragleave")).toBeNull();
  });
});
