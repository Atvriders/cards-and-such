import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2512: StatsPage's "This week" h2 — the section heading of the
 * this-week stats card (data-testid="stats-this-week") — is intentionally
 * authored as a bare `<h2>This week</h2>` with NO attributes whatsoever,
 * including no `id`. W1857 pins the heading's tagName and W2456 pins its
 * empty className, but neither asserts the absence of an `id` attribute.
 * An accidental refactor that added e.g. `id="this-week"` (perhaps to
 * support a deep-link fragment, an aria-labelledby reference, or a CSS
 * `#this-week` selector) would silently couple this heading to a stable
 * in-page anchor that downstream code could reference. Sibling absence-of-id
 * contracts are already pinned for the this-week card itself (W2024) and
 * the inner this-week list (W1986-style), but the heading element's own
 * id-absence has never been locked. The lookup intentionally goes through
 * `getByTestId("stats-this-week").querySelector("h2")` rather than a
 * role/heading query so the assertion does not depend on heading
 * semantics — it pins the literal absence of `id` on the first h2 inside
 * the this-week card.
 */
describe("StatsPage stats-this-week — h2 id absence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2512: stats-this-week 'This week' h2 has no id attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-this-week");
    const h2 = card.querySelector("h2");
    expect(h2).not.toBeNull();
    // Pin the bare-h2 contract: no `id` attribute on the heading so it
    // can't be silently coupled to a fragment anchor or aria-labelledby
    // reference outside the card.
    expect(h2!.hasAttribute("id")).toBe(false);
    expect(h2!.getAttribute("id")).toBeNull();
  });
});
