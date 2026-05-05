import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StatsPage from "./StatsPage.js";
import { ConfirmProvider } from "../platform/ConfirmDialog.js";

/**
 * W2528: StatsPage's "Top played" h2 — the section heading inside the
 * categories stats card (data-testid="stats-categories") — is a static
 * section title and is intentionally NOT a drag source. Existing tests
 * pin the heading's tag/level (W828), text "Top played", bare className
 * (W1878), parent-card relationship (W1460), id-absence (W2092),
 * style-absence (W2142), and tabindex-absence (W2506). Nothing pins the
 * h2's `draggable` attribute absence specifically. Adding `draggable`
 * (e.g. `draggable="true"` to allow the heading to be dragged as a
 * shareable section anchor, or `draggable="false"` to explicitly opt out
 * of the platform default in a way that user-agent stylesheets / drag
 * handlers can target) would silently change the heading's drag
 * semantics — it would surface a HTML5 drag-and-drop interaction surface
 * on a non-interactive section title — while every other contract still
 * held. Pin the absence of a `draggable` attribute on the categories-card
 * h2 so any future change that introduces one is a deliberate,
 * test-acknowledged contract change.
 */
describe("StatsPage categories card — Top played h2 has no draggable", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("W2528: 'Top played' h2 inside data-testid='stats-categories' has no draggable attribute", () => {
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
    // draggable-absence contract.
    expect(heading!.tagName).toBe("H2");
    expect(heading!.textContent).toBe("Top played");
    // The actual contract under test.
    expect(heading!.hasAttribute("draggable")).toBe(false);
  });
});
