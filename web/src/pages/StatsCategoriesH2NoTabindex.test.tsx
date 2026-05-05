import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2506: StatsPage's "Top played" h2 — the section heading inside the
 * categories stats card (data-testid="stats-categories") — is a static
 * section title and is intentionally NOT focusable. Existing tests pin
 * the heading's tag/level (W828), text "Top played", bare className
 * (W1878), parent-card relationship (W1460), and global StatsPage h2
 * contracts for id absence (W2092) and style absence (W2142). Nothing
 * pins the h2's `tabindex` absence specifically. Adding `tabIndex={-1}`
 * (e.g. to make it programmatically focusable as a skip-link target) or
 * `tabIndex={0}` (e.g. to add it to the keyboard tab order so the heading
 * itself acts as a focus anchor for screen readers / hash-link landings)
 * would silently change the StatsPage tab order and screen-reader focus
 * semantics while every other contract still held. Mirrors the
 * NoTabindex pattern used elsewhere on this page (e.g. W2484-area cards
 * via StatsCategoriesNoTabindex). Pin the absence of a `tabindex`
 * attribute on the categories-card h2 so any future change that
 * introduces one is a deliberate, test-acknowledged contract change.
 */
describe("StatsPage categories card — Top played h2 has no tabindex", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2506: 'Top played' h2 inside data-testid='stats-categories' has no tabindex attribute", () => {
    render(
      <MemoryRouter>
        <ConfirmProvider>
          <StatsPage />
        </ConfirmProvider>
      </MemoryRouter>,
    );

    const card = screen.getByTestId("stats-categories");
    const heading = card.querySelector("h2");
    expect(heading).not.toBeNull();
    // Sanity: confirm we located the right heading before pinning the
    // tabindex-absence contract.
    expect(heading!.tagName).toBe("H2");
    expect(heading!.textContent).toBe("Top played");
    // The actual contract under test.
    expect(heading!.hasAttribute("tabindex")).toBe(false);
  });
});
